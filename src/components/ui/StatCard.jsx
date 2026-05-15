export default function StatCard({ icon, label, value, sub, iconColor, danger }) {
  return (
    <div className={`rounded-xl p-5 border shadow-sm transition-shadow hover:shadow-md ${
      danger
        ? "bg-rose-50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30"
        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-medium ${danger ? "text-rose-500 dark:text-rose-400" : "text-zinc-500 dark:text-zinc-400"}`}>{label}</p>
        {icon && <span style={{ color: iconColor || (danger ? "#fb7185" : "#6366f1") }}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold font-mono tabular-nums ${danger ? "text-rose-500 dark:text-rose-400" : "text-zinc-900 dark:text-zinc-50"}`}>
        {value}
      </div>
      {sub && <p className={`text-xs mt-1 ${danger ? "text-rose-400/70" : "text-zinc-400 dark:text-zinc-500"}`}>{sub}</p>}
    </div>
  );
}
