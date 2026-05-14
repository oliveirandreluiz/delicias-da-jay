import { LayoutDashboard, FileText, Package, ShoppingCart, BarChart2, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const NAV = [
  { section: "Visão Geral", items: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { section: "Confeitaria", items: [
    { key: "receitas", label: "Receitas", icon: FileText },
    { key: "produtos", label: "Produtos", icon: Package },
  ]},
  { section: "Financeiro", items: [
    { key: "compras", label: "Compras", icon: ShoppingCart },
    { key: "relatorios", label: "Relatórios", icon: BarChart2 },
  ]},
  { section: "Sistema", items: [
    { key: "config", label: "Configurações", icon: Settings },
  ]},
];

export default function Sidebar({ tab, setTab, setView, user, negocioNome, fazerLogout, collapsed, setCollapsed }) {
  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} hidden md:flex shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex-col overflow-hidden transition-all duration-300`}>

      {/* Logo + toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        {collapsed ? (
          <button onClick={() => setCollapsed(false)} className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20 mx-auto hover:bg-indigo-500 transition-colors">
            D
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20 shrink-0 text-sm">D</div>
              <span className="font-bold text-sm tracking-wide text-zinc-900 dark:text-zinc-50 truncate">Delícias da Jay</span>
            </div>
            <button onClick={() => setCollapsed(true)} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0">
              <ChevronLeft size={15}/>
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{section}</p>
            )}
            <div className="space-y-0.5">
              {items.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button key={key} onClick={() => { setTab(key); setView("list"); }}
                    title={collapsed ? label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      active
                        ? "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-50 font-medium"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon size={17} className={active ? "text-indigo-600 dark:text-indigo-400 shrink-0" : "shrink-0"}/>
                    {!collapsed && <span className="text-sm">{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Usuário + logout */}
      <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 text-sm font-bold shrink-0">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{negocioNome}</div>
              <div className="text-xs text-zinc-400 truncate">{user?.email}</div>
            </div>
            <button onClick={fazerLogout} className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0" title="Sair">
              <LogOut size={14}/>
            </button>
          </div>
        ) : (
          <button onClick={fazerLogout} className="w-full flex justify-center p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Sair">
            <LogOut size={14}/>
          </button>
        )}
      </div>
    </aside>
  );
}
