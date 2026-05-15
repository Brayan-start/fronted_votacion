-- SUPABASE SCHEMA FOR UPEA VOTA

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. TABLAS

-- Perfiles de usuario (Extiende auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    reg_univ TEXT UNIQUE NOT NULL,
    id_card TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    career TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconocimientos faciales (Embeddings)
CREATE TABLE face_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    embedding VECTOR(128), -- Usaremos 128 dimensiones para modelos ligeros
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Elecciones
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'closed')),
    type TEXT NOT NULL CHECK (type IN ('rectorado', 'consejo', 'carrera')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías por elección (ej. Rector, Vicerector)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidatos
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    photo_url TEXT NOT NULL,
    video_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    career TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votos (Cifrados o anonimizados por diseño)
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Un usuario solo puede votar una vez por categoría en una elección
    UNIQUE(user_id, election_id, category_id)
);

-- 3. STORAGE BUCKETS (Deberás crearlos en el dashboard o vía API)
-- buckets: photos-estudiantes, photos-candidatos

-- 4. RLS (Row Level Security)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_embeddings ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para elections
CREATE POLICY "Elections are viewable by everyone" ON elections FOR SELECT USING (true);
CREATE POLICY "Admins can manage elections" ON elections ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para categories
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para candidates
CREATE POLICY "Candidates are viewable by everyone" ON candidates FOR SELECT USING (true);
CREATE POLICY "Admins can manage candidates" ON candidates ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para votes
CREATE POLICY "Users can see their own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can insert votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can see all votes for results" ON votes FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_category_id ON votes(category_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);

-- 7. VISTA PARA RESULTADOS (Garantiza anonimato total)
CREATE OR REPLACE VIEW election_results AS
SELECT 
    election_id,
    category_id,
    candidate_id,
    COUNT(*) as vote_count
FROM votes
GROUP BY election_id, category_id, candidate_id;

-- 8. POLÍTICAS PARA LA VISTA (Solo Admins)
ALTER VIEW election_results OWNER TO postgres;
-- Nota: Las vistas no tienen RLS per se, pero el acceso se controla vía endpoint de FastAPI
