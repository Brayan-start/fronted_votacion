from supabase import create_client, Client
from app.core.config import settings

# Cliente anónimo para operaciones del lado del cliente
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Cliente con Service Role para operaciones administrativas (bypass RLS)
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
