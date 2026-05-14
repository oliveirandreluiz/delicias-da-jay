import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { SEED_RECIPES, CAT_R, CAT_P, UNIDS, EMOJIS, CATEMOJI, FORMAS_PAG } from "./lib/constants";
import { fmt, fmtN, genId } from "./utils/formatters";
import { pPreco, pEmb } from "./utils/helpers";
import { calc, calcCustosFixos } from "./utils/calc";
import s from "./styles/formStyles";
import GLOBAL_CSS from "./styles/globalCss";
import { login, cadastrar, logout, onAuthChange } from "./services/authService";
import { buscarOuCriarNegocio, carregarDadosNegocio, salvarConfig } from "./services/negocioService";
import { salvarReceitas } from "./services/receitasService";
import { listarProdutos, salvarProduto, desativarProduto, inserirProdutoRapido } from "./services/produtosService";
import { listarCompras, buscarItensCompra, salvarCompra, excluirCompra } from "./services/comprasService";


// ─── NAV ITEM ──────────────────────────────────────────────────
function NavItem({ icon, label, active, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23] hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <span className="shrink-0 flex items-center">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES ISOLADOS (MODAIS E FORMS)
// ═══════════════════════════════════════════════════════════════

const ModalConfirm = memo(function ModalConfirm({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:"#fff",borderRadius:12,padding:24,width:"100%",maxWidth:360,textAlign:"center",border:"1px solid #E5E7EB"}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <svg width="20" height="20" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#111827",marginBottom:6,fontWeight:600}}>Confirmar exclusão</div>
        <div style={{fontSize:13,color:"#6B7280",marginBottom:20,lineHeight:1.6}}>Excluir <b style={{color:"#374151"}}>"{item.nome}"</b>?<br/><span style={{fontSize:12,color:"#DC2626"}}>Esta ação não pode ser desfeita.</span></div>
        <div style={{display:"flex",gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:8,border:"1.5px solid #E5E7EB",background:"#fff",color:"#374151",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onCancel}>Cancelar</button>
          <button style={{flex:1,padding:13,borderRadius:8,border:"none",background:"#DC2626",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onConfirm}>Sim, excluir</button>
        </div>
      </div>
    </div>
  );
});

// ─── RESPONSIVE DRAWER WRAPPER ────────────────────────────────
function ResponsiveDrawer({ title, onClose, children }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>{title}</h2>
          <button
            onClick={onClose}
            style={{background:"none",border:"none",cursor:"pointer",padding:8,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,color:"#6B7280"}}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── QUICK PRODUCT MODAL ──────────────────────────────────────
function QuickProdModal({ open, onClose, negocioId, onProductSaved, toast_ }) {
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

// ─── FORM PRODUTO ─────────────────────────────────────────────
function ConfigForm({ config, saving, onSaved, toast_ }) {
  const [f, setF] = useState({ custo_gas:"", custo_energia:"", custo_agua:"", custo_internet:"", custo_mei:"", custo_transporte:"", custo_outros:"", faturamento_mensal:"", margem_padrao:"100", canais_venda:[] });
  useEffect(() => {
    if (config) setF({
      custo_gas: String(config.custo_gas ?? "0"), custo_energia: String(config.custo_energia ?? "0"),
      custo_agua: String(config.custo_agua ?? "0"), custo_internet: String(config.custo_internet ?? "0"),
      custo_mei: String(config.custo_mei ?? "0"), custo_transporte: String(config.custo_transporte ?? "0"),
      custo_outros: String(config.custo_outros ?? "0"), faturamento_mensal: String(config.faturamento_mensal ?? "0"),
      margem_padrao: String(config.margem_padrao ?? "100"),
      canais_venda: config.canais_venda || [{"nome":"Balcão","taxa":0},{"nome":"iFood","taxa":30},{"nome":"Cartão crédito","taxa":3.5},{"nome":"Cartão débito","taxa":1.5},{"nome":"Pix","taxa":0}],
    });
  }, [config?.id]);
  const handleChange = (field, val) => setF(p => ({ ...p, [field]: val }));
  const handleCanalChange = (idx, field, val) => setF(p => { const c=[...p.canais_venda]; c[idx]={...c[idx],[field]:field==="taxa"?parseFloat(val)||0:val}; return {...p, canais_venda:c}; });
  const addCanal = () => setF(p => ({...p, canais_venda:[...p.canais_venda, {nome:"",taxa:0}]}));
  const removeCanal = idx => setF(p => ({...p, canais_venda:p.canais_venda.filter((_,i)=>i!==idx)}));

  const totalFixo = ["custo_gas","custo_energia","custo_agua","custo_internet","custo_mei","custo_transporte","custo_outros"].reduce((s,k) => s + (parseFloat(f[k])||0), 0);
  const fat = parseFloat(f.faturamento_mensal)||0;
  const pctFixo = fat > 0 ? (totalFixo / fat) * 100 : 0;

  const handleSave = () => {
    const payload = {
      custo_gas: parseFloat(f.custo_gas)||0, custo_energia: parseFloat(f.custo_energia)||0,
      custo_agua: parseFloat(f.custo_agua)||0, custo_internet: parseFloat(f.custo_internet)||0,
      custo_mei: parseFloat(f.custo_mei)||0, custo_transporte: parseFloat(f.custo_transporte)||0,
      custo_outros: parseFloat(f.custo_outros)||0, faturamento_mensal: parseFloat(f.faturamento_mensal)||0,
      margem_padrao: parseFloat(f.margem_padrao)||100,
      canais_venda: f.canais_venda.filter(c => c.nome.trim()),
    };
    onSaved(payload);
  };

  const custos = [
    {key:"custo_gas",label:"Gás",icon:"🔥",placeholder:"60.00"},
    {key:"custo_energia",label:"Energia elétrica",icon:"💡",placeholder:"150.00"},
    {key:"custo_agua",label:"Água",icon:"💧",placeholder:"40.00"},
    {key:"custo_internet",label:"Internet / Celular",icon:"📱",placeholder:"50.00"},
    {key:"custo_mei",label:"MEI / DAS (imposto)",icon:"📋",placeholder:"72.00"},
    {key:"custo_transporte",label:"Transporte / Gasolina",icon:"🚗",placeholder:"0.00"},
    {key:"custo_outros",label:"Outros (limpeza, manut.)",icon:"📦",placeholder:"30.00"},
  ];

  return (
    <>
      <div style={s.sec}>
        <div style={s.st}>Custos Fixos Mensais</div>
        <div style={s.help}>Informe a <b>média mensal</b> de cada gasto. Dica: soma as 3 últimas contas e divide por 3. Atualize a cada 3-6 meses.</div>
        {custos.map(c => (
          <div key={c.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:16,width:24,textAlign:"center"}}>{c.icon}</span>
            <label style={{fontSize:12,color:"#374151",fontWeight:500,width:160,flexShrink:0}}>{c.label}</label>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#6B7280"}}>R$</span>
              <input style={{...s.inp,marginBottom:0,paddingLeft:36,textAlign:"right"}} type="number" step="0.01" placeholder={c.placeholder} value={f[c.key]} onChange={e => handleChange(c.key, e.target.value)}/>
            </div>
          </div>
        ))}
        <div style={{background:"#111827",borderRadius:12,padding:"14px 16px",color:"#fff",margin:"12px 0"}}>
          <div style={{fontSize:11,opacity:.7,marginBottom:3}}>Total fixo mensal</div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:24,fontWeight:700}}>{fmt(totalFixo)}</div>
        </div>
      </div>
      <div style={s.sec}>
        <div style={s.st}>Faturamento Mensal</div>
        <div style={s.help}>Quanto você fatura por mês em média? Pode ser uma estimativa. Isso calcula o % real dos custos fixos.</div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#6B7280"}}>R$</span>
          <input style={{...s.inp,paddingLeft:36,textAlign:"right",fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:700,color:"#111827"}} type="number" step="0.01" placeholder="3500.00" value={f.faturamento_mensal} onChange={e => handleChange("faturamento_mensal", e.target.value)}/>
        </div>
        {fat > 0 && (
          <div style={{background:pctFixo > 30 ? "#FFEBEE" : pctFixo > 20 ? "#FFF3CD" : "#E8F5E9", border:`1.5px solid ${pctFixo > 30 ? "#EF9A9A" : pctFixo > 20 ? "#FFC107" : "#81C784"}`, borderRadius:12, padding:"14px 16px", textAlign:"center"}}>
            <div style={{fontSize:11,color:pctFixo>30?"#C62828":pctFixo>20?"#856404":"#2E7D32",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Seus custos fixos representam</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:700,color:pctFixo>30?"#C62828":pctFixo>20?"#856404":"#2E7D32"}}>{pctFixo.toFixed(1)}%</div>
            <div style={{fontSize:11,color:"#6B7280",marginTop:4}}>do faturamento ({fmt(totalFixo)} ÷ {fmt(fat)})</div>
          </div>
        )}
      </div>
      <div style={s.sec}>
        <div style={s.st}>Canais de Venda</div>
        <div style={s.help}>Configure as taxas de cada canal. O iFood geralmente cobra ~30%, cartão crédito ~3.5%, Pix 0%.</div>
        {f.canais_venda.map((ch, idx) => (
          <div key={idx} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
            <input style={{...s.inp,marginBottom:0,flex:1}} placeholder="Nome do canal" value={ch.nome} onChange={e => handleCanalChange(idx,"nome",e.target.value)}/>
            <div style={{position:"relative",width:90}}>
              <input style={{...s.inp,marginBottom:0,textAlign:"right",paddingRight:28}} type="number" step="0.1" placeholder="30" value={ch.taxa} onChange={e => handleCanalChange(idx,"taxa",e.target.value)}/>
              <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#6B7280"}}>%</span>
            </div>
            <button style={{background:"none",border:"none",color:"#DC2626",fontSize:14,cursor:"pointer",flexShrink:0}} onClick={() => removeCanal(idx)}>✕</button>
          </div>
        ))}
        <button style={s.badd} onClick={addCanal}>+ Adicionar canal</button>
      </div>
      <div className="drawer-actions">
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "Salvar Configuração"}</button>
      </div>
    </>
  );
}

