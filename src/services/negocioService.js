import { supabase } from "../lib/supabase";

export async function buscarOuCriarNegocio(userId, nomeNeg) {
  const { data: membro } = await supabase
    .from("membros")
    .select("negocio_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (membro?.negocio_id) {
    const { data: neg } = await supabase
      .from("negocios")
      .select("nome")
      .eq("id", membro.negocio_id)
      .maybeSingle();
    return { nId: membro.negocio_id, nNome: neg?.nome || "Meu Negócio" };
  }

  const { data: neg } = await supabase
    .from("negocios")
    .insert({ nome: nomeNeg })
    .select("id")
    .single();

  await supabase.from("membros").insert({ negocio_id: neg.id, user_id: userId, papel: "dono" });
  return { nId: neg.id, nNome: nomeNeg };
}

export async function carregarDadosNegocio(nId) {
  const [rReceitas, rProdutos, rCompras, rMembros, rConfig] = await Promise.all([
    supabase.from("receitas").select("id, dados").eq("negocio_id", nId).maybeSingle(),
    supabase.from("produtos_v2").select("*").eq("negocio_id", nId).eq("ativo", true).order("nome"),
    supabase.from("vw_compras_listagem").select("*").eq("negocio_id", nId).order("data_compra", { ascending: false }).limit(100),
    supabase.from("membros").select("user_id").eq("negocio_id", nId),
    supabase.from("config_negocio").select("*").eq("negocio_id", nId).maybeSingle(),
  ]);
  return {
    receitasRow: rReceitas.data,
    produtos: rProdutos.data || [],
    compras: rCompras.data || [],
    membros: rMembros.data || [],
    config: rConfig.data || null,
  };
}

export async function salvarConfig(negocioId, configId, payload) {
  if (configId) {
    await supabase.from("config_negocio").update(payload).eq("id", configId);
    return null;
  }
  const { data } = await supabase
    .from("config_negocio")
    .insert({ negocio_id: negocioId, ...payload })
    .select("*")
    .single();
  return data;
}
