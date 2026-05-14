export default function StatCard({ icon, label, value, sub, iconBg = "#f3f4f6", iconColor = "#6b7280" }) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div style={{width:36,height:36,borderRadius:8,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",color:iconColor,flexShrink:0}}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}
