import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT ───────────────────────────────────────────────────────
const SUPA_URL  = import.meta.env.VITE_SUPA_URL;
const SUPA_ANON = import.meta.env.VITE_SUPA_ANON;
const supabase  = createClient(SUPA_URL, SUPA_ANON, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
    storage:            window.localStorage,
    storageKey:         "delicias-jay-auth",
    lock: async (_n, _t, fn) => await fn(),
  },
});

// ─── SEEDS ────────────────────────────────────────────────────────────────
const SEED_PRODUTOS = [
  { id:"p-01", nome:"Farinha de trigo",       preco:6.99,  embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  { id:"p-02", nome:"Farinha de trigo Globo", preco:2.49,  embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  { id:"p-03", nome:"Açúcar",                 preco:2.99,  embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  { id:"p-04", nome:"Açúcar mascavo",         preco:10.00, embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  { id:"p-05", nome:"Fermento",               preco:4.99,  embalagemQtd:100,  unidade:"g",  categoria:"Secos" },
  { id:"p-06", nome:"Essência de baunilha",   preco:7.00,  embalagemQtd:30,   unidade:"ml", categoria:"Secos" },
  { id:"p-10", nome:"Leite condensado",       preco:6.39,  embalagemQtd:395,  unidade:"g",  categoria:"Laticínios" },
  { id:"p-11", nome:"Creme de leite",         preco:2.65,  embalagemQtd:200,  unidade:"g",  categoria:"Laticínios" },
  { id:"p-34", nome:"Ovos",                   preco:1.00,  embalagemQtd:1,    unidade:"un", categoria:"Outros" },
];
const SEED_RECIPES = [];

// ─── CONSTANTES ────────────────────────────────────────────────────────────
const CAT_R     = ["Brownies","Docinhos","Copo da Felicidade","Bolo no Pote","Cones Trufados","Salgados","Outro"];
const CAT_P     = ["Secos","Laticínios","Chocolates","Embalagens","Outros"];
const UNIDS     = ["g","kg","ml","L","un","colher","xícara"];
const EMOJIS    = ["🍫","🧁","🎂","🍰","🍬","🍮","🥧","🍩","🍪","🥐","🫙","🌋","🍇","🌽","🧇","🥮","🍭","☕","🌮","🥚","🧀"];
const CATEMOJI  = {"Secos":"🌾","Laticínios":"🥛","Chocolates":"🍫","Embalagens":"📦","Outros":"🛒"};

// ─── CORES ─────────────────────────────────────────────────────────────────
const V="#4A1A2C", R="#C45C74", RL="#E8899A", RC="#F5D0D8", CR="#FFF0F3", G="#7A4A58", W="#fff";

// ─── HELPERS ───────────────────────────────────────────────────────────────
const fmt  = v => "R$ " + (parseFloat(v)||0).toFixed(2).replace(".",",");
const fmtN = v => (parseFloat(v)||0).toFixed(2).replace(".",",");

function calc(r, prods) {
  const ci = r.ingredientes.reduce((s,i) => {
    const p = prods.find(p => p.id === i.produtoId);
    return p ? s + (p.preco / p.embalagemQtd) * i.usadoQtd : s;
  }, 0);
  const pctOutros = (r.outrosCustos !== undefined ? r.outrosCustos : 30) / 100;
  const outros = ci * pctOutros;
  const total  = ci + outros + (r.despesas||0);
  const porUn  = r.rendimento > 0 ? total / r.rendimento : 0;
  const semT   = porUn * (1 + (r.margem||100) / 100);
  const tp     = (r.taxaDelivery||30) / 100;
  const final  = tp < 1 ? semT / (1 - tp) : semT;
  const taxa   = final - semT;
  const lucro    = (final - taxa - porUn) * r.rendimento;
  const lucroApp = r.precoApp > 0 ? (r.precoApp - (r.precoApp * tp) - porUn) * r.rendimento : null;
  return { ci, outros, total, porUn, semT, taxa, final, lucro, lucroApp };
}

// ─── ESTILOS ───────────────────────────────────────────────────────────────
const s = {
  app:   { maxWidth:480, margin:"0 auto", minHeight:"100vh", background:CR, fontFamily:"'DM Sans',sans-serif", color:V },
  hdr:   { background:V, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo:  { fontFamily:"'Playfair Display',serif", color:RL, fontSize:17, lineHeight:1.2 },
  lsub:  { color:"#D4748866", fontSize:10, letterSpacing:".1em", textTransform:"uppercase" },
  bpri:  { background:R, color:W, border:"none", borderRadius:50, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  bback: { background:"rgba(255,255,255,.12)", border:"none", color:W, borderRadius:50, padding:"7px 14px", fontSize:13, cursor:"pointer" },
  tabs:  { display:"flex", borderBottom:`2px solid ${RC}`, background:W },
  tab:   { flex:1, padding:"12px 8px", border:"none", background:"none", fontSize:13, fontWeight:600, color:`${G}88`, cursor:"pointer", borderBottom:"3px solid transparent", marginBottom:"-2px", fontFamily:"'DM Sans',sans-serif" },
  taba:  { color:R, borderBottomColor:R },
  srchW: { margin:"12px 14px 0", position:"relative", display:"block" },
  srch:  { width:"100%", padding:"10px 14px 10px 38px", borderRadius:50, border:`2px solid ${RC}`, background:CR, fontSize:13, color:V, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", display:"block" },
  chips: { display:"flex", gap:8, padding:"10px 14px", overflowX:"auto", scrollbarWidth:"none" },
  chip:  { flexShrink:0, background:W, border:`2px solid ${RC}`, color:G, borderRadius:50, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  chipa: { background:V, borderColor:V, color:RL },
  cnt:   { padding:"0 18px 6px", fontSize:11, color:`${G}88` },
  list:  { padding:"0 14px 100px", display:"flex", flexDirection:"column", gap:10 },
  card:  { background:W, borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, boxShadow:`0 2px 8px rgba(74,26,44,.08)`, cursor:"pointer", border:"1.5px solid transparent", transition:"all .15s" },
  cem:   { width:46, height:46, background:CR, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 },
  cbd:   { flex:1, minWidth:0 },
  cnm:   { fontWeight:600, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  cmt:   { fontSize:11, color:G, marginTop:2 },
  cpr:   { textAlign:"right", flexShrink:0 },
  cpv:   { fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:R },
  cpl:   { fontSize:10, color:`${G}88` },
  emp:   { textAlign:"center", padding:"60px 20px" },
  sec:   { background:W, borderRadius:14, padding:14, marginBottom:10, boxShadow:`0 2px 6px rgba(74,26,44,.06)` },
  st:    { fontFamily:"'Playfair Display',serif", fontSize:14, marginBottom:10, color:V },
  lbl:   { display:"block", fontSize:10, fontWeight:600, color:G, textTransform:"uppercase", letterSpacing:".05em", marginBottom:4 },
  inp:   { width:"100%", padding:"10px 12px", borderRadius:9, border:`2px solid ${RC}`, background:CR, fontFamily:"'DM Sans',sans-serif", fontSize:14, color:V, outline:"none", marginBottom:10, boxSizing:"border-box", WebkitAppearance:"none" },
  tag:   { background:`${R}18`, borderRadius:7, padding:"5px 9px", fontSize:11, color:R, fontWeight:600, marginBottom:7 },
  badd:  { background:CR, border:`2px dashed ${R}55`, color:R, borderRadius:9, padding:10, width:"100%", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:3, fontFamily:"'DM Sans',sans-serif" },
  bsave: { background:`linear-gradient(135deg,${R},${RL})`, color:W, border:"none", borderRadius:50, padding:15, width:"100%", fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:600, cursor:"pointer", boxShadow:`0 5px 18px rgba(196,92,116,.4)`, marginTop:8 },
  dh:    { background:V, padding:"18px 18px 22px" },
  dn:    { fontFamily:"'Playfair Display',serif", fontSize:20, color:W, marginBottom:3 },
  dc:    { fontSize:11, color:"#D4748866", textTransform:"uppercase", letterSpacing:".07em" },
  db:    { padding:"12px 12px 100px" },
  ir:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:`1px solid #FDE8ED`, fontSize:13 },
  icost: { fontWeight:600, color:R, flexShrink:0, marginLeft:6 },
  pg:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 },
  pb:    { background:CR, borderRadius:9, padding:"9px 11px", border:`1.5px solid ${RC}` },
  pl:    { fontSize:10, textTransform:"uppercase", letterSpacing:".05em", color:G, marginBottom:3 },
  pv:    { fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700 },
  ph:    { background:`linear-gradient(135deg,${R},${RL})`, borderRadius:12, padding:"14px 16px", color:W, margin:"7px 0" },
  phl:   { fontSize:11, opacity:.8, marginBottom:3 },
  phv:   { fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700 },
  be:    { flex:1, background:V, color:W, border:"none", borderRadius:50, padding:13, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  bd:    { background:"none", border:`2px solid ${RC}`, color:R, borderRadius:50, padding:"13px 16px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  fb:    { padding:"12px 12px 20px" },
  er:    { display:"flex", flexWrap:"wrap", gap:7, marginBottom:12 },
  eb:    { width:38, height:38, borderRadius:9, border:`2px solid ${RC}`, background:CR, fontSize:19, cursor:"pointer" },
  ebs:   { borderColor:R, background:"#FFE0E7" },
  ic:    { background:CR, borderRadius:10, padding:11, marginBottom:9, border:`1.5px solid ${RC}` },
  ich:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 },
  brm:   { background:"none", border:"none", color:R, fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  help:  { fontSize:12, color:G, marginBottom:10, lineHeight:1.5, background:"#FFF7F9", borderRadius:7, padding:"7px 10px", borderLeft:`3px solid ${R}` },
  cs:    { background:CR, borderRadius:9, padding:"10px 12px", marginBottom:12, border:`1.5px solid ${RC}` },
  cr:    { display:"flex", justifyContent:"space-between", fontSize:13, padding:"2px 0", color:V },
  tst:   { position:"fixed", bottom:22, left:"50%", transform:"translateX(-50%)", background:V, color:W, padding:"11px 22px", borderRadius:50, fontSize:13, fontWeight:500, zIndex:200, whiteSpace:"nowrap", boxShadow:"0 4px 18px rgba(0,0,0,.3)" },
  sync:  { position:"fixed", top:68, right:10, background:R, color:W, padding:"3px 10px", borderRadius:50, fontSize:10, zIndex:100 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${CR};font-family:'DM Sans',sans-serif;}
  input,select,textarea{color:${V}!important;-webkit-text-fill-color:${V}!important;}
  input:focus,select:focus,textarea:focus{border-color:${R}!important;background:#fff!important;}
  input::placeholder{color:${V}55!important;-webkit-text-fill-color:${V}55!important;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:${RC};border-radius:4px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .card-h:hover{background:${V}22!important;cursor:pointer;}
  .card-hl:hover{box-shadow:0 4px 16px rgba(74,26,44,.13)!important;transform:translateY(-1px);cursor:pointer;}
  .btn-h:hover{opacity:.85;cursor:pointer;}
  @media print{
    .no-print{display:none!important;}
    .print-only{display:block!important;}
    body{background:#fff!important;}
  }
  .desktop-only{display:none!important;}
  .mobile-only{display:block!important;}
  @media(min-width:768px){
    .desktop-only{display:flex!important;}
    .mobile-only{display:none!important;}
    .desk-grid{display:grid!important;grid-template-columns:260px 1fr;height:100vh;overflow:hidden;}
    .desk-side{background:${V};display:flex;flex-direction:column;overflow:hidden;height:100vh;}
    .desk-main{background:${CR};overflow-y:auto;display:flex;flex-direction:column;}
    .desk-detail-grid{display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start;}
  }
`;

// ═══════════════════════════════════════════════════════════════
// COMPONENTES EXTERNOS — state local próprio, sem perda de foco
// ═══════════════════════════════════════════════════════════════

// ─── MODAL CONFIRMAÇÃO ─────────────────────────────────────────
function ModalConfirm({ item, onConfirm, onCancel }) {
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
}

// ─── QUICK PRODUCT MODAL ───────────────────────────────────────
function QuickProdModal({ open, produtos, saveP, toast_, onClose }) {
  const blank = () => ({ nome:"", preco:"", embalagemQtd:"", unidade:"g", categoria:"Secos" });
  const [f, setF] = useState(blank());
  useEffect(() => { if (open) setF(blank()); }, [open]);
  if (!open) return null;
  const pu = f.preco && f.embalagemQtd ? parseFloat(f.preco)/parseFloat(f.embalagemQtd) : null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div style={{background:W,borderRadius:"18px 18px 0 0",padding:18,width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:12,color:V}}>📦 Novo Produto Rápido</div>
        <label style={s.lbl}>Nome *</label>
        <input style={s.inp} placeholder="Ex: Chocolate 70%" value={f.nome} onChange={e=>setF(p=>({...p,nome:e.target.value}))} autoFocus/>
        <label style={s.lbl}>Categoria</label>
        <select style={s.inp} value={f.categoria} onChange={e=>setF(p=>({...p,categoria:e.target.value}))}>
          {CAT_P.map(c=><option key={c}>{c}</option>)}
        </select>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}>
            <label style={s.lbl}>Preço (R$) *</label>
            <input style={s.inp} type="number" step="0.01" placeholder="10.00" value={f.preco} onChange={e=>setF(p=>({...p,preco:e.target.value}))}/>
          </div>
          <div style={{flex:1}}>
            <label style={s.lbl}>Unidade</label>
            <select style={s.inp} value={f.unidade} onChange={e=>setF(p=>({...p,unidade:e.target.value}))}>
              {UNIDS.map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <label style={s.lbl}>Qtd na embalagem ({f.unidade}) *</label>
        <input style={s.inp} type="number" step="any" placeholder="200" value={f.embalagemQtd} onChange={e=>setF(p=>({...p,embalagemQtd:e.target.value}))}/>
        {pu!==null && <div style={s.tag}>💡 Custo: R$ {fmtN(pu)}/{f.unidade}</div>}
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button style={{...s.bsave,flex:1,marginTop:0}} onClick={async()=>{
            if(!f.nome.trim()||!f.preco||!f.embalagemQtd){toast_("⚠️ Preencha todos os campos");return;}
            const c={...f,id:Date.now().toString(),preco:parseFloat(f.preco)||0,embalagemQtd:parseFloat(f.embalagemQtd)||1};
            await saveP([...produtos,c]);
            onClose(); toast_("✅ Produto cadastrado!");
          }}>Salvar Produto</button>
          <button style={{...s.bd,padding:"13px 16px"}} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── FORM PRODUTO ──────────────────────────────────────────────
function ProdutoForm({ initialData, editId, recipes, saving, saveP, pedirExcP, copiarProduto, toast_, onSaved, onCancel }) {
  const [f, setF] = useState(initialData || { nome:"", preco:"", embalagemQtd:"", unidade:"g", categoria:"Secos" });
  useEffect(()=>{ if(initialData) setF(initialData); }, [initialData?.id]);
  const pu = f.preco && f.embalagemQtd ? parseFloat(f.preco)/parseFloat(f.embalagemQtd) : null;
  const usadoEm = editId ? recipes.filter(r=>r.ingredientes.some(i=>i.produtoId===editId)) : [];
  const salvar = async () => {
    if(!f.nome.trim()){toast_("⚠️ Informe o nome");return;}
    if(!f.preco){toast_("⚠️ Informe o preço");return;}
    if(!f.embalagemQtd){toast_("⚠️ Informe o tamanho");return;}
    await onSaved({...f, preco:parseFloat(f.preco)||0, embalagemQtd:parseFloat(f.embalagemQtd)||1});
  };
  return (
    <div style={s.fb}>
      <div style={s.sec}>
        <div style={s.st}>📦 Dados do Produto</div>
        <label style={s.lbl}>Nome *</label>
        <input style={s.inp} placeholder="Ex: Leite condensado" value={f.nome} onChange={e=>setF(p=>({...p,nome:e.target.value}))}/>
        <label style={s.lbl}>Categoria</label>
        <select style={s.inp} value={f.categoria} onChange={e=>setF(p=>({...p,categoria:e.target.value}))}>
          {CAT_P.map(c=><option key={c}>{c}</option>)}
        </select>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}>
            <label style={s.lbl}>Preço pago (R$) *</label>
            <input style={s.inp} type="number" step="0.01" placeholder="6.39" value={f.preco} onChange={e=>setF(p=>({...p,preco:e.target.value}))}/>
          </div>
          <div style={{flex:1}}>
            <label style={s.lbl}>Unidade</label>
            <select style={s.inp} value={f.unidade} onChange={e=>setF(p=>({...p,unidade:e.target.value}))}>
              {UNIDS.map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <label style={s.lbl}>Qtd na embalagem ({f.unidade}) *</label>
        <input style={s.inp} type="number" step="any" placeholder="395" value={f.embalagemQtd} onChange={e=>setF(p=>({...p,embalagemQtd:e.target.value}))}/>
        {pu!==null && <div style={s.tag}>💡 Custo por {f.unidade}: R$ {fmtN(pu)}/{f.unidade}</div>}
      </div>
      {usadoEm.length>0 && (
        <div style={s.sec}>
          <div style={s.st}>📋 Usado em {usadoEm.length} receita{usadoEm.length>1?"s":""}</div>
          {usadoEm.map(r=><div key={r.id} style={{fontSize:12,padding:"4px 0",borderBottom:`1px solid #FDE8ED`,display:"flex",gap:7}}><span>{r.emoji}</span><span>{r.nome}</span></div>)}
        </div>
      )}
      <button style={s.bsave} onClick={salvar}>{saving?"Salvando...":"✅ Salvar Produto"}</button>
      {editId && <button style={{...s.bd,width:"100%",marginTop:10,padding:13,textAlign:"center"}} onClick={()=>pedirExcP(editId)}>🗑 Excluir produto</button>}
      {editId && <button style={{...s.bpri,width:"100%",marginTop:8,padding:13,textAlign:"center",borderRadius:50}} onClick={()=>copiarProduto(editId)}>📋 Copiar produto</button>}
      <div style={{height:40}}/>
    </div>
  );
}

// ─── FORM RECEITA ──────────────────────────────────────────────
function ReceitaForm({ initialData, editId, produtos, saving, saveP, toast_, onSaved, onOpenQuickP }) {
  const [f, setF] = useState(initialData || { emoji:"🍫", nome:"", categoria:"", rendimento:10, margem:100, taxaDelivery:30, outrosCustos:30, despesas:0, precoApp:0, obs:"", ingredientes:[{produtoId:"",usadoQtd:0},{produtoId:"",usadoQtd:0}] });
  useEffect(()=>{ if(initialData) setF(JSON.parse(JSON.stringify(initialData))); }, [initialData?.id]);

  const updIng = (idx, field, val) => {
    setF(prev => {
      const a = [...prev.ingredientes]; a[idx]={...a[idx],[field]:val};
      return {...prev, ingredientes:a};
    });
  };

  const c = calc(f, produtos);

  const salvar = async () => {
    if(!f.nome.trim()){toast_("⚠️ Informe o nome");return;}
    await onSaved({...f, ingredientes:f.ingredientes.filter(i=>i.produtoId)});
  };

  return (
    <div style={s.fb}>
      <div style={s.sec}>
        <div style={s.st}>🍰 Informações</div>
        <div style={s.er}>{EMOJIS.map(e=><button key={e} style={{...s.eb,...(f.emoji===e?s.ebs:{})}} onClick={()=>setF(p=>({...p,emoji:e}))}>{e}</button>)}</div>
        <label style={s.lbl}>Nome *</label>
        <input style={s.inp} placeholder="Ex: Brownie Ninho" value={f.nome} onChange={e=>setF(p=>({...p,nome:e.target.value}))}/>
        <label style={s.lbl}>Categoria</label>
        <select style={s.inp} value={f.categoria} onChange={e=>setF(p=>({...p,categoria:e.target.value}))}>
          <option value="">Selecionar...</option>
          {CAT_R.map(c=><option key={c}>{c}</option>)}
        </select>
        <label style={s.lbl}>Rendimento (nº de unidades)</label>
        <input style={s.inp} type="number" placeholder="10" value={f.rendimento} onChange={e=>setF(p=>({...p,rendimento:parseFloat(e.target.value)||0}))}/>
        <label style={s.lbl}>Observações (opcional)</label>
        <textarea style={{...s.inp,height:65,resize:"none"}} value={f.obs||""} onChange={e=>setF(p=>({...p,obs:e.target.value}))}/>
      </div>
      <div style={s.sec}>
        <div style={s.st}>🧂 Ingredientes</div>
        <div style={s.help}>Digite para buscar. Não encontrou? Cadastre abaixo!</div>
        {f.ingredientes.map((ing,idx)=>{
          const p  = produtos.find(p=>p.id===ing.produtoId);
          const cu = p?(p.preco/p.embalagemQtd)*ing.usadoQtd:0;
          const bsc= p?"":(ing._busca||"");
          const res= bsc.trim().length>0?produtos.filter((pr,i,self)=>pr.nome.toLowerCase().includes(bsc.toLowerCase())&&self.findIndex(x=>x.nome.toLowerCase()===pr.nome.toLowerCase())===i).sort((a,b)=>a.nome.localeCompare(b.nome)):[];
          return (
            <div key={idx} style={s.ic}>
              <div style={s.ich}>
                <span style={{fontSize:12,fontWeight:600,color:G}}>Ingrediente {idx+1}</span>
                <button style={s.brm} onClick={()=>setF(prev=>({...prev,ingredientes:prev.ingredientes.filter((_,i)=>i!==idx)}))}>✕ remover</button>
              </div>
              <label style={s.lbl}>Buscar produto</label>
              <div style={{position:"relative",marginBottom:p?0:10}}>
                {p?(
                  <div style={{display:"flex",alignItems:"center",gap:7,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:9,padding:"9px 12px"}}>
                    <span>✅</span>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</span>
                    <button style={{background:"none",border:"none",color:R,fontSize:15,cursor:"pointer",padding:0,flexShrink:0}} onClick={()=>{const a=[...f.ingredientes];a[idx]={...a[idx],produtoId:"",_busca:""};setF(prev=>({...prev,ingredientes:a}));}}>✕</button>
                  </div>
                ):(
                  <>
                    <input style={{...s.inp,marginBottom:0,paddingLeft:34,background:CR,borderColor:RC}}
                      placeholder="Digite para buscar... ex: margarina" value={bsc}
                      onChange={e=>{const a=[...f.ingredientes];a[idx]={...a[idx],_busca:e.target.value,produtoId:""};setF(prev=>({...prev,ingredientes:a}));}}/>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none"}}>🔍</span>
                    {res.length>0&&(
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:W,border:`2px solid ${RC}`,borderRadius:10,zIndex:50,boxShadow:"0 8px 20px rgba(74,26,44,.15)",maxHeight:190,overflowY:"auto"}}>
                        {res.map(pr=>(
                          <div key={pr.id} style={{padding:"9px 12px",cursor:"pointer",borderBottom:`1px solid #FDE8ED`,fontSize:12}}
                            onClick={()=>{const a=[...f.ingredientes];a[idx]={...a[idx],produtoId:pr.id,_busca:pr.nome};setF(prev=>({...prev,ingredientes:a}));}}>
                            <div style={{fontWeight:600,color:V}}>{pr.nome}</div>
                            <div style={{fontSize:10,color:G,marginTop:1}}>{pr.categoria} · R$ {fmtN(pr.preco)}/{pr.embalagemQtd}{pr.unidade}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {bsc.trim().length>0&&res.length===0&&(
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:W,border:`2px solid ${RC}`,borderRadius:10,zIndex:50,padding:"10px 12px",fontSize:12,color:G}}>Nenhum produto — cadastre abaixo! 👇</div>
                    )}
                  </>
                )}
              </div>
              {p&&<>
                <div style={{marginTop:7}}/>
                <label style={s.lbl}>Quantidade usada ({p.unidade})</label>
                <input style={s.inp} type="number" step="any" placeholder="300" value={ing.usadoQtd||""} onChange={e=>updIng(idx,"usadoQtd",parseFloat(e.target.value)||0)}/>
                {cu>0&&<div style={s.tag}>💡 Custo: {fmt(cu)}</div>}
              </>}
            </div>
          );
        })}
        <button style={s.badd} onClick={()=>setF(prev=>({...prev,ingredientes:[...prev.ingredientes,{produtoId:"",usadoQtd:0}]}))}>+ Adicionar ingrediente</button>
        <button style={{...s.badd,marginTop:7,borderColor:"#86EFAC55",color:"#166534",background:"#F0FFF4"}} onClick={onOpenQuickP}>📦 Cadastrar novo produto</button>
      </div>
      <div style={s.sec}>
        <div style={s.st}>💰 Precificação</div>
        <div style={s.cs}>
          <div style={s.cr}><span>Custo ingredientes</span><strong>{fmt(c.ci)}</strong></div>
          <div style={s.cr}><span>Outros custos ({f.outrosCustos||30}%)</span><strong>{fmt(c.outros)}</strong></div>
          <div style={{...s.cr,fontWeight:700,borderTop:`1.5px solid ${RC}`,paddingTop:5,marginTop:3}}><span>Custo total</span><strong>{fmt(c.total)}</strong></div>
          <div style={s.cr}><span>Custo por unidade</span><strong>{fmt(c.porUn)}</strong></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}>
            <label style={s.lbl}>Margem de lucro (%)</label>
            <input style={{...s.inp,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:R,textAlign:"center"}} type="number" min={0} step={1} placeholder="100" value={f.margem||""} onChange={e=>setF(p=>({...p,margem:parseFloat(e.target.value)||0}))}/>
          </div>
          <div style={{flex:1}}>
            <label style={s.lbl}>Taxa delivery (%)</label>
            <input style={{...s.inp,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:R,textAlign:"center"}} type="number" min={0} step={1} placeholder="30" value={f.taxaDelivery||""} onChange={e=>setF(p=>({...p,taxaDelivery:parseFloat(e.target.value)||0}))}/>
          </div>
        </div>
        <label style={s.lbl}>Outros custos — gás, energia, etc. (%)</label>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <input style={{...s.inp,marginBottom:0,width:90,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:R,textAlign:"center"}} type="number" min={0} step={1} placeholder="30" value={f.outrosCustos!==undefined?f.outrosCustos:30} onChange={e=>setF(p=>({...p,outrosCustos:parseFloat(e.target.value)||0}))}/>
          <div style={{fontSize:12,color:G}}>= {fmt(c.outros)} sobre ingredientes</div>
        </div>
        {c.porUn>0&&<div style={{...s.tag,marginBottom:10}}>💡 {fmt(c.porUn)} × {f.margem||0}% margem ÷ {100-(f.taxaDelivery||30)}% = {fmt(c.final)}</div>}
        <label style={s.lbl}>Despesas extras (R$)</label>
        <input style={s.inp} type="number" step="0.01" placeholder="0,00" value={f.despesas||""} onChange={e=>setF(p=>({...p,despesas:parseFloat(e.target.value)||0}))}/>
        <div style={s.ph}>
          <div style={s.phl}>🏷 Preço de venda sugerido/unidade</div>
          <div style={s.phv}>{fmt(c.final)}</div>
          <div style={{fontSize:11,opacity:.75,marginTop:2}}>Lucro estimado no lote: {fmt(c.lucro)}</div>
        </div>
        <label style={s.lbl}>Preço praticado no app (R$)</label>
        <input style={s.inp} type="number" step="0.01" placeholder="0,00" value={f.precoApp||""} onChange={e=>setF(p=>({...p,precoApp:parseFloat(e.target.value)||0}))}/>
      </div>
      <button style={s.bsave} onClick={salvar}>{saving?"Salvando...":"✅ Salvar Receita"}</button>
      <div style={{height:40}}/>
    </div>
  );
}

// ─── DETALHE RECEITA DESKTOP ───────────────────────────────────
function DesktopDetail({ r, produtos, negocioNome, onEdit, onCopy, onDelete }) {
  const { ci, outros, total, porUn, semT, taxa, final, lucro, lucroApp } = calc(r, produtos);
  return (
    <div style={{padding:"28px 32px",animation:"fadein .2s ease"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}} className="no-print">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:36}}>{r.emoji}</span>
          <div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:V,lineHeight:1.2}}>{r.nome}</h1>
            <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
              <span style={{background:RC,color:V,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>Rendimento: {r.rendimento} unidade{r.rendimento!==1?"s":""}</span>
              {r.categoria&&<span style={{background:`${R}18`,color:R,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>Categoria: {r.categoria}</span>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          <button className="btn-h" style={{padding:"8px 18px",borderRadius:8,border:`2px solid ${RC}`,background:W,color:V,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onEdit}>✏️ Editar</button>
          <button className="btn-h" style={{padding:"8px 18px",borderRadius:8,border:"none",background:V,color:W,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>window.print()}>🖨️ Imprimir Ficha</button>
        </div>
      </div>
      <div className="desk-detail-grid" style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:24,alignItems:"start"}}>
        <div style={{background:W,borderRadius:14,padding:"20px 24px",boxShadow:`0 2px 12px rgba(74,26,44,.08)`}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:V,marginBottom:16}}>🧂 Ingredientes e Custos</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`2px solid ${RC}`}}>
                {["Ingrediente","Qtd Usada","Custo Base","Total na Receita"].map(h=><th key={h} style={{textAlign:h==="Ingrediente"?"left":"right",padding:"6px 6px 10px",fontSize:11,textTransform:"uppercase",letterSpacing:".05em",color:G,fontWeight:600}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {r.ingredientes.map((ing,i)=>{
                const p=produtos.find(p=>p.id===ing.produtoId);
                if(!p)return null;
                return(
                  <tr key={i} style={{borderBottom:`1px solid ${RC}`}}>
                    <td style={{padding:"10px 6px 10px 0",color:V,fontWeight:500}}>{p.nome}</td>
                    <td style={{padding:"10px 6px",textAlign:"right",color:G}}>{ing.usadoQtd}{p.unidade}</td>
                    <td style={{padding:"10px 6px",textAlign:"right",color:G}}>{fmt(p.preco)}/{p.embalagemQtd}{p.unidade}</td>
                    <td style={{padding:"10px 0",textAlign:"right",color:V,fontWeight:600}}>{fmt((p.preco/p.embalagemQtd)*ing.usadoQtd)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{borderTop:`2px solid ${RC}`}}>
                <td colSpan={3} style={{padding:"12px 6px 6px 0",fontWeight:700,color:V}}>Custo dos Ingredientes</td>
                <td style={{padding:"12px 0 6px",textAlign:"right",fontWeight:700,color:R}}>{fmt(ci)}</td>
              </tr>
              <tr>
                <td colSpan={3} style={{padding:"4px 6px 6px 0",color:G,fontSize:12}}>Outros custos ({r.outrosCustos||30}%)</td>
                <td style={{padding:"4px 0 6px",textAlign:"right",color:G,fontSize:12}}>{fmt(outros)}</td>
              </tr>
              {r.despesas>0&&<tr><td colSpan={3} style={{padding:"4px 6px 6px 0",color:G,fontSize:12}}>Despesas extras</td><td style={{padding:"4px 0 6px",textAlign:"right",color:G,fontSize:12}}>{fmt(r.despesas)}</td></tr>}
              <tr style={{borderTop:`2px solid ${RC}`}}>
                <td colSpan={3} style={{padding:"10px 6px 0 0",fontWeight:700,fontSize:14,color:V}}>Custo Total</td>
                <td style={{padding:"10px 0 0",textAlign:"right",fontWeight:700,fontSize:14,color:R}}>{fmt(total)}</td>
              </tr>
            </tfoot>
          </table>
          {r.obs&&<div style={{marginTop:16,paddingTop:14,borderTop:`1px solid ${RC}`}}><div style={{fontSize:11,fontWeight:600,color:G,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Observações</div><div style={{fontSize:13,color:G,lineHeight:1.6}}>{r.obs}</div></div>}
        </div>
        <div style={{background:W,borderRadius:14,padding:"20px",boxShadow:`0 2px 12px rgba(74,26,44,.08)`}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:V,marginBottom:16}}>💰 Precificação</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div style={s.pb}><div style={s.pl}>Custo/Unidade</div><div style={{...s.pv,fontSize:15}}>{fmt(porUn)}</div></div>
            <div style={s.pb}><div style={s.pl}>Margem</div><div style={{...s.pv,fontSize:15}}>{r.margem}%</div></div>
            <div style={s.pb}><div style={s.pl}>Preço s/ Taxa</div><div style={{...s.pv,fontSize:15}}>{fmt(semT)}</div></div>
            <div style={s.pb}><div style={s.pl}>Taxa Delivery ({r.taxaDelivery}%)</div><div style={{...s.pv,fontSize:15}}>{fmt(taxa)}</div></div>
          </div>
          <div style={{background:`linear-gradient(135deg,${R},${RL})`,borderRadius:12,padding:"16px",color:W,marginBottom:8,textAlign:"center"}}>
            <div style={{fontSize:11,opacity:.85,marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Preço de Venda Sugerido</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700}}>{fmt(final)}</div>
            <div style={{fontSize:11,opacity:.75,marginTop:2}}>por unidade</div>
          </div>
          <div style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#92400E",marginBottom:4}}>Lucro Estimado (Preço Sugerido)</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#92400E"}}>{fmt(lucro)}</div>
            <div style={{fontSize:10,color:"#92400E88",marginTop:2}}>para {r.rendimento} unidade{r.rendimento!==1?"s":""}</div>
          </div>
          {r.precoApp>0&&<>
            <div style={{background:"#F0FFF4",border:"1.5px solid #86EFAC",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#166534",marginBottom:4}}>Preço Praticado no App</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#166534"}}>{fmt(r.precoApp)}</div>
            </div>
            {lucroApp!==null&&<div style={{background:"#F0FFF4",border:"1.5px solid #86EFAC",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#166534",marginBottom:4}}>Lucro (Preço App)</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#166534"}}>{fmt(lucroApp)}</div>
            </div>}
          </>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16}} className="no-print">
        <button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:`2px solid ${RC}`,background:W,color:G,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onCopy}>📋 Copiar receita</button>
        <button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:`2px solid ${RC}`,background:W,color:R,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onDelete}>🗑 Excluir</button>
      </div>
    </div>
  );
}

// ─── LISTA RECEITAS ───────────────────────────────────────────
function ListaReceitas({ filtR, recipes, catR, setCatR, searchR, setSearchR, detailId, view, produtos, openDet }) {
  // State local para o input — evita perda de foco ao re-renderizar
  const [localSearch, setLocalSearch] = useState(searchR);
  const timerRef = useRef(null);
  const handleSearch = (val) => {
    setLocalSearch(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSearchR(val), 120);
  };
  return (
    <>
      <div style={s.srchW}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
        <input style={s.srch} placeholder="Buscar receita..." value={localSearch} onChange={e=>handleSearch(e.target.value)}/>
      </div>
      <div style={s.chips}>{["Todos",...CAT_R].map(c=><button key={c} style={{...s.chip,...(catR===c?s.chipa:{})}} onClick={()=>setCatR(c)}>{c}</button>)}</div>
      <div style={s.cnt}>{filtR.length} receita{filtR.length!==1?"s":""}</div>
      {filtR.length===0
        ?<div style={s.emp}><div style={{fontSize:46,marginBottom:10}}>🍰</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:17,marginBottom:5}}>{recipes.length===0?"Nenhuma receita":"Nada encontrado"}</div><div style={{fontSize:12,color:G,opacity:.7}}>{recipes.length===0?'Toque em "+ Receita" para começar!':"Tente outro termo."}</div></div>
        :<div style={s.list}>{filtR.map(r=>{const{final}=calc(r,produtos);return(
          <div key={r.id} style={{...s.card,...(detailId===r.id&&view==="detail"?{borderColor:R,background:"#FFF7F9"}:{})}} className="card-hl" onClick={()=>openDet(r.id)}>
            <div style={s.cem}>{r.emoji}</div>
            <div style={s.cbd}><div style={s.cnm}>{r.nome}</div><div style={s.cmt}>{r.categoria||"Sem categoria"} · rend. {r.rendimento} un.</div></div>
            <div style={s.cpr}><div style={s.cpv}>{fmt(final)}</div><div style={s.cpl}>p/ unidade</div></div>
          </div>
        );})}</div>
      }
    </>
  );
}

// ─── LISTA PRODUTOS ────────────────────────────────────────────
function ListaProdutos({ filtP, catP, setCatP, searchP, setSearchP, recipes, openEditP }) {
  // State local para o input — evita perda de foco ao re-renderizar
  const [localSearch, setLocalSearch] = useState(searchP);
  const timerRef = useRef(null);
  const handleSearch = (val) => {
    setLocalSearch(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSearchP(val), 120);
  };
  return (
    <>
      <div style={s.srchW}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
        <input style={s.srch} placeholder="Buscar produto..." value={localSearch} onChange={e=>handleSearch(e.target.value)}/>
      </div>
      <div style={s.chips}>{["Todos",...CAT_P].map(c=><button key={c} style={{...s.chip,...(catP===c?s.chipa:{})}} onClick={()=>setCatP(c)}>{c}</button>)}</div>
      <div style={s.cnt}>{filtP.length} produto{filtP.length!==1?"s":""} · toque para atualizar</div>
      <div style={s.list}>{filtP.map(p=>{
        const used=recipes.filter(r=>r.ingredientes.some(i=>i.produtoId===p.id)).length;
        const pu=p.embalagemQtd?p.preco/p.embalagemQtd:0;
        return(
          <div key={p.id} style={s.card} className="card-hl" onClick={()=>openEditP(p.id)}>
            <div style={{...s.cem,fontSize:20}}>{CATEMOJI[p.categoria]||"📦"}</div>
            <div style={s.cbd}><div style={s.cnm}>{p.nome}</div><div style={s.cmt}>{p.categoria} · R$ {fmtN(pu)}/{p.unidade}</div>{used>0&&<div style={{fontSize:10,color:R,fontWeight:600,marginTop:2}}>usado em {used} receita{used>1?"s":""}</div>}</div>
            <div style={s.cpr}><div style={s.cpv}>{fmt(p.preco)}</div><div style={s.cpl}>{p.embalagemQtd}{p.unidade}</div></div>
          </div>
        );
      })}</div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function App() {

  // ── AUTH ──
  const [appReady,    setAppReady]    = useState(false);
  const [user,        setUser]        = useState(null);
  const [negocioId,   setNegocioId]   = useState(null);
  const [negocioNome, setNegocioNome] = useState("");
  const [authView,    setAuthView]    = useState("login");
  const [authForm,    setAuthForm]    = useState({ email:"", senha:"", nomeNegocio:"" });
  const [authError,   setAuthError]   = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ── DATA ──
  const [receitasRowId, setReceitasRowId] = useState(null);
  const [produtosRowId, setProdutosRowId] = useState(null);
  const [recipes,  setRecipes]  = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  // ── NAV ──
  const [tab,       setTab]      = useState("receitas");
  const [view,      setView]     = useState("list");
  const [editId,    setEditId]   = useState(null);
  const [detailId,  setDetailId] = useState(null);
  const [editPId,   setEditPId]  = useState(null);
  const [pFormData, setPFormData] = useState(null);
  const [rFormData, setRFormData] = useState(null);

  // ── UI ──
  const [searchR,    setSearchR]    = useState("");
  const [catR,       setCatR]       = useState("Todos");
  const [searchP,    setSearchP]    = useState("");
  const [catP,       setCatP]       = useState("Todos");
  const [toast,      setToast]      = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [quickPOpen, setQuickPOpen] = useState(false);
  const [viewRel,    setViewRel]    = useState(false);

  const toast_ = useCallback(msg => { setToast(msg); setTimeout(()=>setToast(""), 2800); }, []);

  // ── SETUP NEGÓCIO ──
  async function setupNegocio(userId, userMeta) {
    const { data: membro, error: errM } = await supabase.from("membros").select("negocio_id").eq("user_id",userId).maybeSingle();
    if (errM) throw new Error(errM.message);
    if (membro?.negocio_id) {
      const { data: neg } = await supabase.from("negocios").select("nome").eq("id",membro.negocio_id).maybeSingle();
      return { nId: membro.negocio_id, nNome: neg?.nome||"Meu Negócio" };
    }
    const nomeNeg = userMeta?.nome_negocio||"Meu Negócio";
    const { data: neg, error: errN } = await supabase.from("negocios").insert({nome:nomeNeg}).select("id").single();
    if (errN) throw new Error(errN.message);
    await supabase.from("membros").insert({negocio_id:neg.id,user_id:userId,papel:"dono"});
    return { nId: neg.id, nNome: nomeNeg };
  }

  // ── CARREGA DADOS ──
  async function loadUserData(sessionUser) {
    setLoading(true);
    const timeout = setTimeout(async () => {
      try { await supabase.auth.signOut({scope:"local"}); } catch(e){}
      try { Object.keys(localStorage).forEach(k=>{ if(k.startsWith("sb-")||k.includes("delicias-jay-auth")) localStorage.removeItem(k); }); } catch(e){}
      setUser(null); setNegocioId(null); setNegocioNome("");
      setRecipes([]); setProdutos([]);
      setLoading(false); setAppReady(true);
    }, 8000);
    try {
      const { nId, nNome } = await setupNegocio(sessionUser.id, sessionUser.user_metadata);
      setNegocioId(nId); setNegocioNome(nNome);
      const [{ data: rData, error: rErr }, { data: pData, error: pErr }] = await Promise.all([
        supabase.from("receitas").select("id,dados").eq("negocio_id",nId).maybeSingle(),
        supabase.from("produtos").select("id,dados").eq("negocio_id",nId).maybeSingle(),
      ]);
      if(rErr) console.error(rErr);
      if(pErr) console.error(pErr);
      if(rData?.id){setReceitasRowId(rData.id);setRecipes(rData.dados||[]);}else{setRecipes(SEED_RECIPES);}
      if(pData?.id){setProdutosRowId(pData.id);setProdutos(pData.dados||[]);}else{setProdutos(SEED_PRODUTOS);}
    } catch(e) { console.error(e); setRecipes(SEED_RECIPES); setProdutos(SEED_PRODUTOS); }
    clearTimeout(timeout); setLoading(false); setAppReady(true);
  }

  // ── AUTH LISTENER ──
  useEffect(()=>{
    let loaded=false;
    const { data:{subscription} } = supabase.auth.onAuthStateChange(async(event,session)=>{
      if(event==="SIGNED_OUT"){
        loaded=false; setUser(null); setNegocioId(null); setNegocioNome("");
        setRecipes([]); setProdutos([]); setReceitasRowId(null); setProdutosRowId(null);
        setView("list"); setTab("receitas"); setAppReady(true); return;
      }
      if(event==="TOKEN_REFRESHED"||event==="USER_UPDATED") return;
      if((event==="SIGNED_IN"||event==="INITIAL_SESSION")&&session?.user){
        setUser(session.user);
        if(!loaded){loaded=true; await loadUserData(session.user);}else{setAppReady(true);}
        return;
      }
      if(event==="INITIAL_SESSION"&&!session) setAppReady(true);
    });
    return ()=>subscription.unsubscribe();
  },[]); // eslint-disable-line

  // ── SALVAR ──
  const saveR = useCallback(async(dados)=>{
    setSaving(true);
    try{
      if(receitasRowId) await supabase.from("receitas").update({dados,atualizado_em:new Date().toISOString()}).eq("id",receitasRowId);
      else{ const {data}=await supabase.from("receitas").insert({negocio_id:negocioId,dados}).select("id").single(); if(data)setReceitasRowId(data.id); }
    }catch(e){console.error(e);}
    setSaving(false);
  },[receitasRowId,negocioId]);

  const saveP = useCallback(async(dados)=>{
    setSaving(true);
    try{
      if(produtosRowId) await supabase.from("produtos").update({dados,atualizado_em:new Date().toISOString()}).eq("id",produtosRowId);
      else{ const {data}=await supabase.from("produtos").insert({negocio_id:negocioId,dados}).select("id").single(); if(data)setProdutosRowId(data.id); }
    }catch(e){console.error(e);}
    setSaving(false);
  },[produtosRowId,negocioId]);

  // ── AUTH ACTIONS ──
  const fazerLogin = async()=>{
    if(!authForm.email||!authForm.senha){setAuthError("Preencha email e senha");return;}
    setAuthLoading(true); setAuthError("");
    const {error}=await supabase.auth.signInWithPassword({email:authForm.email.trim(),password:authForm.senha});
    if(error)setAuthError("Email ou senha incorretos ❌");
    setAuthLoading(false);
  };
  const fazerCadastro = async()=>{
    if(!authForm.nomeNegocio.trim()){setAuthError("Informe o nome do negócio ⚠️");return;}
    if(!authForm.email.trim()){setAuthError("Informe seu email ⚠️");return;}
    if(authForm.senha.length<6){setAuthError("Senha deve ter ao menos 6 caracteres ⚠️");return;}
    setAuthLoading(true); setAuthError("");
    const {error}=await supabase.auth.signUp({email:authForm.email.trim(),password:authForm.senha,options:{data:{nome_negocio:authForm.nomeNegocio.trim()}}});
    if(error)setAuthError(error.message); else setAuthView("emailConfirm");
    setAuthLoading(false);
  };
  const fazerLogout = async()=>{
    try{await supabase.auth.signOut({scope:"local"});}catch(e){}
    try{Object.keys(localStorage).forEach(k=>{if(k.startsWith("sb-")||k.includes("delicias-jay-auth"))localStorage.removeItem(k);});}catch(e){}
    setUser(null); setNegocioId(null); setNegocioNome("");
    setRecipes([]); setProdutos([]); setReceitasRowId(null); setProdutosRowId(null);
    setView("list"); setTab("receitas"); setAuthView("login"); setAuthForm({email:"",senha:"",nomeNegocio:""});
  };

  // ── CRUD RECEITAS ──
  const blankR = ()=>({ id:Date.now().toString(), emoji:"🍫", nome:"", categoria:"", rendimento:10, margem:100, taxaDelivery:30, outrosCustos:30, despesas:0, precoApp:0, obs:"", ingredientes:[{produtoId:"",usadoQtd:0},{produtoId:"",usadoQtd:0}] });
  const openNewR  = ()=>{ setRFormData(blankR()); setEditId(null); setView("rForm"); };
  const openEditR = id=>{ setRFormData(recipes.find(r=>r.id===id)); setEditId(id); setView("rForm"); };
  const openDet   = id=>{ setDetailId(id); setView("detail"); };
  const saveRecipe = async(data)=>{
    const up = editId ? recipes.map(r=>r.id===editId?{...data,id:editId}:r) : [...recipes,data];
    setRecipes(up); await saveR(up);
    toast_("✅ Receita salva!"); setDetailId(data.id); setView("detail");
  };
  const copiarReceita = id=>{
    const r=recipes.find(r=>r.id===id);
    setRFormData({...JSON.parse(JSON.stringify(r)),id:Date.now().toString(),nome:`Cópia de ${r.nome}`});
    setEditId(null); setView("rForm"); toast_("📋 Revise e salve a cópia!");
  };
  const pedirExcR = id=>{ const r=recipes.find(r=>r.id===id); setConfirmDel({tipo:"receita",id,nome:r?.nome||""}); };
  const confirmarExcR = async()=>{
    if(!confirmDel)return;
    const up=recipes.filter(r=>r.id!==confirmDel.id); setRecipes(up); await saveR(up);
    toast_("🗑 Receita excluída"); setView("list"); setTab("receitas"); setDetailId(null); setConfirmDel(null);
  };

  // ── CRUD PRODUTOS ──
  const blankP = ()=>({ id:Date.now().toString(), nome:"", preco:"", embalagemQtd:"", unidade:"g", categoria:"Secos" });
  const openNewP  = ()=>{ setPFormData(blankP()); setEditPId(null); setView("pForm"); };
  const openEditP = id=>{ setPFormData({...produtos.find(p=>p.id===id), preco:String(produtos.find(p=>p.id===id)?.preco||""), embalagemQtd:String(produtos.find(p=>p.id===id)?.embalagemQtd||"")}); setEditPId(id); setView("pForm"); };
  const saveProd = async(data)=>{
    const up = editPId ? produtos.map(p=>p.id===editPId?{...data,id:editPId}:p) : [...produtos,data];
    setProdutos(up); await saveP(up);
    toast_("✅ Produto salvo!"); setView("list"); setTab("produtos");
  };
  const copiarProduto = id=>{
    const p=produtos.find(p=>p.id===id);
    setPFormData({...p,id:Date.now().toString(),nome:`Cópia de ${p.nome}`,preco:String(p.preco),embalagemQtd:String(p.embalagemQtd)});
    setEditPId(null); setView("pForm"); toast_("📋 Revise e salve a cópia!");
  };
  const pedirExcP = id=>{
    if(recipes.some(r=>r.ingredientes.some(i=>i.produtoId===id))){toast_("⚠️ Produto usado em receitas");return;}
    const p=produtos.find(p=>p.id===id); setConfirmDel({tipo:"produto",id,nome:p?.nome||""});
  };
  const confirmarExcP = async()=>{
    if(!confirmDel)return;
    const up=produtos.filter(p=>p.id!==confirmDel.id); setProdutos(up); await saveP(up);
    toast_("🗑 Produto excluído"); setConfirmDel(null);
  };
  const confirmarExc = ()=>{ if(confirmDel?.tipo==="receita")confirmarExcR(); else confirmarExcP(); };

  // ── EXPORTAR CSV ──
  const exportarCSV = tipo=>{
    const filtP = produtos.filter((p,i,self)=>self.findIndex(x=>x.nome.toLowerCase()===p.nome.toLowerCase())===i).sort((a,b)=>a.nome.localeCompare(b.nome));
    let csv="",nome="";
    if(tipo==="receitas"){
      nome="receitas.csv"; csv="Nome;Categoria;Rendimento;Margem%;Taxa Delivery%;Custo Total;Custo/Un;Preço Sugerido/Un;Preço Praticado;Lucro Lote\n";
      recipes.forEach(r=>{const c=calc(r,produtos); csv+=`"${r.nome}";"${r.categoria||""}";"${r.rendimento}";"${r.margem}";"${r.taxaDelivery}";"${fmtN(c.total)}";"${fmtN(c.porUn)}";"${fmtN(c.final)}";"${fmtN(r.precoApp)}";"${fmtN(c.lucro)}"\n`;});
    }else{
      nome="produtos.csv"; csv="Nome;Categoria;Unidade;Preço Embalagem;Qtd Embalagem;Custo/Un;Usado em Receitas\n";
      filtP.forEach(p=>{const used=recipes.filter(r=>r.ingredientes.some(i=>i.produtoId===p.id)).length; const pu=p.embalagemQtd?p.preco/p.embalagemQtd:0; csv+=`"${p.nome}";"${p.categoria}";"${p.unidade}";"${fmtN(p.preco)}";"${p.embalagemQtd}";"${fmtN(pu)}";"${used}"\n`;});
    }
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=nome; a.click(); URL.revokeObjectURL(url);
    toast_("📊 CSV exportado!");
  };

  // ── FILTROS ──
  const filtR = recipes.filter(r=>(r.nome.toLowerCase().includes(searchR.toLowerCase())||(r.categoria||"").toLowerCase().includes(searchR.toLowerCase()))&&(catR==="Todos"||r.categoria===catR));
  const filtP = produtos.filter((p,i,self)=>self.findIndex(x=>x.nome.toLowerCase()===p.nome.toLowerCase())===i).filter(p=>p.nome.toLowerCase().includes(searchP.toLowerCase())&&(catP==="Todos"||p.categoria===catP)).sort((a,b)=>a.nome.localeCompare(b.nome));

  // ══════════════════════════════════════════════════════════════
  // TELAS DE AUTH
  // ══════════════════════════════════════════════════════════════
  const aInp = err => ({ width:"100%", padding:"13px 18px", borderRadius:50, border:`2px solid ${err?"#ff6b6b":"#C45C7444"}`, background:"rgba(255,255,255,.15)", fontSize:15, color:W, WebkitTextFillColor:W, outline:"none", textAlign:"center", boxSizing:"border-box", marginBottom:10, fontFamily:"'DM Sans',sans-serif" });

  if(!appReady) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:V}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:10}}>🍫</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:5}}>Delícias da Jay</div>
        <div style={{width:28,height:28,border:`3px solid ${R}44`,borderTop:`3px solid ${R}`,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"16px auto 0"}}></div>
      </div>
    </div>
  );

  if(!user&&authView==="emailConfirm") return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:V}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",padding:"0 32px",width:"100%",maxWidth:380}}>
        <div style={{fontSize:60,marginBottom:14}}>📧</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:10}}>Verifique seu email</div>
        <div style={{color:`${RL}bb`,fontSize:14,lineHeight:1.7,marginBottom:28}}>Enviamos um link para<br/><strong style={{color:RL}}>{authForm.email}</strong><br/><br/>Confirme e volte aqui para entrar.</div>
        <button style={{background:"rgba(255,255,255,.12)",border:`1px solid ${R}55`,color:RL,borderRadius:50,padding:"11px 24px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>setAuthView("login")}>Voltar para o login</button>
      </div>
    </div>
  );

  if(!user&&authView==="cadastro") return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:V}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",padding:"0 32px",width:"100%",maxWidth:380}}>
        <div style={{fontSize:52,marginBottom:10}}>🍰</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:4}}>Criar conta</div>
        <div style={{color:`${R}88`,fontSize:11,marginBottom:28,letterSpacing:".08em",textTransform:"uppercase"}}>Novo negócio</div>
        <input style={aInp(!!authError)} type="text" placeholder="Nome do seu negócio 🏪" value={authForm.nomeNegocio} onChange={e=>{setAuthForm({...authForm,nomeNegocio:e.target.value});setAuthError("");}}/>
        <input style={aInp(!!authError)} type="email" placeholder="Seu email" value={authForm.email} onChange={e=>{setAuthForm({...authForm,email:e.target.value});setAuthError("");}}/>
        <input style={aInp(!!authError)} type="password" placeholder="Senha (mín. 6 caracteres)" value={authForm.senha} onChange={e=>{setAuthForm({...authForm,senha:e.target.value});setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&fazerCadastro()}/>
        {authError&&<div style={{color:"#ff8fa3",fontSize:12,marginBottom:10}}>{authError}</div>}
        <button style={{width:"100%",padding:"13px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${R},${RL})`,color:W,fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,cursor:"pointer",marginBottom:14}} onClick={fazerCadastro} disabled={authLoading}>{authLoading?"Criando conta...":"Criar conta"}</button>
        <button style={{background:"none",border:"none",color:`${RL}99`,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>{setAuthView("login");setAuthError("");}}>Já tenho conta → Entrar</button>
      </div>
    </div>
  );

  if(!user) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:V}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",padding:"0 32px",width:"100%",maxWidth:380}}>
        <div style={{fontSize:60,marginBottom:14}}>🍰</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:26,marginBottom:5}}>Delícias da Jay</div>
        <div style={{color:`${R}88`,fontSize:12,marginBottom:32,letterSpacing:".1em",textTransform:"uppercase"}}>Fichas Técnicas</div>
        <input style={aInp(!!authError)} type="email" placeholder="Seu email" value={authForm.email} onChange={e=>{setAuthForm({...authForm,email:e.target.value});setAuthError("");}}/>
        <input style={{...aInp(!!authError),letterSpacing:".15em",animation:authError?"shake .3s":""}} type="password" placeholder="Senha" value={authForm.senha} onChange={e=>{setAuthForm({...authForm,senha:e.target.value});setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&fazerLogin()}/>
        {authError&&<div style={{color:"#ff8fa3",fontSize:12,marginBottom:10}}>{authError}</div>}
        <button style={{width:"100%",padding:"13px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${R},${RL})`,color:W,fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,cursor:"pointer",marginBottom:14}} onClick={fazerLogin} disabled={authLoading}>{authLoading?"Entrando...":"Entrar"}</button>
        <button style={{background:"none",border:"none",color:`${RL}99`,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>{setAuthView("cadastro");setAuthError("");setAuthForm({email:"",senha:"",nomeNegocio:""});}}>Criar novo negócio →</button>
      </div>
    </div>
  );

  if(loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:V}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:10}}>🍫</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:5}}>{negocioNome||"Carregando..."}</div>
        <div style={{width:28,height:28,border:`3px solid ${R}44`,borderTop:`3px solid ${R}`,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"16px auto 0"}}></div>
      </div>
    </div>
  );

  // ListaReceitas e ListaProdutos movidas para componentes externos abaixo

  // ── DETALHE MOBILE ──
  const DetalheMobile = () => {
    const r=recipes.find(r=>r.id===detailId);
    if(!r){setView("list");return null;}
    const{ci,outros,total,porUn,semT,taxa,final,lucro,lucroApp}=calc(r,produtos);
    return(
      <>
        <div style={s.dh}>
          <div style={{fontSize:44,marginBottom:7,marginTop:10}}>{r.emoji}</div>
          <div style={s.dn}>{r.nome}</div>
          <div style={s.dc}>{r.categoria||"Sem categoria"} · {r.rendimento} unidade{r.rendimento!==1?"s":""}</div>
        </div>
        <div style={s.db}>
          <div style={s.sec}>
            <div style={s.st}>🧂 Ingredientes</div>
            {r.ingredientes.map((ing,i)=>{
              const p=produtos.find(p=>p.id===ing.produtoId);
              if(!p)return null;
              return(<div key={i} style={s.ir}><div><div style={{fontWeight:500,fontSize:13}}>{p.nome}</div><div style={{fontSize:11,color:G,marginTop:1}}>{ing.usadoQtd}{p.unidade} · {fmt(p.preco)}/{p.embalagemQtd}{p.unidade}</div></div><div style={s.icost}>{fmt((p.preco/p.embalagemQtd)*ing.usadoQtd)}</div></div>);
            })}
            <div style={{...s.ir,borderTop:`2px solid ${RC}`,marginTop:5,paddingTop:7}}><div style={{fontWeight:700}}>Custo ingredientes</div><div style={s.icost}>{fmt(ci)}</div></div>
            <div style={s.ir}><div>Outros custos ({r.outrosCustos||30}%)</div><div style={s.icost}>{fmt(outros)}</div></div>
            {r.despesas>0&&<div style={s.ir}><div>Despesas extras</div><div style={s.icost}>{fmt(r.despesas)}</div></div>}
            <div style={{...s.ir,fontWeight:700}}><div>Custo total</div><div style={s.icost}>{fmt(total)}</div></div>
          </div>
          <div style={s.sec}>
            <div style={s.st}>💰 Precificação</div>
            <div style={s.pg}><div style={s.pb}><div style={s.pl}>Custo/unidade</div><div style={s.pv}>{fmt(porUn)}</div></div><div style={s.pb}><div style={s.pl}>Margem</div><div style={s.pv}>{r.margem}%</div></div><div style={s.pb}><div style={s.pl}>Preço s/ taxa</div><div style={s.pv}>{fmt(semT)}</div></div><div style={s.pb}><div style={s.pl}>Taxa delivery ({r.taxaDelivery}%)</div><div style={s.pv}>{fmt(taxa)}</div></div></div>
            <div style={s.ph}><div style={s.phl}>🏷 Preço de venda/unidade</div><div style={s.phv}>{fmt(final)}</div></div>
            {r.precoApp>0&&<div style={{...s.pb,background:"#F0FFF4",border:"1.5px solid #86EFAC",marginBottom:7}}><div style={{...s.pl,color:"#166534"}}>✅ Preço praticado no app</div><div style={{...s.pv,color:"#166534"}}>{fmt(r.precoApp)}</div></div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div style={{...s.pb,background:"#FFF7F9",border:"1.5px solid #FCD34D"}}><div style={{...s.pl,color:"#92400E"}}>💸 Lucro (sugerido)</div><div style={{...s.pv,color:"#92400E"}}>{fmt(lucro)}</div></div>
              {lucroApp!==null&&<div style={{...s.pb,background:"#F0FFF4",border:"1.5px solid #86EFAC"}}><div style={{...s.pl,color:"#166534"}}>💸 Lucro (app)</div><div style={{...s.pv,color:"#166534"}}>{fmt(lucroApp)}</div></div>}
            </div>
          </div>
          {r.obs&&<div style={s.sec}><div style={s.st}>📝 Obs</div><div style={{fontSize:13,color:G,lineHeight:1.6}}>{r.obs}</div></div>}
          <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
            <button style={s.be} onClick={()=>openEditR(r.id)}>✏️ Editar</button>
            <button style={{...s.bpri,padding:"13px 14px"}} onClick={()=>copiarReceita(r.id)}>📋 Copiar</button>
            <button style={s.bd} onClick={()=>pedirExcR(r.id)}>🗑 Excluir</button>
          </div>
        </div>
      </>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // MODAL RELATÓRIOS
  // ══════════════════════════════════════════════════════════════
  const RelModal = () => !viewRel ? null : (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"flex-end"}}>
      <div style={{background:W,borderRadius:"18px 18px 0 0",padding:20,width:"100%",maxWidth:520,margin:"0 auto",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:V}}>📊 Relatórios</div>
          <button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:G}} onClick={()=>setViewRel(false)}>✕</button>
        </div>
        <div style={{...s.sec,marginBottom:10}}>
          <div style={s.st}>🍰 Resumo de Receitas ({recipes.length})</div>
          {recipes.map(r=>{const c=calc(r,produtos);return(
            <div key={r.id} style={{borderBottom:`1px solid #FDE8ED`,padding:"7px 0",fontSize:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:600}}><span>{r.emoji} {r.nome}</span><span style={{color:R}}>{fmt(c.final)}/un</span></div>
              <div style={{display:"flex",justifyContent:"space-between",color:G,marginTop:2}}><span>Custo {fmt(c.porUn)}/un · Margem {r.margem}%</span><span style={{color:"#92400E"}}>Lucro {fmt(c.lucro)}</span></div>
            </div>
          );})}
          <button style={{...s.bsave,marginTop:12,padding:12,fontSize:13}} onClick={()=>exportarCSV("receitas")}>⬇️ Exportar Receitas CSV</button>
        </div>
        <div style={s.sec}>
          <div style={s.st}>📦 Resumo de Produtos ({filtP.length})</div>
          {filtP.slice(0,20).map(p=>{const used=recipes.filter(r=>r.ingredientes.some(i=>i.produtoId===p.id)).length;const pu=p.embalagemQtd?p.preco/p.embalagemQtd:0;return(
            <div key={p.id} style={{borderBottom:`1px solid #FDE8ED`,padding:"6px 0",fontSize:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:600}}><span>{p.nome}</span><span style={{color:R}}>{fmt(p.preco)}</span></div>
              <div style={{color:G,marginTop:1}}>R$ {fmtN(pu)}/{p.unidade} · {used} receita{used!==1?"s":""}</div>
            </div>
          );})}
          {filtP.length>20&&<div style={{fontSize:11,color:G,padding:"6px 0"}}>...e mais {filtP.length-20} produtos no CSV</div>}
          <button style={{...s.bsave,marginTop:12,padding:12,fontSize:13}} onClick={()=>exportarCSV("produtos")}>⬇️ Exportar Produtos CSV</button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // MOBILE
  // ══════════════════════════════════════════════════════════════
  const MobileApp = () => (
    <div style={s.app} className="mobile-only">
      <header style={s.hdr}>
        <div>
          <div style={s.logo}>{negocioNome||"Fichas Técnicas"}</div>
          <div style={s.lsub}>Fichas Técnicas</div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {view==="list"&&<><button style={{...s.bpri,background:"rgba(255,255,255,.15)",fontSize:12,padding:"8px 12px"}} onClick={()=>setViewRel(true)}>📊</button><button style={s.bpri} onClick={tab==="receitas"?openNewR:openNewP}>+ {tab==="receitas"?"Receita":"Produto"}</button></>}
          {view!=="list"&&<button style={s.bback} onClick={()=>{if(view==="detail"||view==="pForm")setView("list");else if(view==="rForm")setView(editId?"detail":"list");}}>← Voltar</button>}
          <button style={{background:"rgba(255,255,255,.1)",border:"none",color:RL,borderRadius:50,padding:"8px 12px",fontSize:13,cursor:"pointer"}} onClick={fazerLogout}>🚪</button>
        </div>
      </header>
      {view==="list"&&<><div style={s.tabs}><button style={{...s.tab,...(tab==="receitas"?s.taba:{})}} onClick={()=>setTab("receitas")}>🍰 Receitas</button><button style={{...s.tab,...(tab==="produtos"?s.taba:{})}} onClick={()=>setTab("produtos")}>📦 Produtos</button></div>{tab==="receitas"?<ListaReceitas filtR={filtR} recipes={recipes} catR={catR} setCatR={setCatR} searchR={searchR} setSearchR={setSearchR} detailId={detailId} view={view} produtos={produtos} openDet={openDet}/>:<ListaProdutos filtP={filtP} catP={catP} setCatP={setCatP} searchP={searchP} setSearchP={setSearchP} recipes={recipes} openEditP={openEditP}/>}</>}
      {view==="detail"&&<DetalheMobile/>}
      {view==="rForm"&&<ReceitaForm initialData={rFormData} editId={editId} produtos={produtos} saving={saving} saveP={saveP} toast_={toast_} onSaved={saveRecipe} onOpenQuickP={()=>setQuickPOpen(true)}/>}
      {view==="pForm"&&<ProdutoForm initialData={pFormData} editId={editPId} recipes={recipes} saving={saving} saveP={saveP} pedirExcP={pedirExcP} copiarProduto={copiarProduto} toast_={toast_} onSaved={saveProd} onCancel={()=>setView("list")}/>}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // DESKTOP
  // ══════════════════════════════════════════════════════════════
  const DesktopApp = () => (
    <div className="desktop-only desk-grid">
      {/* SIDEBAR */}
      <div className="desk-side">
        <div style={{padding:"20px 16px 16px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:18,lineHeight:1.2}}>{negocioNome||"Fichas Técnicas"}</div>
          <div style={{color:"#D4748866",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",marginTop:2}}>Fichas Técnicas</div>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
          <button style={{flex:1,padding:"10px 8px",border:"none",background:"none",color:tab==="receitas"?W:"rgba(255,255,255,.4)",fontSize:12,fontWeight:600,cursor:"pointer",borderBottom:tab==="receitas"?`2px solid ${R}`:"2px solid transparent",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>setTab("receitas")}>🍰 Receitas</button>
          <button style={{flex:1,padding:"10px 8px",border:"none",background:"none",color:tab==="produtos"?W:"rgba(255,255,255,.4)",fontSize:12,fontWeight:600,cursor:"pointer",borderBottom:tab==="produtos"?`2px solid ${R}`:"2px solid transparent",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>setTab("produtos")}>📦 Produtos</button>
        </div>
        <div style={{padding:"10px 12px 6px",position:"relative"}}>
          <span style={{position:"absolute",left:22,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(255,255,255,.4)",pointerEvents:"none"}}>🔍</span>
          <input style={{width:"100%",padding:"8px 10px 8px 30px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",fontSize:12,color:W,WebkitTextFillColor:W,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"}}
            placeholder={tab==="receitas"?"Buscar receita...":"Buscar produto..."}
            value={tab==="receitas"?searchR:searchP}
            onChange={e=>tab==="receitas"?setSearchR(e.target.value):setSearchP(e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:5,padding:"4px 12px 8px",overflowX:"auto",scrollbarWidth:"none"}}>
          {(tab==="receitas"?["Todos",...CAT_R]:["Todos",...CAT_P]).map(c=>(
            <button key={c} style={{flexShrink:0,padding:"3px 10px",borderRadius:20,border:"1px solid rgba(255,255,255,.2)",background:(tab==="receitas"?catR:catP)===c?"rgba(255,255,255,.2)":"transparent",color:(tab==="receitas"?catR:catP)===c?W:"rgba(255,255,255,.5)",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
              onClick={()=>tab==="receitas"?setCatR(c):setCatP(c)}>{c}</button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"0 8px"}}>
          {tab==="receitas"&&(
            filtR.length===0
              ?<div style={{textAlign:"center",padding:"40px 16px",color:"rgba(255,255,255,.3)",fontSize:13}}>{recipes.length===0?"Nenhuma receita ainda":"Nada encontrado"}</div>
              :filtR.map(r=>{const{final}=calc(r,produtos);return(
                <div key={r.id} className="card-h" style={{padding:"10px",borderRadius:10,marginBottom:4,display:"flex",alignItems:"center",gap:10,background:detailId===r.id&&view==="detail"?"rgba(255,255,255,.15)":"transparent",transition:"all .15s"}} onClick={()=>openDet(r.id)}>
                  <span style={{fontSize:20,flexShrink:0}}>{r.emoji}</span>
                  <div style={{flex:1,minWidth:0}}><div style={{color:W,fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nome}</div><div style={{color:"rgba(255,255,255,.4)",fontSize:10,marginTop:1}}>{r.categoria||"Sem categoria"}</div></div>
                  <div style={{color:RL,fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,flexShrink:0}}>{fmt(final)}</div>
                </div>
              );})
          )}
          {tab==="produtos"&&(
            filtP.length===0
              ?<div style={{textAlign:"center",padding:"40px 16px",color:"rgba(255,255,255,.3)",fontSize:13}}>Nenhum produto encontrado</div>
              :filtP.map(p=>{const pu=p.embalagemQtd?p.preco/p.embalagemQtd:0;const used=recipes.filter(r=>r.ingredientes.some(i=>i.produtoId===p.id)).length;return(
                <div key={p.id} className="card-h" style={{padding:"10px",borderRadius:10,marginBottom:4,display:"flex",alignItems:"center",gap:10,background:editPId===p.id&&view==="pForm"?"rgba(255,255,255,.15)":"transparent",transition:"all .15s"}} onClick={()=>openEditP(p.id)}>
                  <span style={{fontSize:18,flexShrink:0}}>{CATEMOJI[p.categoria]||"📦"}</span>
                  <div style={{flex:1,minWidth:0}}><div style={{color:W,fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nome}</div><div style={{color:"rgba(255,255,255,.4)",fontSize:10,marginTop:1}}>{p.categoria} · R$ {fmtN(pu)}/{p.unidade}{used>0?` · ${used} receita${used>1?"s":""}`:" "}</div></div>
                  <div style={{color:RL,fontFamily:"'Playfair Display',serif",fontSize:12,fontWeight:700,flexShrink:0}}>{fmt(p.preco)}</div>
                </div>
              );})
          )}
        </div>
        <div style={{padding:"12px",borderTop:"1px solid rgba(255,255,255,.1)",display:"flex",gap:6}}>
          <button className="btn-h" style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:R,color:W,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={tab==="receitas"?openNewR:openNewP}>+ {tab==="receitas"?"Receita":"Produto"}</button>
          <button className="btn-h" style={{padding:"8px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"transparent",color:"rgba(255,255,255,.6)",fontSize:12,cursor:"pointer"}} onClick={()=>setViewRel(true)}>📊</button>
          <button className="btn-h" style={{padding:"8px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"transparent",color:"rgba(255,255,255,.6)",fontSize:12,cursor:"pointer"}} onClick={fazerLogout}>🚪</button>
        </div>
      </div>

      {/* PAINEL DIREITO */}
      <div className="desk-main">
        {view==="list"&&tab==="receitas"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:12}}><div style={{fontSize:64}}>🍰</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:G}}>Selecione uma receita</div><div style={{fontSize:13,color:`${G}66`}}>ou clique em + Receita para criar</div></div>}
        {view==="list"&&tab==="produtos"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:12}}><div style={{fontSize:64}}>📦</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:G}}>Selecione um produto</div><div style={{fontSize:13,color:`${G}66`}}>ou clique em + Produto para criar</div></div>}
        {view==="detail"&&(()=>{const r=recipes.find(r=>r.id===detailId);if(!r)return null;return<DesktopDetail r={r} produtos={produtos} negocioNome={negocioNome} onEdit={()=>openEditR(r.id)} onCopy={()=>copiarReceita(r.id)} onDelete={()=>pedirExcR(r.id)}/>;})()}
        {view==="rForm"&&<div style={{maxWidth:720,margin:"0 auto",width:"100%",padding:"20px 28px 80px"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><button style={{...s.bback,background:RC,color:V}} onClick={()=>setView(editId?"detail":"list")}>← Cancelar</button><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:V}}>{editId?"Editar Receita":"Nova Receita"}</h2></div><ReceitaForm initialData={rFormData} editId={editId} produtos={produtos} saving={saving} saveP={saveP} toast_={toast_} onSaved={saveRecipe} onOpenQuickP={()=>setQuickPOpen(true)}/></div>}
        {view==="pForm"&&<div style={{maxWidth:600,margin:"0 auto",width:"100%",padding:"20px 28px 80px"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><button style={{...s.bback,background:RC,color:V}} onClick={()=>setView("list")}>← Cancelar</button><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:V}}>{editPId?"Editar Produto":"Novo Produto"}</h2></div><ProdutoForm initialData={pFormData} editId={editPId} recipes={recipes} saving={saving} saveP={saveP} pedirExcP={pedirExcP} copiarProduto={copiarProduto} toast_={toast_} onSaved={saveProd} onCancel={()=>setView("list")}/></div>}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER FINAL
  // ══════════════════════════════════════════════════════════════
  return (
    <>
      <style>{CSS}</style>
      <MobileApp/>
      <DesktopApp/>
      <ModalConfirm item={confirmDel} onConfirm={confirmarExc} onCancel={()=>setConfirmDel(null)}/>
      <QuickProdModal open={quickPOpen} produtos={produtos} saveP={saveP} toast_={toast_} onClose={()=>setQuickPOpen(false)}/>
      <RelModal/>
      {toast&&<div style={s.tst}>{toast}</div>}
      {saving&&<div style={s.sync}>💾 Salvando...</div>}
    </>
  );
}
