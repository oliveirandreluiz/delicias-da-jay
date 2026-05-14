import { useState } from "react";
import { FORMAS_PAG, UNIDS } from "../../lib/constants";
import { fmt } from "../../utils/formatters";
import { pPreco } from "../../utils/helpers";
import s from "../../styles/formStyles";

export default function CompraForm({ produtos, saving, onSaved, onOpenQuickP, toast_ }) {
  const [header, setHeader] = useState({ data_compra: new Date().toISOString().split("T")[0], num_doc:"", fornecedor:"", forma_pagamento:"Pix", obs:"" });
  const [itens, setItens] = useState([{ produto_id:"", _busca:"", qtd:"", unidade:"un", valor_unitario:"" }, { produto_id:"", _busca:"", qtd:"", unidade:"un", valor_unitario:"" }]);
  const handleHeaderChange = (field, val) => setHeader(p => ({ ...p, [field]: val }));
  const handleItemChange = (idx, field, val) => setItens(prev => { const a=[...prev]; a[idx]={...a[idx],[field]:val}; return a; });
  const totalItens = itens.reduce((sum, i) => sum + (parseFloat(i.qtd)||0) * (parseFloat(i.valor_unitario)||0), 0);
  const handleSave = () => {
    if (!header.data_compra) { toast_("⚠️ Informe a data"); return; }
    const valid = itens.filter(i => i.produto_id && i.qtd && i.valor_unitario);
    if (valid.length === 0) { toast_("⚠️ Adicione ao menos um item"); return; }
    onSaved(header, valid);
  };
  return (
    <>
      <div style={s.sec}>
        <div style={s.st}>Dados da Compra</div>
        <div className="desk-row">
          <div style={{flex:1.2}}><label style={s.lbl}>Data *</label><input style={s.inp} type="date" value={header.data_compra} onChange={e => handleHeaderChange("data_compra", e.target.value)}/></div>
          <div style={{flex:1}}><label style={s.lbl}>Nº Documento / NF</label><input style={s.inp} placeholder="Ex: 001234" value={header.num_doc} onChange={e => handleHeaderChange("num_doc", e.target.value)}/></div>
        </div>
        <div className="desk-row">
          <div style={{flex:1.5}}><label style={s.lbl}>Empresa / Fornecedor</label><input style={s.inp} placeholder="Ex: Atacadão" value={header.fornecedor} onChange={e => handleHeaderChange("fornecedor", e.target.value)}/></div>
          <div><label style={s.lbl}>Forma de pagamento</label><select style={s.inp} value={header.forma_pagamento} onChange={e => handleHeaderChange("forma_pagamento", e.target.value)}><option value="">—</option>{FORMAS_PAG.map(f => <option key={f}>{f}</option>)}</select></div>
        </div>
      </div>
      <div style={s.sec}>
        <div style={s.st}>Itens da Compra</div>
        <div style={s.help}>Busque o produto cadastrado. Não encontrou? Cadastre abaixo!</div>
        {itens.map((item, idx) => {
          const prod = produtos.find(p => p.id === item.produto_id);
          const bsc = prod ? "" : (item._busca || "");
          const res = bsc.trim().length > 0 ? produtos.filter(pr => pr.nome.toLowerCase().includes(bsc.toLowerCase())).sort((a,b) => a.nome.localeCompare(b.nome)).slice(0,8) : [];
          const subtotal = (parseFloat(item.qtd)||0) * (parseFloat(item.valor_unitario)||0);
          return (
            <div key={idx} style={s.ic}>
              <div style={s.ich}><span style={{fontSize:12,fontWeight:600,color:"#6B7280"}}>Item {idx+1}</span><button style={s.brm} onClick={() => setItens(prev => prev.filter((_,i)=>i!==idx))}>✕ remover</button></div>
              <label style={s.lbl}>Produto *</label>
              <div style={{position:"relative",marginBottom:prod?0:10}}>
                {prod ? (
                  <div style={{display:"flex",alignItems:"center",gap:7,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:9,padding:"9px 12px"}}>
                    <span>✅</span>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{prod.nome} <span style={{fontWeight:400,fontSize:11,color:"#166534aa"}}>({prod.codigo})</span></span>
                    <button style={{background:"none",border:"none",color:"#DC2626",fontSize:15,cursor:"pointer",padding:0,flexShrink:0}} onClick={() => handleItemChange(idx,"produto_id","")}>✕</button>
                  </div>
                ) : (
                  <>
                    <input style={{...s.inp,marginBottom:0,paddingLeft:34,background:"#F9FAFB",borderColor:"#E5E7EB"}} placeholder="Buscar produto..." value={bsc} onChange={e => handleItemChange(idx,"_busca",e.target.value)}/>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none",color:"#9CA3AF"}}>🔍</span>
                    {res.length > 0 && (
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,zIndex:50,boxShadow:"0 8px 20px rgba(0,0,0,.1)",maxHeight:190,overflowY:"auto"}}>
                        {res.map(pr => <div key={pr.id} className="po" style={{padding:"9px 12px",cursor:"pointer",borderBottom:"1px solid #F3F4F6",fontSize:12}} onClick={() => { handleItemChange(idx,"produto_id",pr.id); handleItemChange(idx,"unidade",pr.unidade); }}><div style={{fontWeight:600,color:"#111827"}}>{pr.nome} <span style={{fontWeight:400,color:"#6B7280"}}>({pr.codigo})</span></div><div style={{fontSize:10,color:"#6B7280",marginTop:1}}>{pr.categoria} · último: {fmt(pPreco(pr))}</div></div>)}
                      </div>
                    )}
                  </>
                )}
              </div>
              {prod && (
                <>
                  <div style={{marginTop:7}}/>
                  <div className="desk-row">
                    <div><label style={s.lbl}>Quantidade *</label><input style={s.inp} type="number" step="any" placeholder="2" value={item.qtd} onChange={e => handleItemChange(idx,"qtd",e.target.value)}/></div>
                    <div><label style={s.lbl}>Unidade</label><select style={s.inp} value={item.unidade} onChange={e => handleItemChange(idx,"unidade",e.target.value)}>{UNIDS.map(u => <option key={u}>{u}</option>)}</select></div>
                  </div>
                  <label style={s.lbl}>Valor unitário (R$) *</label><input style={s.inp} type="number" step="0.01" placeholder="42.00" value={item.valor_unitario} onChange={e => handleItemChange(idx,"valor_unitario",e.target.value)}/>
                  {subtotal > 0 && <div style={s.tag}>💰 Subtotal: {fmt(subtotal)}</div>}
                </>
              )}
            </div>
          );
        })}
        <button style={s.badd} onClick={() => setItens(prev => [...prev, { produto_id:"", _busca:"", qtd:"", unidade:"un", valor_unitario:"" }])}>+ Adicionar item</button>
        <button style={{...s.badd,marginTop:7,borderColor:"#86EFAC55",color:"#166534",background:"#F0FFF4"}} onClick={onOpenQuickP}>📦 Cadastrar novo produto</button>
      </div>
      <div style={s.ph}><div style={s.phl}>🧾 Total da Compra</div><div style={s.phv}>{fmt(totalItens)}</div><div style={{fontSize:11,opacity:.75,marginTop:2}}>{itens.filter(i=>i.produto_id).length} itens</div></div>
      <label style={s.lbl}>Observações (opcional)</label><textarea style={{...s.inp,height:65,resize:"none"}} value={header.obs||""} onChange={e => handleHeaderChange("obs",e.target.value)}/>
      <div className="drawer-actions">
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "Salvar Compra"}</button>
      </div>
    </>
  );
}