// ─── FORM PRODUTO (original) ──────────────────────────────────
function ProdutoForm({ initialData, editId, recipes, saving, onSaved, onDelete, onCopy, toast_ }) {
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
      {usadoEm.length > 0 && <div style={s.sec}><div style={s.st}>Usado em {usadoEm.length} receita{usadoEm.length>1?"s":""}</div>{usadoEm.map(r => <div key={r.id} style={{fontSize:12,padding:"4px 0",borderBottom:"1px solid #F3F4F6",display:"flex",gap:7,color:"#374151"}}><span>{r.emoji}</span><span>{r.nome}</span></div>)}</div>}
      <div className="drawer-actions">
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "Salvar Produto"}</button>
        {editId && <button style={{background:"#374151",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={() => onCopy(editId)}>Copiar</button>}
        {editId && <button style={{...s.bd}} onClick={() => onDelete(editId)}>🗑 Excluir</button>}
      </div>
    </>
  );
}

// ─── FORM RECEITA ──────────────────────────────────────────────
function ReceitaForm({ initialData, editId, produtos, saving, onSaved, onOpenQuickP, toast_ }) {
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
          return (<div key={idx} style={s.ic}><div style={s.ich}><span style={{fontSize:12,fontWeight:600,color:"#6B7280"}}>Ingrediente {idx+1}</span><button style={s.brm} onClick={() => setF(prev => ({...prev, ingredientes: prev.ingredientes.filter((_,i)=>i!==idx)}))}>✕ remover</button></div>
            <label style={s.lbl}>Buscar produto</label>
            <div style={{position:"relative",marginBottom:p?0:10}}>
              {p ? (<div style={{display:"flex",alignItems:"center",gap:7,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:9,padding:"9px 12px"}}><span>✅</span><span style={{flex:1,fontSize:13,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</span><button style={{background:"none",border:"none",color:"#DC2626",fontSize:15,cursor:"pointer",padding:0,flexShrink:0}} onClick={() => handleIngChange(idx,"produtoId","")}>✕</button></div>
              ) : (<><input style={{...s.inp,marginBottom:0,paddingLeft:34,background:"#F9FAFB",borderColor:"#E5E7EB"}} placeholder="Digite para buscar..." value={bsc} onChange={e => handleIngChange(idx,"_busca",e.target.value)}/><span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none",color:"#9CA3AF"}}>🔍</span>
                {res.length > 0 && <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,zIndex:50,boxShadow:"0 8px 20px rgba(0,0,0,.1)",maxHeight:190,overflowY:"auto"}}>{res.map(pr2 => <div key={pr2.id} className="po" style={{padding:"9px 12px",cursor:"pointer",borderBottom:"1px solid #F3F4F6",fontSize:12}} onClick={() => handleIngChange(idx,"produtoId",pr2.id)}><div style={{fontWeight:600,color:"#111827"}}>{pr2.nome}</div><div style={{fontSize:10,color:"#6B7280",marginTop:1}}>{pr2.categoria} · R$ {fmtN(pPreco(pr2))}/{pEmb(pr2)}{pr2.unidade}</div></div>)}</div>}
                {bsc.trim().length > 0 && res.length === 0 && <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,zIndex:50,padding:"10px 12px",fontSize:12,color:"#6B7280"}}>Nenhum produto — cadastre abaixo!</div>}</>)}
            </div>
            {p && <><div style={{marginTop:7}}/><label style={s.lbl}>Quantidade usada ({p.unidade})</label><input style={s.inp} type="number" step="any" placeholder="300" value={ing.usadoQtd||""} onChange={e => handleIngChange(idx,"usadoQtd",parseFloat(e.target.value)||0)}/>{cu > 0 && <div style={s.tag}>💡 Custo: {fmt(cu)}</div>}</>}
          </div>);
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

