export default function ComprasPage({ filtC, compras, compraDetalhe, view, searchC, mesFiltroC, setSearchC, setMesFiltroC, mesesCompras, compraItens, mapaUsuarios, openDetC, fmt, pedirExcC }) {
  return (
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
  );
}
