import { useState, useEffect } from "react";
import { CAT_R, EMOJIS } from "../../lib/constants";
import { fmt, fmtN } from "../../utils/formatters";
import { pPreco, pEmb } from "../../utils/helpers";
import { calc } from "../../utils/calc";
import s from "../../styles/formStyles";

export default function ReceitaForm({ initialData, editId, produtos, saving, onSaved, onOpenQuickP, toast_ }) {
  const [f, setF] = useState(null);
  useEffect(() => { if (initialData) setF(JSON.parse(JSON.stringify(initialData))); }, [initialData?.id]);
  const handleChange = (field, val) => setF(p => ({ ...p, [field]: val }));
  const handleIngChange = (idx, field, val) => setF(prev => { const a = [...prev.ingredientes]; a[idx] = { ...a[idx], [field]: val }; return { ...prev, ingredientes: a }; });
  if (!f) return null;
  const c = calc(f, produtos);
  const handleSave = () => { if (!f.nome.trim()) { toast_("⚠️ Informe o nome"); return; } onSaved({ ...f, ingredientes: f.ingredientes.filter(i => i.produtoId) }); };
  return (
    <>
      <div style={s.sec}>
        <div style={s.st}>Informações</div>
        <div style={s.er}>{EMOJIS.map(e => <button key={e} style={{...s.eb,...(f.emoji===e?s.ebs:{})}} onClick={() => handleChange("emoji",e)}>{e}</button>)}</div>
        <label style={s.lbl}>Nome *</label><input style={s.inp} placeholder="Ex: Brownie Ninho" value={f.nome} onChange={e => handleChange("nome",e.target.value)}/>
        <div className="desk-row">
          <div style={{flex:1.5}}><label style={s.lbl}>Categoria</label><select style={s.inp} value={f.categoria} onChange={e => handleChange("categoria",e.target.value)}><option value="">Selecionar...</option>{CAT_R.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label style={s.lbl}>Rend. (un.)</label><input style={s.inp} type="number" placeholder="10" value={f.rendimento} onChange={e => handleChange("rendimento",parseFloat(e.target.value)||0)}/></div>
        </div>
        <label style={s.lbl}>Observações (opcional)</label><textarea style={{...s.inp,height:65,resize:"none"}} value={f.obs||""} onChange={e => handleChange("obs",e.target.value)}/>
      </div>
      <div style={s.sec}>
        <div style={s.st}>Ingredientes</div>
        <div style={s.help}>Digite para buscar. Não encontrou? Cadastre abaixo!</div>
        {f.ingredientes.map((ing, idx) => {
          const p = produtos.find(x => x.id === ing.produtoId);
          const pr = p ? pPreco(p) : 0; const eq = p ? pEmb(p) : 1;
          const cu = p && eq > 0 ? (pr / eq) * ing.usadoQtd : 0;
          const bsc = p ? "" : (ing._busca || "");
          const res = bsc.trim().length > 0 ? produtos.filter(pr2 => pr2.nome.toLowerCase().includes(bsc.toLowerCase())).sort((a,b) => a.nome.localeCompare(b.nome)).slice(0,8) : [];
          return (
            <div key={idx} style={s.ic}>
              <div style={s.ich}><span style={{fontSize:12,fontWeight:600,color:"#6B7280"}}>Ingrediente {idx+1}</span><button style={s.brm} onClick={() => setF(prev => ({...prev, ingredientes: prev.ingredientes.filter((_,i)=>i!==idx)}))}>✕ remover</button></div>
              <label style={s.lbl}>Buscar produto</label>
              <div style={{position:"relative",marginBottom:p?0:10}}>
                {p ? (
                  <div style={{display:"flex",alignItems:"center",gap:7,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:9,padding:"9px 12px"}}>
                    <span>✅</span>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</span>
                    <button style={{background:"none",border:"none",color:"#DC2626",fontSize:15,cursor:"pointer",padding:0,flexShrink:0}} onClick={() => handleIngChange(idx,"produtoId","")}>✕</button>
                  </div>
                ) : (
                  <>
                    <input style={{...s.inp,marginBottom:0,paddingLeft:34,background:"#F9FAFB",borderColor:"#E5E7EB"}} placeholder="Digite para buscar..." value={bsc} onChange={e => handleIngChange(idx,"_busca",e.target.value)}/>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none",color:"#9CA3AF"}}>🔍</span>
                    {res.length > 0 && (
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,zIndex:50,boxShadow:"0 8px 20px rgba(0,0,0,.1)",maxHeight:190,overflowY:"auto"}}>
                        {res.map(pr2 => <div key={pr2.id} className="po" style={{padding:"9px 12px",cursor:"pointer",borderBottom:"1px solid #F3F4F6",fontSize:12}} onClick={() => handleIngChange(idx,"produtoId",pr2.id)}><div style={{fontWeight:600,color:"#111827"}}>{pr2.nome}</div><div style={{fontSize:10,color:"#6B7280",marginTop:1}}>{pr2.categoria} · R$ {fmtN(pPreco(pr2))}/{pEmb(pr2)}{pr2.unidade}</div></div>)}
                      </div>
                    )}
                    {bsc.trim().length > 0 && res.length === 0 && <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,zIndex:50,padding:"10px 12px",fontSize:12,color:"#6B7280"}}>Nenhum produto — cadastre abaixo!</div>}
                  </>
                )}
              </div>
              {p && <><div style={{marginTop:7}}/><label style={s.lbl}>Quantidade usada ({p.unidade})</label><input style={s.inp} type="number" step="any" placeholder="300" value={ing.usadoQtd||""} onChange={e => handleIngChange(idx,"usadoQtd",parseFloat(e.target.value)||0)}/>{cu > 0 && <div style={s.tag}>💡 Custo: {fmt(cu)}</div>}</>}
            </div>
          );
        })}
        <button style={s.badd} onClick={() => setF(prev => ({...prev, ingredientes: [...prev.ingredientes, {produtoId:"",usadoQtd:0}]}))}>+ Adicionar ingrediente</button>
        {onOpenQuickP && <button style={{...s.badd,marginTop:7,borderColor:"#86EFAC55",color:"#166534",background:"#F0FFF4"}} onClick={onOpenQuickP}>📦 Cadastrar novo produto</button>}
      </div>
      <div style={s.sec}>
        <div style={s.st}>Precificação</div>
        <div style={s.cs}><div style={s.cr}><span>Custo ingredientes</span><strong>{fmt(c.ci)}</strong></div><div style={s.cr}><span>Outros custos ({f.outrosCustos||30}%)</span><strong>{fmt(c.outros)}</strong></div><div style={{...s.cr,fontWeight:700,borderTop:"1.5px solid #E5E7EB",paddingTop:5,marginTop:3}}><span>Custo total</span><strong>{fmt(c.total)}</strong></div><div style={s.cr}><span>Custo por unidade</span><strong>{fmt(c.porUn)}</strong></div></div>
        <div className="desk-row">
          <div><label style={s.lbl}>Margem de lucro (%)</label><input style={{...s.inp,fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:700,color:"#111827",textAlign:"center"}} type="number" min={0} step={1} placeholder="100" value={f.margem||""} onChange={e => handleChange("margem",parseFloat(e.target.value)||0)}/></div>
          <div><label style={s.lbl}>Taxa delivery (%)</label><input style={{...s.inp,fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:700,color:"#111827",textAlign:"center"}} type="number" min={0} step={1} placeholder="30" value={f.taxaDelivery||""} onChange={e => handleChange("taxaDelivery",parseFloat(e.target.value)||0)}/></div>
        </div>
        {c.usandoConfig ? (
          <div style={{background:"#E8F5E9",border:"1px solid #81C784",borderRadius:9,padding:"10px 12px",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,color:"#2E7D32",marginBottom:2}}>⚙️ Custo Fixo Automático ({c.pctOutros.toFixed(1)}%)</div>
            <div style={{fontSize:10,color:"#2E7D32",opacity:0.8}}>Calculado com base nas suas Configurações Globais.</div>
          </div>
        ) : (
          <>
            <label style={s.lbl}>Outros custos — gás, energia, etc. (%)</label>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><input style={{...s.inp,marginBottom:0,width:90,fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:"#111827",textAlign:"center"}} type="number" min={0} step={1} placeholder="30" value={f.outrosCustos!==undefined?f.outrosCustos:30} onChange={e => handleChange("outrosCustos",parseFloat(e.target.value)||0)}/><div style={{fontSize:12,color:"#6B7280"}}>= {fmt(c.outros)} sobre ingredientes</div></div>
          </>
        )}
        {c.porUn > 0 && <div style={{...s.tag,marginBottom:10}}>💡 {fmt(c.porUn)} × {f.margem||0}% margem ÷ {100-(f.taxaDelivery||30)}% = {fmt(c.final)}</div>}
        <div className="desk-row">
          <div><label style={s.lbl}>Despesas extras</label><input style={s.inp} type="number" step="0.01" placeholder="0,00" value={f.despesas||""} onChange={e => handleChange("despesas",parseFloat(e.target.value)||0)}/></div>
          <div><label style={s.lbl}>Preço no app</label><input style={s.inp} type="number" step="0.01" placeholder="0,00" value={f.precoApp||""} onChange={e => handleChange("precoApp",parseFloat(e.target.value)||0)}/></div>
        </div>
        <div style={s.ph}><div style={s.phl}>Preço de venda sugerido/un</div><div style={s.phv}>{fmt(c.final)}</div><div style={{fontSize:11,opacity:.75,marginTop:2}}>Lucro lote: {fmt(c.lucro)}</div></div>
      </div>
      <div className="drawer-actions">
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "Salvar Receita"}</button>
      </div>
    </>
  );
}
