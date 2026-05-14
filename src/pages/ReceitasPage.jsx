import DesktopDetail from "../components/DesktopDetail";

export default function ReceitasPage({ filtR, recipes, detailId, view, searchR, catR, setSearchR, setCatR, openDet, fmt, recipesCalc, produtos, openEditR, copiarReceita, pedirExcR, CAT_R }) {
  return (
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
  );
}
