import { X } from "lucide-react";

export default function ResponsiveDrawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
      <div
        className="absolute right-0 top-0 h-full w-full sm:max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
        style={{animation:"slideLeft .3s cubic-bezier(0.16,1,0.3,1)"}}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18}/>
          </button>
        </div>
        <div className="drawer-body flex-1 overflow-y-auto px-6 py-5 bg-zinc-50 dark:bg-zinc-950">
          {children}
        </div>
      </div>
    </div>
  );
}
