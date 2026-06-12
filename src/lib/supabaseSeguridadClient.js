import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_SEGURIDAD_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SEGURIDAD_ANON_KEY;

export const supabaseSeguridad = createClient(supabaseUrl, supabaseKey);

const EVIDENCIAS_BUCKET = 'evidencias';

export async function subirEvidenciaFoto(file) {
  const ext = file.name.split('.').pop();
  const path = `iat/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseSeguridad.storage.from(EVIDENCIAS_BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = supabaseSeguridad.storage.from(EVIDENCIAS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
