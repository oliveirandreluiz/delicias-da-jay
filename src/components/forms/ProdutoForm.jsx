import { useState, useEffect } from "react";
import { CAT_P, UNIDS } from "../../lib/constants";
import { fmtN } from "../../utils/formatters";
import s from "../../styles/formStyles";

export default function ProdutoForm({ initialData, editId, recipes, saving, onSaved, onDelete, onCopy, toast_ }) {
  const [f, setF] = useState({ nome:"", preco_ultimo:"", embalagem_qtd:"", unidade:"g", categoria:"Secos", tipo:"ambos" });
  useEffect(() => { if (initialData) setF({ ...initialData, preco_ultimo: String(initialData.preco_ultimo ?? ""), embalagem_qtd: String(initialData.embalagem_qtd ?? "") }); }, [initialData?.id]);
  const handleChange = (field, val) => setF(p => ({ ...p, [field]: val }));
  const pu = f.preco_ultimo && f.embalagem_qtd ? parseFloat(f.preco_ultimo) / parseFloat(f.embalagem_qtd) : null;
  const usadoEm = editId ? recipes.filter(r => r.ingredientes.some(i => i.produtoId === editId)) : [];
  const handleSave = () => {
    if (!f.nome.trim()) { toast_("⚠️ Informe o nome"); return; }
    if (!f.preco_ultimo) { toast_("⚠️ Informe o preço"); return; }
    if (!f.embalagem_qtd) { toast_("⚠️ Informe o tamanho"); return; }
    onSaved({ ...f, preco_ultimo: parseFloat(f.preco_ultimo)||0, embalagem_qtd: parseFloat(f.embalagem_qtd)||1 });
  };
  return (
    <>
      <div style={s.sec}>
        <div style={s.st}>Dados do Produto</div>
        {editId && f.codigo && <div style={{...s.tag, marginBottom:12}}>SKU: {f.codigo}</div>}
        <label style={s.lbl}>Nome *</label><input style={s.inp} placeholder="Ex: Leite condensado" value={f.nome} onChange={e => handleChange("nome", e.target.value)}/>
        <div className="desk-row">
          <div style={{flex:1.5}}><label style={s.lbl}>Categoria</label><select style={s.inp} value={f.categoria} onChange={e => handleChange("categoria", e.target.value)}>{CAT_P.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label style={s.lbl}>Preço pago *</label><input style={s.inp} type="number" step="0.01" placeholder="6.39" value={f.preco_ultimo} onChange={e => handleChange("preco_ultimo", e.target.value)}/></div>
          <div><label style={s.lbl}>Unidade</label><select style={s.inp} value={f.unidade} onChange={e => handleChange("unidade", e.target.value)}>{UNIDS.map(u => <option key={u}>{u}</option>)}</select></div>
        </div>
        <label style={s.lbl}>Qtd na embalagem ({f.unidade}) *</label><input style={{...s.inp,maxWidth:200}} type="number" step="any" placeholder="395" value={f.embalagem_qtd} onChange={e => handleChange("embalagem_qtd", e.target.value)}/>
        {pu !== null && <div style={s.tag}>💡 Custo por {f.unidade}: R$ {fmtN(pu)}/{f.unidade}</div>}
      </div>
      {usadoEm.length > 0 && (
        <div style={s.sec}>
          <div style={s.st}>Usado em {usadoEm.length} receita{usadoEm.length>1?"s":""}</div>
          {usadoEm.map(r => <div key={r.id} style={{fontSize:12,padding:"4px 0",borderBottom:"1px solid #F3F4F6",display:"flex",gap:7,color:"#374151"}}><span>{r.emoji}</span><span>{r.nome}</span></div>)}
        </div>
      )}
      <div className="drawer-actions">
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "Salvar Produto"}</button>
        {editId && <button style={{background:"#374151",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={() => onCopy(editId)}>Copiar</button>}
        {editId && <button style={{...s.bd}} onClick={() => onDelete(editId)}>🗑 Excluir</button>}
      </div>
    </>
  );
}
