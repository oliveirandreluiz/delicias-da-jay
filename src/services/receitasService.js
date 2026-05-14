import { supabase } from "../lib/supabase";

export async function salvarReceitas(negocioId, receitasRowId, dados) {
  if (receitasRowId) {
    await supabase
      .from("receitas")
      .update({ dados, atualizado_em: new Date().toISOString() })
      .eq("id", receitasRowId);
    return receitasRowId;
  }
  const { data } = await supabase
    .from("receitas")
    .insert({ negocio_id: negocioId, dados })
    .select("id")
    .single();
  return data?.id || null;
}
