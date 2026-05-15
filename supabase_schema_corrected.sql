-- ==========================================================
-- ESQUEMA COMPLETO: SISTEMA DE VOTACIÓN UNIVERSITARIA (UPEA)
-- CONFIGURACIÓN PARA SUPABASE (AUTH + PROFILES + RLS + TRIGGERS)
-- ==========================================================

-- 1. LIMPIEZA PREVIA (Opcional - Ten cuidado si ya tienes datos)
-- DROP TABLE IF EXISTS public.votes CASCADE;
-- DROP TABLE IF EXISTS public.face_embeddings CASCADE;
-- DROP TABLE IF EXISTS public.candidates CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;
-- DROP TABLE IF EXISTS public.elections CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TABLA DE PERFILES (Vinculada a auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    reg_univ TEXT UNIQUE NOT NULL,
    id_card TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'student')) DEFAULT 'student',
    career TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. TABLA DE ELECCIONES
CREATE TABLE public.elections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'closed')) DEFAULT 'inactive',
    type TEXT CHECK (type IN ('rectorado', 'consejo', 'carrera')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;

-- 5. TABLA DE CATEGORÍAS
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    election_id UUID REFERENCES public.elections ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 6. TABLA DE CANDIDATOS
CREATE TABLE public.candidates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    video_url TEXT,
    career TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 7. TABLA DE VOTOS (Garantiza un solo voto por usuario/categoría)
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    election_id UUID REFERENCES public.elections ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories ON DELETE CASCADE NOT NULL,
    candidate_id UUID REFERENCES public.candidates ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id) -- Regla de oro: No doble voto
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 8. TABLA DE EMBEDDINGS FACIALES (Para Biometría)
CREATE TABLE public.face_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    embedding FLOAT8[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.face_embeddings ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- TRIGGER: CREACIÓN AUTOMÁTICA DE PERFIL
-- ==========================================================

-- Función que se ejecuta al crear un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, last_name, reg_univ, id_card, role, career)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Nuevo'), 
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'reg_univ', 'RU-' || NEW.id),
    COALESCE(NEW.raw_user_meta_data->>'id_card', 'CI-' || NEW.id),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'career', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para llamar a la función
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ==========================================================

-- 1. Profiles: Los usuarios ven su propio perfil; los admins ven todos.
-- Para evitar recursión infinita, usamos una política simple para el usuario y otra para el admin basada en metadatos o una subconsulta optimizada.
CREATE POLICY "Profiles: Ver propio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles: Admins ven todos" ON public.profiles
    FOR SELECT USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin'
        OR 
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND (raw_app_meta_data->>'role') = 'admin')
    );

CREATE POLICY "Profiles: Usuarios pueden actualizar su propia info" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Elections / Categories / Candidates: Lectura pública, Escritura solo Admin.
CREATE POLICY "Lectura pública de elecciones" ON public.elections FOR SELECT USING (true);
CREATE POLICY "Admins gestionan elecciones" ON public.elections FOR ALL USING (
    (SELECT (auth.jwt() ->> 'role')) = 'admin'
);

CREATE POLICY "Lectura pública de categorías" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins gestionan categorías" ON public.categories FOR ALL USING (
    (SELECT (auth.jwt() ->> 'role')) = 'admin'
);

CREATE POLICY "Lectura pública de candidatos" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Admins gestionan candidatos" ON public.candidates FOR ALL USING (
    (SELECT (auth.jwt() ->> 'role')) = 'admin'
);

-- 3. Votes: Usuarios pueden insertar su propio voto. Lectura solo para Admins.
CREATE POLICY "Usuarios emiten su propio voto" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins ven todos los votos" ON public.votes FOR SELECT USING (
    (SELECT (auth.jwt() ->> 'role')) = 'admin'
);

-- 4. Face Embeddings: El usuario puede ver/insertar el suyo.
CREATE POLICY "Ver propio embedding" ON public.face_embeddings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insertar propio embedding" ON public.face_embeddings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins gestionan embeddings" ON public.face_embeddings FOR ALL USING (
    (SELECT (auth.jwt() ->> 'role')) = 'admin'
);

-- ==========================================================
-- ÍNDICES PARA RENDIMIENTO
-- ==========================================================
CREATE INDEX idx_profiles_reg_univ ON public.profiles(reg_univ);
CREATE INDEX idx_votes_election_id ON public.votes(election_id);
CREATE INDEX idx_candidates_category_id ON public.candidates(category_id);
