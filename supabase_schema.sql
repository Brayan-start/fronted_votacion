-- UPEA Vota - esquema final recomendado para Supabase
-- Ejecutar en Supabase SQL Editor antes de levantar el backend.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  reg_univ TEXT UNIQUE NOT NULL,
  id_card TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  career TEXT,
  photo_url TEXT,
  password_changed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'closed')),
  type TEXT NOT NULL CHECK (type IN ('rectorado', 'consejo', 'carrera')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  video_url TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  career TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.face_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  embedding FLOAT8[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, election_id, category_id)
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    last_name,
    reg_univ,
    id_card,
    email,
    role,
    career
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'reg_univ', ''),
    COALESCE(NEW.raw_user_meta_data->>'id_card', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'career'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    last_name = EXCLUDED.last_name,
    reg_univ = EXCLUDED.reg_univ,
    id_card = EXCLUDED.id_card,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    career = EXCLUDED.career;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles
FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "public_read_elections" ON public.elections;
CREATE POLICY "public_read_elections" ON public.elections FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_candidates" ON public.candidates;
CREATE POLICY "public_read_candidates" ON public.candidates FOR SELECT USING (true);

DROP POLICY IF EXISTS "students_insert_votes" ON public.votes;
CREATE POLICY "students_insert_votes" ON public.votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_read_own_votes" ON public.votes;
CREATE POLICY "students_read_own_votes" ON public.votes
FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_reg_univ ON public.profiles(reg_univ);
CREATE INDEX IF NOT EXISTS idx_elections_status ON public.elections(status);
CREATE INDEX IF NOT EXISTS idx_categories_election_id ON public.categories(election_id);
CREATE INDEX IF NOT EXISTS idx_candidates_category_id ON public.candidates(category_id);
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON public.votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_category_id ON public.votes(category_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON public.votes(candidate_id);

CREATE OR REPLACE VIEW public.vote_results AS
SELECT
  election_id,
  category_id,
  candidate_id,
  COUNT(*)::INT AS vote_count
FROM public.votes
GROUP BY election_id, category_id, candidate_id;

-- Tabla opcional para persistir códigos de restablecimiento de contraseña
-- (el backend actualmente usa almacenamiento en memoria; esta tabla es
--  para producción con múltiples workers o si se prefiere persistencia)
CREATE TABLE IF NOT EXISTS public.password_reset_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON public.password_reset_codes(email);
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Tabla de auditoría para registrar eventos del sistema
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario TEXT NOT NULL,
  rol TEXT NOT NULL,
  accion TEXT NOT NULL,
  detalle TEXT,
  ip TEXT,
  resultado TEXT NOT NULL CHECK (resultado IN ('exito', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_accion ON public.audit_logs(accion);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs(usuario);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_read_audit_logs" ON public.audit_logs
FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "service_role_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "service_role_insert_audit_logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('photos-estudiantes', 'photos-estudiantes', true),
  ('candidates', 'candidates', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Para crear un admin despues de registrar un usuario:
-- UPDATE public.profiles SET role = 'admin' WHERE reg_univ = 'TU_RU';
