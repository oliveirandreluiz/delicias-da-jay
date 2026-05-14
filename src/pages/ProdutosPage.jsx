export default function ProdutosPage({ filtP, editPId, view, searchP, catP, setSearchP, setCatP, openEditP, fmt, fmtN, pPreco, pEmb, CATEMOJI, CAT_P }) {
  return (
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
  );
}
