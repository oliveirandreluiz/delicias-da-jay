import { useState, useEffect } from "react";

// ─── CATÁLOGO DE PRODUTOS (aba Insumos - planilha atualizada) ─────────────
const SEED_PRODUTOS = [
  // Secos / farinhas
  { id:"p-01", nome:"Farinha de trigo",        preco:6.99,  embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  { id:"p-02", nome:"Farinha de trigo Globo",  preco:2.49,  embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  { id:"p-03", nome:"Açúcar",                  preco:2.99,  embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  { id:"p-04", nome:"Açúcar mascavo",          preco:10.00, embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  { id:"p-05", nome:"Fermento",                preco:4.99,  embalagemQtd:100,  unidade:"g",  categoria:"Secos" },
  { id:"p-06", nome:"Essência de baunilha",    preco:7.00,  embalagemQtd:30,   unidade:"ml", categoria:"Secos" },
  { id:"p-07", nome:"Flocão de milho",         preco:3.99,  embalagemQtd:500,  unidade:"g",  categoria:"Secos" },
  { id:"p-08", nome:"Coco ralado 50g",         preco:2.99,  embalagemQtd:50,   unidade:"g",  categoria:"Secos" },
  { id:"p-09", nome:"Coco ralado 1kg",         preco:29.69, embalagemQtd:1000, unidade:"g",  categoria:"Secos" },
  // Laticínios
  { id:"p-10", nome:"Leite condensado",        preco:6.39,  embalagemQtd:395,  unidade:"g",  categoria:"Laticínios" },
  { id:"p-11", nome:"Creme de leite",          preco:2.65,  embalagemQtd:200,  unidade:"g",  categoria:"Laticínios" },
  { id:"p-12", nome:"Leite integral",          preco:5.00,  embalagemQtd:1000, unidade:"ml", categoria:"Laticínios" },
  { id:"p-13", nome:"Leite Ninho",             preco:18.00, embalagemQtd:380,  unidade:"g",  categoria:"Laticínios" },
  { id:"p-14", nome:"Leite em pó 1kg",         preco:35.89, embalagemQtd:1000, unidade:"g",  categoria:"Laticínios" },
  { id:"p-15", nome:"Margarina",               preco:13.00, embalagemQtd:1000, unidade:"g",  categoria:"Laticínios" },
  { id:"p-16", nome:"Margarina 15kg",          preco:190.00,embalagemQtd:15000,unidade:"g",  categoria:"Laticínios" },
  { id:"p-17", nome:"Margarina Qualy 1kg",     preco:16.00, embalagemQtd:1000, unidade:"g",  categoria:"Laticínios" },
  // Chocolates
  { id:"p-18", nome:"Nescau",                  preco:21.00, embalagemQtd:990,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-19", nome:"Nescau 2kg",              preco:45.00, embalagemQtd:2000, unidade:"g",  categoria:"Chocolates" },
  { id:"p-20", nome:"Cacau em pó",             preco:23.00, embalagemQtd:200,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-21", nome:"Cacau em pó 50%",         preco:15.00, embalagemQtd:200,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-22", nome:"Cacau 50% 1kg",           preco:60.00, embalagemQtd:1000, unidade:"g",  categoria:"Chocolates" },
  { id:"p-23", nome:"Cacau 100%",              preco:70.00, embalagemQtd:500,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-24", nome:"Chocolate 50% 1kg",       preco:65.00, embalagemQtd:1000, unidade:"g",  categoria:"Chocolates" },
  { id:"p-25", nome:"Barra de chocolate",      preco:39.00, embalagemQtd:1000, unidade:"g",  categoria:"Chocolates" },
  { id:"p-26", nome:"Barra de choc. meio amargo",preco:37.00,embalagemQtd:1000,unidade:"g",  categoria:"Chocolates" },
  { id:"p-26b",nome:"Chocolate barra",         preco:35.00, embalagemQtd:1000, unidade:"g",  categoria:"Chocolates" },
  { id:"p-27", nome:"Nutella",                 preco:16.00, embalagemQtd:140,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-28", nome:"Nutella 3kg",             preco:198.00,embalagemQtd:3000, unidade:"g",  categoria:"Chocolates" },
  { id:"p-29", nome:"Granulado pequeno",       preco:3.50,  embalagemQtd:50,   unidade:"g",  categoria:"Chocolates" },
  { id:"p-30", nome:"Granulado grande",        preco:23.00, embalagemQtd:500,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-31", nome:"Granulado Melken 400g",   preco:49.90, embalagemQtd:400,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-32", nome:"Gotas de chocolate",      preco:10.00, embalagemQtd:150,  unidade:"g",  categoria:"Chocolates" },
  { id:"p-33", nome:"Brigadeiro (pronto)",     preco:2.00,  embalagemQtd:1,    unidade:"un", categoria:"Chocolates" },
  // Outros / frescos
  { id:"p-34", nome:"Ovos",                    preco:1.00,  embalagemQtd:1,    unidade:"un", categoria:"Outros" },
  { id:"p-35", nome:"Óleo de soja",            preco:6.99,  embalagemQtd:900,  unidade:"ml", categoria:"Outros" },
  { id:"p-36", nome:"Uva",                     preco:6.99,  embalagemQtd:500,  unidade:"g",  categoria:"Outros" },
  { id:"p-37", nome:"Morango",                 preco:6.99,  embalagemQtd:1,    unidade:"un", categoria:"Outros" },
  { id:"p-38", nome:"Milho",                   preco:3.00,  embalagemQtd:200,  unidade:"g",  categoria:"Outros" },
  { id:"p-39", nome:"Milho verde",             preco:3.50,  embalagemQtd:1,    unidade:"un", categoria:"Outros" },
  { id:"p-40", nome:"Frango",                  preco:17.00, embalagemQtd:1000, unidade:"g",  categoria:"Outros" },
  { id:"p-41", nome:"Verduras",                preco:5.00,  embalagemQtd:1,    unidade:"un", categoria:"Outros" },
  { id:"p-42", nome:"Molho de tomate",         preco:2.00,  embalagemQtd:1,    unidade:"un", categoria:"Outros" },
  { id:"p-43", nome:"Catupiry 400g",           preco:17.00, embalagemQtd:400,  unidade:"g",  categoria:"Outros" },
  { id:"p-44", nome:"Catupiry (12 reais)",     preco:12.00, embalagemQtd:400,  unidade:"g",  categoria:"Outros" },
  { id:"p-45", nome:"Requeijão cremoso",       preco:6.00,  embalagemQtd:1,    unidade:"un", categoria:"Outros" },
  // Embalagens
  { id:"p-50", nome:"Embalagem brownie",       preco:0.52,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-51", nome:"Embalagem cookies",       preco:0.05,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-52", nome:"Embalagem bolo",          preco:1.10,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-53", nome:"Embalagem bolo de pote",  preco:0.80,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-54", nome:"Embalagem delícia de uva",preco:0.75,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-55", nome:"Embalagem tortilete",     preco:0.05,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-56", nome:"Embalagem delivery",      preco:0.57,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-57", nome:"Embalagem empadão",       preco:1.00,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-58", nome:"Cone",                    preco:0.60,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
  { id:"p-59", nome:"Embalagem cone",          preco:0.31,  embalagemQtd:1,    unidade:"un", categoria:"Embalagens" },
];

// ─── RECEITAS SEED (vazio — cadastre suas receitas pelo app) ─────────────
const SEED_RECIPES = [];
    rendimento:10, margem:100, taxaDelivery:30, despesas:0, precoApp:15, obs:"",
    ingredientes:[
      {produtoId:"p-16",usadoQtd:160},{produtoId:"p-03",usadoQtd:230},
      {produtoId:"p-19",usadoQtd:300},{produtoId:"p-20",usadoQtd:10},
      {produtoId:"p-34",usadoQtd:3}, {produtoId:"p-02",usadoQtd:250},
      {produtoId:"p-10",usadoQtd:395},{produtoId:"p-11",usadoQtd:400},
      {produtoId:"p-13",usadoQtd:40},{produtoId:"p-27",usadoQtd:30},
      {produtoId:"p-50",usadoQtd:10},{produtoId:"p-56",usadoQtd:10},
    ],
  },
// ─── SUPABASE CONFIG (via variáveis de ambiente do Vercel) ────────────────
const SUPA_URL     = import.meta.env.VITE_SUPA_URL;
const SUPA_ANON    = import.meta.env.VITE_SUPA_ANON;
const SUPA_HEADERS = {
  "apikey": SUPA_ANON,
  "Authorization": `Bearer ${SUPA_ANON}`,
  "Content-Type": "application/json",
};

// ─── SENHA DE ACESSO ──────────────────────────────────────────────────────
const APP_SENHA = import.meta.env.VITE_APP_SENHA;

const CAT_RECEITA  = ["Brownies","Docinhos","Copo da Felicidade","Bolo no Pote","Cones Trufados","Salgados","Outro"];
const CAT_PRODUTO  = ["Secos","Laticínios","Chocolates","Embalagens","Outros"];
const UNIDADES     = ["g","kg","ml","L","un","colher","xícara"];
const EMOJIS       = ["🍫","🧁","🎂","🍰","🍬","🍮","🥧","🍩","🍪","🥐","🫙","🌋","🍇","🌽","🧇","🥮","🍭","☕","🌮","🥚","🧀"];
const CAT_EMOJI    = {"Secos":"🌾","Laticínios":"🥛","Chocolates":"🍫","Embalagens":"📦","Outros":"🛒"};

const fmt  = v => "R$ "+(parseFloat(v)||0).toFixed(2).replace(".",",");
const fmtN = v => (parseFloat(v)||0).toFixed(2).replace(".",",");

const VINHO_C = "#4A1A2C";

function calcRecipe(r, produtos) {
  const custoIng = r.ingredientes.reduce((s,ing)=>{
    const p = produtos.find(p=>p.id===ing.produtoId);
    if(!p||!p.embalagemQtd) return s;
    return s+(p.preco/p.embalagemQtd)*ing.usadoQtd;
  },0);
  const outros  = custoIng*0.30;
  const total   = custoIng+outros+(r.despesas||0);
  const porUn   = r.rendimento>0 ? total/r.rendimento : 0;
  const semTaxa = porUn*(1+(r.margem||100)/100);
  // Taxa por dentro: preço = semTaxa / (1 - taxa%), ex: 2,17 / 0,70 = 3,10
  const taxaPorc = (r.taxaDelivery||30)/100;
  const final   = taxaPorc < 1 ? semTaxa/(1-taxaPorc) : semTaxa;
  const taxa    = final - semTaxa;
  const lucro   = (final-porUn)*r.rendimento;
  return {custoIng,outros,total,porUn,semTaxa,taxa,final,lucro};
}

export default function App() {
  const [authed,   setAuthed]   = useState(!!sessionStorage.getItem("jay_auth"));
  const [senha,    setSenha]    = useState("");
  const [erroLogin,setErroLogin]= useState(false);
  const [recipes,  setRecipes]  = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState("receitas");
  const [view,     setView]     = useState("list");
  const [editId,   setEditId]   = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [searchR,  setSearchR]  = useState("");
  const [catR,     setCatR]     = useState("Todos");
  const [searchP,  setSearchP]  = useState("");
  const [catP,     setCatP]     = useState("Todos");
  const [toast,    setToast]    = useState("");
  const [rForm,    setRForm]    = useState(null);
  const [pForm,    setPForm]    = useState(null);
  const [editPId,  setEditPId]  = useState(null);
  const [confirmDel, setConfirmDel] = useState(null); // {tipo:'receita'|'produto', id, nome}

  const fazerLogin = () => {
    if(senha === APP_SENHA) {
      sessionStorage.setItem("jay_auth","1");
      setAuthed(true);
    } else {
      setErroLogin(true);
      setTimeout(()=>setErroLogin(false), 2000);
    }
  };

  const fazerLogout = () => {
    sessionStorage.removeItem("jay_auth");
    setAuthed(false);
    setSenha("");
  };

  useEffect(()=>{
    if(!authed) return;
    (async()=>{
      setLoading(true);
      try {
        const [rRes, pRes] = await Promise.all([
          fetch(`${SUPA_URL}/rest/v1/receitas?select=dados`, {headers: SUPA_HEADERS}),
          fetch(`${SUPA_URL}/rest/v1/produtos?select=dados`,  {headers: SUPA_HEADERS}),
        ]);
        const rJson = await rRes.json();
        const pJson = await pRes.json();
        const r = rJson.length > 0 ? rJson[0].dados : null;
        const p = pJson.length > 0 ? pJson[0].dados : null;
        setRecipes(r  || SEED_RECIPES);
        setProdutos(p || SEED_PRODUTOS);
        if(!r) await _upsert("receitas", SEED_RECIPES);
        if(!p) await _upsert("produtos", SEED_PRODUTOS);
      } catch(e) {
        console.error(e);
        setRecipes(SEED_RECIPES);
        setProdutos(SEED_PRODUTOS);
      }
      setLoading(false);
    })();
  },[authed]);

  if(!authed) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#4A1A2C"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",padding:"0 32px",width:"100%",maxWidth:380}}>
        <div style={{fontSize:64,marginBottom:16}}>🍫</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:"#E8899A",fontSize:28,marginBottom:6}}>Delícias da Jay</div>
        <div style={{color:"#C45C7488",fontSize:13,marginBottom:36,letterSpacing:".08em",textTransform:"uppercase"}}>Fichas Técnicas</div>
        <input
          style={{width:"100%",padding:"14px 18px",borderRadius:50,border:`2px solid ${erroLogin?"#ff6b6b":"#C45C7444"}`,background:"rgba(255,255,255,.18)",fontFamily:"'DM Sans',sans-serif",fontSize:16,color:"#fff",WebkitTextFillColor:"#fff",outline:"none",textAlign:"center",letterSpacing:".15em",boxSizing:"border-box",marginBottom:12,animation:erroLogin?"shake .3s":""}}
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={e=>{setSenha(e.target.value);setErroLogin(false);}}
          onKeyDown={e=>e.key==="Enter"&&fazerLogin()}
        />
        {erroLogin && <div style={{color:"#ff6b6b",fontSize:13,marginBottom:12}}>Senha incorreta ❌</div>}
        <button
          style={{width:"100%",padding:"14px",borderRadius:50,border:"none",background:"linear-gradient(135deg,#C45C74,#E8899A)",color:"#fff",fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:600,cursor:"pointer",boxShadow:"0 6px 20px rgba(196,92,116,.4)"}}
          onClick={fazerLogin}>
          Entrar
        </button>
      </div>
    </div>
  );


  const _upsert = async (tabela, dados) => {
    await fetch(`${SUPA_URL}/rest/v1/${tabela}`, {
      method: "POST",
      headers: {...SUPA_HEADERS, "Prefer": "resolution=merge-duplicates"},
      body: JSON.stringify({id: 1, dados}),
    });
  };

  const saveR = async d=>{setSaving(true);await _upsert("receitas",d);setSaving(false);};
  const saveP = async d=>{setSaving(true);await _upsert("produtos",d);setSaving(false);};
  const toast_ = msg=>{setToast(msg);setTimeout(()=>setToast(""),2800);};

  // ── PRODUTO FORM ──
  const blankP   = ()=>({id:Date.now().toString(),nome:"",preco:"",embalagemQtd:"",unidade:"g",categoria:"Secos"});
  const openNewP = ()=>{setPForm(blankP());setEditPId(null);setView("pForm");};
  const openEditP= id=>{setPForm({...produtos.find(p=>p.id===id)});setEditPId(id);setView("pForm");};

  const saveProd = async()=>{
    if(!pForm.nome.trim()){toast_("⚠️ Informe o nome");return;}
    if(!pForm.preco){toast_("⚠️ Informe o preço");return;}
    if(!pForm.embalagemQtd){toast_("⚠️ Informe o tamanho da embalagem");return;}
    const c={...pForm,preco:parseFloat(pForm.preco)||0,embalagemQtd:parseFloat(pForm.embalagemQtd)||1};
    const up=editPId?produtos.map(p=>p.id===editPId?c:p):[...produtos,c];
    setProdutos(up);await saveP(up);
    toast_("✅ Produto salvo! Receitas recalculadas.");
    setView("list");setTab("produtos");
  };

  const deleteProd = async id=>{
    if(recipes.some(r=>r.ingredientes.some(i=>i.produtoId===id))){toast_("⚠️ Produto usado em receitas — remova das receitas antes");return;}
    const up=produtos.filter(p=>p.id!==id);setProdutos(up);await saveP(up);toast_("🗑 Produto excluído");
  };

  const pedirExclusaoReceita = id=>{
    const r=recipes.find(r=>r.id===id);
    setConfirmDel({tipo:"receita",id,nome:r?.nome||"esta receita"});
  };
  const pedirExclusaoProd = id=>{
    if(recipes.some(r=>r.ingredientes.some(i=>i.produtoId===id))){toast_("⚠️ Produto usado em receitas — remova das receitas antes");return;}
    const p=produtos.find(p=>p.id===id);
    setConfirmDel({tipo:"produto",id,nome:p?.nome||"este produto"});
  };
  const confirmarExclusao = async()=>{
    if(!confirmDel) return;
    if(confirmDel.tipo==="receita"){
      const up=recipes.filter(r=>r.id!==confirmDel.id);setRecipes(up);await saveR(up);
      toast_("🗑 Receita excluída");setView("list");setTab("receitas");
    } else {
      const up=produtos.filter(p=>p.id!==confirmDel.id);setProdutos(up);await saveP(up);
      toast_("🗑 Produto excluído");
    }
    setConfirmDel(null);
  };

  // ── RECEITA FORM ──
  const blankR  = ()=>({id:Date.now().toString(),emoji:"🍫",nome:"",categoria:"",rendimento:10,margem:100,taxaDelivery:30,despesas:0,precoApp:0,obs:"",ingredientes:[{produtoId:"",usadoQtd:0},{produtoId:"",usadoQtd:0}]});
  const openNewR   = ()=>{setRForm(blankR());setEditId(null);setView("rForm");};
  const openEditR  = id=>{setRForm(JSON.parse(JSON.stringify(recipes.find(r=>r.id===id))));setEditId(id);setView("rForm");};
  const openDetail = id=>{setDetailId(id);setView("detail");};

  const saveRecipe = async()=>{
    if(!rForm.nome.trim()){toast_("⚠️ Informe o nome da receita");return;}
    const c={...rForm,ingredientes:rForm.ingredientes.filter(i=>i.produtoId)};
    const up=editId?recipes.map(r=>r.id===editId?c:r):[...recipes,c];
    setRecipes(up);await saveR(up);
    toast_("✅ Receita salva!");setDetailId(c.id);setView("detail");
  };

  const deleteRecipe = async id=>{ pedirExclusaoReceita(id); };

  const updIng=(idx,field,val)=>{const a=[...rForm.ingredientes];a[idx]={...a[idx],[field]:val};setRForm({...rForm,ingredientes:a});};

  const filtR=recipes.filter(r=>(r.nome.toLowerCase().includes(searchR.toLowerCase())||(r.categoria||"").toLowerCase().includes(searchR.toLowerCase()))&&(catR==="Todos"||r.categoria===catR));
  const filtP=produtos
    // deduplicar por nome (mantém o primeiro de cada nome)
    .filter((p,i,self)=>self.findIndex(x=>x.nome.toLowerCase()===p.nome.toLowerCase())===i)
    .filter(p=>p.nome.toLowerCase().includes(searchP.toLowerCase())&&(catP==="Todos"||p.categoria===catP))
    .sort((a,b)=>a.nome.localeCompare(b.nome));

  // ── SPLASH ──
  if(loading) return(
    <div style={S.splash}><div style={{textAlign:"center"}}>
      <div style={{fontSize:60,marginBottom:12}}>🍫</div>
      <div style={{fontFamily:"'Playfair Display',serif",color:"#E8899A",fontSize:26,marginBottom:6}}>Delícias da Jay</div>
      <div style={{color:"#C45C7488",fontSize:13}}>Carregando...</div>
      <div style={S.spin}></div>
    </div></div>
  );

  // ── PRODUTO FORM ──
  if(view==="pForm"&&pForm){
    const pu=pForm.preco&&pForm.embalagemQtd?parseFloat(pForm.preco)/parseFloat(pForm.embalagemQtd):null;
    const usadoEm=editPId?recipes.filter(r=>r.ingredientes.some(i=>i.produtoId===editPId)):[];
    return(
      <div style={S.app}><style>{CSS}</style>
        <header style={S.hdr}>
          <button style={S.bk2} onClick={()=>setView("list")}>← Voltar</button>
          <div style={S.hTitle}>{editPId?"Editar Produto":"Novo Produto"}</div>
          <div style={{width:80}}/>
        </header>
        <div style={S.fb}>
          <div style={S.sec}>
            <div style={S.st}>📦 Dados do Produto</div>
            <label style={S.lbl}>Nome *</label>
            <input style={S.inp} placeholder="Ex: Leite condensado" value={pForm.nome} onChange={e=>setPForm({...pForm,nome:e.target.value})}/>
            <label style={S.lbl}>Categoria</label>
            <select style={S.inp} value={pForm.categoria} onChange={e=>setPForm({...pForm,categoria:e.target.value})}>
              {CAT_PRODUTO.map(c=><option key={c}>{c}</option>)}
            </select>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}>
                <label style={S.lbl}>Preço pago (R$) *</label>
                <input style={S.inp} type="number" step="0.01" placeholder="6.39" value={pForm.preco} onChange={e=>setPForm({...pForm,preco:e.target.value})}/>
              </div>
              <div style={{flex:1}}>
                <label style={S.lbl}>Unidade</label>
                <select style={S.inp} value={pForm.unidade} onChange={e=>setPForm({...pForm,unidade:e.target.value})}>
                  {UNIDADES.map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <label style={S.lbl}>Quantidade na embalagem ({pForm.unidade}) *</label>
            <input style={S.inp} type="number" step="any" placeholder="395" value={pForm.embalagemQtd} onChange={e=>setPForm({...pForm,embalagemQtd:e.target.value})}/>
            {pu!==null&&<div style={S.ctag}>💡 Custo por {pForm.unidade}: R$ {fmtN(pu)}/{pForm.unidade}</div>}
          </div>
          {usadoEm.length>0&&(
            <div style={S.sec}>
              <div style={S.st}>📋 Usado em {usadoEm.length} receita{usadoEm.length>1?"s":""}</div>
              {usadoEm.map(r=><div key={r.id} style={{fontSize:13,padding:"5px 0",borderBottom:"1px solid #FDE8ED",display:"flex",gap:8}}><span>{r.emoji}</span><span>{r.nome}</span></div>)}
              <div style={{fontSize:12,color:"#C45C74",marginTop:8,fontWeight:600}}>✅ Ao salvar, essas receitas têm o custo atualizado automaticamente.</div>
            </div>
          )}
          <button style={S.bsave} onClick={saveProd}>{saving?"Salvando...":"✅ Salvar Produto"}</button>
          {editPId&&(
            <button style={{...S.bd,width:"100%",marginTop:10,padding:14,textAlign:"center"}}
              onClick={()=>pedirExclusaoProd(editPId)}>
              🗑 Excluir produto
            </button>
          )}
          <div style={{height:40}}/>
        </div>
        {confirmDel&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
            <div style={{background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:380,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>🗑</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:VINHO_C,marginBottom:8,fontWeight:700}}>Confirmar exclusão</div>
              <div style={{fontSize:14,color:"#7A4A58",marginBottom:24,lineHeight:1.6}}>Tem certeza que deseja excluir<br/><b>"{confirmDel.nome}"</b>?<br/><span style={{fontSize:12,color:"#C45C74"}}>Esta ação não pode ser desfeita.</span></div>
              <div style={{display:"flex",gap:10}}>
                <button style={{flex:1,padding:14,borderRadius:50,border:"2px solid #F5D0D8",background:"#fff",color:"#7A4A58",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={()=>setConfirmDel(null)}>Cancelar</button>
                <button style={{flex:1,padding:14,borderRadius:50,border:"none",background:"linear-gradient(135deg,#C45C74,#E8899A)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={confirmarExclusao}>Sim, excluir</button>
              </div>
            </div>
          </div>
        )}
        {toast&&<div style={S.tst}>{toast}</div>}
      </div>
    );
  }

  // ── RECEITA FORM ──
  if(view==="rForm"&&rForm){
    const c=calcRecipe(rForm,produtos);
    return(
      <div style={S.app}><style>{CSS}</style>
        <header style={S.hdr}>
          <button style={S.bk2} onClick={()=>setView(editId?"detail":"list")}>← Cancelar</button>
          <div style={S.hTitle}>{editId?"Editar":"Nova Receita"}</div>
          <div style={{width:80}}/>
        </header>
        <div style={S.fb}>
          <div style={S.sec}>
            <div style={S.st}>🍰 Informações</div>
            <div style={S.er}>{EMOJIS.map(e=><button key={e} style={{...S.eb,...(rForm.emoji===e?S.ebs:{})}} onClick={()=>setRForm({...rForm,emoji:e})}>{e}</button>)}</div>
            <label style={S.lbl}>Nome *</label>
            <input style={S.inp} placeholder="Ex: Brownie Ninho" value={rForm.nome} onChange={e=>setRForm({...rForm,nome:e.target.value})}/>
            <label style={S.lbl}>Categoria</label>
            <select style={S.inp} value={rForm.categoria} onChange={e=>setRForm({...rForm,categoria:e.target.value})}>
              <option value="">Selecionar...</option>
              {CAT_RECEITA.map(c=><option key={c}>{c}</option>)}
            </select>
            <label style={S.lbl}>Rendimento (nº de unidades)</label>
            <input style={S.inp} type="number" placeholder="10" value={rForm.rendimento} onChange={e=>setRForm({...rForm,rendimento:parseFloat(e.target.value)||0})}/>
            <label style={S.lbl}>Observações</label>
            <textarea style={{...S.inp,height:70,resize:"none"}} value={rForm.obs||""} onChange={e=>setRForm({...rForm,obs:e.target.value})}/>
          </div>

          <div style={S.sec}>
            <div style={S.st}>🧂 Ingredientes</div>
            <div style={S.help}>Digite o nome para buscar. Não encontrou? Cadastre abaixo!</div>
            {rForm.ingredientes.map((ing,idx)=>{
              const p=produtos.find(p=>p.id===ing.produtoId);
              const cu=p&&p.embalagemQtd?(p.preco/p.embalagemQtd)*ing.usadoQtd:0;
              // Bug fix: se produto já selecionado, campo de busca fica vazio (evita texto duplo)
              const busca=p?"":( ing._busca!==undefined ? ing._busca : "");
              const resultados=busca.trim().length>0&&!p
                ? produtos
                    // Bug fix: deduplicar por nome E por id
                    .filter((pr,i,self)=>
                      pr.nome.toLowerCase().includes(busca.toLowerCase()) &&
                      self.findIndex(x=>x.nome.toLowerCase()===pr.nome.toLowerCase())===i
                    )
                    .sort((a,b)=>a.nome.localeCompare(b.nome))
                : [];
              return(
                <div key={idx} style={S.ic}>
                  <div style={S.ich}>
                    <span style={{fontSize:13,fontWeight:600,color:"#7A4A58"}}>Ingrediente {idx+1}</span>
                    <button style={S.brm} onClick={()=>setRForm({...rForm,ingredientes:rForm.ingredientes.filter((_,i)=>i!==idx)})}>✕ remover</button>
                  </div>
                  <label style={S.lbl}>Buscar produto</label>
                  <div style={{position:"relative",marginBottom:p?0:12}}>
                    {p ? (
                      <div style={{display:"flex",alignItems:"center",gap:8,background:"#F0FFF4",border:"2px solid #86EFAC",borderRadius:10,padding:"10px 14px"}}>
                        <span>✅</span>
                        <span style={{flex:1,fontSize:14,fontWeight:600,color:"#166534",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</span>
                        <span style={{fontSize:11,color:"#7A4A58",flexShrink:0,marginRight:4}}>{p.categoria}</span>
                        <button style={{background:"none",border:"none",color:"#C45C74",fontSize:16,cursor:"pointer",padding:0,flexShrink:0}}
                          onClick={()=>{const a=[...rForm.ingredientes];a[idx]={...a[idx],produtoId:"",_busca:""};setRForm({...rForm,ingredientes:a});}}>✕</button>
                      </div>
                    ) : (
                      <>
                        <input
                          style={{...S.inp,marginBottom:0,paddingLeft:36,background:"#FFF0F3",borderColor:"#F5D0D8"}}
                          placeholder="Digite para buscar... ex: margarina"
                          value={busca}
                          onChange={e=>{const a=[...rForm.ingredientes];a[idx]={...a[idx],_busca:e.target.value,produtoId:""};setRForm({...rForm,ingredientes:a});}}
                        />
                        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,pointerEvents:"none"}}>🔍</span>
                        {resultados.length>0&&(
                          <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"2px solid #F5D0D8",borderRadius:12,zIndex:50,boxShadow:"0 8px 24px rgba(74,26,44,.15)",maxHeight:200,overflowY:"auto"}}>
                            {resultados.map(pr=>(
                              <div key={pr.id}
                                style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #FDE8ED",fontSize:13}}
                                className="prod-opt"
                                onClick={()=>{const a=[...rForm.ingredientes];a[idx]={...a[idx],produtoId:pr.id,_busca:pr.nome};setRForm({...rForm,ingredientes:a});}}>
                                <div style={{fontWeight:600,color:"#4A1A2C"}}>{pr.nome}</div>
                                <div style={{fontSize:11,color:"#7A4A58",marginTop:2}}>{pr.categoria} · R$ {fmtN(pr.preco)}/{pr.embalagemQtd}{pr.unidade}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {busca.trim().length>0&&resultados.length===0&&(
                          <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"2px solid #F5D0D8",borderRadius:12,zIndex:50,padding:"12px 14px",fontSize:13,color:"#7A4A58"}}>
                            Nenhum produto encontrado — cadastre abaixo! 👇
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {p&&<>
                    <div style={{marginTop:8}}></div>
                    <label style={S.lbl}>Quantidade usada ({p.unidade})</label>
                    <input style={S.inp} type="number" step="any" placeholder="300" value={ing.usadoQtd||""} onChange={e=>updIng(idx,"usadoQtd",parseFloat(e.target.value)||0)}/>
                    {cu>0&&<div style={S.ctag}>💡 Custo: {fmt(cu)}</div>}
                  </>}
                </div>
              );
            })}
            <button style={S.badd} onClick={()=>setRForm({...rForm,ingredientes:[...rForm.ingredientes,{produtoId:"",usadoQtd:0}]})}>+ Adicionar ingrediente</button>
            <button style={{...S.badd,marginTop:8,borderColor:"#86EFAC55",color:"#166534",background:"#F0FFF4"}}
              onClick={()=>setQuickP({id:Date.now().toString(),nome:"",preco:"",embalagemQtd:"",unidade:"g",categoria:"Secos"})}>
              📦 Cadastrar novo produto
            </button>
          </div>

          <div style={S.sec}>
            <div style={S.st}>💰 Precificação</div>
            <div style={S.cs}>
              <div style={S.cr}><span>Custo ingredientes</span><strong>{fmt(c.custoIng)}</strong></div>
              <div style={S.cr}><span>Outros custos (30%)</span><strong>{fmt(c.outros)}</strong></div>
              <div style={{...S.cr,fontWeight:700,borderTop:"1.5px solid #F5D0D8",paddingTop:6,marginTop:4}}><span>Custo total</span><strong>{fmt(c.total)}</strong></div>
              <div style={S.cr}><span>Custo por unidade</span><strong>{fmt(c.porUn)}</strong></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}>
                <label style={S.lbl}>Margem de lucro (%)</label>
                <input style={{...S.inp,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#C45C74",textAlign:"center"}}
                  type="number" min={0} step={1} placeholder="100"
                  value={rForm.margem||""}
                  onChange={e=>setRForm({...rForm,margem:parseFloat(e.target.value)||0})}/>
              </div>
              <div style={{flex:1}}>
                <label style={S.lbl}>Taxa delivery (%)</label>
                <input style={{...S.inp,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#C45C74",textAlign:"center"}}
                  type="number" min={0} step={1} placeholder="30"
                  value={rForm.taxaDelivery||""}
                  onChange={e=>setRForm({...rForm,taxaDelivery:parseFloat(e.target.value)||0})}/>
              </div>
            </div>
            {c.porUn>0&&<div style={{...S.ctag,marginBottom:12}}>💡 Custo/un {fmt(c.porUn)} → com {rForm.margem||0}% margem ÷ {100-(rForm.taxaDelivery||0)}% = {fmt(c.final)}</div>}
            <label style={S.lbl}>Despesas extras (R$)</label>
            <input style={S.inp} type="number" step="0.01" placeholder="0,00" value={rForm.despesas||""} onChange={e=>setRForm({...rForm,despesas:parseFloat(e.target.value)||0})}/>
            <div style={S.ph}>
              <div style={S.pbl}>🏷 Preço de venda sugerido/unidade</div>
              <div style={S.pb}>{fmt(c.final)}</div>
              <div style={{fontSize:12,opacity:.75,marginTop:2}}>Lucro estimado no lote: {fmt(c.lucro)}</div>
            </div>
            <label style={S.lbl}>Preço praticado no app (R$)</label>
            <input style={S.inp} type="number" step="0.01" placeholder="0,00" value={rForm.precoApp||""} onChange={e=>setRForm({...rForm,precoApp:parseFloat(e.target.value)||0})}/>
          </div>
          <button style={S.bsave} onClick={saveRecipe}>{saving?"Salvando...":"✅ Salvar Receita"}</button>
          <div style={{height:40}}/>
        </div>

        {/* ── MODAL PRODUTO RÁPIDO ── */}
        {quickP&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>setQuickP(null)}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,marginBottom:14,color:"#4A1A2C"}}>📦 Novo Produto Rápido</div>
              <label style={S.lbl}>Nome *</label>
              <input style={S.inp} placeholder="Ex: Chocolate 70%" value={quickP.nome} onChange={e=>setQuickP({...quickP,nome:e.target.value})}/>
              <label style={S.lbl}>Categoria</label>
              <select style={S.inp} value={quickP.categoria} onChange={e=>setQuickP({...quickP,categoria:e.target.value})}>
                {CAT_PRODUTO.map(c=><option key={c}>{c}</option>)}
              </select>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1}}>
                  <label style={S.lbl}>Preço (R$) *</label>
                  <input style={S.inp} type="number" step="0.01" placeholder="10.00" value={quickP.preco} onChange={e=>setQuickP({...quickP,preco:e.target.value})}/>
                </div>
                <div style={{flex:1}}>
                  <label style={S.lbl}>Unidade</label>
                  <select style={S.inp} value={quickP.unidade} onChange={e=>setQuickP({...quickP,unidade:e.target.value})}>
                    {UNIDADES.map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <label style={S.lbl}>Qtd na embalagem ({quickP.unidade}) *</label>
              <input style={S.inp} type="number" step="any" placeholder="200" value={quickP.embalagemQtd} onChange={e=>setQuickP({...quickP,embalagemQtd:e.target.value})}/>
              {quickP.preco&&quickP.embalagemQtd&&<div style={S.ctag}>💡 Custo por {quickP.unidade}: R$ {fmtN(parseFloat(quickP.preco)/parseFloat(quickP.embalagemQtd))}/{quickP.unidade}</div>}
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button style={{...S.bsave,flex:1,marginTop:0}} onClick={async()=>{
                  if(!quickP.nome.trim()||!quickP.preco||!quickP.embalagemQtd){toast_("⚠️ Preencha todos os campos");return;}
                  const c={...quickP,preco:parseFloat(quickP.preco)||0,embalagemQtd:parseFloat(quickP.embalagemQtd)||1};
                  const up=[...produtos,c];
                  setProdutos(up);await saveP(up);
                  setQuickP(null);
                  toast_("✅ Produto cadastrado! Selecione nos ingredientes.");
                }}>Salvar Produto</button>
                <button style={{...S.bd,padding:"14px 18px"}} onClick={()=>setQuickP(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {confirmDel&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
            <div style={{background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:380,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>🗑</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:VINHO_C,marginBottom:8,fontWeight:700}}>Confirmar exclusão</div>
              <div style={{fontSize:14,color:"#7A4A58",marginBottom:24,lineHeight:1.6}}>Tem certeza que deseja excluir<br/><b>"{confirmDel.nome}"</b>?<br/><span style={{fontSize:12,color:"#C45C74"}}>Esta ação não pode ser desfeita.</span></div>
              <div style={{display:"flex",gap:10}}>
                <button style={{flex:1,padding:14,borderRadius:50,border:"2px solid #F5D0D8",background:"#fff",color:"#7A4A58",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={()=>setConfirmDel(null)}>Cancelar</button>
                <button style={{flex:1,padding:14,borderRadius:50,border:"none",background:"linear-gradient(135deg,#C45C74,#E8899A)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={confirmarExclusao}>Sim, excluir</button>
              </div>
            </div>
          </div>
        )}
        {toast&&<div style={S.tst}>{toast}</div>}
      </div>
    );
  }

  // ── DETAIL ──
  if(view==="detail"){
    const r=recipes.find(r=>r.id===detailId);
    if(!r){setView("list");return null;}
    const {custoIng,outros,total,porUn,semTaxa,taxa,final,lucro}=calcRecipe(r,produtos);
    return(
      <div style={S.app}><style>{CSS}</style>
        <div style={S.dh}>
          <button style={S.bk} onClick={()=>{setView("list");setTab("receitas");}}>← Voltar</button>
          <div style={{fontSize:48,marginBottom:8}}>{r.emoji}</div>
          <div style={S.dn}>{r.nome}</div>
          <div style={S.dc}>{r.categoria||"Sem categoria"} · {r.rendimento} unidade{r.rendimento!==1?"s":""}</div>
        </div>
        <div style={S.db}>
          <div style={S.sec}>
            <div style={S.st}>🧂 Ingredientes</div>
            {r.ingredientes.map((ing,i)=>{
              const p=produtos.find(p=>p.id===ing.produtoId);
              if(!p) return null;
              const cu=(p.preco/p.embalagemQtd)*ing.usadoQtd;
              return <div key={i} style={S.ir}><div><div style={S.in_}>{p.nome}</div><div style={S.id_}>{ing.usadoQtd}{p.unidade} · {fmt(p.preco)}/{p.embalagemQtd}{p.unidade}</div></div><div style={S.ic_}>{fmt(cu)}</div></div>;
            })}
            <div style={{...S.ir,borderTop:"2px solid #F5D0D8",marginTop:6,paddingTop:8}}><div style={{fontWeight:700}}>Custo ingredientes</div><div style={S.ic_}>{fmt(custoIng)}</div></div>
            <div style={S.ir}><div>Outros custos (gás/energia 30%)</div><div style={S.ic_}>{fmt(outros)}</div></div>
            {r.despesas>0&&<div style={S.ir}><div>Despesas extras</div><div style={S.ic_}>{fmt(r.despesas)}</div></div>}
            <div style={{...S.ir,fontWeight:700,fontSize:15}}><div>Custo total</div><div style={{...S.ic_,fontSize:15}}>{fmt(total)}</div></div>
          </div>
          <div style={S.sec}>
            <div style={S.st}>💰 Precificação</div>
            <div style={S.pg}>
              <div style={S.pb_}><div style={S.pl}>Custo/unidade</div><div style={S.pv}>{fmt(porUn)}</div></div>
              <div style={S.pb_}><div style={S.pl}>Margem</div><div style={S.pv}>{r.margem}%</div></div>
              <div style={S.pb_}><div style={S.pl}>Preço s/ taxa</div><div style={S.pv}>{fmt(semTaxa)}</div></div>
              <div style={S.pb_}><div style={S.pl}>Taxa delivery ({r.taxaDelivery}%)</div><div style={S.pv}>{fmt(taxa)}</div></div>
            </div>
            <div style={S.ph}><div style={S.pbl}>🏷 Preço de venda/unidade</div><div style={S.pb}>{fmt(final)}</div></div>
            {r.precoApp>0&&<div style={{...S.pb_,background:"#F0FFF4",border:"1.5px solid #86EFAC",marginBottom:8}}><div style={{...S.pl,color:"#166534"}}>✅ Preço praticado no app</div><div style={{...S.pv,color:"#166534"}}>{fmt(r.precoApp)}</div></div>}
            <div style={{...S.pb_,background:"#FFF7F9",border:"1.5px solid #FCD34D"}}><div style={{...S.pl,color:"#92400E"}}>💸 Lucro estimado (lote)</div><div style={{...S.pv,color:"#92400E"}}>{fmt(lucro)}</div></div>
          </div>
          {r.obs&&<div style={S.sec}><div style={S.st}>📝 Obs</div><div style={{fontSize:14,color:"#7A4A58",lineHeight:1.6}}>{r.obs}</div></div>}
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button style={S.be} onClick={()=>openEditR(r.id)}>✏️ Editar</button>
            <button style={{...S.bd,display:"flex",alignItems:"center",gap:6}} onClick={()=>pedirExclusaoReceita(r.id)}>🗑 Excluir</button>
          </div>
        </div>
        {confirmDel&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
            <div style={{background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:380,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>🗑</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:VINHO_C,marginBottom:8,fontWeight:700}}>Confirmar exclusão</div>
              <div style={{fontSize:14,color:"#7A4A58",marginBottom:24,lineHeight:1.6}}>Tem certeza que deseja excluir<br/><b>"{confirmDel.nome}"</b>?<br/><span style={{fontSize:12,color:"#C45C74"}}>Esta ação não pode ser desfeita.</span></div>
              <div style={{display:"flex",gap:10}}>
                <button style={{flex:1,padding:14,borderRadius:50,border:"2px solid #F5D0D8",background:"#fff",color:"#7A4A58",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={()=>setConfirmDel(null)}>Cancelar</button>
                <button style={{flex:1,padding:14,borderRadius:50,border:"none",background:"linear-gradient(135deg,#C45C74,#E8899A)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={confirmarExclusao}>Sim, excluir</button>
              </div>
            </div>
          </div>
        )}
        {toast&&<div style={S.tst}>{toast}</div>}
      </div>
    );
  }

  // ── LIST ──
  return(
    <div style={S.app}><style>{CSS}</style>
      <header style={S.hdr}>
        <div><div style={S.logo}>Delícias da Jay</div><div style={S.lsub}>Fichas Técnicas</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button style={S.bp} onClick={tab==="receitas"?openNewR:openNewP}>+ {tab==="receitas"?"Receita":"Produto"}</button>
          <button style={{background:"rgba(255,255,255,.1)",border:"none",color:"#E8899A",borderRadius:50,padding:"9px 14px",fontSize:13,cursor:"pointer"}} onClick={fazerLogout} title="Sair">🚪</button>
        </div>
      </header>

      <div style={S.tabs}>
        <button style={{...S.tab_,...(tab==="receitas"?S.taba:{})}} onClick={()=>setTab("receitas")}>🍰 Receitas</button>
        <button style={{...S.tab_,...(tab==="produtos"?S.taba:{})}} onClick={()=>setTab("produtos")}>📦 Produtos</button>
      </div>

      {tab==="receitas"&&<>
        <div style={S.sw}><span style={S.si}>🔍</span><input style={S.sinp} placeholder="Buscar receita..." value={searchR} onChange={e=>setSearchR(e.target.value)}/></div>
        <div style={S.cs2}>{["Todos",...CAT_RECEITA].map(c=><button key={c} style={{...S.cc,...(catR===c?S.cca:{})}} onClick={()=>setCatR(c)}>{c}</button>)}</div>
        <div style={S.lc}>{filtR.length} receita{filtR.length!==1?"s":""}</div>
        {filtR.length===0?(
          <div style={S.emp}><div style={{fontSize:52,marginBottom:12}}>🍰</div><div style={S.et}>{recipes.length===0?"Nenhuma receita":"Nada encontrado"}</div><div style={S.es}>{recipes.length===0?'Toque em "+ Receita"':"Tente outro termo."}</div></div>
        ):(
          <div style={S.lst}>{filtR.map(r=>{
            const {final,porUn}=calcRecipe(r,produtos);
            return(
              <div key={r.id} style={S.card} className="card-hover" onClick={()=>openDetail(r.id)}>
                <div style={S.ce}>{r.emoji}</div>
                <div style={S.cb}><div style={S.cn}>{r.nome}</div><div style={S.cm}>{r.categoria||"Sem categoria"} · rend. {r.rendimento} un.</div></div>
                <div style={S.crr}><div style={S.cp}>{fmt(final)}</div><div style={S.cpl}>p/ unidade</div></div>
              </div>
            );
          })}</div>
        )}
      </>}

      {tab==="produtos"&&<>
        <div style={S.sw}><span style={S.si}>🔍</span><input style={S.sinp} placeholder="Buscar produto..." value={searchP} onChange={e=>setSearchP(e.target.value)}/></div>
        <div style={S.cs2}>{["Todos",...CAT_PRODUTO].map(c=><button key={c} style={{...S.cc,...(catP===c?S.cca:{})}} onClick={()=>setCatP(c)}>{c}</button>)}</div>
        <div style={S.lc}>{filtP.length} produto{filtP.length!==1?"s":""} · toque para atualizar o preço</div>
        <div style={S.lst}>{filtP.map(p=>{
          const used=recipes.filter(r=>r.ingredientes.some(i=>i.produtoId===p.id)).length;
          const pu=p.embalagemQtd?p.preco/p.embalagemQtd:0;
          return(
            <div key={p.id} style={S.card} className="card-hover" onClick={()=>openEditP(p.id)}>
              <div style={{...S.ce,fontSize:22}}>{CAT_EMOJI[p.categoria]||"📦"}</div>
              <div style={S.cb}>
                <div style={S.cn}>{p.nome}</div>
                <div style={S.cm}>{p.categoria} · R$ {fmtN(pu)}/{p.unidade}</div>
                {used>0&&<div style={{fontSize:11,color:"#C45C74",fontWeight:600,marginTop:2}}>usado em {used} receita{used>1?"s":""}</div>}
              </div>
              <div style={S.crr}><div style={S.cp}>{fmt(p.preco)}</div><div style={S.cpl}>{p.embalagemQtd}{p.unidade}</div></div>
            </div>
          );
        })}</div>
      </>}

      {toast&&<div style={S.tst}>{toast}</div>}
      {saving&&<div style={S.sync}>💾 Salvando...</div>}

      {/* ── MODAL CONFIRMAÇÃO EXCLUSÃO ── */}
      {confirmDel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
          <div style={{background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:380,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>🗑</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:VINHO_C,marginBottom:8,fontWeight:700}}>
              Confirmar exclusão
            </div>
            <div style={{fontSize:14,color:"#7A4A58",marginBottom:24,lineHeight:1.6}}>
              Tem certeza que deseja excluir<br/>
              <b>"{confirmDel.nome}"</b>?<br/>
              <span style={{fontSize:12,color:"#C45C74"}}>Esta ação não pode ser desfeita.</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button style={{flex:1,padding:14,borderRadius:50,border:"2px solid #F5D0D8",background:"#fff",color:"#7A4A58",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}}
                onClick={()=>setConfirmDel(null)}>Cancelar</button>
              <button style={{flex:1,padding:14,borderRadius:50,border:"none",background:"linear-gradient(135deg,#C45C74,#E8899A)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}}
                onClick={confirmarExclusao}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S={
  app:{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"#FFF0F3",fontFamily:"'DM Sans',sans-serif",color:"#4A1A2C"},
  splash:{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#4A1A2C"},
  spin:{width:32,height:32,border:"3px solid #C45C7444",borderTop:"3px solid #C45C74",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"20px auto 0"},
  hdr:{background:"#4A1A2C",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100},
  hTitle:{color:"#E8899A",fontFamily:"'Playfair Display',serif",fontSize:16},
  logo:{fontFamily:"'Playfair Display',serif",color:"#E8899A",fontSize:18,lineHeight:1.2},
  lsub:{color:"#D4748866",fontSize:11,letterSpacing:".1em",textTransform:"uppercase",marginTop:1},
  bp:{background:"#C45C74",color:"#fff",border:"none",borderRadius:50,padding:"9px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"},
  bk:{background:"rgba(255,255,255,.12)",border:"none",color:"#fff",borderRadius:50,padding:"7px 14px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:4,marginBottom:16},
  bk2:{background:"rgba(255,255,255,.12)",border:"none",color:"#fff",borderRadius:50,padding:"7px 14px",fontSize:13,cursor:"pointer",width:80},
  tabs:{display:"flex",borderBottom:"2px solid #F5D0D8",background:"#fff"},
  tab_:{flex:1,padding:"13px 8px",border:"none",background:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#7A4A5888",cursor:"pointer",borderBottom:"3px solid transparent",marginBottom:"-2px"},
  taba:{color:"#C45C74",borderBottomColor:"#C45C74"},
  sw:{margin:"14px 16px 0",position:"relative"},
  si:{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14},
  sinp:{width:"100%",padding:"11px 14px 11px 38px",borderRadius:50,border:"2px solid #F5D0D8",background:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#4A1A2C",outline:"none",boxSizing:"border-box"},
  cs2:{display:"flex",gap:8,padding:"12px 16px",overflowX:"auto",scrollbarWidth:"none"},
  cc:{flexShrink:0,background:"#fff",border:"2px solid #F5D0D8",color:"#7A4A58",borderRadius:50,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  cca:{background:"#4A1A2C",borderColor:"#4A1A2C",color:"#E8899A"},
  lc:{padding:"0 20px 8px",fontSize:12,color:"#7A4A5888"},
  lst:{padding:"0 16px 100px",display:"flex",flexDirection:"column",gap:10},
  card:{background:"#fff",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 10px rgba(74,26,44,.08)",cursor:"pointer",border:"1.5px solid transparent",transition:"all .15s"},
  ce:{width:50,height:50,background:"#FFF0F3",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0},
  cb:{flex:1,minWidth:0},
  cn:{fontWeight:600,fontSize:15,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
  cm:{fontSize:12,color:"#7A4A58",marginTop:2},
  crr:{textAlign:"right",flexShrink:0},
  cp:{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#C45C74"},
  cpl:{fontSize:11,color:"#7A4A5888"},
  emp:{textAlign:"center",padding:"70px 20px"},
  et:{fontFamily:"'Playfair Display',serif",fontSize:18,marginBottom:6},
  es:{fontSize:13,color:"#7A4A58",opacity:.7},
  tst:{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#4A1A2C",color:"#fff",padding:"12px 24px",borderRadius:50,fontSize:14,fontWeight:500,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.3)"},
  sync:{position:"fixed",top:70,right:12,background:"#C45C74",color:"#fff",padding:"4px 12px",borderRadius:50,fontSize:11,zIndex:100},
  dh:{background:"#4A1A2C",padding:"20px 20px 24px"},
  dn:{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#fff",marginBottom:4},
  dc:{fontSize:12,color:"#C8886088",textTransform:"uppercase",letterSpacing:".08em"},
  db:{padding:"14px 14px 100px"},
  be:{flex:1,background:"#4A1A2C",color:"#fff",border:"none",borderRadius:50,padding:14,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"},
  bd:{background:"none",border:"2px solid #F5D0D8",color:"#C45C74",borderRadius:50,padding:"14px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:14,cursor:"pointer"},
  sec:{background:"#fff",borderRadius:16,padding:16,marginBottom:12,boxShadow:"0 2px 8px rgba(74,26,44,.06)"},
  st:{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:12,color:"#4A1A2C"},
  ir:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #FDE8ED",fontSize:14},
  in_:{fontWeight:500,fontSize:14},
  id_:{fontSize:12,color:"#7A4A58",marginTop:1},
  ic_:{fontWeight:600,color:"#C45C74",flexShrink:0,marginLeft:8},
  pg:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8},
  pb_:{background:"#FFF0F3",borderRadius:10,padding:"10px 12px",border:"1.5px solid #F5D0D8"},
  pl:{fontSize:11,textTransform:"uppercase",letterSpacing:".05em",color:"#7A4A58",marginBottom:4},
  pv:{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700},
  ph:{background:"linear-gradient(135deg,#C45C74,#E8899A)",borderRadius:14,padding:"16px 18px",color:"#fff",margin:"8px 0"},
  pbl:{fontSize:12,opacity:.8,marginBottom:4},
  pb:{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700},
  fb:{padding:"14px 14px 20px"},
  lbl:{display:"block",fontSize:11,fontWeight:600,color:"#7A4A58",textTransform:"uppercase",letterSpacing:".05em",marginBottom:5},
  inp:{width:"100%",padding:"11px 14px",borderRadius:10,border:"2px solid #F5D0D8",background:"#FFF0F3",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#4A1A2C",outline:"none",marginBottom:12,boxSizing:"border-box",WebkitAppearance:"none"},
  er:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14},
  eb:{width:40,height:40,borderRadius:10,border:"2px solid #F5D0D8",background:"#FFF0F3",fontSize:20,cursor:"pointer"},
  ebs:{border:"2px solid #C45C74",background:"#FFE0E7"},
  help:{fontSize:13,color:"#7A4A58",marginBottom:12,lineHeight:1.5,background:"#FFF7F9",borderRadius:8,padding:"8px 10px",borderLeft:"3px solid #C45C74"},
  ic:{background:"#FFF0F3",borderRadius:12,padding:12,marginBottom:10,border:"1.5px solid #F5D0D8"},
  ich:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8},
  brm:{background:"none",border:"none",color:"#C45C74",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  ctag:{background:"#C45C7418",borderRadius:8,padding:"6px 10px",fontSize:12,color:"#C45C74",fontWeight:600,marginBottom:8},
  badd:{background:"#FFF0F3",border:"2px dashed #C45C7455",color:"#C45C74",borderRadius:10,padding:12,width:"100%",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:4},
  cs:{background:"#FFF0F3",borderRadius:10,padding:"12px 14px",marginBottom:14,border:"1.5px solid #F5D0D8"},
  cr:{display:"flex",justifyContent:"space-between",fontSize:14,padding:"3px 0",color:"#4A1A2C"},
  slr:{display:"flex",alignItems:"center",gap:10,marginBottom:12},
  sl:{flex:1,height:20,border:"none",background:"none",padding:0,marginBottom:0,accentColor:"#C45C74",WebkitAppearance:"auto"},
  slv:{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#C45C74",minWidth:48,textAlign:"right"},
  bsave:{background:"linear-gradient(135deg,#C45C74,#E8899A)",color:"#fff",border:"none",borderRadius:50,padding:16,width:"100%",fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:600,cursor:"pointer",boxShadow:"0 6px 20px rgba(196,92,116,.4)",marginTop:10},
};

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#FFF0F3;}
  input,select,textarea{color:#4A1A2C!important;-webkit-text-fill-color:#4A1A2C!important;}
  input:focus,select:focus,textarea:focus{border-color:#C45C74!important;background:#fff!important;}
  input::placeholder{color:#4A1A2C66!important;-webkit-text-fill-color:#4A1A2C66!important;}
  .card-hover:hover{border-color:#F5D0D8!important;transform:translateY(-1px);box-shadow:0 6px 20px rgba(74,26,44,.12)!important;}
  ::-webkit-scrollbar{display:none;}
  @keyframes spin{to{transform:rotate(360deg);}}
  input[type=range]{accent-color:#C45C74;}
  .prod-opt:hover{background:#FFF0F3;}
  .prod-opt:last-child{border-bottom:none!important;}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
`;
