import { useState, useEffect, useCallback, useMemo } from "react";
import { SEED_RECIPES, CAT_R, CAT_P, CATEMOJI } from "./lib/constants";
import { fmt, fmtN, genId } from "./utils/formatters";
import { pPreco, pEmb } from "./utils/helpers";
import { calc } from "./utils/calc";
import s from "./styles/formStyles";
import GLOBAL_CSS from "./styles/globalCss";
import { useTheme } from "./hooks/useTheme";
import { login, cadastrar, logout, onAuthChange } from "./services/authService";
import { buscarOuCriarNegocio, carregarDadosNegocio, salvarConfig } from "./services/negocioService";
import { salvarReceitas } from "./services/receitasService";
import { listarProdutos, salvarProduto, desativarProduto } from "./services/produtosService";
import { listarCompras, buscarItensCompra, salvarCompra, excluirCompra } from "./services/comprasService";
import ModalConfirm from "./components/ui/ModalConfirm";
import ResponsiveDrawer from "./components/ui/ResponsiveDrawer";
import QuickProdModal from "./components/forms/QuickProdModal";
import ConfigForm from "./components/forms/ConfigForm";
import ProdutoForm from "./components/forms/ProdutoForm";
import ReceitaForm from "./components/forms/ReceitaForm";
import CompraForm from "./components/forms/CompraForm";
import DashboardHome from "./components/DashboardHome";
import RelatoriosPanel from "./components/RelatoriosPanel";
import AppLayout from "./components/layout/AppLayout";
import { LoadingScreen, DataLoadingScreen, EmailConfirmScreen, CadastroScreen, LoginScreen } from "./pages/AuthScreens";
import ReceitasPage from "./pages/ReceitasPage";
import ProdutosPage from "./pages/ProdutosPage";
import ComprasPage from "./pages/ComprasPage";


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
  const { dark, toggle: toggleDark } = useTheme();
  const [pFormInit,setPFormInit]=useState(null); const [rFormInit,setRFormInit]=useState(null);
  const [searchR,setSearchR]=useState(""); const [catR,setCatR]=useState("Todos"); const [searchP,setSearchP]=useState(""); const [catP,setCatP]=useState("Todos");
  const [toast,setToast]=useState(""); const [confirmDel,setConfirmDel]=useState(null); const [quickPOpen,setQuickPOpen]=useState(false);
  const [searchC,setSearchC]=useState(""); const [mesFiltroC,setMesFiltroC]=useState("Todos"); const [compraDetalhe,setCompraDetalhe]=useState(null); const [compraItens,setCompraItens]=useState({}); const [mapaUsuarios,setMapaUsuarios]=useState({});
  const [config,setConfig]=useState(null);

  const toast_ = useCallback(msg => { setToast(msg); setTimeout(() => setToast(""), 2800); }, []);
  const recipesCalc = useMemo(() => recipes.map(r => ({ ...r, _calc: calc(r, produtos, config) })), [recipes, produtos, config]);;

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

  if (!appReady) return <LoadingScreen/>;
  if (!user && authView === "emailConfirm") return <EmailConfirmScreen email={authForm.email} onBack={() => setAuthView("login")}/>;
  if (!user && authView === "cadastro") return <CadastroScreen authForm={authForm} authError={authError} authLoading={authLoading} setAuthForm={setAuthForm} setAuthError={setAuthError} setAuthView={setAuthView} fazerCadastro={fazerCadastro}/>;
  if (!user) return <LoginScreen authForm={authForm} authError={authError} authLoading={authLoading} setAuthForm={setAuthForm} setAuthError={setAuthError} setAuthView={setAuthView} fazerLogin={fazerLogin}/>;
  if (loading) return <DataLoadingScreen negocioNome={negocioNome}/>;

  const onNew = tab==="receitas"?openNewR:tab==="produtos"?openNewP:tab==="compras"?openNewC:null;

  return (
    <AppLayout
      tab={tab} setTab={setTab} view={view} setView={setView}
      user={user} negocioNome={negocioNome} fazerLogout={fazerLogout}
      dark={dark} toggleDark={toggleDark}
      sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}
      onNew={onNew}
    >
      {tab === "dashboard" && <DashboardHome recipesCalc={recipesCalc} produtos={produtos} compras={compras} fmt={fmt} fmtN={fmtN} pPreco={pPreco} pEmb={pEmb}/>}
      {tab === "receitas" && <ReceitasPage filtR={filtR} recipes={recipes} detailId={detailId} view={view} searchR={searchR} catR={catR} setSearchR={setSearchR} setCatR={setCatR} openDet={openDet} fmt={fmt} recipesCalc={recipesCalc} produtos={produtos} openEditR={openEditR} copiarReceita={copiarReceita} pedirExcR={pedirExcR} CAT_R={CAT_R}/>}
      {tab === "produtos" && <ProdutosPage filtP={filtP} editPId={editPId} view={view} searchP={searchP} catP={catP} setSearchP={setSearchP} setCatP={setCatP} openEditP={openEditP} fmt={fmt} fmtN={fmtN} pPreco={pPreco} pEmb={pEmb} CATEMOJI={CATEMOJI} CAT_P={CAT_P}/>}
      {tab === "compras" && <ComprasPage filtC={filtC} compras={compras} compraDetalhe={compraDetalhe} view={view} searchC={searchC} mesFiltroC={mesFiltroC} setSearchC={setSearchC} setMesFiltroC={setMesFiltroC} mesesCompras={mesesCompras} compraItens={compraItens} mapaUsuarios={mapaUsuarios} openDetC={openDetC} fmt={fmt} pedirExcC={pedirExcC}/>}
      {tab === "relatorios" && <RelatoriosPanel recipesCalc={recipesCalc} produtos={produtos} compras={compras} filtP={filtP} fmt={fmt} fmtN={fmtN} pPreco={pPreco} pEmb={pEmb} onClose={() => setTab("dashboard")} onExportCSV={exportarCSV}/>}
      {tab === "config" && (
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Configurações</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Personalize o seu negócio</p>
          </div>
          <ConfigForm config={config} saving={saving} onSaved={handleSaveConfig} toast_={toast_}/>
        </div>
      )}

      {/* Formulários (drawers) */}
      {view === "pForm" && <ResponsiveDrawer title={editPId ? "Editar Produto" : "Novo Produto"} onClose={() => setView("list")}><ProdutoForm initialData={pFormInit} editId={editPId} recipes={recipes} saving={saving} onSaved={handleSaveProd} onDelete={pedirExcP} onCopy={copiarProduto} toast_={toast_}/></ResponsiveDrawer>}
      {view === "rForm" && <ResponsiveDrawer title={editId ? "Editar Receita" : "Nova Receita"} onClose={() => setView(editId?"detail":"list")}><ReceitaForm initialData={rFormInit} editId={editId} produtos={produtos} saving={saving} onSaved={handleSaveRecipe} onOpenQuickP={() => setQuickPOpen(true)} toast_={toast_}/></ResponsiveDrawer>}
      {view === "cForm" && <ResponsiveDrawer title="Nova Compra" onClose={() => {setView("list");setTab("compras");}}><CompraForm produtos={produtos} saving={saving} onSaved={handleSaveCompra} onOpenQuickP={() => setQuickPOpen(true)} toast_={toast_}/></ResponsiveDrawer>}

      <ModalConfirm item={confirmDel} onConfirm={confirmarExc} onCancel={() => setConfirmDel(null)}/>
      <QuickProdModal open={quickPOpen} onClose={() => setQuickPOpen(false)} negocioId={negocioId} onProductSaved={reloadProdutos} toast_={toast_}/>
      {toast && <div style={s.tst}>{toast}</div>}
      {saving && <div style={s.sync}>💾 Salvando...</div>}
    </AppLayout>
  );
}