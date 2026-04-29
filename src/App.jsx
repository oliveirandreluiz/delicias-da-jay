import { useState, useEffect, useCallback } from "react";

// ─── PRODUTOS ──────────────────────────────────────────────────────────────
const SEED_PRODUTOS = [
  { id:"p-01", nome:"Farinha de trigo",          preco:6.99,   embalagemQtd:1000,  unidade:"g",  categoria:"Secos" },
  { id:"p-02", nome:"Farinha de trigo Globo",    preco:2.49,   embalagemQtd:1000,  unidade:"g",  categoria:"Secos" },
  { id:"p-03", nome:"Açúcar",                    preco:2.99,   embalagemQtd:1000,  unidade:"g",  categoria:"Secos" },
  { id:"p-04", nome:"Açúcar mascavo",            preco:10.00,  embalagemQtd:1000,  unidade:"g",  categoria:"Secos" },
  { id:"p-05", nome:"Fermento",                  preco:4.99,   embalagemQtd:100,   unidade:"g",  categoria:"Secos" },
  { id:"p-06", nome:"Essência de baunilha",      preco:7.00,   embalagemQtd:30,    unidade:"ml", categoria:"Secos" },
  { id:"p-07", nome:"Flocão de milho",           preco:3.99,   embalagemQtd:500,   unidade:"g",  categoria:"Secos" },
  { id:"p-08", nome:"Coco ralado 50g",           preco:2.99,   embalagemQtd:50,    unidade:"g",  categoria:"Secos" },
  { id:"p-09", nome:"Coco ralado 1kg",           preco:29.69,  embalagemQtd:1000,  unidade:"g",  categoria:"Secos" },
  { id:"p-10", nome:"Leite condensado",          preco:6.39,   embalagemQtd:395,   unidade:"g",  categoria:"Laticínios" },
  { id:"p-11", nome:"Creme de leite",            preco:2.65,   embalagemQtd:200,   unidade:"g",  categoria:"Laticínios" },
  { id:"p-12", nome:"Leite integral",            preco:5.00,   embalagemQtd:1000,  unidade:"ml", categoria:"Laticínios" },
  { id:"p-13", nome:"Leite Ninho",               preco:18.00,  embalagemQtd:380,   unidade:"g",  categoria:"Laticínios" },
  { id:"p-14", nome:"Leite em pó 1kg",           preco:35.89,  embalagemQtd:1000,  unidade:"g",  categoria:"Laticínios" },
  { id:"p-15", nome:"Margarina",                 preco:13.00,  embalagemQtd:1000,  unidade:"g",  categoria:"Laticínios" },
  { id:"p-16", nome:"Margarina 15kg",            preco:190.00, embalagemQtd:15000, unidade:"g",  categoria:"Laticínios" },
  { id:"p-17", nome:"Margarina Qualy 1kg",       preco:16.00,  embalagemQtd:1000,  unidade:"g",  categoria:"Laticínios" },
  { id:"p-18", nome:"Nescau",                    preco:21.00,  embalagemQtd:990,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-19", nome:"Nescau 2kg",                preco:45.00,  embalagemQtd:2000,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-20", nome:"Cacau em pó",               preco:23.00,  embalagemQtd:200,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-21", nome:"Cacau em pó 50%",           preco:15.00,  embalagemQtd:200,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-22", nome:"Cacau 50% 1kg",             preco:60.00,  embalagemQtd:1000,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-23", nome:"Cacau 100%",                preco:70.00,  embalagemQtd:500,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-24", nome:"Chocolate 50% 1kg",         preco:65.00,  embalagemQtd:1000,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-25", nome:"Barra de chocolate",        preco:39.00,  embalagemQtd:1000,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-26", nome:"Barra choc. meio amargo",   preco:37.00,  embalagemQtd:1000,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-27", nome:"Nutella",                   preco:16.00,  embalagemQtd:140,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-28", nome:"Nutella 3kg",               preco:198.00, embalagemQtd:3000,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-29", nome:"Granulado pequeno",         preco:3.50,   embalagemQtd:50,    unidade:"g",  categoria:"Chocolates" },
  { id:"p-30", nome:"Granulado grande",          preco:23.00,  embalagemQtd:500,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-31", nome:"Granulado Melken 400g",     preco:49.90,  embalagemQtd:400,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-32", nome:"Gotas de chocolate",        preco:10.00,  embalagemQtd:150,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-33", nome:"Brigadeiro (pronto)",       preco:2.00,   embalagemQtd:1,     unidade:"un", categoria:"Chocolates" },
  { id:"p-34", nome:"Ovos",                      preco:1.00,   embalagemQtd:1,     unidade:"un", categoria:"Outros" },
  { id:"p-35", nome:"Óleo de soja",              preco:6.99,   embalagemQtd:900,   unidade:"ml", categoria:"Outros" },
  { id:"p-36", nome:"Uva",                       preco:6.99,   embalagemQtd:500,   unidade:"g",  categoria:"Outros" },
  { id:"p-37", nome:"Morango",                   preco:6.99,   embalagemQtd:1,     unidade:"un", categoria:"Outros" },
  { id:"p-38", nome:"Milho",                     preco:3.00,   embalagemQtd:200,   unidade:"g",  categoria:"Outros" },
  { id:"p-39", nome:"Milho verde",               preco:3.50,   embalagemQtd:1,     unidade:"un", categoria:"Outros" },
  { id:"p-40", nome:"Frango",                    preco:17.00,  embalagemQtd:1000,  unidade:"g",  categoria:"Outros" },
  { id:"p-41", nome:"Verduras",                  preco:5.00,   embalagemQtd:1,     unidade:"un", categoria:"Outros" },
  { id:"p-42", nome:"Molho de tomate",           preco:2.00,   embalagemQtd:1,     unidade:"un", categoria:"Outros" },
  { id:"p-43", nome:"Catupiry 400g",             preco:17.00,  embalagemQtd:400,   unidade:"g",  categoria:"Outros" },
  { id:"p-44", nome:"Catupiry",                  preco:12.00,  embalagemQtd:400,   unidade:"g",  categoria:"Outros" },
  { id:"p-45", nome:"Requeijão cremoso",         preco:6.00,   embalagemQtd:1,     unidade:"un", categoria:"Outros" },
  { id:"p-50", nome:"Embalagem brownie",         preco:0.52,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-51", nome:"Embalagem cookies",         preco:0.05,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-52", nome:"Embalagem bolo",            preco:1.10,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-53", nome:"Embalagem bolo de pote",    preco:0.80,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-54", nome:"Embalagem delícia de uva",  preco:0.75,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-55", nome:"Embalagem tortilete",       preco:0.05,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-56", nome:"Embalagem delivery",        preco:0.57,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-57", nome:"Embalagem empadão",         preco:1.00,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-58", nome:"Cone",                      preco:0.60,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
  { id:"p-59", nome:"Embalagem cone",            preco:0.31,   embalagemQtd:1,     unidade:"un", categoria:"Embalagens" },
];

const SEED_RECIPES = [];

// ─── SUPABASE ──────────────────────────────────────────────────────────────
const SUPA_URL  = import.meta.env.VITE_SUPA_URL;
const SUPA_ANON = import.meta.env.VITE_SUPA_ANON;
const SUPA_H    = { "apikey": SUPA_ANON, "Authorization": `Bearer ${SUPA_ANON}`, "Content-Type": "application/json" };
const APP_SENHA = import.meta.env.VITE_APP_SENHA;

// ─── CONSTANTES ────────────────────────────────────────────────────────────
const CAT_R   = ["Brownies","Docinhos","Copo da Felicidade","Bolo no Pote","Cones Trufados","Salgados","Outro"];
const CAT_P   = ["Secos","Laticínios","Chocolates","Embalagens","Outros"];
const UNIDS   = ["g","kg","ml","L","un","colher","xícara"];
const EMOJIS  = ["🍫","🧁","🎂","🍰","🍬","🍮","🥧","🍩","🍪","🥐","🫙","🌋","🍇","🌽","🧇","🥮","🍭","☕","🌮","🥚","🧀"];
const CATEMOJI= {"Secos":"🌾","Laticínios":"🥛","Chocolates":"🍫","Embalagens":"📦","Outros":"🛒"};

// ─── HELPERS ───────────────────────────────────────────────────────────────
const fmt  = v => "R$ " + (parseFloat(v)||0).toFixed(2).replace(".",",");
const fmtN = v => (parseFloat(v)||0).toFixed(2).replace(".",",");

function calc(r, prods) {
  const ci = r.ingredientes.reduce((s,i) => {
    const p = prods.find(p => p.id === i.produtoId);
    return p ? s + (p.preco / p.embalagemQtd) * i.usadoQtd : s;
  }, 0);
  const outros = ci * 0.30;
  const total  = ci + outros + (r.despesas||0);
  const porUn  = r.rendimento > 0 ? total / r.rendimento : 0;
  const semT   = porUn * (1 + (r.margem||100) / 100);
  const tp     = (r.taxaDelivery||30) / 100;
  const final  = tp < 1 ? semT / (1 - tp) : semT;
  const taxa   = final - semT;
  const lucro  = (final - porUn) * r.rendimento;
  return { ci, outros, total, porUn, semT, taxa, final, lucro };
}

async function upsert(tabela, dados) {
  await fetch(`${SUPA_URL}/rest/v1/${tabela}`, {
    method: "POST",
    headers: { ...SUPA_H, "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify({ id: 1, dados }),
  });
}

// ─── ESTILOS ───────────────────────────────────────────────────────────────
const V = "#4A1A2C", R = "#C45C74", RL = "#E8899A", RC = "#F5D0D8",
      CR = "#FFF0F3", G = "#7A4A58", W = "#fff";

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
  srchW: { margin:"12px 14px 0", position:"relative" },
  srch:  { width:"100%", padding:"10px 14px 10px 36px", borderRadius:50, border:`2px solid ${RC}`, background:W, fontSize:13, color:V, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif" },
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
  body{background:#FFF0F3;}
  input,select,textarea{color:#4A1A2C!important;-webkit-text-fill-color:#4A1A2C!important;}
  input:focus,select:focus,textarea:focus{border-color:#C45C74!important;background:#fff!important;}
  input::placeholder{color:#4A1A2C55!important;-webkit-text-fill-color:#4A1A2C55!important;}
  .ch:hover{border-color:#F5D0D8!important;transform:translateY(-1px);}
  .po:hover{background:#FFF0F3!important;}
  ::-webkit-scrollbar{display:none;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
`;

// ─── COMPONENTE MODAL CONFIRMAÇÃO ──────────────────────────────────────────
function ModalConfirm({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:W,borderRadius:18,padding:22,width:"100%",maxWidth:360,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:10}}>🗑</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:V,marginBottom:7,fontWeight:700}}>Confirmar exclusão</div>
        <div style={{fontSize:13,color:G,marginBottom:20,lineHeight:1.6}}>
          Excluir <b>"{item.nome}"</b>?<br/>
          <span style={{fontSize:11,color:R}}>Esta ação não pode ser desfeita.</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:50,border:`2px solid ${RC}`,background:W,color:G,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onCancel}>Cancelar</button>
          <button style={{flex:1,padding:13,borderRadius:50,border:"none",background:`linear-gradient(135deg,${R},${RL})`,color:W,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={onConfirm}>Sim, excluir</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────
export default function App() {
  // ── STATE ──
  const [authed,     setAuthed]     = useState(!!sessionStorage.getItem("jay_auth"));
  const [senha,      setSenha]      = useState("");
  const [erroLogin,  setErroLogin]  = useState(false);
  const [recipes,    setRecipes]    = useState([]);
  const [produtos,   setProdutos]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [tab,        setTab]        = useState("receitas");
  const [view,       setView]       = useState("list");
  const [editId,     setEditId]     = useState(null);
  const [detailId,   setDetailId]   = useState(null);
  const [searchR,    setSearchR]    = useState("");
  const [catR,       setCatR]       = useState("Todos");
  const [searchP,    setSearchP]    = useState("");
  const [catP,       setCatP]       = useState("Todos");
  const [toast,      setToast]      = useState("");
  const [rForm,      setRForm]      = useState(null);
  const [pForm,      setPForm]      = useState(null);
  const [editPId,    setEditPId]    = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [quickP,     setQuickP]     = useState(null);

  // ── HELPERS ──
  const toast_ = useCallback(msg => { setToast(msg); setTimeout(() => setToast(""), 2800); }, []);
  const saveR  = useCallback(async d => { setSaving(true); await upsert("receitas", d); setSaving(false); }, []);
  const saveP  = useCallback(async d => { setSaving(true); await upsert("produtos",  d); setSaving(false); }, []);

  // ── LOAD ──
  useEffect(() => {
    if (!authed) return;
    (async () => {
      setLoading(true);
      try {
        const [rr, pr] = await Promise.all([
          fetch(`${SUPA_URL}/rest/v1/receitas?select=dados`, { headers: SUPA_H }),
          fetch(`${SUPA_URL}/rest/v1/produtos?select=dados`,  { headers: SUPA_H }),
        ]);
        const rj = await rr.json();
        const pj = await pr.json();
        const rd = rj.length > 0 ? rj[0].dados : null;
        const pd = pj.length > 0 ? pj[0].dados : null;
        setRecipes(rd || SEED_RECIPES);
        setProdutos(pd || SEED_PRODUTOS);
        if (!rd) await upsert("receitas", SEED_RECIPES);
        if (!pd) await upsert("produtos",  SEED_PRODUTOS);
      } catch (e) {
        console.error(e);
        setRecipes(SEED_RECIPES);
        setProdutos(SEED_PRODUTOS);
      }
      setLoading(false);
    })();
  }, [authed]);

  // ── LOGIN ──
  const fazerLogin  = () => {
    if (senha === APP_SENHA) { sessionStorage.setItem("jay_auth","1"); setAuthed(true); }
    else { setErroLogin(true); setTimeout(() => setErroLogin(false), 2000); }
  };
  const fazerLogout = () => { sessionStorage.removeItem("jay_auth"); setAuthed(false); setSenha(""); };

  // ── PRODUTO CRUD ──
  const blankP    = () => ({ id: Date.now().toString(), nome:"", preco:"", embalagemQtd:"", unidade:"g", categoria:"Secos" });
  const openNewP  = () => { setPForm(blankP()); setEditPId(null); setView("pForm"); };
  const openEditP = id => { setPForm({...produtos.find(p => p.id === id)}); setEditPId(id); setView("pForm"); };

  const saveProd = async () => {
    if (!pForm.nome.trim())    { toast_("⚠️ Informe o nome");              return; }
    if (!pForm.preco)           { toast_("⚠️ Informe o preço");             return; }
    if (!pForm.embalagemQtd)    { toast_("⚠️ Informe o tamanho");           return; }
    const c = { ...pForm, preco: parseFloat(pForm.preco)||0, embalagemQtd: parseFloat(pForm.embalagemQtd)||1 };
    const up = editPId ? produtos.map(p => p.id === editPId ? c : p) : [...produtos, c];
    setProdutos(up); await saveP(up);
    toast_("✅ Produto salvo!"); setView("list"); setTab("produtos");
  };

  // ── RECEITA CRUD ──
  const blankR    = () => ({ id: Date.now().toString(), emoji:"🍫", nome:"", categoria:"", rendimento:10, margem:100, taxaDelivery:30, despesas:0, precoApp:0, obs:"", ingredientes:[{produtoId:"",usadoQtd:0},{produtoId:"",usadoQtd:0}] });
  const openNewR  = () => { setRForm(blankR()); setEditId(null); setView("rForm"); };
  const openEditR = id => { setRForm(JSON.parse(JSON.stringify(recipes.find(r => r.id === id)))); setEditId(id); setView("rForm"); };
  const openDet   = id => { setDetailId(id); setView("detail"); };

  const saveRecipe = async () => {
    if (!rForm.nome.trim()) { toast_("⚠️ Informe o nome"); return; }
    const c  = { ...rForm, ingredientes: rForm.ingredientes.filter(i => i.produtoId) };
    const up = editId ? recipes.map(r => r.id === editId ? c : r) : [...recipes, c];
    setRecipes(up); await saveR(up);
    toast_("✅ Receita salva!"); setDetailId(c.id); setView("detail");
  };

  // ── EXCLUSÃO ──
  const pedirExcR = id => { const r = recipes.find(r => r.id === id); setConfirmDel({ tipo:"receita", id, nome: r?.nome||"" }); };
  const pedirExcP = id => {
    if (recipes.some(r => r.ingredientes.some(i => i.produtoId === id))) { toast_("⚠️ Produto usado em receitas"); return; }
    const p = produtos.find(p => p.id === id); setConfirmDel({ tipo:"produto", id, nome: p?.nome||"" });
  };
  const confirmarExc = async () => {
    if (!confirmDel) return;
    if (confirmDel.tipo === "receita") {
      const up = recipes.filter(r => r.id !== confirmDel.id); setRecipes(up); await saveR(up);
      toast_("🗑 Receita excluída"); setView("list"); setTab("receitas");
    } else {
      const up = produtos.filter(p => p.id !== confirmDel.id); setProdutos(up); await saveP(up);
      toast_("🗑 Produto excluído");
    }
    setConfirmDel(null);
  };

  const updIng = (idx, field, val) => {
    const a = [...rForm.ingredientes]; a[idx] = { ...a[idx], [field]: val };
    setRForm({ ...rForm, ingredientes: a });
  };

  // ── FILTROS ──
  const filtR = recipes.filter(r =>
    (r.nome.toLowerCase().includes(searchR.toLowerCase()) || (r.categoria||"").toLowerCase().includes(searchR.toLowerCase())) &&
    (catR === "Todos" || r.categoria === catR)
  );
  const filtP = produtos
    .filter((p,i,self) => self.findIndex(x => x.nome.toLowerCase() === p.nome.toLowerCase()) === i)
    .filter(p => p.nome.toLowerCase().includes(searchP.toLowerCase()) && (catP === "Todos" || p.categoria === catP))
    .sort((a,b) => a.nome.localeCompare(b.nome));

  // ══════════════════════════════════════════════════════════════
  // TELA DE LOGIN
  // ══════════════════════════════════════════════════════════════
  if (!authed) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:V}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",padding:"0 32px",width:"100%",maxWidth:380}}>
        <div style={{fontSize:60,marginBottom:14}}>🍰</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:26,marginBottom:5}}>Delícias da Jay</div>
        <div style={{color:`${R}88`,fontSize:12,marginBottom:32,letterSpacing:".1em",textTransform:"uppercase"}}>Fichas Técnicas</div>
        <input
          style={{width:"100%",padding:"13px 18px",borderRadius:50,border:`2px solid ${erroLogin?"#ff6b6b":"#C45C7444"}`,background:"rgba(255,255,255,.15)",fontSize:15,color:W,WebkitTextFillColor:W,outline:"none",textAlign:"center",letterSpacing:".15em",boxSizing:"border-box",marginBottom:10,fontFamily:"'DM Sans',sans-serif",animation:erroLogin?"shake .3s":""}}
          type="password" placeholder="Digite sua senha" value={senha}
          onChange={e => { setSenha(e.target.value); setErroLogin(false); }}
          onKeyDown={e => e.key === "Enter" && fazerLogin()}
        />
        {erroLogin && <div style={{color:"#ff8fa3",fontSize:12,marginBottom:10}}>Senha incorreta ❌</div>}
        <button style={{width:"100%",padding:"13px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${R},${RL})`,color:W,fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,cursor:"pointer"}} onClick={fazerLogin}>
          Entrar
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // SPLASH
  // ══════════════════════════════════════════════════════════════
  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:V}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:10}}>🍫</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:RL,fontSize:22,marginBottom:5}}>Delícias da Jay</div>
        <div style={{width:28,height:28,border:`3px solid ${R}44`,borderTop:`3px solid ${R}`,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"16px auto 0"}}></div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // FORM PRODUTO
  // ══════════════════════════════════════════════════════════════
  if (view === "pForm" && pForm) {
    const pu = pForm.preco && pForm.embalagemQtd ? parseFloat(pForm.preco) / parseFloat(pForm.embalagemQtd) : null;
    const usadoEm = editPId ? recipes.filter(r => r.ingredientes.some(i => i.produtoId === editPId)) : [];
    return (
      <div style={s.app}><style>{CSS}</style>
        <header style={s.hdr}>
          <button style={s.bback} onClick={() => setView("list")}>← Voltar</button>
          <span style={s.logo}>{editPId ? "Editar Produto" : "Novo Produto"}</span>
          <div style={{width:70}}/>
        </header>
        <div style={s.fb}>
          <div style={s.sec}>
            <div style={s.st}>📦 Dados do Produto</div>
            <label style={s.lbl}>Nome *</label>
            <input style={s.inp} placeholder="Ex: Leite condensado" value={pForm.nome} onChange={e => setPForm({...pForm, nome:e.target.value})}/>
            <label style={s.lbl}>Categoria</label>
            <select style={s.inp} value={pForm.categoria} onChange={e => setPForm({...pForm, categoria:e.target.value})}>
              {CAT_P.map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}>
                <label style={s.lbl}>Preço pago (R$) *</label>
                <input style={s.inp} type="number" step="0.01" placeholder="6.39" value={pForm.preco} onChange={e => setPForm({...pForm, preco:e.target.value})}/>
              </div>
              <div style={{flex:1}}>
                <label style={s.lbl}>Unidade</label>
                <select style={s.inp} value={pForm.unidade} onChange={e => setPForm({...pForm, unidade:e.target.value})}>
                  {UNIDS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <label style={s.lbl}>Qtd na embalagem ({pForm.unidade}) *</label>
            <input style={s.inp} type="number" step="any" placeholder="395" value={pForm.embalagemQtd} onChange={e => setPForm({...pForm, embalagemQtd:e.target.value})}/>
            {pu !== null && <div style={s.tag}>💡 Custo por {pForm.unidade}: R$ {fmtN(pu)}/{pForm.unidade}</div>}
          </div>
          {usadoEm.length > 0 && (
            <div style={s.sec}>
              <div style={s.st}>📋 Usado em {usadoEm.length} receita{usadoEm.length>1?"s":""}</div>
              {usadoEm.map(r => <div key={r.id} style={{fontSize:12,padding:"4px 0",borderBottom:`1px solid #FDE8ED`,display:"flex",gap:7}}><span>{r.emoji}</span><span>{r.nome}</span></div>)}
              <div style={{fontSize:11,color:R,marginTop:7,fontWeight:600}}>✅ Ao salvar, essas receitas são recalculadas automaticamente.</div>
            </div>
          )}
          <button style={s.bsave} onClick={saveProd}>{saving ? "Salvando..." : "✅ Salvar Produto"}</button>
          {editPId && <button style={{...s.bd,width:"100%",marginTop:10,padding:13,textAlign:"center"}} onClick={() => pedirExcP(editPId)}>🗑 Excluir produto</button>}
          <div style={{height:40}}/>
        </div>
        <ModalConfirm item={confirmDel} onConfirm={confirmarExc} onCancel={() => setConfirmDel(null)}/>
        {toast && <div style={s.tst}>{toast}</div>}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // FORM RECEITA
  // ══════════════════════════════════════════════════════════════
  if (view === "rForm" && rForm) {
    const c = calc(rForm, produtos);
    return (
      <div style={s.app}><style>{CSS}</style>
        <header style={s.hdr}>
          <button style={s.bback} onClick={() => setView(editId ? "detail" : "list")}>← Cancelar</button>
          <span style={s.logo}>{editId ? "Editar Receita" : "Nova Receita"}</span>
          <div style={{width:70}}/>
        </header>
        <div style={s.fb}>

          {/* INFO */}
          <div style={s.sec}>
            <div style={s.st}>🍰 Informações</div>
            <div style={s.er}>{EMOJIS.map(e => <button key={e} style={{...s.eb,...(rForm.emoji===e?s.ebs:{})}} onClick={() => setRForm({...rForm,emoji:e})}>{e}</button>)}</div>
            <label style={s.lbl}>Nome *</label>
            <input style={s.inp} placeholder="Ex: Brownie Ninho" value={rForm.nome} onChange={e => setRForm({...rForm,nome:e.target.value})}/>
            <label style={s.lbl}>Categoria</label>
            <select style={s.inp} value={rForm.categoria} onChange={e => setRForm({...rForm,categoria:e.target.value})}>
              <option value="">Selecionar...</option>
              {CAT_R.map(c => <option key={c}>{c}</option>)}
            </select>
            <label style={s.lbl}>Rendimento (nº de unidades)</label>
            <input style={s.inp} type="number" placeholder="10" value={rForm.rendimento} onChange={e => setRForm({...rForm,rendimento:parseFloat(e.target.value)||0})}/>
            <label style={s.lbl}>Observações (opcional)</label>
            <textarea style={{...s.inp,height:65,resize:"none"}} value={rForm.obs||""} onChange={e => setRForm({...rForm,obs:e.target.value})}/>
          </div>

          {/* INGREDIENTES */}
          <div style={s.sec}>
            <div style={s.st}>🧂 Ingredientes</div>
            <div style={s.help}>Digite para buscar. Não encontrou? Cadastre abaixo!</div>
            {rForm.ingredientes.map((ing, idx) => {
              const p   = produtos.find(p => p.id === ing.produtoId);
              const cu  = p ? (p.preco / p.embalagemQtd) * ing.usadoQtd : 0;
              const bsc = p ? "" : (ing._busca || "");
              const res = bsc.trim().length > 0
                ? produtos
                    .filter((pr,i,self) => pr.nome.toLowerCase().includes(bsc.toLowerCase()) && self.findIndex(x => x.nome.toLowerCase()===pr.nome.toLowerCase())===i)
                    .sort((a,b) => a.nome.localeCompare(b.nome))
                : [];
              return (
                <div key={idx} style={s.ic}>
                  <div style={s.ich}>
                    <span style={{fontSize:12,fontWeight:600,color:G}}>Ingrediente {idx+1}</span>
                    <button style={s.brm} onClick={() => setRForm({...rForm,ingredientes:rForm.ingredientes.filter((_,i)=>i!==idx)})}>✕ remover</button>
                  </div>
                  <label style={s.lbl}>Buscar produto</label>
                  <div style={{position:"relative",marginBottom:p?0:10}}>
                    {p ? (
                      <div style={{display:"flex",alignItems:"center",gap:7,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:9,padding:"9px 12px"}}>
                        <span>✅</span>
                        <span style={{flex:1,fontSize:13,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</span>
                        <button style={{background:"none",border:"none",color:R,fontSize:15,cursor:"pointer",padding:0,flexShrink:0}}
                          onClick={() => { const a=[...rForm.ingredientes]; a[idx]={...a[idx],produtoId:"",_busca:""}; setRForm({...rForm,ingredientes:a}); }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <input
                          style={{...s.inp,marginBottom:0,paddingLeft:34,background:CR,borderColor:RC}}
                          placeholder="Digite para buscar... ex: margarina"
                          value={bsc}
                          onChange={e => { const a=[...rForm.ingredientes]; a[idx]={...a[idx],_busca:e.target.value,produtoId:""}; setRForm({...rForm,ingredientes:a}); }}
                        />
                        <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none"}}>🔍</span>
                        {res.length > 0 && (
                          <div style={{position:"absolute",top:"100%",left:0,right:0,background:W,border:`2px solid ${RC}`,borderRadius:10,zIndex:50,boxShadow:"0 8px 20px rgba(74,26,44,.15)",maxHeight:190,overflowY:"auto"}}>
                            {res.map(pr => (
                              <div key={pr.id} className="po"
                                style={{padding:"9px 12px",cursor:"pointer",borderBottom:`1px solid #FDE8ED`,fontSize:12}}
                                onClick={() => { const a=[...rForm.ingredientes]; a[idx]={...a[idx],produtoId:pr.id,_busca:pr.nome}; setRForm({...rForm,ingredientes:a}); }}>
                                <div style={{fontWeight:600,color:V}}>{pr.nome}</div>
                                <div style={{fontSize:10,color:G,marginTop:1}}>{pr.categoria} · R$ {fmtN(pr.preco)}/{pr.embalagemQtd}{pr.unidade}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {bsc.trim().length > 0 && res.length === 0 && (
                          <div style={{position:"absolute",top:"100%",left:0,right:0,background:W,border:`2px solid ${RC}`,borderRadius:10,zIndex:50,padding:"10px 12px",fontSize:12,color:G}}>
                            Nenhum produto — cadastre abaixo! 👇
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {p && <>
                    <div style={{marginTop:7}}/>
                    <label style={s.lbl}>Quantidade usada ({p.unidade})</label>
                    <input style={s.inp} type="number" step="any" placeholder="300" value={ing.usadoQtd||""} onChange={e => updIng(idx,"usadoQtd",parseFloat(e.target.value)||0)}/>
                    {cu > 0 && <div style={s.tag}>💡 Custo: {fmt(cu)}</div>}
                  </>}
                </div>
              );
            })}
            <button style={s.badd} onClick={() => setRForm({...rForm,ingredientes:[...rForm.ingredientes,{produtoId:"",usadoQtd:0}]})}>+ Adicionar ingrediente</button>
            <button style={{...s.badd,marginTop:7,borderColor:"#86EFAC55",color:"#166534",background:"#F0FFF4"}}
              onClick={() => setQuickP({id:Date.now().toString(),nome:"",preco:"",embalagemQtd:"",unidade:"g",categoria:"Secos"})}>
              📦 Cadastrar novo produto
            </button>
          </div>

          {/* PRECIFICAÇÃO */}
          <div style={s.sec}>
            <div style={s.st}>💰 Precificação</div>
            <div style={s.cs}>
              <div style={s.cr}><span>Custo ingredientes</span><strong>{fmt(c.ci)}</strong></div>
              <div style={s.cr}><span>Outros custos (30%)</span><strong>{fmt(c.outros)}</strong></div>
              <div style={{...s.cr,fontWeight:700,borderTop:`1.5px solid ${RC}`,paddingTop:5,marginTop:3}}><span>Custo total</span><strong>{fmt(c.total)}</strong></div>
              <div style={s.cr}><span>Custo por unidade</span><strong>{fmt(c.porUn)}</strong></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}>
                <label style={s.lbl}>Margem de lucro (%)</label>
                <input style={{...s.inp,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:R,textAlign:"center"}}
                  type="number" min={0} step={1} placeholder="100" value={rForm.margem||""}
                  onChange={e => setRForm({...rForm,margem:parseFloat(e.target.value)||0})}/>
              </div>
              <div style={{flex:1}}>
                <label style={s.lbl}>Taxa delivery (%)</label>
                <input style={{...s.inp,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:R,textAlign:"center"}}
                  type="number" min={0} step={1} placeholder="30" value={rForm.taxaDelivery||""}
                  onChange={e => setRForm({...rForm,taxaDelivery:parseFloat(e.target.value)||0})}/>
              </div>
            </div>
            {c.porUn > 0 && <div style={{...s.tag,marginBottom:10}}>💡 {fmt(c.porUn)} × {rForm.margem||0}% margem ÷ {100-(rForm.taxaDelivery||30)}% = {fmt(c.final)}</div>}
            <label style={s.lbl}>Despesas extras (R$)</label>
            <input style={s.inp} type="number" step="0.01" placeholder="0,00" value={rForm.despesas||""} onChange={e => setRForm({...rForm,despesas:parseFloat(e.target.value)||0})}/>
            <div style={s.ph}>
              <div style={s.phl}>🏷 Preço de venda sugerido/unidade</div>
              <div style={s.phv}>{fmt(c.final)}</div>
              <div style={{fontSize:11,opacity:.75,marginTop:2}}>Lucro estimado no lote: {fmt(c.lucro)}</div>
            </div>
            <label style={s.lbl}>Preço praticado no app (R$)</label>
            <input style={s.inp} type="number" step="0.01" placeholder="0,00" value={rForm.precoApp||""} onChange={e => setRForm({...rForm,precoApp:parseFloat(e.target.value)||0})}/>
          </div>

          <button style={s.bsave} onClick={saveRecipe}>{saving ? "Salvando..." : "✅ Salvar Receita"}</button>
          <div style={{height:40}}/>
        </div>

        {/* MODAL PRODUTO RÁPIDO */}
        {quickP && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={() => setQuickP(null)}>
            <div style={{background:W,borderRadius:"18px 18px 0 0",padding:18,width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e => e.stopPropagation()}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:12,color:V}}>📦 Novo Produto Rápido</div>
              <label style={s.lbl}>Nome *</label>
              <input style={s.inp} placeholder="Ex: Chocolate 70%" value={quickP.nome} onChange={e => setQuickP({...quickP,nome:e.target.value})}/>
              <label style={s.lbl}>Categoria</label>
              <select style={s.inp} value={quickP.categoria} onChange={e => setQuickP({...quickP,categoria:e.target.value})}>
                {CAT_P.map(c => <option key={c}>{c}</option>)}
              </select>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1}}>
                  <label style={s.lbl}>Preço (R$) *</label>
                  <input style={s.inp} type="number" step="0.01" placeholder="10.00" value={quickP.preco} onChange={e => setQuickP({...quickP,preco:e.target.value})}/>
                </div>
                <div style={{flex:1}}>
                  <label style={s.lbl}>Unidade</label>
                  <select style={s.inp} value={quickP.unidade} onChange={e => setQuickP({...quickP,unidade:e.target.value})}>
                    {UNIDS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <label style={s.lbl}>Qtd na embalagem ({quickP.unidade}) *</label>
              <input style={s.inp} type="number" step="any" placeholder="200" value={quickP.embalagemQtd} onChange={e => setQuickP({...quickP,embalagemQtd:e.target.value})}/>
              {quickP.preco && quickP.embalagemQtd && <div style={s.tag}>💡 Custo por {quickP.unidade}: R$ {fmtN(parseFloat(quickP.preco)/parseFloat(quickP.embalagemQtd))}/{quickP.unidade}</div>}
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button style={{...s.bsave,flex:1,marginTop:0}} onClick={async () => {
                  if (!quickP.nome.trim()||!quickP.preco||!quickP.embalagemQtd) { toast_("⚠️ Preencha todos os campos"); return; }
                  const c = {...quickP, preco:parseFloat(quickP.preco)||0, embalagemQtd:parseFloat(quickP.embalagemQtd)||1};
                  const up = [...produtos, c]; setProdutos(up); await saveP(up);
                  setQuickP(null); toast_("✅ Produto cadastrado! Selecione nos ingredientes.");
                }}>Salvar Produto</button>
                <button style={{...s.bd,padding:"13px 16px"}} onClick={() => setQuickP(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <ModalConfirm item={confirmDel} onConfirm={confirmarExc} onCancel={() => setConfirmDel(null)}/>
        {toast && <div style={s.tst}>{toast}</div>}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // DETALHE RECEITA
  // ══════════════════════════════════════════════════════════════
  if (view === "detail") {
    const r = recipes.find(r => r.id === detailId);
    if (!r) { setView("list"); return null; }
    const { ci, outros, total, porUn, semT, taxa, final, lucro } = calc(r, produtos);
    return (
      <div style={s.app}><style>{CSS}</style>
        <div style={s.dh}>
          <button style={s.bback} onClick={() => { setView("list"); setTab("receitas"); }}>← Voltar</button>
          <div style={{fontSize:44,marginBottom:7,marginTop:10}}>{r.emoji}</div>
          <div style={s.dn}>{r.nome}</div>
          <div style={s.dc}>{r.categoria||"Sem categoria"} · {r.rendimento} unidade{r.rendimento!==1?"s":""}</div>
        </div>
        <div style={s.db}>
          <div style={s.sec}>
            <div style={s.st}>🧂 Ingredientes</div>
            {r.ingredientes.map((ing,i) => {
              const p = produtos.find(p => p.id === ing.produtoId);
              if (!p) return null;
              return (
                <div key={i} style={s.ir}>
                  <div>
                    <div style={{fontWeight:500,fontSize:13}}>{p.nome}</div>
                    <div style={{fontSize:11,color:G,marginTop:1}}>{ing.usadoQtd}{p.unidade} · {fmt(p.preco)}/{p.embalagemQtd}{p.unidade}</div>
                  </div>
                  <div style={s.icost}>{fmt((p.preco/p.embalagemQtd)*ing.usadoQtd)}</div>
                </div>
              );
            })}
            <div style={{...s.ir,borderTop:`2px solid ${RC}`,marginTop:5,paddingTop:7}}><div style={{fontWeight:700}}>Custo ingredientes</div><div style={s.icost}>{fmt(ci)}</div></div>
            <div style={s.ir}><div>Outros custos (30%)</div><div style={s.icost}>{fmt(outros)}</div></div>
            {r.despesas > 0 && <div style={s.ir}><div>Despesas extras</div><div style={s.icost}>{fmt(r.despesas)}</div></div>}
            <div style={{...s.ir,fontWeight:700}}><div>Custo total</div><div style={s.icost}>{fmt(total)}</div></div>
          </div>
          <div style={s.sec}>
            <div style={s.st}>💰 Precificação</div>
            <div style={s.pg}>
              <div style={s.pb}><div style={s.pl}>Custo/unidade</div><div style={s.pv}>{fmt(porUn)}</div></div>
              <div style={s.pb}><div style={s.pl}>Margem</div><div style={s.pv}>{r.margem}%</div></div>
              <div style={s.pb}><div style={s.pl}>Preço s/ taxa</div><div style={s.pv}>{fmt(semT)}</div></div>
              <div style={s.pb}><div style={s.pl}>Taxa delivery ({r.taxaDelivery}%)</div><div style={s.pv}>{fmt(taxa)}</div></div>
            </div>
            <div style={s.ph}><div style={s.phl}>🏷 Preço de venda/unidade</div><div style={s.phv}>{fmt(final)}</div></div>
            {r.precoApp > 0 && <div style={{...s.pb,background:"#F0FFF4",border:"1.5px solid #86EFAC",marginBottom:7}}><div style={{...s.pl,color:"#166534"}}>✅ Preço praticado no app</div><div style={{...s.pv,color:"#166534"}}>{fmt(r.precoApp)}</div></div>}
            <div style={{...s.pb,background:"#FFF7F9",border:"1.5px solid #FCD34D"}}><div style={{...s.pl,color:"#92400E"}}>💸 Lucro estimado (lote)</div><div style={{...s.pv,color:"#92400E"}}>{fmt(lucro)}</div></div>
          </div>
          {r.obs && <div style={s.sec}><div style={s.st}>📝 Obs</div><div style={{fontSize:13,color:G,lineHeight:1.6}}>{r.obs}</div></div>}
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button style={s.be} onClick={() => openEditR(r.id)}>✏️ Editar</button>
            <button style={s.bd} onClick={() => pedirExcR(r.id)}>🗑 Excluir</button>
          </div>
        </div>
        <ModalConfirm item={confirmDel} onConfirm={confirmarExc} onCancel={() => setConfirmDel(null)}/>
        {toast && <div style={s.tst}>{toast}</div>}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // LISTA PRINCIPAL
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={s.app}><style>{CSS}</style>
      <header style={s.hdr}>
        <div><div style={s.logo}>Delícias da Jay</div><div style={s.lsub}>Fichas Técnicas</div></div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <button style={s.bpri} onClick={tab==="receitas" ? openNewR : openNewP}>+ {tab==="receitas"?"Receita":"Produto"}</button>
          <button style={{background:"rgba(255,255,255,.1)",border:"none",color:RL,borderRadius:50,padding:"8px 12px",fontSize:13,cursor:"pointer"}} onClick={fazerLogout} title="Sair">🚪</button>
        </div>
      </header>

      <div style={s.tabs}>
        <button style={{...s.tab,...(tab==="receitas"?s.taba:{})}} onClick={() => setTab("receitas")}>🍰 Receitas</button>
        <button style={{...s.tab,...(tab==="produtos"?s.taba:{})}} onClick={() => setTab("produtos")}>📦 Produtos</button>
      </div>

      {tab === "receitas" && <>
        <div style={s.srchW}><span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input style={s.srch} placeholder="Buscar receita..." value={searchR} onChange={e => setSearchR(e.target.value)}/></div>
        <div style={s.chips}>{["Todos",...CAT_R].map(c => <button key={c} style={{...s.chip,...(catR===c?s.chipa:{})}} onClick={() => setCatR(c)}>{c}</button>)}</div>
        <div style={s.cnt}>{filtR.length} receita{filtR.length!==1?"s":""}</div>
        {filtR.length === 0 ? (
          <div style={s.emp}><div style={{fontSize:46,marginBottom:10}}>🍰</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:17,marginBottom:5}}>{recipes.length===0?"Nenhuma receita":"Nada encontrado"}</div><div style={{fontSize:12,color:G,opacity:.7}}>{recipes.length===0?'Toque em "+ Receita" para começar!':"Tente outro termo."}</div></div>
        ) : (
          <div style={s.list}>{filtR.map(r => {
            const { final } = calc(r, produtos);
            return (
              <div key={r.id} style={s.card} className="ch" onClick={() => openDet(r.id)}>
                <div style={s.cem}>{r.emoji}</div>
                <div style={s.cbd}><div style={s.cnm}>{r.nome}</div><div style={s.cmt}>{r.categoria||"Sem categoria"} · rend. {r.rendimento} un.</div></div>
                <div style={s.cpr}><div style={s.cpv}>{fmt(final)}</div><div style={s.cpl}>p/ unidade</div></div>
              </div>
            );
          })}</div>
        )}
      </>}

      {tab === "produtos" && <>
        <div style={s.srchW}><span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input style={s.srch} placeholder="Buscar produto..." value={searchP} onChange={e => setSearchP(e.target.value)}/></div>
        <div style={s.chips}>{["Todos",...CAT_P].map(c => <button key={c} style={{...s.chip,...(catP===c?s.chipa:{})}} onClick={() => setCatP(c)}>{c}</button>)}</div>
        <div style={s.cnt}>{filtP.length} produto{filtP.length!==1?"s":""} · toque para atualizar o preço</div>
        <div style={s.list}>{filtP.map(p => {
          const used = recipes.filter(r => r.ingredientes.some(i => i.produtoId === p.id)).length;
          const pu   = p.embalagemQtd ? p.preco / p.embalagemQtd : 0;
          return (
            <div key={p.id} style={s.card} className="ch" onClick={() => openEditP(p.id)}>
              <div style={{...s.cem,fontSize:20}}>{CATEMOJI[p.categoria]||"📦"}</div>
              <div style={s.cbd}>
                <div style={s.cnm}>{p.nome}</div>
                <div style={s.cmt}>{p.categoria} · R$ {fmtN(pu)}/{p.unidade}</div>
                {used > 0 && <div style={{fontSize:10,color:R,fontWeight:600,marginTop:2}}>usado em {used} receita{used>1?"s":""}</div>}
              </div>
              <div style={s.cpr}><div style={s.cpv}>{fmt(p.preco)}</div><div style={s.cpl}>{p.embalagemQtd}{p.unidade}</div></div>
            </div>
          );
        })}</div>
      </>}

      <ModalConfirm item={confirmDel} onConfirm={confirmarExc} onCancel={() => setConfirmDel(null)}/>
      {toast && <div style={s.tst}>{toast}</div>}
      {saving && <div style={s.sync}>💾 Salvando...</div>}
    </div>
  );
}
