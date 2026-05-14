import { useState, useEffect, useCallback, useMemo } from "react";
import { SEED_RECIPES, CAT_R, CAT_P, CATEMOJI } from "./lib/constants";
import { fmt, fmtN, genId } from "./utils/formatters";
import { pPreco, pEmb } from "./utils/helpers";
import { calc, calcCustosFixos } from "./utils/calc";
import s from "./styles/formStyles";
import GLOBAL_CSS from "./styles/globalCss";
import { login, cadastrar, logout, onAuthChange } from "./services/authService";
import { buscarOuCriarNegocio, carregarDadosNegocio, salvarConfig } from "./services/negocioService";
import { salvarReceitas } from "./services/receitasService";
import { listarProdutos, salvarProduto, desativarProduto } from "./services/produtosService";
import { listarCompras, buscarItensCompra, salvarCompra, excluirCompra } from "./services/comprasService";
import NavItem from "./components/ui/NavItem";
import ModalConfirm from "./components/ui/ModalConfirm";
import ResponsiveDrawer from "./components/ui/ResponsiveDrawer";
import MiniBarChart from "./components/ui/MiniBarChart";
import StatCard from "./components/ui/StatCard";
import QuickProdModal from "./components/forms/QuickProdModal";
import ConfigForm from "./components/forms/ConfigForm";
import ProdutoForm from "./components/forms/ProdutoForm";
import ReceitaForm from "./components/forms/ReceitaForm";
import CompraForm from "./components/forms/CompraForm";
import DashboardHome from "./components/DashboardHome";
import RelatoriosPanel from "./components/RelatoriosPanel";
import DesktopDetail from "./components/DesktopDetail";


// ─── PAINÉIS MOVIDOS PARA src/components/ ─────────────────────

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