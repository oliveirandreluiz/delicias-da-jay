import { useState, useEffect } from "react";
import { CAT_P, UNIDS } from "../../lib/constants";
import { fmtN } from "../../utils/formatters";
import { inserirProdutoRapido } from "../../services/produtosService";
import s from "../../styles/formStyles";

export default function QuickProdModal({ open, onClose, negocioId, onProductSaved, toast_ }) {
  const [f, setF] = useState({ nome:"", preco_ultimo:"", embalagem_qtd:"", unidade:"g", categoria:"Secos" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setF({ nome:"", preco_ultimo:"", embalagem_qtd:"", unidade:"g", categoria:"Secos" }); }, [open]);
  if (!open) return null;
  const pu = f.preco_ultimo && f.embalagem_qtd ? parseFloat(f.preco_ultimo) / parseFloat(f.embalagem_qtd) : null;
  const handleSave = async () => {
    if (!f.nome.trim()||!f.preco_ultimo||!f.embalagem_qtd) { toast_("⚠️ Preencha todos os campos"); return; }
    setSaving(true);
    try {
      await inserirProdutoRapido(negocioId, f);
      await onProductSaved(); onClose(); toast_("✅ Produto cadastrado!");
    } catch(e) { console.error(e); toast_("❌ Erro ao salvar"); }
    setSaving(false);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div style={{background:"#ffffff",borderRadius:"18px 18px 0 0",padding:18,width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:600,marginBottom:12,color:"#111827"}}>Novo Produto Rápido</div>
        <label style={s.lbl}>Nome *</label><input style={s.inp} placeholder="Ex: Chocolate 70%" value={f.nome} onChange={e=>setF(p=>({...p,nome:e.target.value}))} autoFocus/>
        <label style={s.lbl}>Categoria</label><select style={s.inp} value={f.categoria} onChange={e=>setF(p=>({...p,categoria:e.target.value}))}>{CAT_P.map(c=><option key={c}>{c}</option>)}</select>
        <div className="desk-row">
          <div><label style={s.lbl}>Preço (R$) *</label><input style={s.inp} type="number" step="0.01" placeholder="10.00" value={f.preco_ultimo} onChange={e=>setF(p=>({...p,preco_ultimo:e.target.value}))}/></div>
          <div><label style={s.lbl}>Unidade</label><select style={s.inp} value={f.unidade} onChange={e=>setF(p=>({...p,unidade:e.target.value}))}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
        </div>
        <label style={s.lbl}>Qtd na embalagem ({f.unidade}) *</label><input style={s.inp} type="number" step="any" placeholder="200" value={f.embalagem_qtd} onChange={e=>setF(p=>({...p,embalagem_qtd:e.target.value}))}/>
        {pu!==null && <div style={s.tag}>💡 Custo: R$ {fmtN(pu)}/{f.unidade}</div>}
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button style={{...s.bsave,flex:1,marginTop:0}} onClick={handleSave}>{saving?"Salvando...":"Salvar Produto"}</button>
          <button style={{...s.bd,padding:"13px 16px"}} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
