import StatCard from "./ui/StatCard";
import MiniBarChart from "./ui/MiniBarChart";

export default function DashboardHome({ recipesCalc, produtos, compras, fmt, fmtN, pPreco, pEmb }) {
  const totalReceitas = recipesCalc.length;
  const totalProdutos = produtos.length;
  const margemMedia = totalReceitas > 0 ? recipesCalc.reduce((s,r) => s + (r.margem||0), 0) / totalReceitas : 0;
  const custoMedio = totalReceitas > 0 ? recipesCalc.reduce((s,r) => s + r._calc.porUn, 0) / totalReceitas : 0;
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
  const topProdutos = Object.entries(prodUso).sort((a,b) => b[1] - a[1]).slice(0,5).map(([id,count]) => { const p = produtos.find(x => x.id === id); return p ? { nome: p.nome, count, custo: pPreco(p) } : null; }).filter(Boolean);
  const semIngrediente = recipesCalc.filter(r => r.ingredientes.filter(i=>i.produtoId).length === 0);
  const margemBaixa = recipesCalc.filter(r => r.margem < 50);

  const iconReceitas = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>;
  const iconProdutos = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
  const iconCompras = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
  const iconLucro = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

  return (
    <div className="p-6 space-y-5" style={{animation:"fadein .3s ease"}}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visão geral do negócio</p>
        </div>
        <span className="text-xs text-gray-400">{hoje.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={iconReceitas} label="Receitas" value={totalReceitas} sub={`Margem média: ${margemMedia.toFixed(0)}%`} iconBg="#eff6ff" iconColor="#3b82f6"/>
        <StatCard icon={iconProdutos} label="Produtos" value={totalProdutos} sub={`Custo médio/un: ${fmt(custoMedio)}`} iconBg="#f0fdf4" iconColor="#22c55e"/>
        <StatCard icon={iconCompras} label="Compras do mês" value={fmt(totalComprasMes)} sub={`${comprasMes.length} compra${comprasMes.length!==1?"s":""}`} iconBg="#fff7ed" iconColor="#f97316"/>
        <StatCard icon={iconLucro} label="Lucro potencial" value={fmt(lucroTotalSugerido)} sub="Soma de todas as receitas" iconBg="#f0fdf4" iconColor="#16a34a"/>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Compras por Mês</h3>
            <span className="text-xs text-gray-400">Total: <span className="font-semibold text-gray-600 dark:text-gray-300">{fmt(totalComprasGeral)}</span></span>
          </div>
          {compras.length > 0
            ? <MiniBarChart data={meses} color="#6366f1" height={100}/>
            : <div className="text-center py-8 text-gray-400 text-sm">Registre compras para ver o gráfico</div>
          }
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Top Receitas por Lucro</h3>
          {topReceitas.length > 0 ? topReceitas.map((r,i) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-[#1F1F23] last:border-0">
              <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i+1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{r.nome}</div>
                <div className="text-xs text-gray-400">Margem {r.margem}% · {fmt(r._calc.final)}/un</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-green-600">{fmt(r._calc.lucro)}</div>
                <div className="text-xs text-gray-400">lucro/lote</div>
              </div>
            </div>
          )) : <div className="text-center py-8 text-gray-400 text-sm">Cadastre receitas para ver o ranking</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Insumos Mais Usados</h3>
          {topProdutos.length > 0 ? topProdutos.map((p,i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-[#1F1F23] last:border-0">
              <span className="text-xs font-bold text-gray-400 w-4 shrink-0 text-center">{p.count}x</span>
              <div className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-200 truncate">{p.nome}</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">{fmt(p.custo)}</div>
            </div>
          )) : <div className="text-center py-8 text-gray-400 text-sm">Adicione ingredientes às receitas</div>}
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Alertas</h3>
          {semIngrediente.length > 0 && (
            <div className="rounded-lg p-3 mb-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">{semIngrediente.length} receita{semIngrediente.length>1?"s":""} sem ingredientes</div>
              <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 opacity-80">{semIngrediente.map(r=>r.nome).join(", ")}</div>
            </div>
          )}
          {margemBaixa.length > 0 && (
            <div className="rounded-lg p-3 mb-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <div className="text-xs font-semibold text-red-600 dark:text-red-400">{margemBaixa.length} receita{margemBaixa.length>1?"s":""} com margem abaixo de 50%</div>
              <div className="text-xs text-red-500 mt-1 opacity-80">{margemBaixa.map(r=>`${r.nome} (${r.margem}%)`).join(", ")}</div>
            </div>
          )}
          {semIngrediente.length === 0 && margemBaixa.length === 0 && (
            <div className="rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-center">
              <div className="text-sm font-semibold text-green-700 dark:text-green-400">Tudo certo</div>
              <div className="text-xs text-green-600 dark:text-green-500 mt-0.5 opacity-80">Nenhum alerta no momento</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
