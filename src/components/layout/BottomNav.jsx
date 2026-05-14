import { LayoutDashboard, FileText, Package, MoreHorizontal, ShoppingCart, BarChart2, Settings } from "lucide-react";
import { useState } from "react";

const MAIN_TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "receitas", label: "Receitas", icon: FileText },
  { key: "produtos", label: "Produtos", icon: Package },
  { key: "_mais", label: "Mais", icon: MoreHorizontal },
];

const MAIS_TABS = [
  { key: "compras", label: "Compras", icon: ShoppingCart },
  { key: "relatorios", label: "Relatórios", icon: BarChart2 },
  { key: "config", label: "Config", icon: Settings },
];

export default function BottomNav({ tab, setTab, setView }) {
  const [maisOpen, setMaisOpen] = useState(false);
  const isExtra = ["compras", "relatorios", "config"].includes(tab);

  return (
    <>
      {/* Drawer "Mais" */}
      {maisOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setMaisOpen(false)}/>
          <div className="fixed bottom-16 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-3 grid grid-cols-3 gap-2 md:hidden">
            {MAIS_TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => { setTab(key); setView("list"); setMaisOpen(false); }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors ${
                  tab === key ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon size={20}/>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Barra de navegação */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex md:hidden z-30">
        {MAIN_TABS.map(({ key, label, icon: Icon }) => {
          const isMais = key === "_mais";
          const active = isMais ? isExtra || maisOpen : tab === key;
          return (
            <button key={key}
              onClick={() => isMais ? setMaisOpen(v => !v) : (setTab(key), setView("list"), setMaisOpen(false))}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              <Icon size={20}/>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
