import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null enquanto o Supabase não estiver configurado — o site cai nos dados estáticos
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export type Aviso = {
  id: string;
  texto: string;
  ativo: boolean;
  created_at: string;
};

export type Foto = {
  id: string;
  album_id: string;
  path: string;
  legenda: string | null;
  created_at: string;
};

export type Album = {
  id: string;
  titulo: string;
  data_evento: string | null;
  created_at: string;
  fotos: Foto[];
};

export function fotoUrl(path: string): string {
  if (!supabase) return "";
  return supabase.storage.from("fotos").getPublicUrl(path).data.publicUrl;
}
