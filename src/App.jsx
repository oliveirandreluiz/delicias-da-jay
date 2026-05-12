import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT ───────────────────────────────────────────────────────
const SUPA_URL  = import.meta.env.VITE_SUPA_URL;
const SUPA_ANON = import.meta.env.VITE_SUPA_ANON;
const supabase  = createClient(SUPA_URL, SUPA_ANON, {
  auth: {
    persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
    storage: window.localStorage, storageKey: "delicias-jay-auth",
    lock: async (_n, _t, fn) => await fn(),
  },
});

// ─── CONSTANTES ────────────────────────────────────────────────────────────
const SEED_RECIPES = [];
const CAT_R  = ["Brownies","Docinhos","Copo da Felicidade","Bolo no Pote","Cones Trufados","Salgados","Outro"];
const CAT_P  = ["Secos","Laticínios","Chocolates","Embalagens","Outros"];
const UNIDS  = ["g","kg","ml","L","un","colher","xícara"];
const EMOJIS = ["🍫","🧁","🎂","🍰","🍬","🍮","🥧","🍩","🍪","🥐","🫙","🌋","🍇","🌽","🧇","🥮","🍭","☕","🌮","🥚","🧀"];
const CATEMOJI = {"Secos":"🌾","Laticínios":"🥛","Chocolates":"🍫","Embalagens":"📦","Outros":"🛒"};
const FORMAS_PAG = ["Pix","Cartão débito","Cartão crédito","Dinheiro","Boleto"];

// ─── HELPERS ───────────────────────────────────────────────────────────────
const fmt  = v => "R$ " + (parseFloat(v)||0).toFixed(2).replace(".",",");
const fmtN = v => (parseFloat(v)||0).toFixed(2).replace(".",",");
const genId = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).slice(2);
const pPreco = p => p.preco_ultimo !== undefined ? p.preco_ultimo : p.preco;
const pEmb   = p => p.embalagem_qtd !== undefined ? p.embalagem_qtd : p.embalagemQtd;

function calc(r, prods) {
  const ci = r.ingredientes.reduce((s,i) => {
    const p = prods.find(x => x.id === i.produtoId);
    if (!p) return s;
    const eq = pEmb(p);
    return eq > 0 ? s + (pPreco(p) / eq) * i.usadoQtd : s;
  }, 0);
  const pctOutros = (r.outrosCustos !== undefined ? r.outrosCustos : 30) / 100;
  const outros = ci * pctOutros;
  const total  = ci + outros + (r.despesas||0);
  const porUn  = r.rendimento > 0 ? total / r.rendimento : 0;
  const semT   = porUn * (1 + (r.margem||100) / 100);
  const tp     = (r.taxaDelivery||30) / 100;
  const final_ = tp < 1 ? semT / (1 - tp) : semT;
  const taxa   = final_ - semT;
  const lucro    = (final_ - taxa - porUn) * r.rendimento;
  const lucroApp = r.precoApp > 0 ? (r.precoApp - (r.precoApp * tp) - porUn) * r.rendimento : null;
  return { ci, outros, total, porUn, semT, taxa, final: final_, lucro, lucroApp };
}

// ─── CORES ─────────────────────────────────────────────────────────────────
const V="#4A1A2C", R="#C45C74", RL="#E8899A", RC="#F5D0D8", CR="#FFF0F3", G="#7A4A58", W="#fff";

