export default function NavItem({ icon, label, active, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23] hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <span className="shrink-0 flex items-center">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
