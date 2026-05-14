import { supabase } from "../lib/supabase";

export async function listarProdutos(negocioId) {
  const { data } = await supabase
    .from("produtos_v2")
    .select("*")
    .eq("negocio_id", negocioId)
    .eq("ativo", true)
    .order("nome");
  return (data || []).map(p => ({ ...p, preco: p.preco_ultimo, embalagemQtd: p.embalagem_qtd }));
}

export async function salvarProduto(negocioId, produtoId, payload) {
  if (produtoId) {
    await supabase.from("produtos_v2").update(payload).eq("id", produtoId);
  } else {
    await supabase.from("produtos_v2").insert({ ...payload, negocio_id: negocioId });
  }
}

export async function desativarProduto(produtoId) {
  await supabase.from("produtos_v2").update({ ativo: false }).eq("id", produtoId);
}

export async function inserirProdutoRapido(negocioId, dados) {
  await supabase.from("produtos_v2").insert({
    negocio_id: negocioId,
    nome: dados.nome.trim(),
    categoria: dados.categoria,
    unidade: dados.unidade,
    tipo: "ambos",
    preco_ultimo: parseFloat(dados.preco_ultimo) || 0,
    embalagem_qtd: parseFloat(dados.embalagem_qtd) || 1,
  });
}