// ─── FORM COMPRA ──────────────────────────────────────────────
function CompraForm({ produtos, saving, onSaved, onOpenQuickP, toast_ }) {
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
      <div style={s.sec}><div style={s.st}>Dados da Compra</div>
        <div className="desk-row">
          <div style={{flex:1.2}}><label style={s.lbl}>Data *</label><input style={s.inp} type="date" value={header.data_compra} onChange={e => handleHeaderChange("data_compra", e.target.value)}/></div>
          <div style={{flex:1}}><label style={s.lbl}>Nº Documento / NF</label><input style={s.inp} placeholder="Ex: 001234" value={header.num_doc} onChange={e => handleHeaderChange("num_doc", e.target.value)}/></div>
        </div>
        <div className="desk-row">
          <div style={{flex:1.5}}><label style={s.lbl}>Empresa / Fornecedor</label><input style={s.inp} placeholder="Ex: Atacadão" value={header.fornecedor} onChange={e => handleHeaderChange("fornecedor", e.target.value)}/></div>
          <div><label style={s.lbl}>Forma de pagamento</label><select style={s.inp} value={header.forma_pagamento} onChange={e => handleHeaderChange("forma_pagamento", e.target.value)}><option value="">—</option>{FORMAS_PAG.map(f => <option key={f}>{f}</option>)}</select></div>
        </div>
      </div>
      <div style={s.sec}><div style={s.st}>Itens da Compra</div><div style={s.help}>Busque o produto cadastrado. Não encontrou? Cadastre abaixo!</div>
        {itens.map((item, idx) => {
          const prod = produtos.find(p => p.id === item.produto_id);
          const bsc = prod ? "" : (item._busca || "");
          const res = bsc.trim().length > 0 ? produtos.filter(pr => pr.nome.toLowerCase().includes(bsc.toLowerCase())).sort((a,b) => a.nome.localeCompare(b.nome)).slice(0,8) : [];
          const subtotal = (parseFloat(item.qtd)||0) * (parseFloat(item.valor_unitario)||0);
          return (<div key={idx} style={s.ic}><div style={s.ich}><span style={{fontSize:12,fontWeight:600,color:"#6B7280"}}>Item {idx+1}</span><button style={s.brm} onClick={() => setItens(prev => prev.filter((_,i)=>i!==idx))}>✕ remover</button></div>
            <label style={s.lbl}>Produto *</label>
            <div style={{position:"relative",marginBottom:prod?0:10}}>
              {prod ? (<div style={{display:"flex",alignItems:"center",gap:7,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:9,padding:"9px 12px"}}><span>✅</span><span style={{flex:1,fontSize:13,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{prod.nome} <span style={{fontWeight:400,fontSize:11,color:"#166534aa"}}>({prod.codigo})</span></span><button style={{background:"none",border:"none",color:"#DC2626",fontSize:15,cursor:"pointer",padding:0,flexShrink:0}} onClick={() => handleItemChange(idx,"produto_id","")}>✕</button></div>
              ) : (<><input style={{...s.inp,marginBottom:0,paddingLeft:34,background:"#F9FAFB",borderColor:"#E5E7EB"}} placeholder="Buscar produto..." value={bsc} onChange={e => handleItemChange(idx,"_busca",e.target.value)}/><span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none",color:"#9CA3AF"}}>🔍</span>
                {res.length > 0 && <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,zIndex:50,boxShadow:"0 8px 20px rgba(0,0,0,.1)",maxHeight:190,overflowY:"auto"}}>{res.map(pr => <div key={pr.id} className="po" style={{padding:"9px 12px",cursor:"pointer",borderBottom:"1px solid #F3F4F6",fontSize:12}} onClick={() => { handleItemChange(idx,"produto_id",pr.id); handleItemChange(idx,"unidade",pr.unidade); }}><div style={{fontWeight:600,color:"#111827"}}>{pr.nome} <span style={{fontWeight:400,color:"#6B7280"}}>({pr.codigo})</span></div><div style={{fontSize:10,color:"#6B7280",marginTop:1}}>{pr.categoria} · último: {fmt(pPreco(pr))}</div></div>)}</div>}</>)}
            </div>
            {prod && <><div style={{marginTop:7}}/><div className="desk-row"><div><label style={s.lbl}>Quantidade *</label><input style={s.inp} type="number" step="any" placeholder="2" value={item.qtd} onChange={e => handleItemChange(idx,"qtd",e.target.value)}/></div><div><label style={s.lbl}>Unidade</label><select style={s.inp} value={item.unidade} onChange={e => handleItemChange(idx,"unidade",e.target.value)}>{UNIDS.map(u => <option key={u}>{u}</option>)}</select></div></div><label style={s.lbl}>Valor unitário (R$) *</label><input style={s.inp} type="number" step="0.01" placeholder="42.00" value={item.valor_unitario} onChange={e => handleItemChange(idx,"valor_unitario",e.target.value)}/>{subtotal > 0 && <div style={s.tag}>💰 Subtotal: {fmt(subtotal)}</div>}</>}
          </div>);
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

// ─── MINI BAR CHART (SVG puro — sem dependência) ─────────────
function MiniBarChart({ data, color = "#6366f1", height = 110 }) {
  if (!data || data.length === 0) return <div style={{textAlign:"center",padding:20,color:"#6B7280",fontSize:12}}>Sem dados</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(24, Math.floor(260 / data.length));
  const gap = 4;
  const totalW = data.length * (barW + gap);
  return (
    <div style={{overflowX:"auto",scrollbarWidth:"none"}}>
      <svg width={totalW} height={height + 24} style={{display:"block"}}>
        {data.map((d, i) => {
          const h = (d.value / max) * height;
          const x = i * (barW + gap);
          return (
            <g key={i}>
              <rect x={x} y={height - h} width={barW} height={h} rx={4} fill={color} opacity={0.85} />
              <text x={x + barW / 2} y={height - h - 4} textAnchor="middle" fontSize={9} fontWeight={600} fill="#374151">{d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value > 0 ? d.value : ""}</text>
              <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize={9} fill="#6B7280">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, iconBg = "#f3f4f6", iconColor = "#6b7280" }) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div style={{width:36,height:36,borderRadius:8,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",color:iconColor,flexShrink:0}}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────
function DashboardHome({ recipesCalc, produtos, compras, fmt, fmtN, pPreco, pEmb }) {
  const totalReceitas = recipesCalc.length;
  const totalProdutos = produtos.length;
  const margemMedia = totalReceitas > 0 ? recipesCalc.reduce((s,r) => s + (r.margem||0), 0) / totalReceitas : 0;
  const custoMedio = totalReceitas > 0 ? recipesCalc.reduce((s,r) => s + r._calc.porUn, 0) / totalReceitas : 0;
  const lucroTotalSugerido = recipesCalc.reduce((s,r) => s + r._calc.lucro, 0);
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`;
  const comprasMes = compras.filter(c => c.data_compra?.startsWith(mesAtual));
  const totalComprasMes = comprasMes.reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
  const totalComprasGeral = compras.reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][d.getMonth()];
    const val = compras.filter(c => c.data_compra?.startsWith(key)).reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
    meses.push({ label, value: Math.round(val) });
  }
  const topReceitas = [...recipesCalc].sort((a,b) => b._calc.lucro - a._calc.lucro).slice(0,5);
  const prodUso = {};
  recipesCalc.forEach(r => r.ingredientes.forEach(i => { if(i.produtoId) prodUso[i.produtoId] = (prodUso[i.produtoId]||0) + 1; }));
  const topProdutos = Object.entries(prodUso).sort((a,b) => b[1] - a[1]).slice(0,5).map(([id,count]) => { const p = produtos.find(x => x.id === id); return p ? { nome: p.nome, count, custo: pPreco(p) } : null; }).filter(Boolean);
  const semIngrediente = recipesCalc.filter(r => r.ingredientes.filter(i=>i.produtoId).length === 0);
  const margemBaixa = recipesCalc.filter(r => r.margem < 50);

  const iconReceitas = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>;
  const iconProdutos = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
  const iconCompras = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
  const iconLucro = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

  return (
    <div className="p-6 space-y-5" style={{animation:"fadein .3s ease"}}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visão geral do negócio</p>
        </div>
        <span className="text-xs text-gray-400">{hoje.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={iconReceitas} label="Receitas" value={totalReceitas} sub={`Margem média: ${margemMedia.toFixed(0)}%`} iconBg="#eff6ff" iconColor="#3b82f6"/>
        <StatCard icon={iconProdutos} label="Produtos" value={totalProdutos} sub={`Custo médio/un: ${fmt(custoMedio)}`} iconBg="#f0fdf4" iconColor="#22c55e"/>
        <StatCard icon={iconCompras} label="Compras do mês" value={fmt(totalComprasMes)} sub={`${comprasMes.length} compra${comprasMes.length!==1?"s":""}`} iconBg="#fff7ed" iconColor="#f97316"/>
        <StatCard icon={iconLucro} label="Lucro potencial" value={fmt(lucroTotalSugerido)} sub="Soma de todas as receitas" iconBg="#f0fdf4" iconColor="#16a34a"/>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Compras por Mês</h3>
            <span className="text-xs text-gray-400">Total: <span className="font-semibold text-gray-600 dark:text-gray-300">{fmt(totalComprasGeral)}</span></span>
          </div>
          {compras.length > 0
            ? <MiniBarChart data={meses} color="#6366f1" height={100}/>
            : <div className="text-center py-8 text-gray-400 text-sm">Registre compras para ver o gráfico</div>
          }
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Top Receitas por Lucro</h3>
          {topReceitas.length > 0 ? topReceitas.map((r,i) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-[#1F1F23] last:border-0">
              <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i+1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{r.nome}</div>
                <div className="text-xs text-gray-400">Margem {r.margem}% · {fmt(r._calc.final)}/un</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-green-600">{fmt(r._calc.lucro)}</div>
                <div className="text-xs text-gray-400">lucro/lote</div>
              </div>
            </div>
          )) : <div className="text-center py-8 text-gray-400 text-sm">Cadastre receitas para ver o ranking</div>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Insumos Mais Usados</h3>
          {topProdutos.length > 0 ? topProdutos.map((p,i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-[#1F1F23] last:border-0">
              <span className="text-xs font-bold text-gray-400 w-4 shrink-0 text-center">{p.count}x</span>
              <div className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-200 truncate">{p.nome}</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">{fmt(p.custo)}</div>
            </div>
          )) : <div className="text-center py-8 text-gray-400 text-sm">Adicione ingredientes às receitas</div>}
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Alertas</h3>
          {semIngrediente.length > 0 && (
            <div className="rounded-lg p-3 mb-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">{semIngrediente.length} receita{semIngrediente.length>1?"s":""} sem ingredientes</div>
              <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 opacity-80">{semIngrediente.map(r=>r.nome).join(", ")}</div>
            </div>
          )}
          {margemBaixa.length > 0 && (
            <div className="rounded-lg p-3 mb-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <div className="text-xs font-semibold text-red-600 dark:text-red-400">{margemBaixa.length} receita{margemBaixa.length>1?"s":""} com margem abaixo de 50%</div>
              <div className="text-xs text-red-500 mt-1 opacity-80">{margemBaixa.map(r=>`${r.nome} (${r.margem}%)`).join(", ")}</div>
            </div>
          )}
          {semIngrediente.length === 0 && margemBaixa.length === 0 && (
            <div className="rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-center">
              <div className="text-sm font-semibold text-green-700 dark:text-green-400">Tudo certo</div>
              <div className="text-xs text-green-600 dark:text-green-500 mt-0.5 opacity-80">Nenhum alerta no momento</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RELATÓRIOS PANEL ────────────────────────────────────────
function RelatoriosPanel({ recipesCalc, produtos, compras, filtP, fmt, fmtN, pPreco, pEmb, onClose, onExportCSV }) {
  const [relTab, setRelTab] = useState("receitas");

  const totalLucroSugerido = recipesCalc.reduce((s,r) => s + r._calc.lucro, 0);
  const margemMedia = recipesCalc.length > 0 ? recipesCalc.reduce((s,r) => s + (r.margem||0), 0) / recipesCalc.length : 0;

  const hoje = new Date();
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][d.getMonth()];
    const val = compras.filter(c => c.data_compra?.startsWith(key)).reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
    meses.push({ label, value: Math.round(val) });
  }

  const lucroData = recipesCalc.slice(0,8).map(r => ({ label: r.nome.substring(0,8), value: Math.round(r._calc.lucro) }));
  const catDist = {};
  recipesCalc.forEach(r => { const cat = r.categoria||"Sem categoria"; catDist[cat] = (catDist[cat]||0) + 1; });

  const iR  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>;
  const iPct = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><path d="M16 8L8 16"/></svg>;
  const iMon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  const iBox = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
  const iCart = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
  const iCal  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  const iDL   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

  return (
    <div className="p-6 space-y-5" style={{animation:"fadein .3s ease"}}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-400 mt-0.5">Análise completa do negócio</p>
        </div>
        <button
          onClick={() => onExportCSV(relTab === "compras" ? "compras" : relTab === "produtos" ? "produtos" : "receitas")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1F1F23] text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors"
        >
          {iDL} Exportar CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#1F1F23]">
        {[{k:"receitas",l:"Receitas"},{k:"produtos",l:"Produtos"},{k:"compras",l:"Compras"}].map(t => (
          <button key={t.k} onClick={() => setRelTab(t.k)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${relTab===t.k?"border-gray-900 text-gray-900 dark:text-white dark:border-white":"border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
          >{t.l}</button>
        ))}
      </div>

      {/* ── TAB RECEITAS ── */}
      {relTab === "receitas" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={iR}   label="Total Receitas"  value={recipesCalc.length}           iconBg="#eff6ff" iconColor="#3b82f6"/>
            <StatCard icon={iPct} label="Margem Média"    value={`${margemMedia.toFixed(0)}%`} iconBg={margemMedia>=60?"#f0fdf4":"#fff7ed"} iconColor={margemMedia>=60?"#16a34a":"#ea580c"}/>
            <StatCard icon={iMon} label="Lucro Potencial" value={fmt(totalLucroSugerido)}       iconBg="#f0fdf4" iconColor="#16a34a"/>
          </div>

          {lucroData.length > 0 && (
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Lucro por Receita</h3>
              <MiniBarChart data={lucroData} color="#6366f1" height={90}/>
            </div>
          )}

          {Object.keys(catDist).length > 0 && (
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Por Categoria</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(catDist).map(([cat,count]) => (
                  <div key={cat} className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{cat}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Detalhamento</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
              {recipesCalc.map(r => {
                const c = r._calc;
                const mCls = r.margem >= 80 ? "text-green-600" : r.margem >= 50 ? "text-amber-600" : "text-red-500";
                return (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{r.nome}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Custo {fmt(c.porUn)}/un · Rend. {r.rendimento} un.</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{fmt(c.final)}<span className="text-xs font-normal text-gray-400">/un</span></div>
                      <div className="flex gap-1.5 justify-end mt-1">
                        <span className={`text-xs font-semibold ${mCls}`}>{r.margem}%</span>
                        <span className="text-xs font-semibold text-green-600">{fmt(c.lucro)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {recipesCalc.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Nenhuma receita cadastrada</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB PRODUTOS ── */}
      {relTab === "produtos" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={iBox} label="Produtos Ativos" value={filtP.length} iconBg="#eff6ff" iconColor="#3b82f6"/>
            <StatCard icon={iMon} label="Preço Médio" value={fmt(filtP.length > 0 ? filtP.reduce((s,p) => s + pPreco(p), 0) / filtP.length : 0)} iconBg="#fff7ed" iconColor="#ea580c"/>
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Lista de Produtos</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
              {filtP.slice(0,30).map(p => {
                const pu = pEmb(p) ? pPreco(p) / pEmb(p) : 0;
                const usedIn = recipesCalc.filter(r => r.ingredientes.some(ing => ing.produtoId === p.id)).length;
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{p.nome}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.categoria} · R$ {fmtN(pu)}/{p.unidade}{usedIn > 0 ? ` · ${usedIn} receita${usedIn>1?"s":""}` : ""}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{fmt(pPreco(p))}</div>
                      <div className="text-xs text-gray-400">{pEmb(p)}{p.unidade}</div>
                    </div>
                  </div>
                );
              })}
              {filtP.length > 30 && <div className="px-5 py-3 text-xs text-gray-400">...e mais {filtP.length - 30} no CSV</div>}
              {filtP.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Nenhum produto cadastrado</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB COMPRAS ── */}
      {relTab === "compras" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={iCart} label="Total Compras" value={compras.length} iconBg="#fff7ed" iconColor="#ea580c"/>
            <StatCard icon={iMon}  label="Valor Total"   value={fmt(compras.reduce((s,c) => s + parseFloat(c.valor_total||0), 0))} iconBg="#fef2f2" iconColor="#dc2626"/>
            <StatCard icon={iCal}  label="Mês Atual"     value={fmt(compras.filter(c=>c.data_compra?.startsWith(new Date().toISOString().substring(0,7))).reduce((s,c) => s+parseFloat(c.valor_total||0),0))} iconBg="#eff6ff" iconColor="#3b82f6"/>
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Compras por Mês</h3>
            {compras.length > 0 ? <MiniBarChart data={meses} color="#f97316" height={100}/> : <div className="text-center py-8 text-gray-400 text-sm">Sem dados de compras</div>}
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Últimas Compras</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
              {compras.slice(0,15).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.fornecedor||"Sem fornecedor"}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR")} · {c.forma_pagamento||""}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{fmt(c.valor_total)}</div>
                </div>
              ))}
              {compras.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Nenhuma compra registrada</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DETALHES NO DESKTOP ──────────────────────────────────────
function DesktopDetail({ r, produtos, onEdit, onCopy, onDelete }) {
  const { ci, outros, total, porUn, semT, taxa, final: f_, lucro, lucroApp } = calc(r, produtos);
  return (
    <div style={{padding:"28px 32px",animation:"fadein .2s ease"}} className="desk-detail-wrapper">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}} className="no-print">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div>
            <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:700,color:"#111827",lineHeight:1.2}}>{r.nome}</h1>
            <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
              <span style={{background:"#F3F4F6",color:"#374151",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>Rendimento: {r.rendimento} un.</span>
              {r.categoria&&<span style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>{r.categoria}</span>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          <button className="btn-h" style={{padding:"8px 18px",borderRadius:8,border:"1.5px solid #E5E7EB",background:"#fff",color:"#374151",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onEdit}>Editar</button>
          <button className="btn-h" style={{padding:"8px 18px",borderRadius:8,border:"none",background:"#111827",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={()=>window.print()}>Imprimir</button>
        </div>
      </div>
      <div className="desk-detail-grid">
        <div style={{background:"#fff",borderRadius:14,padding:"20px 24px",boxShadow:"0 2px 12px rgba(0,0,0,.06)",border:"1px solid #E5E7EB"}}>
          <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:600,color:"#111827",marginBottom:16}}>Ingredientes e Custos</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:"2px solid #E5E7EB"}}>{["Ingrediente","Qtd","Custo Base","Total"].map(h=><th key={h} style={{textAlign:h==="Ingrediente"?"left":"right",padding:"6px 6px 10px",fontSize:11,textTransform:"uppercase",letterSpacing:".05em",color:"#6B7280",fontWeight:600}}>{h}</th>)}</tr></thead>
            <tbody>{r.ingredientes.map((ing,i)=>{const p=produtos.find(x=>x.id===ing.produtoId);if(!p)return null;const pr=pPreco(p);const eq=pEmb(p);return(<tr key={i} style={{borderBottom:"1px solid #F3F4F6"}}><td style={{padding:"10px 6px 10px 0",color:"#111827",fontWeight:500}}>{p.nome}</td><td style={{padding:"10px 6px",textAlign:"right",color:"#6B7280"}}>{ing.usadoQtd}{p.unidade}</td><td style={{padding:"10px 6px",textAlign:"right",color:"#6B7280"}}>{fmt(pr)}/{eq}{p.unidade}</td><td style={{padding:"10px 0",textAlign:"right",color:"#111827",fontWeight:600}}>{fmt(eq>0?(pr/eq)*ing.usadoQtd:0)}</td></tr>);})}</tbody>
            <tfoot>
              <tr style={{borderTop:"2px solid #E5E7EB"}}><td colSpan={3} style={{padding:"12px 6px 6px 0",fontWeight:700,color:"#111827"}}>Custo Ingredientes</td><td style={{padding:"12px 0 6px",textAlign:"right",fontWeight:700,color:"#111827"}}>{fmt(ci)}</td></tr>
              <tr><td colSpan={3} style={{padding:"4px 6px 6px 0",color:"#6B7280",fontSize:12}}>Outros custos ({r.outrosCustos||30}%)</td><td style={{padding:"4px 0 6px",textAlign:"right",color:"#6B7280",fontSize:12}}>{fmt(outros)}</td></tr>
              {r.despesas>0&&<tr><td colSpan={3} style={{padding:"4px 6px 6px 0",color:"#6B7280",fontSize:12}}>Despesas extras</td><td style={{padding:"4px 0 6px",textAlign:"right",color:"#6B7280",fontSize:12}}>{fmt(r.despesas)}</td></tr>}
              <tr style={{borderTop:"2px solid #E5E7EB"}}><td colSpan={3} style={{padding:"10px 6px 0 0",fontWeight:700,fontSize:14,color:"#111827"}}>Custo Total</td><td style={{padding:"10px 0 0",textAlign:"right",fontWeight:700,fontSize:14,color:"#111827"}}>{fmt(total)}</td></tr>
            </tfoot>
          </table>
          {r.obs&&<div style={{marginTop:16,paddingTop:14,borderTop:"1px solid #E5E7EB"}}><div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Observações</div><div style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{r.obs}</div></div>}
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 12px rgba(0,0,0,.06)",border:"1px solid #E5E7EB"}}>
          <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:600,color:"#111827",marginBottom:16}}>Precificação</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div style={s.pb}><div style={s.pl}>Custo/Un</div><div style={{...s.pv,fontSize:15}}>{fmt(porUn)}</div></div>
            <div style={s.pb}><div style={s.pl}>Margem</div><div style={{...s.pv,fontSize:15}}>{r.margem}%</div></div>
            <div style={s.pb}><div style={s.pl}>Preço s/ Taxa</div><div style={{...s.pv,fontSize:15}}>{fmt(semT)}</div></div>
            <div style={s.pb}><div style={s.pl}>Taxa ({r.taxaDelivery}%)</div><div style={{...s.pv,fontSize:15}}>{fmt(taxa)}</div></div>
          </div>
          <div style={{background:"#111827",borderRadius:12,padding:"16px",color:"#fff",marginBottom:8,textAlign:"center"}}>
            <div style={{fontSize:11,opacity:.7,marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Preço Sugerido</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:28,fontWeight:700}}>{fmt(f_)}</div>
            <div style={{fontSize:11,opacity:.6,marginTop:2}}>por unidade</div>
          </div>
          <div style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#92400E",marginBottom:4}}>Lucro Estimado</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:"#92400E"}}>{fmt(lucro)}</div>
            <div style={{fontSize:10,color:"#92400E88",marginTop:2}}>p/ {r.rendimento} un.</div>
          </div>
          {r.precoApp>0&&<><div style={{background:"#F0FFF4",border:"1.5px solid #86EFAC",borderRadius:10,padding:"12px 14px",marginBottom:8}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#166534",marginBottom:4}}>Preço App</div><div style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:"#166534"}}>{fmt(r.precoApp)}</div></div>{lucroApp!==null&&<div style={{background:"#F0FFF4",border:"1.5px solid #86EFAC",borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#166534",marginBottom:4}}>Lucro App</div><div style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:"#166534"}}>{fmt(lucroApp)}</div></div>}</>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16}} className="no-print">
        <button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:"1.5px solid #E5E7EB",background:"#fff",color:"#374151",fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onCopy}>Copiar</button>
        <button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:"1.5px solid #FCA5A5",background:"#fff",color:"#DC2626",fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onDelete}>Excluir</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function App() {
  useEffect(() => { const id="delicias-jay-css"; if(!document.getElementById(id)){const el=document.createElement("style");el.id=id;el.textContent=GLOBAL_CSS;document.head.appendChild(el);} }, []);

  const [appReady,setAppReady]=useState(false); const [user,setUser]=useState(null); const [negocioId,setNegocioId]=useState(null); const [negocioNome,setNegocioNome]=useState("");
  const [authView,setAuthView]=useState("login"); const [authForm,setAuthForm]=useState({email:"",senha:"",nomeNegocio:""}); const [authError,setAuthError]=useState(""); const [authLoading,setAuthLoading]=useState(false);
  const [receitasRowId,setReceitasRowId]=useState(null); const [recipes,setRecipes]=useState([]); const [produtos,setProdutos]=useState([]); const [compras,setCompras]=useState([]); const [loading,setLoading]=useState(false); const [saving,setSaving]=useState(false);
  const [tab,setTab]=useState("dashboard"); const [view,setView]=useState("list"); const [editId,setEditId]=useState(null); const [detailId,setDetailId]=useState(null); const [editPId,setEditPId]=useState(null);
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [darkMode,setDarkMode]=useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  const [pFormInit,setPFormInit]=useState(null); const [rFormInit,setRFormInit]=useState(null);
  const [searchR,setSearchR]=useState(""); const [catR,setCatR]=useState("Todos"); const [searchP,setSearchP]=useState(""); const [catP,setCatP]=useState("Todos");
  const [toast,setToast]=useState(""); const [confirmDel,setConfirmDel]=useState(null); const [viewRel,setViewRel]=useState(false); const [quickPOpen,setQuickPOpen]=useState(false);
  const [searchC,setSearchC]=useState(""); const [mesFiltroC,setMesFiltroC]=useState("Todos"); const [compraDetalhe,setCompraDetalhe]=useState(null); const [compraItens,setCompraItens]=useState({}); const [mapaUsuarios,setMapaUsuarios]=useState({});
  const [config,setConfig]=useState(null); const [viewConfig,setViewConfig]=useState(false);

  const toast_ = useCallback(msg => { setToast(msg); setTimeout(() => setToast(""), 2800); }, []);
  const recipesCalc = useMemo(() => recipes.map(r => ({ ...r, _calc: calc(r, produtos, config) })), [recipes, produtos, config]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDarkMode(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  async function loadUserData(sessionUser) {
    setLoading(true);
    const timeout = setTimeout(() => { setLoading(false); setAppReady(true); }, 12000);
    try {
      const nomeNeg = sessionUser.user_metadata?.nome_negocio || "Meu Negócio";
      const { nId, nNome } = await buscarOuCriarNegocio(sessionUser.id, nomeNeg);
      setNegocioId(nId); setNegocioNome(nNome);
      const { receitasRow, produtos: prods, compras: comps, membros, config: cfg } = await carregarDadosNegocio(nId);
      if (receitasRow?.id) { setReceitasRowId(receitasRow.id); setRecipes(receitasRow.dados || []); } else setRecipes(SEED_RECIPES);
      setProdutos(prods.map(p => ({ ...p, preco: p.preco_ultimo, embalagemQtd: p.embalagem_qtd })));
      setCompras(comps);
      const map = {}; membros.forEach(m => { map[m.user_id] = m.user_id === sessionUser.id ? (sessionUser.email?.split("@")[0] || "Eu") : "Membro"; }); setMapaUsuarios(map);
      if (cfg) setConfig(cfg);
    } catch(e) { console.error(e); setRecipes(SEED_RECIPES); }
    clearTimeout(timeout); setLoading(false); setAppReady(true);
  }

  useEffect(() => {
    let loaded = false;
    const subscription = onAuthChange(async (event, session) => {
      if (event === "SIGNED_OUT") { loaded=false; setUser(null); setNegocioId(null); setNegocioNome(""); setRecipes([]); setProdutos([]); setCompras([]); setReceitasRowId(null); setView("list"); setTab("receitas"); setAppReady(true); return; }
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) { setUser(session.user); if (!loaded) { loaded = true; await loadUserData(session.user); } else { setAppReady(true); } return; }
      if (event === "INITIAL_SESSION" && !session) setAppReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const saveR = useCallback(async (dados) => { setSaving(true); try { const newId = await salvarReceitas(negocioId, receitasRowId, dados); if (newId && !receitasRowId) setReceitasRowId(newId); } catch(e) { console.error(e); } setSaving(false); }, [receitasRowId, negocioId]);
  const reloadProdutos = useCallback(async () => { const prods = await listarProdutos(negocioId); setProdutos(prods); }, [negocioId]);
  const reloadCompras = useCallback(async () => { const comps = await listarCompras(negocioId); setCompras(comps); }, [negocioId]);
  const handleSaveConfig = useCallback(async (payload) => { setSaving(true); try { const novoData = await salvarConfig(negocioId, config?.id, payload); if (novoData) setConfig(novoData); else setConfig({ ...config, ...payload }); toast_("✅ Configuração salva!"); setViewConfig(false); } catch(e) { console.error(e); toast_("❌ Erro ao salvar"); } setSaving(false); }, [config, negocioId, toast_]);

  const fazerLogin = async () => { if (!authForm.email || !authForm.senha) { setAuthError("Preencha email e senha"); return; } setAuthLoading(true); setAuthError(""); try { await login(authForm.email, authForm.senha); } catch(e) { setAuthError(e.message + " ❌"); } setAuthLoading(false); };
  const fazerCadastro = async () => { if (!authForm.nomeNegocio.trim()) { setAuthError("Informe o nome do negócio ⚠️"); return; } if (!authForm.email.trim()) { setAuthError("Informe seu email ⚠️"); return; } if (authForm.senha.length < 6) { setAuthError("Senha: mín. 6 caracteres ⚠️"); return; } setAuthLoading(true); setAuthError(""); try { await cadastrar(authForm.email, authForm.senha, authForm.nomeNegocio); setAuthView("emailConfirm"); } catch(e) { setAuthError(e.message); } setAuthLoading(false); };
  const fazerLogout = async () => { await logout(); setUser(null); setNegocioId(null); setNegocioNome(""); setRecipes([]); setProdutos([]); setCompras([]); setConfig(null); setReceitasRowId(null); setView("list"); setTab("receitas"); setAuthView("login"); setAuthForm({ email:"", senha:"", nomeNegocio:"" }); };

  const openNewP = () => { setPFormInit({ nome:"", preco_ultimo:"", embalagem_qtd:"", unidade:"g", categoria:"Secos", tipo:"ambos", id: genId() }); setEditPId(null); setView("pForm"); };
  const openEditP = id => { const p = produtos.find(x => x.id === id); if (p) setPFormInit(p); setEditPId(id); setView("pForm"); };
  const handleSaveProd = async (data) => { setSaving(true); const payload = { nome: data.nome.trim(), categoria: data.categoria, unidade: data.unidade, tipo: data.tipo||"ambos", preco_ultimo: data.preco_ultimo, embalagem_qtd: data.embalagem_qtd }; try { await salvarProduto(negocioId, editPId, payload); await reloadProdutos(); toast_("✅ Produto salvo!"); setView("list"); setTab("produtos"); } catch(e) { console.error(e); toast_("❌ Erro ao salvar"); } setSaving(false); };
  const pedirExcP = id => { if (recipes.some(r => r.ingredientes.some(i => i.produtoId === id))) { toast_("⚠️ Produto usado em receitas"); return; } setConfirmDel({ tipo:"produto", id, nome: produtos.find(x=>x.id===id)?.nome||"" }); };
  const copiarProduto = id => { const p = produtos.find(x => x.id === id); setPFormInit({ ...p, nome: `Cópia de ${p.nome}`, id: genId() }); setEditPId(null); setView("pForm"); toast_("📋 Revise e salve!"); };

  const openNewR = () => { setRFormInit({ id: genId(), emoji:"🍫", nome:"", categoria:"", rendimento:10, margem:100, taxaDelivery:30, outrosCustos:30, despesas:0, precoApp:0, obs:"", ingredientes:[{produtoId:"",usadoQtd:0},{produtoId:"",usadoQtd:0}] }); setEditId(null); setView("rForm"); };
  const openEditR = id => { setRFormInit(recipes.find(r => r.id === id)); setEditId(id); setView("rForm"); };
  const openDet = id => { setDetailId(id); setView("detail"); };
  const handleSaveRecipe = async (data) => { const up = editId ? recipes.map(r => r.id === editId ? { ...data, id: editId } : r) : [...recipes, data]; setRecipes(up); await saveR(up); toast_("✅ Receita salva!"); setDetailId(data.id); setView("detail"); };
  const pedirExcR = id => setConfirmDel({ tipo:"receita", id, nome: recipes.find(x=>x.id===id)?.nome||"" });
  const copiarReceita = id => { const r = recipes.find(x => x.id === id); setRFormInit({ ...JSON.parse(JSON.stringify(r)), id: genId(), nome: `Cópia de ${r.nome}` }); setEditId(null); setView("rForm"); toast_("📋 Revise e salve!"); };

  const openNewC = () => setView("cForm");
  const openDetC = async (id) => { const itens = await buscarItensCompra(id); setCompraItens(prev => ({ ...prev, [id]: itens })); setCompraDetalhe(id); setView("cDetail"); };
  const handleSaveCompra = async (header, validItens) => { setSaving(true); try { await salvarCompra(negocioId, user.id, header, validItens); await Promise.all([reloadCompras(), reloadProdutos()]); toast_("✅ Compra salva!"); setView("list"); setTab("compras"); } catch(e) { console.error(e); toast_("❌ Erro ao salvar"); } setSaving(false); };
  const pedirExcC = id => setConfirmDel({ tipo:"compra", id, nome: `Compra ${compras.find(x=>x.id===id)?.data_compra||""}` });

  const confirmarExc = async () => { if (!confirmDel) return; setSaving(true); if (confirmDel.tipo === "receita") { const up = recipes.filter(r => r.id !== confirmDel.id); setRecipes(up); await saveR(up); toast_("🗑 Receita excluída"); setView("list"); setTab("receitas"); } else if (confirmDel.tipo === "produto") { await desativarProduto(confirmDel.id); await reloadProdutos(); toast_("🗑 Produto desativado"); } else if (confirmDel.tipo === "compra") { await excluirCompra(confirmDel.id); await reloadCompras(); toast_("🗑 Compra excluída"); setView("list"); setTab("compras"); } setConfirmDel(null); setSaving(false); };

  const exportarCSV = (tipo) => { let csv="",nome=""; if (tipo==="receitas"){nome="receitas.csv";csv="Nome;Categoria;Rendimento;Margem%;Taxa%;Custo Total;Custo/Un;Preço Sugerido;Preço App;Lucro Lote\n";recipesCalc.forEach(r=>{const c=r._calc;csv+=`"${r.nome}";"${r.categoria||""}";"${r.rendimento}";"${r.margem}";"${r.taxaDelivery}";"${fmtN(c.total)}";"${fmtN(c.porUn)}";"${fmtN(c.final)}";"${fmtN(r.precoApp)}";"${fmtN(c.lucro)}"\n`;});}else{nome="produtos.csv";csv="Código;Nome;Categoria;Unidade;Preço;Embalagem;Custo/Un\n";filtP.forEach(p=>{const pu=pEmb(p)?pPreco(p)/pEmb(p):0;csv+=`"${p.codigo||""}";"${p.nome}";"${p.categoria}";"${p.unidade}";"${fmtN(pPreco(p))}";"${pEmb(p)}";"${fmtN(pu)}"\n`;});} const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=nome;a.click();URL.revokeObjectURL(url);toast_("📊 CSV exportado!"); };

  const filtR = useMemo(() => recipesCalc.filter(r => (r.nome.toLowerCase().includes(searchR.toLowerCase()) || (r.categoria||"").toLowerCase().includes(searchR.toLowerCase())) && (catR === "Todos" || r.categoria === catR)), [recipesCalc, searchR, catR]);
  const filtP = useMemo(() => produtos.filter(p => p.nome.toLowerCase().includes(searchP.toLowerCase()) && (catP === "Todos" || p.categoria === catP)).sort((a,b) => a.nome.localeCompare(b.nome)), [produtos, searchP, catP]);
  const mesesCompras = useMemo(() => { const set = new Set(compras.map(c => c.data_compra?.substring(0,7))); return Array.from(set).sort().reverse(); }, [compras]);
  const filtC = useMemo(() => compras.filter(c => mesFiltroC === "Todos" || c.data_compra?.startsWith(mesFiltroC)).filter(c => !searchC || (c.fornecedor||"").toLowerCase().includes(searchC.toLowerCase())), [compras, mesFiltroC, searchC]);

  // ── AUTH SCREENS (layout clean) ──
  const authInp = (err) => ({ width:"100%", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${err?"#f87171":"#e5e7eb"}`, background:"#fff", fontSize:14, color:"#111827", outline:"none", boxSizing:"border-box", marginBottom:12, fontFamily:"'DM Sans',sans-serif", transition:"border-color .15s" });
  const authCard = { background:"#fff", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:380, boxShadow:"0 4px 24px rgba(0,0,0,.08)", border:"1px solid #f3f4f6" };

  if (!appReady) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-3">🍰</div>
        <div className="text-gray-500 text-sm">Carregando...</div>
        <div style={{width:24,height:24,border:"2px solid #e5e7eb",borderTop:"2px solid #c8566b",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"16px auto 0"}}></div>
      </div>
    </div>
  );

  if (!user && authView === "emailConfirm") return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div style={authCard} className="text-center">
        <div className="text-5xl mb-4">📧</div>
        <div className="text-xl font-semibold text-gray-800 mb-2">Verifique seu email</div>
        <div className="text-sm text-gray-500 leading-relaxed mb-6">Enviamos um link para<br/><span className="font-medium text-gray-700">{authForm.email}</span><br/><br/>Confirme e volte para entrar.</div>
        <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setAuthView("login")}>← Voltar para o login</button>
      </div>
    </div>
  );

  if (!user && authView === "cadastro") return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div style={authCard}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🍰</div>
          <div className="text-xl font-semibold text-gray-800">Criar conta</div>
          <div className="text-xs text-gray-400 mt-1">Novo negócio</div>
        </div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nome do negócio</label>
        <input style={authInp(!!authError)} type="text" placeholder="Ex: Confeitaria da Jay" value={authForm.nomeNegocio} onChange={e=>{setAuthForm({...authForm,nomeNegocio:e.target.value});setAuthError("");}}/>
        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
        <input style={authInp(!!authError)} type="email" placeholder="seu@email.com" value={authForm.email} onChange={e=>{setAuthForm({...authForm,email:e.target.value});setAuthError("");}}/>
        <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
        <input style={authInp(!!authError)} type="password" placeholder="Mínimo 6 caracteres" value={authForm.senha} onChange={e=>{setAuthForm({...authForm,senha:e.target.value});setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&fazerCadastro()}/>
        {authError && <div className="text-red-400 text-xs mb-3">{authError}</div>}
        <button className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors mb-4" onClick={fazerCadastro} disabled={authLoading}>{authLoading?"Criando conta...":"Criar conta"}</button>
        <div className="text-center"><button className="text-sm text-gray-400 hover:text-gray-600 transition-colors" onClick={()=>{setAuthView("login");setAuthError("");}}>Já tenho conta → Entrar</button></div>
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div style={authCard}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍰</div>
          <div className="text-xl font-semibold text-gray-800">Delícias da Jay</div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Gestão</div>
        </div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
        <input style={authInp(!!authError)} type="email" placeholder="seu@email.com" value={authForm.email} onChange={e=>{setAuthForm({...authForm,email:e.target.value});setAuthError("");}}/>
        <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
        <input style={{...authInp(!!authError), animation:authError?"shake .3s":""}} type="password" placeholder="••••••••" value={authForm.senha} onChange={e=>{setAuthForm({...authForm,senha:e.target.value});setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&fazerLogin()}/>
        {authError && <div className="text-red-400 text-xs mb-3">{authError}</div>}
        <button className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors mb-4" onClick={fazerLogin} disabled={authLoading}>{authLoading?"Entrando...":"Entrar"}</button>
        <div className="text-center"><button className="text-sm text-gray-400 hover:text-gray-600 transition-colors" onClick={()=>{setAuthView("cadastro");setAuthError("");setAuthForm({email:"",senha:"",nomeNegocio:""});}}>Criar novo negócio →</button></div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-3">🍰</div>
        <div className="text-gray-500 text-sm">{negocioNome||"Carregando..."}</div>
        <div style={{width:24,height:24,border:"2px solid #e5e7eb",borderTop:"2px solid #c8566b",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"16px auto 0"}}></div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // NOVO LAYOUT — SIDEBAR + HEADER + CONTEÚDO
  // ══════════════════════════════════════════════════════════════
  const breadcrumb = { dashboard:"Dashboard", receitas:"Receitas", produtos:"Produtos", compras:"Compras", relatorios:"Relatórios", config:"Configurações" }[tab] || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0F0F12]">

      {/* ── SIDEBAR ── */}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-60"} shrink-0 bg-white dark:bg-[#0F0F12] border-r border-gray-200 dark:border-[#1F1F23] flex flex-col overflow-hidden transition-all duration-300`}>

        {/* Logo + toggle */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 dark:border-[#1F1F23] shrink-0">
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">Delícias da Jay</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Gestão</div>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {!sidebarCollapsed && <div className="px-2 pt-1 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Visão Geral</div>}
          <NavItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} label="Dashboard" active={tab==="dashboard"} collapsed={sidebarCollapsed} onClick={() => { setTab("dashboard"); setView("list"); }} />

          {!sidebarCollapsed && <div className="px-2 pt-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Confeitaria</div>}
          <NavItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>} label="Receitas" active={tab==="receitas"} collapsed={sidebarCollapsed} onClick={() => { setTab("receitas"); setView("list"); }} />
          <NavItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>} label="Produtos" active={tab==="produtos"} collapsed={sidebarCollapsed} onClick={() => { setTab("produtos"); setView("list"); }} />

          {!sidebarCollapsed && <div className="px-2 pt-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Financeiro</div>}
          <NavItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>} label="Compras" active={tab==="compras"} collapsed={sidebarCollapsed} onClick={() => { setTab("compras"); setView("list"); }} />
          <NavItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} label="Relatórios" active={tab==="relatorios"} collapsed={sidebarCollapsed} onClick={() => setTab("relatorios")} />

          {!sidebarCollapsed && <div className="px-2 pt-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sistema</div>}
          <NavItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} label="Configurações" active={tab==="config"} collapsed={sidebarCollapsed} onClick={() => setTab("config")} />
        </nav>

        {/* Usuário + logout */}
        <div className="shrink-0 border-t border-gray-200 dark:border-[#1F1F23] p-3">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 text-sm font-bold shrink-0">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{negocioNome}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
              <button onClick={fazerLogout} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Sair"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
            </div>
          ) : (
            <button onClick={fazerLogout} className="w-full flex justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Sair"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
          )}
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* HEADER */}
        <header className="h-14 bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] flex items-center px-5 gap-4 shrink-0">
          <div className="flex-1 min-w-0 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-gray-400 dark:text-gray-500">Delícias da Jay</span>
            <span className="mx-1.5 text-gray-300 dark:text-gray-600">/</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{breadcrumb}</span>
          </div>

          {(tab === "receitas" || tab === "produtos" || tab === "compras") && (
            <button
              onClick={tab === "receitas" ? openNewR : tab === "produtos" ? openNewP : openNewC}
              className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              + {tab === "receitas" ? "Receita" : tab === "produtos" ? "Produto" : "Compra"}
            </button>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? "Modo claro" : "Modo escuro"}
          >
            {darkMode
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </header>

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0F0F12]">

          {/* Dashboard */}
          {tab === "dashboard" && (
            <DashboardHome recipesCalc={recipesCalc} produtos={produtos} compras={compras} fmt={fmt} fmtN={fmtN} pPreco={pPreco} pEmb={pEmb}/>
          )}

          {/* Receitas: lista + detalhe lado a lado */}
          {tab === "receitas" && (
            <div className="flex h-full">
              <div className="w-72 shrink-0 bg-white dark:bg-[#0F0F12] border-r border-gray-200 dark:border-[#1F1F23] flex flex-col overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-[#1F1F23] space-y-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#1F1F23] text-sm text-gray-700 dark:text-gray-200 outline-none" placeholder="Buscar receita..." value={searchR} onChange={e=>setSearchR(e.target.value)}/>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto" style={{scrollbarWidth:"none"}}>
                    {["Todos",...CAT_R].map(c=><button key={c} onClick={()=>setCatR(c)} className={`shrink-0 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-colors ${catR===c?"bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900":"border-gray-200 dark:border-[#1F1F23] text-gray-500 dark:text-gray-400 hover:border-gray-400"}`}>{c}</button>)}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {filtR.length === 0
                    ? <div className="text-center py-10 text-gray-400 text-sm">{recipes.length === 0 ? "Nenhuma receita" : "Nada encontrado"}</div>
                    : filtR.map(r=>(
                      <div key={r.id} onClick={()=>openDet(r.id)} className={`flex items-center gap-2.5 p-2.5 rounded-lg mb-1 cursor-pointer transition-all border ${detailId===r.id&&view==="detail"?"bg-gray-100 dark:bg-[#1F1F23] border-gray-300 dark:border-gray-600":"border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                        <span className="text-xl shrink-0">{r.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{r.nome}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{r.categoria||"Sem categoria"}</div>
                        </div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white shrink-0">{fmt(r._calc.final)}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {view==="detail" && (()=>{ const r=recipesCalc.find(x=>x.id===detailId); if(!r) return null; return <DesktopDetail r={r} produtos={produtos} onEdit={()=>openEditR(r.id)} onCopy={()=>copiarReceita(r.id)} onDelete={()=>pedirExcR(r.id)}/>; })()}
                {view!=="detail" && (
                  <div className="flex-1 flex items-center justify-center h-full flex-col gap-3 text-gray-400">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-gray-300"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                    <div className="text-sm font-medium text-gray-500">Selecione uma receita para ver detalhes</div>
                    <div className="text-xs text-gray-400">ou clique em "+ Receita" para adicionar</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Produtos: lista + placeholder */}
          {tab === "produtos" && (
            <div className="flex h-full">
              <div className="w-72 shrink-0 bg-white dark:bg-[#0F0F12] border-r border-gray-200 dark:border-[#1F1F23] flex flex-col overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-[#1F1F23] space-y-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#1F1F23] text-sm text-gray-700 dark:text-gray-200 outline-none" placeholder="Buscar produto..." value={searchP} onChange={e=>setSearchP(e.target.value)}/>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto" style={{scrollbarWidth:"none"}}>
                    {["Todos",...CAT_P].map(c=><button key={c} onClick={()=>setCatP(c)} className={`shrink-0 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-colors ${catP===c?"bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900":"border-gray-200 dark:border-[#1F1F23] text-gray-500 dark:text-gray-400 hover:border-gray-400"}`}>{c}</button>)}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {filtP.length === 0
                    ? <div className="text-center py-10 text-gray-400 text-sm">Nenhum produto</div>
                    : filtP.map(p=>{ const pu=pEmb(p)?pPreco(p)/pEmb(p):0; return (
                      <div key={p.id} onClick={()=>openEditP(p.id)} className={`flex items-center gap-2.5 p-2.5 rounded-lg mb-1 cursor-pointer transition-all border ${editPId===p.id&&view==="pForm"?"bg-gray-100 dark:bg-[#1F1F23] border-gray-300 dark:border-gray-600":"border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                        <span className="text-lg shrink-0">{CATEMOJI[p.categoria]||"📦"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{p.nome}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{p.categoria} · R$ {fmtN(pu)}/{p.unidade}</div>
                        </div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white shrink-0">{fmt(pPreco(p))}</div>
                      </div>
                    );})
                  }
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3 h-full">
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-gray-300"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Selecione um produto para editar</div>
                <div className="text-xs text-gray-400">ou clique em "+ Produto" para adicionar</div>
              </div>
            </div>
          )}

          {/* Compras: lista + detalhe */}
          {tab === "compras" && (
            <div className="flex h-full">
              <div className="w-72 shrink-0 bg-white dark:bg-[#0F0F12] border-r border-gray-200 dark:border-[#1F1F23] flex flex-col overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-[#1F1F23] space-y-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#1F1F23] text-sm text-gray-700 dark:text-gray-200 outline-none" placeholder="Buscar fornecedor..." value={searchC} onChange={e=>setSearchC(e.target.value)}/>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto" style={{scrollbarWidth:"none"}}>
                    <button onClick={()=>setMesFiltroC("Todos")} className={`shrink-0 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-colors ${mesFiltroC==="Todos"?"bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900":"border-gray-200 dark:border-[#1F1F23] text-gray-500 dark:text-gray-400 hover:border-gray-400"}`}>Todos</button>
                    {mesesCompras.map(m=>{ const[a,me]=m.split("-"); return <button key={m} onClick={()=>setMesFiltroC(m)} className={`shrink-0 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-colors ${mesFiltroC===m?"bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900":"border-gray-200 dark:border-[#1F1F23] text-gray-500 dark:text-gray-400 hover:border-gray-400"}`}>{["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(me)]}/{a.slice(2)}</button>; })}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {filtC.length === 0
                    ? <div className="text-center py-10 text-gray-400 text-sm">{compras.length === 0 ? "Nenhuma compra" : "Nada encontrado"}</div>
                    : filtC.map(c=>(
                      <div key={c.id} onClick={()=>openDetC(c.id)} className={`flex items-center gap-2.5 p-2.5 rounded-lg mb-1 cursor-pointer transition-all border ${compraDetalhe===c.id&&view==="cDetail"?"bg-gray-100 dark:bg-[#1F1F23] border-gray-300 dark:border-gray-600":"border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                        <span className="text-lg shrink-0">🛒</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{c.fornecedor||"Sem fornecedor"}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</div>
                        </div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white shrink-0">{fmt(c.valor_total)}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {view==="cDetail" && compraDetalhe && (()=>{
                  const c=compras.find(x=>x.id===compraDetalhe); if(!c) return null;
                  const it=compraItens[compraDetalhe]||[];
                  const tot=it.reduce((sum,i)=>sum+parseFloat(i.valor_subtotal||0),0);
                  return (
                    <div className="p-7" style={{animation:"fadein .2s ease"}}>
                      <div className="mb-6">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{c.fornecedor||"Compra"}</h1>
                        <div className="text-xs text-gray-400 mt-1">{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR")} · {c.forma_pagamento||""} · {mapaUsuarios[c.created_by]||""}</div>
                      </div>
                      <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden mb-4">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Itens ({it.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
                          {it.map((i,idx)=>(
                            <div key={idx} className="flex items-center justify-between px-5 py-3">
                              <div>
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{i.produto_nome_snapshot}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{i.qtd} {i.unidade} × {fmt(i.valor_unitario)}</div>
                              </div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(i.valor_subtotal)}</div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-[#1F1F23]">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">Total</div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{fmt(tot)}</div>
                          </div>
                        </div>
                      </div>
                      {c.obs && (
                        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-5 mb-4">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Observações</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{c.obs}</p>
                        </div>
                      )}
                      <button className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={()=>pedirExcC(c.id)}>Excluir compra</button>
                    </div>
                  );
                })()}
                {(view!=="cDetail"||!compraDetalhe) && (
                  <div className="flex h-full items-center justify-center flex-col gap-3 text-gray-400">
                    <div className="text-5xl">🛒</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Selecione uma compra para ver detalhes</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Relatórios */}
          {tab === "relatorios" && (
            <RelatoriosPanel recipesCalc={recipesCalc} produtos={produtos} compras={compras} filtP={filtP} fmt={fmt} fmtN={fmtN} pPreco={pPreco} pEmb={pEmb} onClose={() => setTab("dashboard")} onExportCSV={exportarCSV}/>
          )}

          {/* Configurações */}
          {tab === "config" && (
            <div className="max-w-2xl mx-auto p-6">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                <p className="text-sm text-gray-400 mt-0.5">Personalize o seu negócio</p>
              </div>
              <ConfigForm config={config} saving={saving} onSaved={handleSaveConfig} toast_={toast_}/>
            </div>
          )}

        </main>
      </div>

      {/* Formulários (drawers) */}
      {view === "pForm" && <ResponsiveDrawer title={editPId ? "Editar Produto" : "Novo Produto"} onClose={() => setView("list")}><ProdutoForm initialData={pFormInit} editId={editPId} recipes={recipes} saving={saving} onSaved={handleSaveProd} onDelete={pedirExcP} onCopy={copiarProduto} toast_={toast_}/></ResponsiveDrawer>}
      {view === "rForm" && <ResponsiveDrawer title={editId ? "Editar Receita" : "Nova Receita"} onClose={() => setView(editId?"detail":"list")}><ReceitaForm initialData={rFormInit} editId={editId} produtos={produtos} saving={saving} onSaved={handleSaveRecipe} onOpenQuickP={() => setQuickPOpen(true)} toast_={toast_}/></ResponsiveDrawer>}
      {view === "cForm" && <ResponsiveDrawer title="Nova Compra" onClose={() => {setView("list");setTab("compras");}}><CompraForm produtos={produtos} saving={saving} onSaved={handleSaveCompra} onOpenQuickP={() => setQuickPOpen(true)} toast_={toast_}/></ResponsiveDrawer>}

      <ModalConfirm item={confirmDel} onConfirm={confirmarExc} onCancel={() => setConfirmDel(null)}/>
      <QuickProdModal open={quickPOpen} onClose={() => setQuickPOpen(false)} negocioId={negocioId} onProductSaved={reloadProdutos} toast_={toast_}/>
      {toast && <div style={s.tst}>{toast}</div>}
      {saving && <div style={s.sync}>💾 Salvando...</div>}
    </div>
  );
}