export default function ResponsiveDrawer({ title, onClose, children }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>{title}</h2>
          <button
            onClick={onClose}
            style={{background:"none",border:"none",cursor:"pointer",padding:8,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,color:"#6B7280"}}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
}
