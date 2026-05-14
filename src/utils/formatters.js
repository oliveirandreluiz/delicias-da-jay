export const fmt  = v => "R$ " + (parseFloat(v) || 0).toFixed(2).replace(".", ",");

export const fmtN = v => (parseFloat(v) || 0).toFixed(2).replace(".", ",");

export const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random().toString(36).slice(2);
