import { supabase } from "../lib/supabase";

export async function listarCompras(negocioId) {
  const { data } = await supabase
    .from("vw_compras_listagem")
    .select("*")
    .eq("negocio_id", negocioId)
    .order("data_compra", { ascending: false })
    .limit(100);
  return data || [];
}

export async function buscarItensCompra(compraId) {
  const { data } = await supabase
    .from("compra_itens")
    .select("*")
    .eq("compra_id", compraId)
    .order("created_at");
  return data || [];
}

export async function salvarCompra(negocioId, userId, header, itens) {
  const { data: newC, error } = await supabase
    .from("compras")
    .insert({
      negocio_id: negocioId,
      data_compra: header.data_compra,
      num_doc: header.num_doc || null,
      fornecedor: header.fornecedor || null,
      forma_pagamento: header.forma_pagamento || null,
      obs: header.obs || null,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw error;

  await supabase.from("compra_itens").insert(
    itens.map(i => ({
      compra_id: newC.id,
      produto_id: i.produto_id,
      qtd: parseFloat(i.qtd) || 0,
      unidade: i.unidade || "un",
      valor_unitario: parseFloat(i.valor_unitario) || 0,
    }))
  );
}

export async function excluirCompra(compraId) {
  await supabase.from("compras").delete().eq("id", compraId);
}
