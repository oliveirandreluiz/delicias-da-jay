import { calc } from "../utils/calc";
import { pPreco, pEmb } from "../utils/helpers";
import { fmt } from "../utils/formatters";
import { Pencil, Printer, Copy, Trash2 } from "lucide-react";

export default function DesktopDetail({ r, produtos, onEdit, onCopy, onDelete }) {
  const { ci, outros, total, porUn, semT, taxa, final: f_, lucro, lucroApp } = calc(r, produtos);

  const margem = r.margem || 0;
  const margemCls = margem >= 80
    ? "text-emerald-600 dark:text-emerald-400"
    : margem >= 50
    ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="p-6 md:p-8" style={{animation:"fadein .2s ease"}}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 no-print">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {r.emoji && <span className="text-3xl">{r.emoji}</span>}
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50">{r.nome}</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full px-3 py-0.5 text-xs font-semibold">
              Rendimento: {r.rendimento} un.
            </span>
            {r.categoria && (
              <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-full px-3 py-0.5 text-xs font-semibold">
                {r.categoria}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <Pencil size={14}/>
            Editar
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            <Printer size={14}/>
            Imprimir
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="desk-detail-grid grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        {/* Left: Ingredients table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ingredientes e Custos</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950/30 text-[11px] text-zinc-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Ingrediente</th>
                <th className="px-5 py-3 font-semibold text-right hidden sm:table-cell">Qtd</th>
                <th className="px-5 py-3 font-semibold text-right hidden sm:table-cell">Custo Base</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm">
              {r.ingredientes.map((ing, i) => {
                const p = produtos.find(x => x.id === ing.produtoId);
                if (!p) return null;
                const pr = pPreco(p);
                const eq = pEmb(p);
                return (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-zinc-800 dark:text-zinc-200">{p.nome}</td>
                    <td className="px-5 py-3 text-right text-zinc-500 dark:text-zinc-400 font-mono tabular-nums hidden sm:table-cell">{ing.usadoQtd}{p.unidade}</td>
                    <td className="px-5 py-3 text-right text-zinc-500 dark:text-zinc-400 font-mono tabular-nums hidden sm:table-cell">{fmt(pr)}/{eq}{p.unidade}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums font-semibold text-zinc-700 dark:text-zinc-200">{fmt(eq > 0 ? (pr / eq) * ing.usadoQtd : 0)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="text-sm">
              <tr className="border-t-2 border-zinc-200 dark:border-zinc-700">
                <td colSpan={3} className="px-5 py-3 font-bold text-zinc-900 dark:text-zinc-50">Custo Ingredientes</td>
                <td className="px-5 py-3 text-right font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">{fmt(ci)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-5 py-2 text-xs text-zinc-500 dark:text-zinc-400">Outros custos ({r.outrosCustos || 30}%)</td>
                <td className="px-5 py-2 text-right text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">{fmt(outros)}</td>
              </tr>
              {r.despesas > 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-2 text-xs text-zinc-500 dark:text-zinc-400">Despesas extras</td>
                  <td className="px-5 py-2 text-right text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">{fmt(r.despesas)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-zinc-200 dark:border-zinc-700">
                <td colSpan={3} className="px-5 pt-3 pb-4 font-bold text-zinc-900 dark:text-zinc-50">Custo Total</td>
                <td className="px-5 pt-3 pb-4 text-right font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">{fmt(total)}</td>
              </tr>
            </tfoot>
          </table>
          {r.obs && (
            <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Observações</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{r.obs}</p>
            </div>
          )}
        </div>

        {/* Right: Pricing summary — sticky on desktop */}
        <div className="space-y-3 lg:sticky lg:top-6">

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Custo/Un", value: fmt(porUn) },
              { label: "Margem", value: `${margem}%`, extra: margemCls },
              { label: "Preço s/ Taxa", value: fmt(semT) },
              { label: `Taxa (${r.taxaDelivery}%)`, value: fmt(taxa) },
            ].map(({ label, value, extra }) => (
              <div key={label} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-center">
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
                <p className={`text-sm font-bold font-mono tabular-nums ${extra || "text-zinc-900 dark:text-zinc-50"}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 dark:bg-zinc-100 rounded-xl p-4 text-center">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Preço Sugerido</p>
            <p className="text-3xl font-bold font-mono tabular-nums text-white dark:text-zinc-900">{fmt(f_)}</p>
            <p className="text-xs text-zinc-500 mt-1">por unidade</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Lucro Estimado</p>
            <p className="text-xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400">{fmt(lucro)}</p>
            <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70 mt-1">p/ {r.rendimento} un.</p>
          </div>

          {r.precoApp > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Preço App</p>
              <p className="text-xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">{fmt(r.precoApp)}</p>
              {lucroApp !== null && (
                <>
                  <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 mt-3">Lucro App</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">{fmt(lucroApp)}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3 mt-6 no-print">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <Copy size={14}/>
          Copiar
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 size={14}/>
          Excluir
        </button>
      </div>
    </div>
  );
}