// ─── ESTILOS ───────────────────────────────────────────────────────────────
const s = {
  app:{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:CR,fontFamily:"'DM Sans',sans-serif",color:V},
  hdr:{background:V,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100},
  logo:{fontFamily:"'Playfair Display',serif",color:RL,fontSize:17,lineHeight:1.2},
  lsub:{color:"#D4748866",fontSize:10,letterSpacing:".1em",textTransform:"uppercase"},
  bpri:{background:R,color:W,border:"none",borderRadius:50,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  bback:{background:"rgba(255,255,255,.12)",border:"none",color:W,borderRadius:50,padding:"7px 14px",fontSize:13,cursor:"pointer"},
  tabs:{display:"flex",borderBottom:`2px solid ${RC}`,background:W},
  tab:{flex:1,padding:"12px 8px",border:"none",background:"none",fontSize:12,fontWeight:600,color:`${G}88`,cursor:"pointer",borderBottom:"3px solid transparent",marginBottom:"-2px",fontFamily:"'DM Sans',sans-serif"},
  taba:{color:R,borderBottomColor:R},
  srchW:{margin:"12px 14px 0",position:"relative",display:"block"},
  srch:{width:"100%",padding:"10px 14px 10px 38px",borderRadius:50,border:`2px solid ${RC}`,background:CR,fontSize:13,color:V,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",display:"block"},
  chips:{display:"flex",gap:8,padding:"10px 14px",overflowX:"auto",scrollbarWidth:"none"},
  chip:{flexShrink:0,background:W,border:`2px solid ${RC}`,color:G,borderRadius:50,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  chipa:{background:V,borderColor:V,color:RL},
  cnt:{padding:"0 18px 6px",fontSize:11,color:`${G}88`},
  list:{padding:"0 14px 100px",display:"flex",flexDirection:"column",gap:10},
  card:{background:W,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:`0 2px 8px rgba(74,26,44,.08)`,cursor:"pointer",border:"1.5px solid transparent",transition:"all .15s"},
  cem:{width:46,height:46,background:CR,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0},
  cbd:{flex:1,minWidth:0},cnm:{fontWeight:600,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
  cmt:{fontSize:11,color:G,marginTop:2},cpr:{textAlign:"right",flexShrink:0},
  cpv:{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:R},cpl:{fontSize:10,color:`${G}88`},
  emp:{textAlign:"center",padding:"60px 20px"},
  sec:{background:W,borderRadius:14,padding:14,marginBottom:10,boxShadow:`0 2px 6px rgba(74,26,44,.06)`},
  st:{fontFamily:"'Playfair Display',serif",fontSize:14,marginBottom:10,color:V},
  lbl:{display:"block",fontSize:10,fontWeight:600,color:G,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4},
  inp:{width:"100%",padding:"10px 12px",borderRadius:9,border:`2px solid ${RC}`,background:CR,fontFamily:"'DM Sans',sans-serif",fontSize:14,color:V,outline:"none",marginBottom:10,boxSizing:"border-box",WebkitAppearance:"none"},
  tag:{background:`${R}18`,borderRadius:7,padding:"5px 9px",fontSize:11,color:R,fontWeight:600,marginBottom:7},
  badd:{background:CR,border:`2px dashed ${R}55`,color:R,borderRadius:9,padding:10,width:"100%",fontSize:13,fontWeight:600,cursor:"pointer",marginTop:3,fontFamily:"'DM Sans',sans-serif"},
  bsave:{background:`linear-gradient(135deg,${R},${RL})`,color:W,border:"none",borderRadius:50,padding:15,width:"100%",fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:`0 5px 18px rgba(196,92,116,.4)`},
  dh:{background:V,padding:"18px 18px 22px"},dn:{fontFamily:"'Playfair Display',serif",fontSize:20,color:W,marginBottom:3},
  dc:{fontSize:11,color:"#D4748866",textTransform:"uppercase",letterSpacing:".07em"},db:{padding:"12px 12px 100px"},
  ir:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid #FDE8ED`,fontSize:13},
  icost:{fontWeight:600,color:R,flexShrink:0,marginLeft:6},
  pg:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8},
  pb:{background:CR,borderRadius:9,padding:"9px 11px",border:`1.5px solid ${RC}`},
  pl:{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:G,marginBottom:3},
  pv:{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700},
  ph:{background:`linear-gradient(135deg,${R},${RL})`,borderRadius:12,padding:"14px 16px",color:W,margin:"7px 0"},
  phl:{fontSize:11,opacity:.8,marginBottom:3},phv:{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700},
  be:{flex:1,background:V,color:W,border:"none",borderRadius:50,padding:13,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  bd:{background:"none",border:`2px solid ${RC}`,color:R,borderRadius:50,padding:"13px 16px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  fb:{padding:"12px 12px 20px"},er:{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12},
  eb:{width:38,height:38,borderRadius:9,border:`2px solid ${RC}`,background:CR,fontSize:19,cursor:"pointer"},
  ebs:{borderColor:R,background:"#FFE0E7"},
  ic:{background:CR,borderRadius:10,padding:11,marginBottom:9,border:`1.5px solid ${RC}`},
  ich:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7},
  brm:{background:"none",border:"none",color:R,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  help:{fontSize:12,color:G,marginBottom:10,lineHeight:1.5,background:"#FFF7F9",borderRadius:7,padding:"7px 10px",borderLeft:`3px solid ${R}`},
  cs:{background:CR,borderRadius:9,padding:"10px 12px",marginBottom:12,border:`1.5px solid ${RC}`},
  cr:{display:"flex",justifyContent:"space-between",fontSize:13,padding:"2px 0",color:V},
  tst:{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",background:V,color:W,padding:"11px 22px",borderRadius:50,fontSize:13,fontWeight:500,zIndex:300,whiteSpace:"nowrap",boxShadow:"0 4px 18px rgba(0,0,0,.3)"},
  sync:{position:"fixed",top:68,right:10,background:R,color:W,padding:"3px 10px",borderRadius:50,fontSize:10,zIndex:100},
};

// ─── CSS GLOBAL (Injetado) ────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${CR};font-family:'DM Sans',sans-serif;}
  input,select,textarea{color:${V}!important;-webkit-text-fill-color:${V}!important;}
  input:focus,select:focus,textarea:focus{border-color:${R}!important;background:#fff!important;}
  input::placeholder{color:${V}55!important;-webkit-text-fill-color:${V}55!important;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${RC};border-radius:4px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  
  .card-h:hover{background:${V}22!important;cursor:pointer;}
  .card-hl:hover{box-shadow:0 4px 16px rgba(74,26,44,.13)!important;transform:translateY(-1px);cursor:pointer;}
  .btn-h:hover{opacity:.85;cursor:pointer;}
  .ch:hover{border-color:${RC}!important;transform:translateY(-1px);}
  .po:hover{background:${CR}!important;}
  
  .desktop-only{display:none!important;}
  .mobile-only{display:block!important;}

  /* ── RESPONSIVE DRAWER CSS ── */
  @media(max-width:767px){
    .drawer-overlay { position: fixed; inset: 0; background: ${CR}; z-index: 200; display: flex; flex-direction: column; overflow-y: auto; }
    .drawer-container { width: 100%; min-height: 100vh; background: ${CR}; display: flex; flex-direction: column; }
    .form-header-mob { background: ${V}; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
    .drawer-body { padding: 12px 12px 100px; flex: 1; }
    .drawer-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
  }

  @media(min-width:768px){
    .desktop-only{display:flex!important;}
    .mobile-only{display:none!important;}
    .desk-grid{display:grid!important;grid-template-columns:280px 1fr;height:100vh;overflow:hidden;}
    .desk-side{background:${V};display:flex;flex-direction:column;overflow:hidden;height:100vh;}
    .desk-main{background:${CR};overflow-y:auto;display:flex;flex-direction:column;}
    
    /* Drawer Desktop */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; justify-content: flex-end; backdrop-filter: blur(2px); overflow: hidden; }
    .drawer-container { width: 500px; height: 100vh; background: ${CR}; box-shadow: -4px 0 24px rgba(0,0,0,0.15); animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: flex; flex-direction: column; overflow: hidden; }
    .drawer-header { padding: 20px 24px; background: #FFF; border-bottom: 1px solid ${RC}; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .drawer-header h2 { font-family: 'Playfair Display', serif; font-size: 20px; color: ${V}; margin: 0; }
    .drawer-body { padding: 24px; overflow-y: auto; flex: 1; }
    @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }

    /* Forms Desktop Inputs */
    .desk-row { display: flex; gap: 12px; }
    .desk-row > div { flex: 1; min-width: 0; }
    .drawer-actions { display: flex; flex-direction: row-reverse; justify-content: flex-start; gap: 10px; margin-top: 24px; border-top: 1px solid ${RC}; padding-top: 16px; }
    .drawer-actions button { width: auto!important; padding: 12px 24px!important; border-radius: 8px!important; margin-top: 0!important; }
  }

  /* ── PRINT CSS OTIMIZADO ── */
  @media print {
    .no-print, .desk-side, header, .tabs, .drawer-overlay, button, .sync, .tst {
      display: none !important;
    }
    .print-only { display: block !important; }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body, .app, #root {
      background: #fff !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .desk-grid {
      display: block !important;
      height: auto !important;
      overflow: visible !important;
    }
    
    .desk-main {
      overflow: visible !important;
      background: #fff !important;
      padding: 0 !important;
      height: auto !important;
    }

    .desk-detail-grid {
      display: grid !important;
      grid-template-columns: 1fr 280px !important;
      gap: 20px !important;
      align-items: start !important;
      break-inside: avoid;
    }

    .desk-detail-grid > div {
      box-shadow: none !important;
      border: 1px solid #F5D0D8 !important;
      break-inside: avoid;
    }
  }
`;

// ═══════════════════════════════════════════════════════════════
// COMPONENTES ISOLADOS (MODAIS E FORMS)
// ═══════════════════════════════════════════════════════════════

const ModalConfirm = memo(function ModalConfirm({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:W,borderRadius:18,padding:22,width:"100%",maxWidth:360,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:10}}>🗑</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:V,marginBottom:7,fontWeight:700}}>Confirmar exclusão</div>
        <div style={{fontSize:13,color:G,marginBottom:20,lineHeight:1.6}}>Excluir <b>"{item.nome}"</b>?<br/><span style={{fontSize:11,color:R}}>Esta ação não pode ser desfeita.</span></div>
        <div style={{display:"flex",gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:50,border:`2px solid ${RC}`,background:W,color:G,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onCancel}>Cancelar</button>
          <button style={{flex:1,padding:13,borderRadius:50,border:"none",background:`linear-gradient(135deg,${R},${RL})`,color:W,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onConfirm}>Sim, excluir</button>
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
        {/* HEADER MOBILE */}
        <header className="mobile-only form-header-mob">
          <button style={s.bback} onClick={onClose}>← Voltar</button>
          <span style={s.logo}>{title}</span><div style={{width:70}}/>
        </header>
        {/* HEADER DESKTOP */}
        <div className="desktop-only drawer-header">
          <h2>{title}</h2>
          <button style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:G}} onClick={onClose}>✕</button>
        </div>
        {/* BODY */}
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
      await supabase.from("produtos_v2").insert({ negocio_id: negocioId, nome: f.nome.trim(), categoria: f.categoria, unidade: f.unidade, tipo: "ambos", preco_ultimo: parseFloat(f.preco_ultimo)||0, embalagem_qtd: parseFloat(f.embalagem_qtd)||1 });
      await onProductSaved(); onClose(); toast_("✅ Produto cadastrado!");
    } catch(e) { console.error(e); toast_("❌ Erro ao salvar"); }
    setSaving(false);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div style={{background:W,borderRadius:"18px 18px 0 0",padding:18,width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:12,color:V}}>📦 Novo Produto Rápido</div>
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
        <div style={s.st}>📦 Dados do Produto</div>
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
      {usadoEm.length > 0 && <div style={s.sec}><div style={s.st}>📋 Usado em {usadoEm.length} receita{usadoEm.length>1?"s":""}</div>{usadoEm.map(r => <div key={r.id} style={{fontSize:12,padding:"4px 0",borderBottom:`1px solid #FDE8ED`,display:"flex",gap:7}}><span>{r.emoji}</span><span>{r.nome}</span></div>)}</div>}
      <div className="drawer-actions">
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "✅ Salvar Produto"}</button>
        {editId && <button style={{...s.bpri,borderRadius:50}} onClick={() => onCopy(editId)}>📋 Copiar</button>}
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
        <div style={s.st}>🍰 Informações</div>
        <div style={s.er}>{EMOJIS.map(e => <button key={e} style={{...s.eb,...(f.emoji===e?s.ebs:{})}} onClick={() => handleChange("emoji",e)}>{e}</button>)}</div>
        <label style={s.lbl}>Nome *</label><input style={s.inp} placeholder="Ex: Brownie Ninho" value={f.nome} onChange={e => handleChange("nome",e.target.value)}/>
        <div className="desk-row">
          <div style={{flex:1.5}}><label style={s.lbl}>Categoria</label><select style={s.inp} value={f.categoria} onChange={e => handleChange("categoria",e.target.value)}><option value="">Selecionar...</option>{CAT_R.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label style={s.lbl}>Rend. (un.)</label><input style={s.inp} type="number" placeholder="10" value={f.rendimento} onChange={e => handleChange("rendimento",parseFloat(e.target.value)||0)}/></div>
        </div>
        <label style={s.lbl}>Observações (opcional)</label><textarea style={{...s.inp,height:65,resize:"none"}} value={f.obs||""} onChange={e => handleChange("obs",e.target.value)}/>
      </div>
      <div style={s.sec}>
        <div style={s.st}>🧂 Ingredientes</div>
        <div style={s.help}>Digite para buscar. Não encontrou? Cadastre abaixo!</div>
        {f.ingredientes.map((ing, idx) => {
          const p = produtos.find(x => x.id === ing.produtoId);
          const pr = p ? pPreco(p) : 0; const eq = p ? pEmb(p) : 1;
          const cu = p && eq > 0 ? (pr / eq) * ing.usadoQtd : 0;
          const bsc = p ? "" : (ing._busca || "");
          const res = bsc.trim().length > 0 ? produtos.filter(pr2 => pr2.nome.toLowerCase().includes(bsc.toLowerCase())).sort((a,b) => a.nome.localeCompare(b.nome)).slice(0,8) : [];
          return (<div key={idx} style={s.ic}><div style={s.ich}><span style={{fontSize:12,fontWeight:600,color:G}}>Ingrediente {idx+1}</span><button style={s.brm} onClick={() => setF(prev => ({...prev, ingredientes: prev.ingredientes.filter((_,i)=>i!==idx)}))}>✕ remover</button></div>
            <label style={s.lbl}>Buscar produto</label>
            <div style={{position:"relative",marginBottom:p?0:10}}>
              {p ? (<div style={{display:"flex",alignItems:"center",gap:7,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:9,padding:"9px 12px"}}><span>✅</span><span style={{flex:1,fontSize:13,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</span><button style={{background:"none",border:"none",color:R,fontSize:15,cursor:"pointer",padding:0,flexShrink:0}} onClick={() => handleIngChange(idx,"produtoId","")}>✕</button></div>
              ) : (<><input style={{...s.inp,marginBottom:0,paddingLeft:34,background:CR,borderColor:RC}} placeholder="Digite para buscar..." value={bsc} onChange={e => handleIngChange(idx,"_busca",e.target.value)}/><span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none"}}>🔍</span>
                {res.length > 0 && <div style={{position:"absolute",top:"100%",left:0,right:0,background:W,border:`2px solid ${RC}`,borderRadius:10,zIndex:50,boxShadow:"0 8px 20px rgba(74,26,44,.15)",maxHeight:190,overflowY:"auto"}}>{res.map(pr2 => <div key={pr2.id} className="po" style={{padding:"9px 12px",cursor:"pointer",borderBottom:`1px solid #FDE8ED`,fontSize:12}} onClick={() => handleIngChange(idx,"produtoId",pr2.id)}><div style={{fontWeight:600,color:V}}>{pr2.nome}</div><div style={{fontSize:10,color:G,marginTop:1}}>{pr2.categoria} · R$ {fmtN(pPreco(pr2))}/{pEmb(pr2)}{pr2.unidade}</div></div>)}</div>}
                {bsc.trim().length > 0 && res.length === 0 && <div style={{position:"absolute",top:"100%",left:0,right:0,background:W,border:`2px solid ${RC}`,borderRadius:10,zIndex:50,padding:"10px 12px",fontSize:12,color:G}}>Nenhum produto — cadastre abaixo! 👇</div>}</>)}
            </div>
            {p && <><div style={{marginTop:7}}/><label style={s.lbl}>Quantidade usada ({p.unidade})</label><input style={s.inp} type="number" step="any" placeholder="300" value={ing.usadoQtd||""} onChange={e => handleIngChange(idx,"usadoQtd",parseFloat(e.target.value)||0)}/>{cu > 0 && <div style={s.tag}>💡 Custo: {fmt(cu)}</div>}</>}
          </div>);
        })}
        <button style={s.badd} onClick={() => setF(prev => ({...prev, ingredientes: [...prev.ingredientes, {produtoId:"",usadoQtd:0}]}))}>+ Adicionar ingrediente</button>
        {onOpenQuickP && <button style={{...s.badd,marginTop:7,borderColor:"#86EFAC55",color:"#166534",background:"#F0FFF4"}} onClick={onOpenQuickP}>📦 Cadastrar novo produto</button>}
      </div>
      <div style={s.sec}>
        <div style={s.st}>💰 Precificação</div>
        <div style={s.cs}><div style={s.cr}><span>Custo ingredientes</span><strong>{fmt(c.ci)}</strong></div><div style={s.cr}><span>Outros custos ({f.outrosCustos||30}%)</span><strong>{fmt(c.outros)}</strong></div><div style={{...s.cr,fontWeight:700,borderTop:`1.5px solid ${RC}`,paddingTop:5,marginTop:3}}><span>Custo total</span><strong>{fmt(c.total)}</strong></div><div style={s.cr}><span>Custo por unidade</span><strong>{fmt(c.porUn)}</strong></div></div>
        <div className="desk-row">
          <div><label style={s.lbl}>Margem de lucro (%)</label><input style={{...s.inp,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:R,textAlign:"center"}} type="number" min={0} step={1} placeholder="100" value={f.margem||""} onChange={e => handleChange("margem",parseFloat(e.target.value)||0)}/></div>
          <div><label style={s.lbl}>Taxa delivery (%)</label><input style={{...s.inp,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:R,textAlign:"center"}} type="number" min={0} step={1} placeholder="30" value={f.taxaDelivery||""} onChange={e => handleChange("taxaDelivery",parseFloat(e.target.value)||0)}/></div>
        </div>
        <label style={s.lbl}>Outros custos — gás, energia, etc. (%)</label>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><input style={{...s.inp,marginBottom:0,width:90,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:R,textAlign:"center"}} type="number" min={0} step={1} placeholder="30" value={f.outrosCustos!==undefined?f.outrosCustos:30} onChange={e => handleChange("outrosCustos",parseFloat(e.target.value)||0)}/><div style={{fontSize:12,color:G}}>= {fmt(c.outros)} sobre ingredientes</div></div>
        {c.porUn > 0 && <div style={{...s.tag,marginBottom:10}}>💡 {fmt(c.porUn)} × {f.margem||0}% margem ÷ {100-(f.taxaDelivery||30)}% = {fmt(c.final)}</div>}
        <div className="desk-row">
          <div><label style={s.lbl}>Despesas extras</label><input style={s.inp} type="number" step="0.01" placeholder="0,00" value={f.despesas||""} onChange={e => handleChange("despesas",parseFloat(e.target.value)||0)}/></div>
          <div><label style={s.lbl}>Preço no app</label><input style={s.inp} type="number" step="0.01" placeholder="0,00" value={f.precoApp||""} onChange={e => handleChange("precoApp",parseFloat(e.target.value)||0)}/></div>
        </div>
        <div style={s.ph}><div style={s.phl}>🏷 Preço de venda sugerido/un</div><div style={s.phv}>{fmt(c.final)}</div><div style={{fontSize:11,opacity:.75,marginTop:2}}>Lucro lote: {fmt(c.lucro)}</div></div>
      </div>
      <div className="drawer-actions">
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "✅ Salvar Receita"}</button>
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
      <div style={s.sec}><div style={s.st}>🛒 Dados da Compra</div>
        <div className="desk-row">
          <div style={{flex:1.2}}><label style={s.lbl}>Data *</label><input style={s.inp} type="date" value={header.data_compra} onChange={e => handleHeaderChange("data_compra", e.target.value)}/></div>
          <div style={{flex:1}}><label style={s.lbl}>Nº Documento / NF</label><input style={s.inp} placeholder="Ex: 001234" value={header.num_doc} onChange={e => handleHeaderChange("num_doc", e.target.value)}/></div>
        </div>
        <div className="desk-row">
          <div style={{flex:1.5}}><label style={s.lbl}>Empresa / Fornecedor</label><input style={s.inp} placeholder="Ex: Atacadão" value={header.fornecedor} onChange={e => handleHeaderChange("fornecedor", e.target.value)}/></div>
          <div><label style={s.lbl}>Forma de pagamento</label><select style={s.inp} value={header.forma_pagamento} onChange={e => handleHeaderChange("forma_pagamento", e.target.value)}><option value="">—</option>{FORMAS_PAG.map(f => <option key={f}>{f}</option>)}</select></div>
        </div>
      </div>
      <div style={s.sec}><div style={s.st}>📦 Itens da Compra</div><div style={s.help}>Busque o produto cadastrado. Não encontrou? Cadastre abaixo!</div>
        {itens.map((item, idx) => {
          const prod = produtos.find(p => p.id === item.produto_id);
          const bsc = prod ? "" : (item._busca || "");
          const res = bsc.trim().length > 0 ? produtos.filter(pr => pr.nome.toLowerCase().includes(bsc.toLowerCase())).sort((a,b) => a.nome.localeCompare(b.nome)).slice(0,8) : [];
          const subtotal = (parseFloat(item.qtd)||0) * (parseFloat(item.valor_unitario)||0);
          return (<div key={idx} style={s.ic}><div style={s.ich}><span style={{fontSize:12,fontWeight:600,color:G}}>Item {idx+1}</span><button style={s.brm} onClick={() => setItens(prev => prev.filter((_,i)=>i!==idx))}>✕ remover</button></div>
            <label style={s.lbl}>Produto *</label>
            <div style={{position:"relative",marginBottom:prod?0:10}}>
              {prod ? (<div style={{display:"flex",alignItems:"center",gap:7,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:9,padding:"9px 12px"}}><span>✅</span><span style={{flex:1,fontSize:13,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{prod.nome} <span style={{fontWeight:400,fontSize:11,color:"#166534aa"}}>({prod.codigo})</span></span><button style={{background:"none",border:"none",color:R,fontSize:15,cursor:"pointer",padding:0,flexShrink:0}} onClick={() => handleItemChange(idx,"produto_id","")}>✕</button></div>
              ) : (<><input style={{...s.inp,marginBottom:0,paddingLeft:34,background:CR,borderColor:RC}} placeholder="Buscar produto..." value={bsc} onChange={e => handleItemChange(idx,"_busca",e.target.value)}/><span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none"}}>🔍</span>
                {res.length > 0 && <div style={{position:"absolute",top:"100%",left:0,right:0,background:W,border:`2px solid ${RC}`,borderRadius:10,zIndex:50,boxShadow:"0 8px 20px rgba(74,26,44,.15)",maxHeight:190,overflowY:"auto"}}>{res.map(pr => <div key={pr.id} className="po" style={{padding:"9px 12px",cursor:"pointer",borderBottom:`1px solid #FDE8ED`,fontSize:12}} onClick={() => { handleItemChange(idx,"produto_id",pr.id); handleItemChange(idx,"unidade",pr.unidade); }}><div style={{fontWeight:600,color:V}}>{pr.nome} <span style={{fontWeight:400,color:G}}>({pr.codigo})</span></div><div style={{fontSize:10,color:G,marginTop:1}}>{pr.categoria} · último: {fmt(pPreco(pr))}</div></div>)}</div>}</>)}
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
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "✅ Salvar Compra"}</button>
      </div>
    </>
  );
}

// ─── MINI BAR CHART (SVG puro — sem dependência) ─────────────
function MiniBarChart({ data, color = R, height = 110 }) {
  if (!data || data.length === 0) return <div style={{textAlign:"center",padding:20,color:G,fontSize:12}}>Sem dados</div>;
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
              <text x={x + barW / 2} y={height - h - 4} textAnchor="middle" fontSize={9} fontWeight={600} fill={V}>{d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value > 0 ? d.value : ""}</text>
              <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize={9} fill={G}>{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────
function StatCard({ emoji, label, value, sub, accent = R }) {
  return (
    <div style={{background:W,borderRadius:14,padding:"16px 18px",boxShadow:`0 2px 8px rgba(74,26,44,.06)`,border:`1.5px solid ${RC}`,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:44,height:44,borderRadius:12,background:`${accent}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{emoji}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10,fontWeight:600,color:G,textTransform:"uppercase",letterSpacing:".04em"}}>{label}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:V,marginTop:2}}>{value}</div>
        {sub && <div style={{fontSize:11,color:accent,fontWeight:500,marginTop:1}}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── DASHBOARD HOME (desktop — quando nenhum item está selecionado) ──
function DashboardHome({ recipesCalc, produtos, compras, fmt, fmtN, pPreco, pEmb }) {
  // KPIs de receitas
  const totalReceitas = recipesCalc.length;
  const totalProdutos = produtos.length;
  const margemMedia = totalReceitas > 0 ? recipesCalc.reduce((s,r) => s + (r.margem||0), 0) / totalReceitas : 0;
  const custoMedio = totalReceitas > 0 ? recipesCalc.reduce((s,r) => s + r._calc.porUn, 0) / totalReceitas : 0;
  const lucroTotalSugerido = recipesCalc.reduce((s,r) => s + r._calc.lucro, 0);

  // KPIs de compras (mês atual)
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`;
  const comprasMes = compras.filter(c => c.data_compra?.startsWith(mesAtual));
  const totalComprasMes = comprasMes.reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
  const totalComprasGeral = compras.reduce((s,c) => s + parseFloat(c.valor_total||0), 0);

  // Gráfico de compras por mês (últimos 6 meses)
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][d.getMonth()];
    const val = compras.filter(c => c.data_compra?.startsWith(key)).reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
    meses.push({ label, value: Math.round(val) });
  }

  // Top receitas por lucro
  const topReceitas = [...recipesCalc].sort((a,b) => b._calc.lucro - a._calc.lucro).slice(0,5);

  // Produtos mais usados em receitas
  const prodUso = {};
  recipesCalc.forEach(r => r.ingredientes.forEach(i => { if(i.produtoId) prodUso[i.produtoId] = (prodUso[i.produtoId]||0) + 1; }));
  const topProdutos = Object.entries(prodUso).sort((a,b) => b[1] - a[1]).slice(0,5).map(([id,count]) => {
    const p = produtos.find(x => x.id === id);
    return p ? { nome: p.nome, count, custo: pPreco(p) } : null;
  }).filter(Boolean);

  // Alertas
  const semIngrediente = recipesCalc.filter(r => r.ingredientes.filter(i=>i.produtoId).length === 0);
  const margemBaixa = recipesCalc.filter(r => r.margem < 50);

  return (
    <div style={{padding:"28px 32px",animation:"fadein .3s ease",overflowY:"auto"}}>
      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:V,margin:0}}>Painel Geral</h1>
          <div style={{fontSize:12,color:G,marginTop:4}}>Visão geral do seu negócio</div>
        </div>
        <div style={{fontSize:12,color:G,display:"flex",alignItems:"center",gap:6}}>
          📅 {hoje.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:12,marginBottom:24}}>
        <StatCard emoji="🍰" label="Receitas" value={totalReceitas} sub={`Margem média: ${margemMedia.toFixed(0)}%`} accent={R}/>
        <StatCard emoji="📦" label="Produtos" value={totalProdutos} sub={`Custo médio/un: ${fmt(custoMedio)}`} accent="#1565C0"/>
        <StatCard emoji="🛒" label="Compras do Mês" value={fmt(totalComprasMes)} sub={`${comprasMes.length} compra${comprasMes.length!==1?"s":""}`} accent="#E65100"/>
        <StatCard emoji="💰" label="Lucro Potencial" value={fmt(lucroTotalSugerido)} sub="Soma de todas as receitas" accent="#2E7D32"/>
      </div>

      {/* GRÁFICO + TOP RECEITAS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {/* Gráfico de compras */}
        <div style={{background:W,borderRadius:14,padding:"18px 20px",boxShadow:`0 2px 8px rgba(74,26,44,.06)`,border:`1.5px solid ${RC}`}}>
          <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:14,fontFamily:"'Playfair Display',serif"}}>💸 Compras por Mês</div>
          {compras.length > 0 ? <MiniBarChart data={meses} color="#E65100" height={100}/> : <div style={{textAlign:"center",padding:"30px 0",color:G,fontSize:12}}>Registre compras para ver o gráfico</div>}
          <div style={{textAlign:"right",marginTop:8,fontSize:11,color:G}}>Total geral: <strong style={{color:V}}>{fmt(totalComprasGeral)}</strong></div>
        </div>

        {/* Top receitas por lucro */}
        <div style={{background:W,borderRadius:14,padding:"18px 20px",boxShadow:`0 2px 8px rgba(74,26,44,.06)`,border:`1.5px solid ${RC}`}}>
          <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:14,fontFamily:"'Playfair Display',serif"}}>🏆 Top Receitas por Lucro</div>
          {topReceitas.length > 0 ? topReceitas.map((r,i) => (
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<topReceitas.length-1?`1px solid ${RC}`:"none"}}>
              <div style={{width:24,height:24,borderRadius:7,background:i===0?`linear-gradient(135deg,${R},${RL})`:i===1?"#FCD34D":RC,color:i<2?W:V,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:18,flexShrink:0}}>{r.emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:V,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nome}</div>
                <div style={{fontSize:10,color:G}}>Margem {r.margem}% · {fmt(r._calc.final)}/un</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:"#2E7D32"}}>{fmt(r._calc.lucro)}</div>
                <div style={{fontSize:9,color:G}}>lucro/lote</div>
              </div>
            </div>
          )) : <div style={{textAlign:"center",padding:"30px 0",color:G,fontSize:12}}>Cadastre receitas para ver o ranking</div>}
        </div>
      </div>

      {/* PRODUTOS MAIS USADOS + ALERTAS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Produtos mais usados */}
        <div style={{background:W,borderRadius:14,padding:"18px 20px",boxShadow:`0 2px 8px rgba(74,26,44,.06)`,border:`1.5px solid ${RC}`}}>
          <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:14,fontFamily:"'Playfair Display',serif"}}>📦 Insumos Mais Usados</div>
          {topProdutos.length > 0 ? topProdutos.map((p,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<topProdutos.length-1?`1px solid ${RC}`:"none"}}>
              <div style={{width:24,height:24,borderRadius:7,background:`${R}15`,color:R,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{p.count}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,color:V,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nome}</div>
              </div>
              <div style={{fontSize:12,fontWeight:600,color:R,flexShrink:0}}>{fmt(p.custo)}</div>
            </div>
          )) : <div style={{textAlign:"center",padding:"30px 0",color:G,fontSize:12}}>Adicione ingredientes às receitas</div>}
        </div>

        {/* Alertas */}
        <div style={{background:W,borderRadius:14,padding:"18px 20px",boxShadow:`0 2px 8px rgba(74,26,44,.06)`,border:`1.5px solid ${RC}`}}>
          <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:14,fontFamily:"'Playfair Display',serif"}}>⚠️ Alertas</div>
          {semIngrediente.length > 0 && (
            <div style={{background:"#FFF3CD",border:"1.5px solid #FFC107",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:600,color:"#856404"}}>🧂 {semIngrediente.length} receita{semIngrediente.length>1?"s":""} sem ingredientes</div>
              <div style={{fontSize:10,color:"#856404",marginTop:3,opacity:.8}}>{semIngrediente.map(r=>r.nome).join(", ")}</div>
            </div>
          )}
          {margemBaixa.length > 0 && (
            <div style={{background:"#FFEBEE",border:"1.5px solid #EF9A9A",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:600,color:"#C62828"}}>📉 {margemBaixa.length} receita{margemBaixa.length>1?"s":""} com margem abaixo de 50%</div>
              <div style={{fontSize:10,color:"#C62828",marginTop:3,opacity:.8}}>{margemBaixa.map(r=>`${r.nome} (${r.margem}%)`).join(", ")}</div>
            </div>
          )}
          {semIngrediente.length === 0 && margemBaixa.length === 0 && (
            <div style={{background:"#E8F5E9",border:"1.5px solid #81C784",borderRadius:10,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:6}}>✅</div>
              <div style={{fontSize:12,fontWeight:600,color:"#2E7D32"}}>Tudo certo!</div>
              <div style={{fontSize:11,color:"#2E7D32",opacity:.7,marginTop:2}}>Nenhum alerta no momento</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RELATÓRIOS PANEL (substitui o modal simples) ────────────
function RelatoriosPanel({ recipesCalc, produtos, compras, filtP, fmt, fmtN, pPreco, pEmb, onClose, onExportCSV }) {
  const [relTab, setRelTab] = useState("receitas");

  // Cálculos globais
  const totalCustoReceitas = recipesCalc.reduce((s,r) => s + r._calc.total, 0);
  const totalLucroSugerido = recipesCalc.reduce((s,r) => s + r._calc.lucro, 0);
  const margemMedia = recipesCalc.length > 0 ? recipesCalc.reduce((s,r) => s + (r.margem||0), 0) / recipesCalc.length : 0;

  // Compras por mês para gráfico
  const hoje = new Date();
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][d.getMonth()];
    const val = compras.filter(c => c.data_compra?.startsWith(key)).reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
    meses.push({ label, value: Math.round(val) });
  }

  // Lucro por receita para gráfico
  const lucroData = recipesCalc.slice(0,8).map(r => ({ label: r.nome.substring(0,8), value: Math.round(r._calc.lucro) }));

  // Distribuição por categoria
  const catDist = {};
  recipesCalc.forEach(r => { const cat = r.categoria||"Sem categoria"; catDist[cat] = (catDist[cat]||0) + 1; });

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(2px)"}}>
      <div style={{background:CR,borderRadius:20,width:"100%",maxWidth:720,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(74,26,44,.2)"}}>
        {/* Header */}
        <div style={{padding:"20px 24px",background:W,borderBottom:`1.5px solid ${RC}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:V,fontWeight:700}}>📊 Relatórios</div>
            <div style={{fontSize:11,color:G,marginTop:2}}>Análise completa do seu negócio</div>
          </div>
          <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:G,padding:4}} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderBottom:`1.5px solid ${RC}`,background:W,flexShrink:0}}>
          {[{k:"receitas",l:"🍰 Receitas"},{k:"produtos",l:"📦 Produtos"},{k:"compras",l:"💸 Compras"}].map(t => (
            <button key={t.k} onClick={() => setRelTab(t.k)} style={{flex:1,padding:"12px 8px",border:"none",background:"none",fontSize:12,fontWeight:600,color:relTab===t.k?R:`${G}88`,cursor:"pointer",borderBottom:relTab===t.k?`3px solid ${R}`:"3px solid transparent",fontFamily:"'DM Sans',sans-serif"}}>{t.l}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>

          {/* ── TAB RECEITAS ── */}
          {relTab === "receitas" && <>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
              <StatCard emoji="🍰" label="Total Receitas" value={recipesCalc.length} accent={R}/>
              <StatCard emoji="📊" label="Margem Média" value={`${margemMedia.toFixed(0)}%`} accent={margemMedia>=60?"#2E7D32":"#E65100"}/>
              <StatCard emoji="💰" label="Lucro Potencial" value={fmt(totalLucroSugerido)} accent="#2E7D32"/>
            </div>

            {/* Gráfico de lucro */}
            {lucroData.length > 0 && (
              <div style={{background:W,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${RC}`,marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:12,fontFamily:"'Playfair Display',serif"}}>Lucro por Receita</div>
                <MiniBarChart data={lucroData} color="#2E7D32" height={90}/>
              </div>
            )}

            {/* Categorias */}
            {Object.keys(catDist).length > 0 && (
              <div style={{background:W,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${RC}`,marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:12,fontFamily:"'Playfair Display',serif"}}>Por Categoria</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {Object.entries(catDist).map(([cat,count]) => (
                    <div key={cat} style={{background:`${R}12`,borderRadius:8,padding:"8px 12px",fontSize:12}}>
                      <span style={{fontWeight:600,color:V}}>{cat}</span>
                      <span style={{color:R,fontWeight:700,marginLeft:6}}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista detalhada */}
            <div style={{background:W,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${RC}`,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:12,fontFamily:"'Playfair Display',serif"}}>Detalhamento</div>
              {recipesCalc.map(r => {
                const c = r._calc;
                const margemCor = r.margem >= 80 ? "#2E7D32" : r.margem >= 50 ? "#E65100" : "#C62828";
                return (
                  <div key={r.id} style={{borderBottom:`1px solid ${RC}`,padding:"10px 0",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:20,flexShrink:0}}>{r.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:V,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nome}</div>
                      <div style={{fontSize:10,color:G,marginTop:2}}>Custo {fmt(c.porUn)}/un · Rend. {r.rendimento} un.</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:R}}>{fmt(c.final)}<span style={{fontSize:10,fontWeight:400,color:G}}>/un</span></div>
                      <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:3}}>
                        <span style={{fontSize:10,fontWeight:600,color:margemCor,background:`${margemCor}15`,padding:"2px 6px",borderRadius:4}}>{r.margem}%</span>
                        <span style={{fontSize:10,fontWeight:600,color:"#2E7D32"}}>{fmt(c.lucro)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button style={{...s.bsave,marginTop:0,padding:12,fontSize:13}} onClick={() => onExportCSV("receitas")}>⬇️ Exportar Receitas CSV</button>
          </>}

          {/* ── TAB PRODUTOS ── */}
          {relTab === "produtos" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
              <StatCard emoji="📦" label="Produtos Ativos" value={filtP.length} accent="#1565C0"/>
              <StatCard emoji="💵" label="Investimento Médio" value={fmt(filtP.length > 0 ? filtP.reduce((s,p) => s + pPreco(p), 0) / filtP.length : 0)} accent="#E65100"/>
            </div>
            <div style={{background:W,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${RC}`,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:12,fontFamily:"'Playfair Display',serif"}}>Lista de Produtos</div>
              {filtP.slice(0,30).map((p,i) => {
                const pu = pEmb(p) ? pPreco(p) / pEmb(p) : 0;
                const usedIn = recipesCalc.filter(r => r.ingredientes.some(ing => ing.produtoId === p.id)).length;
                return (
                  <div key={p.id} style={{borderBottom:`1px solid ${RC}`,padding:"8px 0",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:16,flexShrink:0}}>{CATEMOJI[p.categoria]||"📦"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:V,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nome}</div>
                      <div style={{fontSize:10,color:G,marginTop:1}}>{p.categoria} · R$ {fmtN(pu)}/{p.unidade} {usedIn > 0 ? `· ${usedIn} receita${usedIn>1?"s":""}` : ""}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:R}}>{fmt(pPreco(p))}</div>
                      <div style={{fontSize:10,color:G}}>{pEmb(p)}{p.unidade}</div>
                    </div>
                  </div>
                );
              })}
              {filtP.length > 30 && <div style={{fontSize:11,color:G,padding:"8px 0"}}>...e mais {filtP.length - 30} no CSV</div>}
            </div>
            <button style={{...s.bsave,marginTop:0,padding:12,fontSize:13}} onClick={() => onExportCSV("produtos")}>⬇️ Exportar Produtos CSV</button>
          </>}

          {/* ── TAB COMPRAS ── */}
          {relTab === "compras" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
              <StatCard emoji="🛒" label="Total Compras" value={compras.length} accent="#E65100"/>
              <StatCard emoji="💸" label="Valor Total" value={fmt(compras.reduce((s,c) => s + parseFloat(c.valor_total||0), 0))} accent="#C62828"/>
              <StatCard emoji="📅" label="Mês Atual" value={fmt(compras.filter(c=>c.data_compra?.startsWith(new Date().toISOString().substring(0,7))).reduce((s,c) => s+parseFloat(c.valor_total||0),0))} accent="#1565C0"/>
            </div>
            {/* Gráfico mensal */}
            <div style={{background:W,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${RC}`,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:12,fontFamily:"'Playfair Display',serif"}}>Compras por Mês</div>
              {compras.length > 0 ? <MiniBarChart data={meses} color="#E65100" height={100}/> : <div style={{textAlign:"center",padding:"30px 0",color:G,fontSize:12}}>Sem dados de compras</div>}
            </div>
            {/* Lista das últimas compras */}
            <div style={{background:W,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${RC}`}}>
              <div style={{fontSize:13,fontWeight:700,color:V,marginBottom:12,fontFamily:"'Playfair Display',serif"}}>Últimas Compras</div>
              {compras.slice(0,15).map((c,i) => (
                <div key={c.id} style={{borderBottom:`1px solid ${RC}`,padding:"8px 0",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:16,flexShrink:0}}>🛒</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:V}}>{c.fornecedor||"Sem fornecedor"}</div>
                    <div style={{fontSize:10,color:G,marginTop:1}}>{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR")} · {c.forma_pagamento||""}</div>
                  </div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:R,flexShrink:0}}>{fmt(c.valor_total)}</div>
                </div>
              ))}
              {compras.length === 0 && <div style={{textAlign:"center",padding:"20px 0",color:G,fontSize:12}}>Nenhuma compra registrada</div>}
            </div>
          </>}
        </div>
      </div>
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
          <span style={{fontSize:36}}>{r.emoji}</span>
          <div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:V,lineHeight:1.2}}>{r.nome}</h1>
            <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
              <span style={{background:RC,color:V,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>Rendimento: {r.rendimento} un.</span>
              {r.categoria&&<span style={{background:`${R}18`,color:R,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>{r.categoria}</span>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          <button className="btn-h" style={{padding:"8px 18px",borderRadius:8,border:`2px solid ${RC}`,background:W,color:V,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onEdit}>✏️ Editar</button>
          <button className="btn-h" style={{padding:"8px 18px",borderRadius:8,border:"none",background:V,color:W,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>window.print()}>🖨️ Imprimir</button>
        </div>
      </div>
      <div className="desk-detail-grid">
        <div style={{background:W,borderRadius:14,padding:"20px 24px",boxShadow:`0 2px 12px rgba(74,26,44,.08)`}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:V,marginBottom:16}}>🧂 Ingredientes e Custos</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`2px solid ${RC}`}}>{["Ingrediente","Qtd","Custo Base","Total"].map(h=><th key={h} style={{textAlign:h==="Ingrediente"?"left":"right",padding:"6px 6px 10px",fontSize:11,textTransform:"uppercase",letterSpacing:".05em",color:G,fontWeight:600}}>{h}</th>)}</tr></thead>
            <tbody>{r.ingredientes.map((ing,i)=>{const p=produtos.find(x=>x.id===ing.produtoId);if(!p)return null;const pr=pPreco(p);const eq=pEmb(p);return(<tr key={i} style={{borderBottom:`1px solid ${RC}`}}><td style={{padding:"10px 6px 10px 0",color:V,fontWeight:500}}>{p.nome}</td><td style={{padding:"10px 6px",textAlign:"right",color:G}}>{ing.usadoQtd}{p.unidade}</td><td style={{padding:"10px 6px",textAlign:"right",color:G}}>{fmt(pr)}/{eq}{p.unidade}</td><td style={{padding:"10px 0",textAlign:"right",color:V,fontWeight:600}}>{fmt(eq>0?(pr/eq)*ing.usadoQtd:0)}</td></tr>);})}</tbody>
            <tfoot>
              <tr style={{borderTop:`2px solid ${RC}`}}><td colSpan={3} style={{padding:"12px 6px 6px 0",fontWeight:700,color:V}}>Custo Ingredientes</td><td style={{padding:"12px 0 6px",textAlign:"right",fontWeight:700,color:R}}>{fmt(ci)}</td></tr>
              <tr><td colSpan={3} style={{padding:"4px 6px 6px 0",color:G,fontSize:12}}>Outros custos ({r.outrosCustos||30}%)</td><td style={{padding:"4px 0 6px",textAlign:"right",color:G,fontSize:12}}>{fmt(outros)}</td></tr>
              {r.despesas>0&&<tr><td colSpan={3} style={{padding:"4px 6px 6px 0",color:G,fontSize:12}}>Despesas extras</td><td style={{padding:"4px 0 6px",textAlign:"right",color:G,fontSize:12}}>{fmt(r.despesas)}</td></tr>}
              <tr style={{borderTop:`2px solid ${RC}`}}><td colSpan={3} style={{padding:"10px 6px 0 0",fontWeight:700,fontSize:14,color:V}}>Custo Total</td><td style={{padding:"10px 0 0",textAlign:"right",fontWeight:700,fontSize:14,color:R}}>{fmt(total)}</td></tr>
            </tfoot>
          </table>
          {r.obs&&<div style={{marginTop:16,paddingTop:14,borderTop:`1px solid ${RC}`}}><div style={{fontSize:11,fontWeight:600,color:G,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Observações</div><div style={{fontSize:13,color:G,lineHeight:1.6}}>{r.obs}</div></div>}
        </div>
        <div style={{background:W,borderRadius:14,padding:"20px",boxShadow:`0 2px 12px rgba(74,26,44,.08)`}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:V,marginBottom:16}}>💰 Precificação</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div style={s.pb}><div style={s.pl}>Custo/Un</div><div style={{...s.pv,fontSize:15}}>{fmt(porUn)}</div></div>
            <div style={s.pb}><div style={s.pl}>Margem</div><div style={{...s.pv,fontSize:15}}>{r.margem}%</div></div>
            <div style={s.pb}><div style={s.pl}>Preço s/ Taxa</div><div style={{...s.pv,fontSize:15}}>{fmt(semT)}</div></div>
            <div style={s.pb}><div style={s.pl}>Taxa ({r.taxaDelivery}%)</div><div style={{...s.pv,fontSize:15}}>{fmt(taxa)}</div></div>
          </div>
          <div style={{background:`linear-gradient(135deg,${R},${RL})`,borderRadius:12,padding:"16px",color:W,marginBottom:8,textAlign:"center"}}>
            <div style={{fontSize:11,opacity:.85,marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Preço Sugerido</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700}}>{fmt(f_)}</div>
            <div style={{fontSize:11,opacity:.75,marginTop:2}}>por unidade</div>
          </div>
          <div style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#92400E",marginBottom:4}}>Lucro Estimado</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#92400E"}}>{fmt(lucro)}</div>
            <div style={{fontSize:10,color:"#92400E88",marginTop:2}}>p/ {r.rendimento} un.</div>
          </div>
          {r.precoApp>0&&<><div style={{background:"#F0FFF4",border:"1.5px solid #86EFAC",borderRadius:10,padding:"12px 14px",marginBottom:8}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#166534",marginBottom:4}}>Preço App</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#166534"}}>{fmt(r.precoApp)}</div></div>{lucroApp!==null&&<div style={{background:"#F0FFF4",border:"1.5px solid #86EFAC",borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#166534",marginBottom:4}}>Lucro App</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#166534"}}>{fmt(lucroApp)}</div></div>}</>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16}} className="no-print">
        <button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:`2px solid ${RC}`,background:W,color:G,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onCopy}>📋 Copiar</button>
        <button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:`2px solid ${RC}`,background:W,color:R,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onDelete}>🗑 Excluir</button>
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
  const [tab,setTab]=useState("receitas"); const [view,setView]=useState("list"); const [editId,setEditId]=useState(null); const [detailId,setDetailId]=useState(null); const [editPId,setEditPId]=useState(null);
  const [pFormInit,setPFormInit]=useState(null); const [rFormInit,setRFormInit]=useState(null);
  const [searchR,setSearchR]=useState(""); const [catR,setCatR]=useState("Todos"); const [searchP,setSearchP]=useState(""); const [catP,setCatP]=useState("Todos");
  const [toast,setToast]=useState(""); const [confirmDel,setConfirmDel]=useState(null); const [viewRel,setViewRel]=useState(false); const [quickPOpen,setQuickPOpen]=useState(false);
  const [searchC,setSearchC]=useState(""); const [mesFiltroC,setMesFiltroC]=useState("Todos"); const [compraDetalhe,setCompraDetalhe]=useState(null); const [compraItens,setCompraItens]=useState({}); const [mapaUsuarios,setMapaUsuarios]=useState({});

  const toast_ = useCallback(msg => { setToast(msg); setTimeout(() => setToast(""), 2800); }, []);
  const recipesCalc = useMemo(() => recipes.map(r => ({ ...r, _calc: calc(r, produtos) })), [recipes, produtos]);

  async function setupNegocio(userId, userMeta) {
    const { data: membro, error: errM } = await supabase.from("membros").select("negocio_id").eq("user_id", userId).maybeSingle();
    if (errM) throw new Error(errM.message);
    if (membro?.negocio_id) { const { data: neg } = await supabase.from("negocios").select("nome").eq("id", membro.negocio_id).maybeSingle(); return { nId: membro.negocio_id, nNome: neg?.nome || "Meu Negócio" }; }
    const nomeNeg = userMeta?.nome_negocio || "Meu Negócio";
    const { data: neg, error: errN } = await supabase.from("negocios").insert({ nome: nomeNeg }).select("id").single();
    if (errN) throw new Error(errN.message);
    await supabase.from("membros").insert({ negocio_id: neg.id, user_id: userId, papel: "dono" });
    return { nId: neg.id, nNome: nomeNeg };
  }

  async function loadUserData(sessionUser) {
    setLoading(true);
    const timeout = setTimeout(() => { setLoading(false); setAppReady(true); }, 12000);
    try {
      const { nId, nNome } = await setupNegocio(sessionUser.id, sessionUser.user_metadata);
      setNegocioId(nId); setNegocioNome(nNome);
      const [rRes, pRes, cRes, mRes] = await Promise.all([
        supabase.from("receitas").select("id, dados").eq("negocio_id", nId).maybeSingle(),
        supabase.from("produtos_v2").select("*").eq("negocio_id", nId).eq("ativo", true).order("nome"),
        supabase.from("vw_compras_listagem").select("*").eq("negocio_id", nId).order("data_compra", { ascending: false }).limit(100),
        supabase.from("membros").select("user_id").eq("negocio_id", nId),
      ]);
      if (rRes.data?.id) { setReceitasRowId(rRes.data.id); setRecipes(rRes.data.dados || []); } else setRecipes(SEED_RECIPES);
      if (pRes.data) setProdutos(pRes.data.map(p => ({ ...p, preco: p.preco_ultimo, embalagemQtd: p.embalagem_qtd })));
      if (cRes.data) setCompras(cRes.data);
      if (mRes.data) { const map = {}; mRes.data.forEach(m => { map[m.user_id] = m.user_id === sessionUser.id ? (sessionUser.email?.split("@")[0] || "Eu") : "Membro"; }); setMapaUsuarios(map); }
    } catch(e) { console.error(e); setRecipes(SEED_RECIPES); }
    clearTimeout(timeout); setLoading(false); setAppReady(true);
  }

  useEffect(() => {
    let loaded = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") { loaded=false; setUser(null); setNegocioId(null); setNegocioNome(""); setRecipes([]); setProdutos([]); setCompras([]); setReceitasRowId(null); setView("list"); setTab("receitas"); setAppReady(true); return; }
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) { setUser(session.user); if (!loaded) { loaded = true; await loadUserData(session.user); } else { setAppReady(true); } return; }
      if (event === "INITIAL_SESSION" && !session) setAppReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const saveR = useCallback(async (dados) => { setSaving(true); try { if (receitasRowId) await supabase.from("receitas").update({ dados, atualizado_em: new Date().toISOString() }).eq("id", receitasRowId); else { const { data } = await supabase.from("receitas").insert({ negocio_id: negocioId, dados }).select("id").single(); if (data) setReceitasRowId(data.id); } } catch(e) { console.error(e); } setSaving(false); }, [receitasRowId, negocioId]);
  const reloadProdutos = useCallback(async () => { const { data } = await supabase.from("produtos_v2").select("*").eq("negocio_id", negocioId).eq("ativo", true).order("nome"); if (data) setProdutos(data.map(p => ({ ...p, preco: p.preco_ultimo, embalagemQtd: p.embalagem_qtd }))); }, [negocioId]);
  const reloadCompras = useCallback(async () => { const { data } = await supabase.from("vw_compras_listagem").select("*").eq("negocio_id", negocioId).order("data_compra", { ascending: false }).limit(100); if (data) setCompras(data); }, [negocioId]);

  const fazerLogin = async () => { if (!authForm.email || !authForm.senha) { setAuthError("Preencha email e senha"); return; } setAuthLoading(true); setAuthError(""); const { error } = await supabase.auth.signInWithPassword({ email: authForm.email.trim(), password: authForm.senha }); if (error) setAuthError("Email ou senha incorretos ❌"); setAuthLoading(false); };
  const fazerCadastro = async () => { if (!authForm.nomeNegocio.trim()) { setAuthError("Informe o nome do negócio ⚠️"); return; } if (!authForm.email.trim()) { setAuthError("Informe seu email ⚠️"); return; } if (authForm.senha.length < 6) { setAuthError("Senha: mín. 6 caracteres ⚠️"); return; } setAuthLoading(true); setAuthError(""); const { error } = await supabase.auth.signUp({ email: authForm.email.trim(), password: authForm.senha, options: { data: { nome_negocio: authForm.nomeNegocio.trim() } } }); if (error) setAuthError(error.message); else setAuthView("emailConfirm"); setAuthLoading(false); };
  const fazerLogout = async () => { try { await supabase.auth.signOut({ scope: "local" }); } catch(e) {} try { Object.keys(localStorage).forEach(k => { if (k.startsWith("sb-") || k.includes("delicias-jay-auth")) localStorage.removeItem(k); }); } catch(e) {} setUser(null); setNegocioId(null); setNegocioNome(""); setRecipes([]); setProdutos([]); setCompras([]); setReceitasRowId(null); setView("list"); setTab("receitas"); setAuthView("login"); setAuthForm({ email:"", senha:"", nomeNegocio:"" }); };

  const openNewP = () => { setPFormInit({ nome:"", preco_ultimo:"", embalagem_qtd:"", unidade:"g", categoria:"Secos", tipo:"ambos", id: genId() }); setEditPId(null); setView("pForm"); };
  const openEditP = id => { const p = produtos.find(x => x.id === id); if (p) setPFormInit(p); setEditPId(id); setView("pForm"); };
  const handleSaveProd = async (data) => { setSaving(true); const payload = { nome: data.nome.trim(), categoria: data.categoria, unidade: data.unidade, tipo: data.tipo||"ambos", preco_ultimo: data.preco_ultimo, embalagem_qtd: data.embalagem_qtd }; try { if (editPId) await supabase.from("produtos_v2").update(payload).eq("id", editPId); else { payload.negocio_id = negocioId; await supabase.from("produtos_v2").insert(payload); } await reloadProdutos(); toast_("✅ Produto salvo!"); setView("list"); setTab("produtos"); } catch(e) { console.error(e); toast_("❌ Erro ao salvar"); } setSaving(false); };
  const pedirExcP = id => { if (recipes.some(r => r.ingredientes.some(i => i.produtoId === id))) { toast_("⚠️ Produto usado em receitas"); return; } setConfirmDel({ tipo:"produto", id, nome: produtos.find(x=>x.id===id)?.nome||"" }); };
  const copiarProduto = id => { const p = produtos.find(x => x.id === id); setPFormInit({ ...p, nome: `Cópia de ${p.nome}`, id: genId() }); setEditPId(null); setView("pForm"); toast_("📋 Revise e salve!"); };

  const openNewR = () => { setRFormInit({ id: genId(), emoji:"🍫", nome:"", categoria:"", rendimento:10, margem:100, taxaDelivery:30, outrosCustos:30, despesas:0, precoApp:0, obs:"", ingredientes:[{produtoId:"",usadoQtd:0},{produtoId:"",usadoQtd:0}] }); setEditId(null); setView("rForm"); };
  const openEditR = id => { setRFormInit(recipes.find(r => r.id === id)); setEditId(id); setView("rForm"); };
  const openDet = id => { setDetailId(id); setView("detail"); };
  const handleSaveRecipe = async (data) => { const up = editId ? recipes.map(r => r.id === editId ? { ...data, id: editId } : r) : [...recipes, data]; setRecipes(up); await saveR(up); toast_("✅ Receita salva!"); setDetailId(data.id); setView("detail"); };
  const pedirExcR = id => setConfirmDel({ tipo:"receita", id, nome: recipes.find(x=>x.id===id)?.nome||"" });
  const copiarReceita = id => { const r = recipes.find(x => x.id === id); setRFormInit({ ...JSON.parse(JSON.stringify(r)), id: genId(), nome: `Cópia de ${r.nome}` }); setEditId(null); setView("rForm"); toast_("📋 Revise e salve!"); };

  const openNewC = () => setView("cForm");
  const openDetC = async (id) => { const { data: itens } = await supabase.from("compra_itens").select("*").eq("compra_id", id).order("created_at"); setCompraItens(prev => ({ ...prev, [id]: itens || [] })); setCompraDetalhe(id); setView("cDetail"); };
  const handleSaveCompra = async (header, validItens) => { setSaving(true); try { const { data: newC, error } = await supabase.from("compras").insert({ negocio_id: negocioId, data_compra: header.data_compra, num_doc: header.num_doc || null, fornecedor: header.fornecedor || null, forma_pagamento: header.forma_pagamento || null, obs: header.obs || null, created_by: user.id }).select("id").single(); if (error) throw error; await supabase.from("compra_itens").insert(validItens.map(i => ({ compra_id: newC.id, produto_id: i.produto_id, qtd: parseFloat(i.qtd)||0, unidade: i.unidade||"un", valor_unitario: parseFloat(i.valor_unitario)||0 }))); await Promise.all([reloadCompras(), reloadProdutos()]); toast_("✅ Compra salva!"); setView("list"); setTab("compras"); } catch(e) { console.error(e); toast_("❌ Erro ao salvar"); } setSaving(false); };
  const pedirExcC = id => setConfirmDel({ tipo:"compra", id, nome: `Compra ${compras.find(x=>x.id===id)?.data_compra||""}` });

  const confirmarExc = async () => { if (!confirmDel) return; setSaving(true); if (confirmDel.tipo === "receita") { const up = recipes.filter(r => r.id !== confirmDel.id); setRecipes(up); await saveR(up); toast_("🗑 Receita excluída"); setView("list"); setTab("receitas"); } else if (confirmDel.tipo === "produto") { await supabase.from("produtos_v2").update({ ativo: false }).eq("id", confirmDel.id); await reloadProdutos(); toast_("🗑 Produto desativado"); } else if (confirmDel.tipo === "compra") { await supabase.from("compras").delete().eq("id", confirmDel.id); await reloadCompras(); toast_("🗑 Compra excluída"); setView("list"); setTab("compras"); } setConfirmDel(null); setSaving(false); };

  const exportarCSV = (tipo) => { let csv="",nome=""; if (tipo==="receitas"){nome="receitas.csv";csv="Nome;Categoria;Rendimento;Margem%;Taxa%;Custo Total;Custo/Un;Preço Sugerido;Preço App;Lucro Lote\n";recipesCalc.forEach(r=>{const c=r._calc;csv+=`"${r.nome}";"${r.categoria||""}";"${r.rendimento}";"${r.margem}";"${r.taxaDelivery}";"${fmtN(c.total)}";"${fmtN(c.porUn)}";"${fmtN(c.final)}";"${fmtN(r.precoApp)}";"${fmtN(c.lucro)}"\n`;});}else{nome="produtos.csv";csv="Código;Nome;Categoria;Unidade;Preço;Embalagem;Custo/Un\n";filtP.forEach(p=>{const pu=pEmb(p)?pPreco(p)/pEmb(p):0;csv+=`"${p.codigo||""}";"${p.nome}";"${p.categoria}";"${p.unidade}";"${fmtN(pPreco(p))}";"${pEmb(p)}";"${fmtN(pu)}"\n`;});} const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=nome;a.click();URL.revokeObjectURL(url);toast_("📊 CSV exportado!"); };

  const filtR = useMemo(() => recipesCalc.filter(r => (r.nome.toLowerCase().includes(searchR.toLowerCase()) || (r.categoria||"").toLowerCase().includes(searchR.toLowerCase())) && (catR === "Todos" || r.categoria === catR)), [recipesCalc, searchR, catR]);
  const filtP = useMemo(() => produtos.filter(p => p.nome.toLowerCase().includes(searchP.toLowerCase()) && (catP === "Todos" || p.categoria === catP)).sort((a,b) => a.nome.localeCompare(b.nome)), [produtos, searchP, catP]);
  const mesesCompras = useMemo(() => { const set = new Set(compras.map(c => c.data_compra?.substring(0,7))); return Array.from(set).sort().reverse(); }, [compras]);
  const filtC = useMemo(() => compras.filter(c => mesFiltroC === "Todos" || c.data_compra?.startsWith(mesFiltroC)).filter(c => !searchC || (c.fornecedor||"").toLowerCase().includes(searchC.toLowerCase())), [compras, mesFiltroC, searchC]);

  // ── AUTH SCREENS ──
  const aInp = err => ({width:"100%",padding:"13px 18px",borderRadius:50,border:`2px solid ${err?"#ff6b6b":"#C45C7444"}`,background:"rgba(255,255,255,.15)",fontSize:15,color:W,WebkitTextFillColor:W,outline:"none",textAlign:"center",boxSizing:"border-box",marginBottom:10,fontFamily:"'DM Sans',sans-serif"});
  if (!appReady) return (<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:V}}><div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:10}}>🍫</div><div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:5}}>Delícias da Jay</div><div style={{width:28,height:28,border:`3px solid ${R}44`,borderTop:`3px solid ${R}`,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"16px auto 0"}}></div></div></div>);
  if (!user && authView === "emailConfirm") return (<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:V}}><div style={{textAlign:"center",padding:"0 32px",width:"100%",maxWidth:380}}><div style={{fontSize:60,marginBottom:14}}>📧</div><div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:10}}>Verifique seu email</div><div style={{color:`${RL}bb`,fontSize:14,lineHeight:1.7,marginBottom:28}}>Enviamos um link para<br/><strong style={{color:RL}}>{authForm.email}</strong><br/><br/>Confirme e volte para entrar.</div><button style={{background:"rgba(255,255,255,.12)",border:`1px solid ${R}55`,color:RL,borderRadius:50,padding:"11px 24px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={() => setAuthView("login")}>Voltar para o login</button></div></div>);
  if (!user && authView === "cadastro") return (<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:V}}><div style={{textAlign:"center",padding:"0 32px",width:"100%",maxWidth:380}}><div style={{fontSize:52,marginBottom:10}}>🍰</div><div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:4}}>Criar conta</div><div style={{color:`${R}88`,fontSize:11,marginBottom:28,letterSpacing:".08em",textTransform:"uppercase"}}>Novo negócio</div><input style={aInp(!!authError)} type="text" placeholder="Nome do seu negócio 🏪" value={authForm.nomeNegocio} onChange={e=>{setAuthForm({...authForm,nomeNegocio:e.target.value});setAuthError("");}}/><input style={aInp(!!authError)} type="email" placeholder="Seu email" value={authForm.email} onChange={e=>{setAuthForm({...authForm,email:e.target.value});setAuthError("");}}/><input style={aInp(!!authError)} type="password" placeholder="Senha (mín. 6 caracteres)" value={authForm.senha} onChange={e=>{setAuthForm({...authForm,senha:e.target.value});setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&fazerCadastro()}/>{authError&&<div style={{color:"#ff8fa3",fontSize:12,marginBottom:10}}>{authError}</div>}<button style={{width:"100%",padding:"13px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${R},${RL})`,color:W,fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,cursor:"pointer",marginBottom:14}} onClick={fazerCadastro} disabled={authLoading}>{authLoading?"Criando conta...":"Criar conta"}</button><button style={{background:"none",border:"none",color:`${RL}99`,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>{setAuthView("login");setAuthError("");}}>Já tenho conta → Entrar</button></div></div>);
  if (!user) return (<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:V}}><div style={{textAlign:"center",padding:"0 32px",width:"100%",maxWidth:380}}><div style={{fontSize:60,marginBottom:14}}>🍰</div><div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:26,marginBottom:5}}>Delícias da Jay</div><div style={{color:`${R}88`,fontSize:12,marginBottom:32,letterSpacing:".1em",textTransform:"uppercase"}}>Fichas Técnicas</div><input style={aInp(!!authError)} type="email" placeholder="Seu email" value={authForm.email} onChange={e=>{setAuthForm({...authForm,email:e.target.value});setAuthError("");}}/><input style={{...aInp(!!authError),letterSpacing:".15em",animation:authError?"shake .3s":""}} type="password" placeholder="Senha" value={authForm.senha} onChange={e=>{setAuthForm({...authForm,senha:e.target.value});setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&fazerLogin()}/>{authError&&<div style={{color:"#ff8fa3",fontSize:12,marginBottom:10}}>{authError}</div>}<button style={{width:"100%",padding:"13px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${R},${RL})`,color:W,fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,cursor:"pointer",marginBottom:14}} onClick={fazerLogin} disabled={authLoading}>{authLoading?"Entrando...":"Entrar"}</button><button style={{background:"none",border:"none",color:`${RL}99`,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>{setAuthView("cadastro");setAuthError("");setAuthForm({email:"",senha:"",nomeNegocio:""});}}>Criar novo negócio →</button></div></div>);
  if (loading) return (<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:V}}><div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:10}}>🍫</div><div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:5}}>{negocioNome||"Carregando..."}</div><div style={{width:28,height:28,border:`3px solid ${R}44`,borderTop:`3px solid ${R}`,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"16px auto 0"}}></div></div></div>);

  // ══════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO PRINCIPAL — MOBILE + DESKTOP DRAWER
  // ══════════════════════════════════════════════════════════════
  const newAction = tab === "receitas" ? openNewR : tab === "produtos" ? openNewP : openNewC;
  const newLabel  = tab === "receitas" ? "Receita" : tab === "produtos" ? "Produto" : "Compra";

  const listaReceitas = filtR.length === 0 ? <div style={s.emp}><div style={{fontSize:46,marginBottom:10}}>🍰</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:17}}>{recipes.length===0?"Nenhuma receita":"Nada encontrado"}</div></div> : <div style={s.list}>{filtR.map(r => <div key={r.id} style={s.card} className="ch" onClick={() => openDet(r.id)}><div style={s.cem}>{r.emoji}</div><div style={s.cbd}><div style={s.cnm}>{r.nome}</div><div style={s.cmt}>{r.categoria||"Sem categoria"} · rend. {r.rendimento} un.</div></div><div style={s.cpr}><div style={s.cpv}>{fmt(r._calc.final)}</div><div style={s.cpl}>p/ unidade</div></div></div>)}</div>;
  const listaProdutos = <div style={s.list}>{filtP.map(p => { const used = recipes.filter(r => r.ingredientes.some(i => i.produtoId === p.id)).length; const pu = pEmb(p) ? pPreco(p) / pEmb(p) : 0; return <div key={p.id} style={s.card} className="ch" onClick={() => openEditP(p.id)}><div style={{...s.cem,fontSize:20}}>{CATEMOJI[p.categoria]||"📦"}</div><div style={s.cbd}><div style={s.cnm}>{p.nome}</div><div style={s.cmt}>{p.codigo} · {p.categoria} · R$ {fmtN(pu)}/{p.unidade}</div>{used>0 && <div style={{fontSize:10,color:R,fontWeight:600,marginTop:2}}>usado em {used} receita{used>1?"s":""}</div>}</div><div style={s.cpr}><div style={s.cpv}>{fmt(pPreco(p))}</div><div style={s.cpl}>{pEmb(p)}{p.unidade}</div></div></div>; })}</div>;
  const listaCompras = filtC.length === 0 ? <div style={s.emp}><div style={{fontSize:46,marginBottom:10}}>🛒</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:17}}>{compras.length===0?"Nenhuma compra":"Nada encontrado"}</div></div> : <div style={s.list}>{filtC.map(c => <div key={c.id} style={s.card} className="ch" onClick={() => openDetC(c.id)}><div style={{...s.cem,fontSize:20}}>🛒</div><div style={s.cbd}><div style={s.cnm}>{c.fornecedor||"Sem fornecedor"}</div><div style={s.cmt}>{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} · {c.forma_pagamento||""}{mapaUsuarios[c.created_by]?` · ${mapaUsuarios[c.created_by]}`:""}</div></div><div style={s.cpr}><div style={s.cpv}>{fmt(c.valor_total)}</div><div style={s.cpl}>total</div></div></div>)}</div>;

  const sideList = (
    <div style={{flex:1,overflowY:"auto",padding:"0 8px"}}>
      {tab==="receitas"&&(filtR.length===0?<div style={{textAlign:"center",padding:"40px 16px",color:"rgba(255,255,255,.3)",fontSize:13}}>Nenhuma receita</div>:filtR.map(r=><div key={r.id} className="card-h" style={{padding:"10px",borderRadius:10,marginBottom:4,display:"flex",alignItems:"center",gap:10,background:detailId===r.id&&view==="detail"?"rgba(255,255,255,.15)":"transparent",transition:"all .15s"}} onClick={()=>openDet(r.id)}><span style={{fontSize:20,flexShrink:0}}>{r.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{color:W,fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nome}</div><div style={{color:"rgba(255,255,255,.4)",fontSize:10,marginTop:1}}>{r.categoria||"Sem categoria"}</div></div><div style={{color:RL,fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,flexShrink:0}}>{fmt(r._calc.final)}</div></div>))}
      {tab==="produtos"&&(filtP.length===0?<div style={{textAlign:"center",padding:"40px 16px",color:"rgba(255,255,255,.3)",fontSize:13}}>Nenhum produto</div>:filtP.map(p=>{const pu=pEmb(p)?pPreco(p)/pEmb(p):0;return<div key={p.id} className="card-h" style={{padding:"10px",borderRadius:10,marginBottom:4,display:"flex",alignItems:"center",gap:10,background:editPId===p.id&&view==="pForm"?"rgba(255,255,255,.15)":"transparent",transition:"all .15s"}} onClick={()=>openEditP(p.id)}><span style={{fontSize:18,flexShrink:0}}>{CATEMOJI[p.categoria]||"📦"}</span><div style={{flex:1,minWidth:0}}><div style={{color:W,fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nome}</div><div style={{color:"rgba(255,255,255,.4)",fontSize:10,marginTop:1}}>{p.categoria} · R$ {fmtN(pu)}/{p.unidade}</div></div><div style={{color:RL,fontFamily:"'Playfair Display',serif",fontSize:12,fontWeight:700,flexShrink:0}}>{fmt(pPreco(p))}</div></div>;}))}
      {tab==="compras"&&(filtC.length===0?<div style={{textAlign:"center",padding:"40px 16px",color:"rgba(255,255,255,.3)",fontSize:13}}>Nenhuma compra</div>:filtC.map(c=><div key={c.id} className="card-h" style={{padding:"10px",borderRadius:10,marginBottom:4,display:"flex",alignItems:"center",gap:10,transition:"all .15s"}} onClick={()=>openDetC(c.id)}><span style={{fontSize:18,flexShrink:0}}>🛒</span><div style={{flex:1,minWidth:0}}><div style={{color:W,fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.fornecedor||"Sem fornecedor"}</div><div style={{color:"rgba(255,255,255,.4)",fontSize:10,marginTop:1}}>{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</div></div><div style={{color:RL,fontFamily:"'Playfair Display',serif",fontSize:12,fontWeight:700,flexShrink:0}}>{fmt(c.valor_total)}</div></div>))}
    </div>
  );

  return (
    <>
      {/* ── BACKGROUND LIST MOBILE ── */}
      <div style={s.app} className="mobile-only">
        <header style={s.hdr}><div><div style={s.logo}>{negocioNome||"Fichas Técnicas"}</div><div style={s.lsub}>Gestão</div></div><div style={{display:"flex",gap:7,alignItems:"center"}}><button style={{...s.bpri,background:"rgba(255,255,255,.15)",fontSize:12,padding:"8px 12px"}} onClick={() => setViewRel(true)}>📊</button><button style={s.bpri} onClick={newAction}>+ {newLabel}</button><button style={{background:"rgba(255,255,255,.1)",border:"none",color:RL,borderRadius:50,padding:"8px 12px",fontSize:13,cursor:"pointer"}} onClick={fazerLogout}>🚪</button></div></header>
        <div style={s.tabs}><button style={{...s.tab,...(tab==="receitas"?s.taba:{})}} onClick={() => setTab("receitas")}>🍰 Receitas</button><button style={{...s.tab,...(tab==="produtos"?s.taba:{})}} onClick={() => setTab("produtos")}>📦 Produtos</button><button style={{...s.tab,...(tab==="compras"?s.taba:{})}} onClick={() => setTab("compras")}>💸 Compras</button></div>
        {tab==="receitas"&&<><div style={s.srchW}><span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input style={s.srch} placeholder="Buscar receita..." value={searchR} onChange={e => setSearchR(e.target.value)}/></div><div style={s.chips}>{["Todos",...CAT_R].map(c => <button key={c} style={{...s.chip,...(catR===c?s.chipa:{})}} onClick={() => setCatR(c)}>{c}</button>)}</div><div style={s.cnt}>{filtR.length} receita{filtR.length!==1?"s":""}</div>{listaReceitas}</>}
        {tab==="produtos"&&<><div style={s.srchW}><span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input style={s.srch} placeholder="Buscar produto..." value={searchP} onChange={e => setSearchP(e.target.value)}/></div><div style={s.chips}>{["Todos",...CAT_P].map(c => <button key={c} style={{...s.chip,...(catP===c?s.chipa:{})}} onClick={() => setCatP(c)}>{c}</button>)}</div><div style={s.cnt}>{filtP.length} produto{filtP.length!==1?"s":""}</div>{listaProdutos}</>}
        {tab==="compras"&&<><div style={s.srchW}><span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input style={s.srch} placeholder="Buscar por fornecedor..." value={searchC} onChange={e => setSearchC(e.target.value)}/></div><div style={s.chips}><button style={{...s.chip,...(mesFiltroC==="Todos"?s.chipa:{})}} onClick={() => setMesFiltroC("Todos")}>Todos</button>{mesesCompras.map(m => { const [a,me]=m.split("-"); return <button key={m} style={{...s.chip,...(mesFiltroC===m?s.chipa:{})}} onClick={() => setMesFiltroC(m)}>{["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(me)]}/{a.slice(2)}</button>; })}</div><div style={{padding:"4px 18px 8px",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:`${G}88`}}>{filtC.length} compra{filtC.length!==1?"s":""}</span><span style={{fontSize:13,fontWeight:700,color:R}}>Total: {fmt(filtC.reduce((sum,c) => sum + parseFloat(c.valor_total||0), 0))}</span></div>{listaCompras}</>}
      </div>

      {/* ── BACKGROUND LIST DESKTOP ── */}
      <div className="desktop-only desk-grid">
        <div className="desk-side">
          <div style={{padding:"20px 16px 16px",borderBottom:"1px solid rgba(255,255,255,.1)"}}><div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:18,lineHeight:1.2}}>{negocioNome||"Fichas Técnicas"}</div><div style={{color:"#D4748866",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",marginTop:2}}>Gestão</div></div>
          <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
            {["receitas","produtos","compras"].map(t => <button key={t} style={{flex:1,padding:"10px 6px",border:"none",background:"none",color:tab===t?W:"rgba(255,255,255,.4)",fontSize:11,fontWeight:600,cursor:"pointer",borderBottom:tab===t?`2px solid ${R}`:"2px solid transparent",fontFamily:"'DM Sans',sans-serif"}} onClick={() => setTab(t)}>{t==="receitas"?"🍰 Receitas":t==="produtos"?"📦 Produtos":"💸 Compras"}</button>)}
          </div>
          <div style={{padding:"10px 12px 6px",position:"relative"}}><span style={{position:"absolute",left:22,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(255,255,255,.4)",pointerEvents:"none"}}>🔍</span><input style={{width:"100%",padding:"8px 10px 8px 30px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",fontSize:12,color:W,WebkitTextFillColor:W,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"}} placeholder={tab==="receitas"?"Buscar receita...":tab==="produtos"?"Buscar produto...":"Buscar fornecedor..."} value={tab==="receitas"?searchR:tab==="produtos"?searchP:searchC} onChange={e=>tab==="receitas"?setSearchR(e.target.value):tab==="produtos"?setSearchP(e.target.value):setSearchC(e.target.value)}/></div>
          <div style={{display:"flex",gap:5,padding:"4px 12px 8px",overflowX:"auto",scrollbarWidth:"none"}}>{(tab==="receitas"?["Todos",...CAT_R]:tab==="produtos"?["Todos",...CAT_P]:["Todos",...mesesCompras]).map(c=><button key={c} style={{flexShrink:0,padding:"3px 10px",borderRadius:20,border:"1px solid rgba(255,255,255,.2)",background:(tab==="receitas"?catR:tab==="produtos"?catP:mesFiltroC)===c?"rgba(255,255,255,.2)":"transparent",color:(tab==="receitas"?catR:tab==="produtos"?catP:mesFiltroC)===c?W:"rgba(255,255,255,.5)",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>tab==="receitas"?setCatR(c):tab==="produtos"?setCatP(c):setMesFiltroC(c)}>{c}</button>)}</div>
          {sideList}
          <div style={{padding:"12px",borderTop:"1px solid rgba(255,255,255,.1)",display:"flex",gap:6}}>
            <button className="btn-h" style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:R,color:W,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={newAction}>+ {newLabel}</button>
            <button className="btn-h" style={{padding:"8px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"transparent",color:"rgba(255,255,255,.6)",fontSize:12,cursor:"pointer"}} onClick={() => setViewRel(true)}>📊</button>
            <button className="btn-h" style={{padding:"8px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"transparent",color:"rgba(255,255,255,.6)",fontSize:12,cursor:"pointer"}} onClick={fazerLogout}>🚪</button>
          </div>
        </div>
        <div className="desk-main">
          {view==="list"&&<DashboardHome recipesCalc={recipesCalc} produtos={produtos} compras={compras} fmt={fmt} fmtN={fmtN} pPreco={pPreco} pEmb={pEmb}/>}
          
          {/* DETALHES RENDERIZAM NO DESK-MAIN (Painel principal à direita) */}
          {view==="detail"&&(()=>{const r=recipesCalc.find(x=>x.id===detailId);if(!r)return null;return<DesktopDetail r={r} produtos={produtos} onEdit={()=>openEditR(r.id)} onCopy={()=>copiarReceita(r.id)} onDelete={()=>pedirExcR(r.id)}/>;})()}
          {view==="cDetail"&&compraDetalhe&&(()=>{const c=compras.find(x=>x.id===compraDetalhe);if(!c)return null;const it=compraItens[compraDetalhe]||[];const tot=it.reduce((sum,i)=>sum+parseFloat(i.valor_subtotal||0),0);return<div style={{padding:"28px 32px",animation:"fadein .2s ease"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><span style={{fontSize:36}}>🛒</span><div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:V}}>{c.fornecedor||"Compra"}</h1><div style={{fontSize:12,color:G,marginTop:4}}>{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR")} · {c.forma_pagamento||""} · {mapaUsuarios[c.created_by]||""}</div></div></div><div style={s.sec}><div style={s.st}>📦 Itens ({it.length})</div>{it.map((i,idx)=><div key={idx} style={s.ir}><div><div style={{fontWeight:500,fontSize:13}}>{i.produto_nome_snapshot}</div><div style={{fontSize:11,color:G,marginTop:1}}>{i.qtd} {i.unidade} × {fmt(i.valor_unitario)}</div></div><div style={s.icost}>{fmt(i.valor_subtotal)}</div></div>)}<div style={{...s.ir,borderTop:`2px solid ${RC}`,marginTop:5,paddingTop:7,fontWeight:700}}><div>Total</div><div style={s.icost}>{fmt(tot)}</div></div></div>{c.obs&&<div style={s.sec}><div style={s.st}>📝 Obs</div><div style={{fontSize:13,color:G,lineHeight:1.6}}>{c.obs}</div></div>}<button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:`2px solid ${RC}`,background:W,color:R,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>pedirExcC(c.id)}>🗑 Excluir compra</button></div>;})()}
        </div>
      </div>

      {/* ── OVERLAYS DOS FORMULÁRIOS (Drawer no Desktop / Fullscreen no Mobile) ── */}
      {view === "pForm" && (
        <ResponsiveDrawer title={editPId ? "Editar Produto" : "Novo Produto"} onClose={() => setView("list")}>
          <ProdutoForm initialData={pFormInit} editId={editPId} recipes={recipes} saving={saving} onSaved={handleSaveProd} onDelete={pedirExcP} onCopy={copiarProduto} toast_={toast_}/>
        </ResponsiveDrawer>
      )}
      {view === "rForm" && (
        <ResponsiveDrawer title={editId ? "Editar Receita" : "Nova Receita"} onClose={() => setView(editId?"detail":"list")}>
          <ReceitaForm initialData={rFormInit} editId={editId} produtos={produtos} saving={saving} onSaved={handleSaveRecipe} onOpenQuickP={() => setQuickPOpen(true)} toast_={toast_}/>
        </ResponsiveDrawer>
      )}
      {view === "cForm" && (
        <ResponsiveDrawer title="Nova Compra" onClose={() => {setView("list");setTab("compras");}}>
          <CompraForm produtos={produtos} saving={saving} onSaved={handleSaveCompra} onOpenQuickP={() => setQuickPOpen(true)} toast_={toast_}/>
        </ResponsiveDrawer>
      )}

      {/* ── OVERLAYS DOS DETALHES (Somente no Mobile) ── */}
      {view === "detail" && (
        <div className="mobile-only" style={{position:"fixed",inset:0,background:CR,zIndex:200,overflowY:"auto"}}>
          {(()=>{const rc = recipesCalc.find(x => x.id === detailId); if (!rc) return null; const { ci, outros, total, porUn, semT, taxa, final: f_, lucro, lucroApp } = rc._calc; return <div style={s.app}><div style={s.dh}><button style={s.bback} onClick={() => {setView("list");setTab("receitas");}}>← Voltar</button><div style={{fontSize:44,marginBottom:7,marginTop:10}}>{rc.emoji}</div><div style={s.dn}>{rc.nome}</div><div style={s.dc}>{rc.categoria||"Sem categoria"} · {rc.rendimento} un.</div></div><div style={s.db}><div style={s.sec}><div style={s.st}>🧂 Ingredientes</div>{rc.ingredientes.map((ing,i) => { const p = produtos.find(x=>x.id===ing.produtoId); if (!p) return null; const pr=pPreco(p); const eq=pEmb(p); return <div key={i} style={s.ir}><div><div style={{fontWeight:500,fontSize:13}}>{p.nome}</div><div style={{fontSize:11,color:G,marginTop:1}}>{ing.usadoQtd}{p.unidade} · {fmt(pr)}/{eq}{p.unidade}</div></div><div style={s.icost}>{fmt(eq>0?(pr/eq)*ing.usadoQtd:0)}</div></div>; })}<div style={{...s.ir,borderTop:`2px solid ${RC}`,marginTop:5,paddingTop:7}}><div style={{fontWeight:700}}>Custo ingredientes</div><div style={s.icost}>{fmt(ci)}</div></div><div style={s.ir}><div>Outros custos ({rc.outrosCustos||30}%)</div><div style={s.icost}>{fmt(outros)}</div></div>{rc.despesas > 0 && <div style={s.ir}><div>Despesas extras</div><div style={s.icost}>{fmt(rc.despesas)}</div></div>}<div style={{...s.ir,fontWeight:700}}><div>Custo total</div><div style={s.icost}>{fmt(total)}</div></div></div><div style={s.sec}><div style={s.st}>💰 Precificação</div><div style={s.pg}><div style={s.pb}><div style={s.pl}>Custo/un</div><div style={s.pv}>{fmt(porUn)}</div></div><div style={s.pb}><div style={s.pl}>Margem</div><div style={s.pv}>{rc.margem}%</div></div><div style={s.pb}><div style={s.pl}>Preço s/ taxa</div><div style={s.pv}>{fmt(semT)}</div></div><div style={s.pb}><div style={s.pl}>Taxa ({rc.taxaDelivery}%)</div><div style={s.pv}>{fmt(taxa)}</div></div></div><div style={s.ph}><div style={s.phl}>🏷 Preço de venda/un</div><div style={s.phv}>{fmt(f_)}</div></div>{rc.precoApp > 0 && <div style={{...s.pb,background:"#F0FFF4",border:"1.5px solid #86EFAC",marginBottom:7}}><div style={{...s.pl,color:"#166534"}}>✅ Preço praticado</div><div style={{...s.pv,color:"#166534"}}>{fmt(rc.precoApp)}</div></div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div style={{...s.pb,background:"#FFF7F9",border:"1.5px solid #FCD34D"}}><div style={{...s.pl,color:"#92400E"}}>💸 Lucro sugerido</div><div style={{...s.pv,color:"#92400E"}}>{fmt(lucro)}</div></div>{lucroApp!==null && <div style={{...s.pb,background:"#F0FFF4",border:"1.5px solid #86EFAC"}}><div style={{...s.pl,color:"#166534"}}>💸 Lucro app</div><div style={{...s.pv,color:"#166534"}}>{fmt(lucroApp)}</div></div>}</div></div>{rc.obs && <div style={s.sec}><div style={s.st}>📝 Obs</div><div style={{fontSize:13,color:G,lineHeight:1.6}}>{rc.obs}</div></div>}<div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}><button style={s.be} onClick={() => openEditR(rc.id)}>✏️ Editar</button><button style={{...s.bpri,padding:"13px 14px"}} onClick={() => copiarReceita(rc.id)}>📋 Copiar</button><button style={s.bd} onClick={() => pedirExcR(rc.id)}>🗑 Excluir</button></div></div></div>;})()}
        </div>
      )}
      {view === "cDetail" && (
        <div className="mobile-only" style={{position:"fixed",inset:0,background:CR,zIndex:200,overflowY:"auto"}}>
          {(()=>{const c=compras.find(x=>x.id===compraDetalhe);if(!c)return null;const it=compraItens[compraDetalhe]||[];const tot=it.reduce((sum,i)=>sum+parseFloat(i.valor_subtotal||0),0);return<div style={s.app}><div style={s.dh}><button style={s.bback} onClick={() => {setView("list");setTab("compras");}}>← Voltar</button><div style={{fontSize:44,marginBottom:7,marginTop:10}}>🛒</div><div style={s.dn}>{c.fornecedor || "Compra"}</div><div style={s.dc}>{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR")} · {c.forma_pagamento||""} · {mapaUsuarios[c.created_by]||""}</div></div><div style={s.db}><div style={s.sec}><div style={s.st}>📦 Itens ({it.length})</div>{it.map((i,idx)=><div key={idx} style={s.ir}><div><div style={{fontWeight:500,fontSize:13}}>{i.produto_nome_snapshot}</div><div style={{fontSize:11,color:G,marginTop:1}}>{i.qtd} {i.unidade} × {fmt(i.valor_unitario)}</div></div><div style={s.icost}>{fmt(i.valor_subtotal)}</div></div>)}<div style={{...s.ir,borderTop:`2px solid ${RC}`,marginTop:5,paddingTop:7,fontWeight:700}}><div>Total</div><div style={s.icost}>{fmt(tot)}</div></div></div>{c.obs&&<div style={s.sec}><div style={s.st}>📝 Obs</div><div style={{fontSize:13,color:G,lineHeight:1.6}}>{c.obs}</div></div>}<button style={s.bd} onClick={()=>pedirExcC(c.id)}>🗑 Excluir compra</button></div></div>;})()}
        </div>
      )}

      <ModalConfirm item={confirmDel} onConfirm={confirmarExc} onCancel={() => setConfirmDel(null)}/>
      <QuickProdModal open={quickPOpen} onClose={() => setQuickPOpen(false)} negocioId={negocioId} onProductSaved={reloadProdutos} toast_={toast_}/>
      
      {viewRel && <RelatoriosPanel recipesCalc={recipesCalc} produtos={produtos} compras={compras} filtP={filtP} fmt={fmt} fmtN={fmtN} pPreco={pPreco} pEmb={pEmb} onClose={() => setViewRel(false)} onExportCSV={exportarCSV}/>}
      
      {toast && <div style={s.tst}>{toast}</div>}
      {saving && <div style={s.sync}>💾 Salvando...</div>}
    </>
  );
}