// Retorna o preço unitário do produto independente de como o campo foi salvo
export const pPreco = p =>
  p.preco_ultimo !== undefined ? p.preco_ultimo : p.preco;

// Retorna a quantidade da embalagem independente de como o campo foi salvo
export const pEmb = p =>
  p.embalagem_qtd !== undefined ? p.embalagem_qtd : p.embalagemQtd;
