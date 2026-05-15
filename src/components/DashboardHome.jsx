import { TrendingUp, ShoppingCart, AlertTriangle, ArrowUpRight } from "lucide-react";
import MiniBarChart from "./ui/MiniBarChart";

export default function DashboardHome({ recipesCalc, produtos, compras, fmt, fmtN, pPreco, pEmb }) {
  const totalReceitas = recipesCalc.length;
  const margemMedia = totalReceitas > 0 ? recipesCalc.reduce((s,r) => s + (r.margem||0), 0) / totalReceitas : 0;
  const lucroTotalSugerido = recipesCalc.reduce((s,r) => s + r._calc.lucro, 0);
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`;
  const comprasMes = compras.filter(c => c.data_compra?.startsWith(mesAtual));
  const totalComprasMes = comprasMes.reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
  const totalComprasGeral = compras.reduce((s,c) => s + parseFloat(c.valor_total||0), 0);

  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][d.getMonth()];
    const val = compras.filter(c => c.data_compra?.startsWith(key)).reduce((s,c) => s + parseFloat(c.valor_total||0), 0);
    meses.push({ label, value: Math.round(val) });
  }

  const topReceitas = [...recipesCalc].sort((a,b) => b._calc.lucro - a._calc.lucro).slice(0,5);
  const prodUso = {};
  recipesCalc.forEach(r => r.ingredientes.forEach(i => { if(i.produtoId) prodUso[i.produtoId] = (prodUso[i.produtoId]||0) + 1; }));
  const topProdutos = Object.entries(prodUso).sort((a,b) => b[1]-a[1]).slice(0,5)
    .map(([id,count]) => { const p = produtos.find(x => x.id === id); return p ? { nome: p.nome, count, custo: pPreco(p) } : null; }).filter(Boolean);
  const semIngrediente = recipesCalc.filter(r => r.ingredientes.filter(i=>i.produtoId).length === 0);
  const margemBaixa = recipesCalc.filter(r => r.margem < 50);
  const totalAlertas = semIngrediente.length + margemBaixa.length;

  return (
    <div className="p-6 space-y-6" style={{animation:"fadein .3s ease"}}>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Bem-vindo(a) de volta!</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Resumo da operação · {hoje.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Lucro Potencial</p>
            <TrendingUp size={16} className="text-emerald-500"/>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">{fmt(lucroTotalSugerido)}</p>
          <p className="text-xs text-zinc-400 mt-1">Soma de todas as receitas</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Margem Média</p>
            <ArrowUpRight size={16} className={margemMedia >= 60 ? "text-emerald-500" : "text-amber-500"}/>
          </div>
          <p className={`text-2xl font-bold font-mono tabular-nums ${margemMedia >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>{margemMedia.toFixed(0)}%</p>
          <p className="text-xs text-zinc-400 mt-1">Baseado em {totalReceitas} receita{totalReceitas!==1?"s":""}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Compras do Mês</p>
            <ShoppingCart size={16} className="text-zinc-400"/>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">{fmt(totalComprasMes)}</p>
          <p className="text-xs text-zinc-400 mt-1">{comprasMes.length} compra{comprasMes.length!==1?"s":""} registrada{comprasMes.length!==1?"s":""}</p>
        </div>

        <div className={`rounded-xl p-5 border shadow-sm ${totalAlertas > 0 ? "bg-rose-50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30" : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-medium ${totalAlertas > 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>Alertas</p>
            <AlertTriangle size={16} className={totalAlertas > 0 ? "text-rose-400" : "text-emerald-500"}/>
          </div>
          <p className={`text-2xl font-bold font-mono tabular-nums ${totalAlertas > 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>{totalAlertas > 0 ? `${totalAlertas} item${totalAlertas!==1?"s":""}` : "Tudo ok"}</p>
          <p className={`text-xs mt-1 ${totalAlertas > 0 ? "text-rose-400/80" : "text-emerald-600/70 dark:text-emerald-500/70"}`}>{totalAlertas > 0 ? "Requer atenção" : "Nenhum alerta"}</p>
        </div>

      </div>

      {/* Top receitas + insumos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-3">Top Receitas por Lucro</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {topReceitas.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-sm">Cadastre receitas para ver o ranking</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950/30 text-[11px] text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">Receita</th>
                    <th className="px-5 py-3 font-semibold text-right hidden sm:table-cell">Custo/un</th>
                    <th className="px-5 py-3 font-semibold text-right">Preço</th>
                    <th className="px-5 py-3 font-semibold text-right">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm">
                  {topReceitas.map(r => {
                    const mCls = r.margem >= 80 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : r.margem >= 50 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
                    return (
                      <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                          <div className="flex items-center gap-2">
                            <span>{r.emoji}</span>
                            <span className="truncate max-w-[160px]">{r.nome}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-zinc-500 dark:text-zinc-400 font-mono tabular-nums hidden sm:table-cell">{fmt(r._calc.porUn)}</td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums font-semibold text-zinc-700 dark:text-zinc-200">{fmt(r._calc.final)}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${mCls}`}>{r.margem}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-3">Insumos Mais Usados</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            {topProdutos.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 text-sm">Adicione ingredientes às receitas</div>
            ) : (
              <ul className="space-y-3.5">
                {topProdutos.map((p,i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"/>
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">{p.nome}</span>
                    </div>
                    <span className="text-sm text-zinc-400 dark:text-zinc-500 font-mono tabular-nums shrink-0">{fmt(p.custo)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico + alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Compras por Mês</h3>
            <span className="text-xs text-zinc-400">Total: <span className="font-semibold font-mono text-zinc-600 dark:text-zinc-300">{fmt(totalComprasGeral)}</span></span>
          </div>
          {compras.length > 0
            ? <MiniBarChart data={meses} color="#6366f1" height={100}/>
            : <div className="text-center py-8 text-zinc-400 text-sm">Registre compras para ver o gráfico</div>
          }
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">Alertas do Sistema</h3>
          <div className="space-y-2">
            {semIngrediente.length > 0 && (
              <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">{semIngrediente.length} receita{semIngrediente.length>1?"s":""} sem ingredientes</div>
                <div className="text-xs text-amber-600/80 dark:text-amber-500/70 mt-1 truncate">{semIngrediente.map(r=>r.nome).join(", ")}</div>
              </div>
            )}
            {margemBaixa.length > 0 && (
              <div className="rounded-lg p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/50">
                <div className="text-xs font-semibold text-red-600 dark:text-red-400">{margemBaixa.length} receita{margemBaixa.length>1?"s":""} com margem abaixo de 50%</div>
                <div className="text-xs text-red-500/80 mt-1 truncate">{margemBaixa.map(r=>`${r.nome} (${r.margem}%)`).join(", ")}</div>
              </div>
            )}
            {semIngrediente.length === 0 && margemBaixa.length === 0 && (
              <div className="rounded-lg p-4 bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/50 text-center">
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Tudo certo</div>
                <div className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">Nenhum alerta no momento</div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
