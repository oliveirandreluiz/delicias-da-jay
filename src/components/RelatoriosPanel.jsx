import { useState } from "react";
import StatCard from "./ui/StatCard";
import MiniBarChart from "./ui/MiniBarChart";

export default function RelatoriosPanel({ recipesCalc, produtos, compras, filtP, fmt, fmtN, pPreco, pEmb, onClose, onExportCSV }) {
  const [relTab, setRelTab] = useState("receitas");

  const totalLucroSugerido = recipesCalc.reduce((s,r) => s + r._calc.lucro, 0);
  const margemMedia = recipesCalc.length > 0 ? recipesCalc.reduce((s,r) => s + (r.margem||0), 0) / recipesCalc.length : 0;

  const hoje = new Date();
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][d.getMonth()];
    const val = compras.filter(c => c.data_compra?.startsWith(key)).reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
    meses.push({ label, value: Math.round(val) });
  }

  const lucroData = recipesCalc.slice(0,8).map(r => ({ label: r.nome.substring(0,8), value: Math.round(r._calc.lucro) }));
  const catDist = {};
  recipesCalc.forEach(r => { const cat = r.categoria||"Sem categoria"; catDist[cat] = (catDist[cat]||0) + 1; });

  const iR  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>;
  const iPct = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><path d="M16 8L8 16"/></svg>;
  const iMon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  const iBox = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
  const iCart = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
  const iCal  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  const iDL   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

  return (
    <div className="p-6 space-y-5" style={{animation:"fadein .3s ease"}}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-400 mt-0.5">Análise completa do negócio</p>
        </div>
        <button
          onClick={() => onExportCSV(relTab === "compras" ? "compras" : relTab === "produtos" ? "produtos" : "receitas")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1F1F23] text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors"
        >
          {iDL} Exportar CSV
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-[#1F1F23]">
        {[{k:"receitas",l:"Receitas"},{k:"produtos",l:"Produtos"},{k:"compras",l:"Compras"}].map(t => (
          <button key={t.k} onClick={() => setRelTab(t.k)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${relTab===t.k?"border-gray-900 text-gray-900 dark:text-white dark:border-white":"border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
          >{t.l}</button>
        ))}
      </div>

      {relTab === "receitas" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={iR}   label="Total Receitas"  value={recipesCalc.length}           iconBg="#eff6ff" iconColor="#3b82f6"/>
            <StatCard icon={iPct} label="Margem Média"    value={`${margemMedia.toFixed(0)}%`} iconBg={margemMedia>=60?"#f0fdf4":"#fff7ed"} iconColor={margemMedia>=60?"#16a34a":"#ea580c"}/>
            <StatCard icon={iMon} label="Lucro Potencial" value={fmt(totalLucroSugerido)}       iconBg="#f0fdf4" iconColor="#16a34a"/>
          </div>
          {lucroData.length > 0 && (
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Lucro por Receita</h3>
              <MiniBarChart data={lucroData} color="#6366f1" height={90}/>
            </div>
          )}
          {Object.keys(catDist).length > 0 && (
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Por Categoria</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(catDist).map(([cat,count]) => (
                  <div key={cat} className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{cat}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Detalhamento</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
              {recipesCalc.map(r => {
                const c = r._calc;
                const mCls = r.margem >= 80 ? "text-green-600" : r.margem >= 50 ? "text-amber-600" : "text-red-500";
                return (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{r.nome}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Custo {fmt(c.porUn)}/un · Rend. {r.rendimento} un.</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{fmt(c.final)}<span className="text-xs font-normal text-gray-400">/un</span></div>
                      <div className="flex gap-1.5 justify-end mt-1">
                        <span className={`text-xs font-semibold ${mCls}`}>{r.margem}%</span>
                        <span className="text-xs font-semibold text-green-600">{fmt(c.lucro)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {recipesCalc.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Nenhuma receita cadastrada</div>}
            </div>
          </div>
        </div>
      )}

      {relTab === "produtos" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={iBox} label="Produtos Ativos" value={filtP.length} iconBg="#eff6ff" iconColor="#3b82f6"/>
            <StatCard icon={iMon} label="Preço Médio" value={fmt(filtP.length > 0 ? filtP.reduce((s,p) => s + pPreco(p), 0) / filtP.length : 0)} iconBg="#fff7ed" iconColor="#ea580c"/>
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Lista de Produtos</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
              {filtP.slice(0,30).map(p => {
                const pu = pEmb(p) ? pPreco(p) / pEmb(p) : 0;
                const usedIn = recipesCalc.filter(r => r.ingredientes.some(ing => ing.produtoId === p.id)).length;
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{p.nome}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.categoria} · R$ {fmtN(pu)}/{p.unidade}{usedIn > 0 ? ` · ${usedIn} receita${usedIn>1?"s":""}` : ""}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{fmt(pPreco(p))}</div>
                      <div className="text-xs text-gray-400">{pEmb(p)}{p.unidade}</div>
                    </div>
                  </div>
                );
              })}
              {filtP.length > 30 && <div className="px-5 py-3 text-xs text-gray-400">...e mais {filtP.length - 30} no CSV</div>}
              {filtP.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Nenhum produto cadastrado</div>}
            </div>
          </div>
        </div>
      )}

      {relTab === "compras" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={iCart} label="Total Compras" value={compras.length} iconBg="#fff7ed" iconColor="#ea580c"/>
            <StatCard icon={iMon}  label="Valor Total"   value={fmt(compras.reduce((s,c) => s + parseFloat(c.valor_total||0), 0))} iconBg="#fef2f2" iconColor="#dc2626"/>
            <StatCard icon={iCal}  label="Mês Atual"     value={fmt(compras.filter(c=>c.data_compra?.startsWith(new Date().toISOString().substring(0,7))).reduce((s,c) => s+parseFloat(c.valor_total||0),0))} iconBg="#eff6ff" iconColor="#3b82f6"/>
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Compras por Mês</h3>
            {compras.length > 0 ? <MiniBarChart data={meses} color="#f97316" height={100}/> : <div className="text-center py-8 text-gray-400 text-sm">Sem dados de compras</div>}
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Últimas Compras</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
              {compras.slice(0,15).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.fornecedor||"Sem fornecedor"}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(c.data_compra+"T12:00:00").toLocaleDateString("pt-BR")} · {c.forma_pagamento||""}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{fmt(c.valor_total)}</div>
                </div>
              ))}
              {compras.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Nenhuma compra registrada</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
