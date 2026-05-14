import { memo } from "react";

const ModalConfirm = memo(function ModalConfirm({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:"#fff",borderRadius:12,padding:24,width:"100%",maxWidth:360,textAlign:"center",border:"1px solid #E5E7EB"}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <svg width="20" height="20" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#111827",marginBottom:6,fontWeight:600}}>Confirmar exclusão</div>
        <div style={{fontSize:13,color:"#6B7280",marginBottom:20,lineHeight:1.6}}>
          Excluir <b style={{color:"#374151"}}>"{item.nome}"</b>?<br/>
          <span style={{fontSize:12,color:"#DC2626"}}>Esta ação não pode ser desfeita.</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:8,border:"1.5px solid #E5E7EB",background:"#fff",color:"#374151",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onCancel}>Cancelar</button>
          <button style={{flex:1,padding:13,borderRadius:8,border:"none",background:"#DC2626",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onConfirm}>Sim, excluir</button>
        </div>
      </div>
    </div>
  );
});

export default ModalConfirm;
