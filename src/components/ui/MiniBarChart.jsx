export default function MiniBarChart({ data, color = "#6366f1", height = 110 }) {
  if (!data || data.length === 0) return <div style={{textAlign:"center",padding:20,color:"#6B7280",fontSize:12}}>Sem dados</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(24, Math.floor(260 / data.length));
  const gap = 4;
  const totalW = data.length * (barW + gap);
  return (
    <div style={{overflowX:"auto",scrollbarWidth:"none"}}>
      <svg width={totalW} height={height + 24} style={{display:"block"}}>
        {data.map((d, i) => {
          const h = (d.value / max) * height;
          const x = i * (barW + gap);
          return (
            <g key={i}>
              <rect x={x} y={height - h} width={barW} height={h} rx={4} fill={color} opacity={0.85} />
              <text x={x + barW / 2} y={height - h - 4} textAnchor="middle" fontSize={9} fontWeight={600} fill="#374151">
                {d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value > 0 ? d.value : ""}
              </text>
              <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize={9} fill="#6B7280">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
