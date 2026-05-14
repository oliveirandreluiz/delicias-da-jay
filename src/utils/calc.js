import { pPreco, pEmb } from "./helpers";

// Calcula o total dos custos fixos mensais e o % sobre o faturamento
export function calcCustosFixos(cfg) {
  if (!cfg || !cfg.faturamento_mensal || cfg.faturamento_mensal <= 0) return null;
  const totalFixo =
    (parseFloat(cfg.custo_gas)       || 0) +
    (parseFloat(cfg.custo_energia)   || 0) +
    (parseFloat(cfg.custo_agua)      || 0) +
    (parseFloat(cfg.custo_internet)  || 0) +
    (parseFloat(cfg.custo_mei)       || 0) +
    (parseFloat(cfg.custo_transporte)|| 0) +
    (parseFloat(cfg.custo_outros)    || 0);
  return { totalFixo, pct: (totalFixo / parseFloat(cfg.faturamento_mensal)) * 100 };
}

// Calcula custos, precificação e lucro de uma receita
export function calc(r, prods, cfg) {
  const ci = r.ingredientes.reduce((s, i) => {
    const p = prods.find(x => x.id === i.produtoId);
    if (!p) return s;
    const eq = pEmb(p);
    return eq > 0 ? s + (pPreco(p) / eq) * i.usadoQtd : s;
  }, 0);

  const cfgFixos   = calcCustosFixos(cfg);
  const pctOutros  = cfgFixos
    ? cfgFixos.pct / 100
    : (r.outrosCustos !== undefined ? r.outrosCustos : 30) / 100;
  const usandoConfig = !!cfgFixos;

  const outros  = ci * pctOutros;
  const total   = ci + outros + (r.despesas || 0);
  const porUn   = r.rendimento > 0 ? total / r.rendimento : 0;
  const semT    = porUn * (1 + (r.margem || 100) / 100);
  const tp      = (r.taxaDelivery || 30) / 100;
  const final_  = tp < 1 ? semT / (1 - tp) : semT;
  const taxa    = final_ - semT;
  const lucro   = (final_ - taxa - porUn) * r.rendimento;
  const lucroApp = r.precoApp > 0
    ? (r.precoApp - r.precoApp * tp - porUn) * r.rendimento
    : null;

  const canais    = cfg?.canais_venda || [];
  const simCanais = canais.map(ch => {
    const t          = (parseFloat(ch.taxa) || 0) / 100;
    const precoCanal = t < 1 ? semT / (1 - t) : semT;
    const taxaCanal  = precoCanal - semT;
    const lucroCanal = (precoCanal - taxaCanal - porUn) * r.rendimento;
    return { nome: ch.nome, taxa: ch.taxa, preco: precoCanal, lucro: lucroCanal };
  });

  return {
    ci, outros, pctOutros: pctOutros * 100, usandoConfig,
    total, porUn, semT, taxa, final: final_,
    lucro, lucroApp, simCanais,
  };
}
