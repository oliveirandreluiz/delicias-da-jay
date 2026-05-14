import { Sun, Moon, Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const LABELS = {
  dashboard: "Dashboard",
  receitas: "Receitas",
  produtos: "Produtos",
  compras: "Compras",
  relatorios: "Relatórios",
  config: "Configurações",
};

const NEW_LABEL = {
  receitas: "Nova Receita",
  produtos: "Novo Produto",
  compras: "Nova Compra",
};

export default function AppLayout({
  tab, setTab, view, setView,
  user, negocioNome, fazerLogout,
  dark, toggleDark,
  sidebarCollapsed, setSidebarCollapsed,
  onNew,
  children,
}) {
  const breadcrumb = LABELS[tab] || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">

      <Sidebar
        tab={tab} setTab={setTab} setView={setView}
        user={user} negocioNome={negocioNome} fazerLogout={fazerLogout}
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-14 md:h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 flex items-center px-5 gap-4 shrink-0 sticky top-0 z-10">

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0 text-sm">
            <span className="text-zinc-400 dark:text-zinc-500">Delícias da Jay</span>
            <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{breadcrumb}</span>
          </div>

          {/* Botão de nova ação (só nas abas relevantes) */}
          {onNew && (
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-indigo-600/20"
            >
              <Plus size={14}/>
              <span className="hidden sm:inline">{NEW_LABEL[tab]}</span>
              <span className="sm:hidden">Novo</span>
            </button>
          )}

          {/* Toggle de tema */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={dark ? "Modo claro" : "Modo escuro"}
          >
            {dark ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 pb-16 md:pb-0">
          {children}
        </main>

      </div>

      <BottomNav tab={tab} setTab={setTab} setView={setView}/>
    </div>
  );
}
