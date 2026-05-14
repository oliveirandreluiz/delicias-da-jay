import { calc } from "../utils/calc";
import { pPreco, pEmb } from "../utils/helpers";
import { fmt } from "../utils/formatters";
import s from "../styles/formStyles";

export default function DesktopDetail({ r, produtos, onEdit, onCopy, onDelete }) {
  const { ci, outros, total, porUn, semT, taxa, final: f_, lucro, lucroApp } = calc(r, produtos);
  return (
    <div style={{padding:"28px 32px",animation:"fadein .2s ease"}} className="desk-detail-wrapper">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}} className="no-print">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div>
            <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:700,color:"#111827",lineHeight:1.2}}>{r.nome}</h1>
            <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
              <span style={{background:"#F3F4F6",color:"#374151",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>Rendimento: {r.rendimento} un.</span>
              {r.categoria&&<span style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600}}>{r.categoria}</span>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          <button className="btn-h" style={{padding:"8px 18px",borderRadius:8,border:"1.5px solid #E5E7EB",background:"#fff",color:"#374151",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onEdit}>Editar</button>
          <button className="btn-h" style={{padding:"8px 18px",borderRadius:8,border:"none",background:"#111827",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={()=>window.print()}>Imprimir</button>
        </div>
      </div>
      <div className="desk-detail-grid">
        <div style={{background:"#fff",borderRadius:14,padding:"20px 24px",boxShadow:"0 2px 12px rgba(0,0,0,.06)",border:"1px solid #E5E7EB"}}>
          <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:600,color:"#111827",marginBottom:16}}>Ingredientes e Custos</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:"2px solid #E5E7EB"}}>
                {["Ingrediente","Qtd","Custo Base","Total"].map(h=><th key={h} style={{textAlign:h==="Ingrediente"?"left":"right",padding:"6px 6px 10px",fontSize:11,textTransform:"uppercase",letterSpacing:".05em",color:"#6B7280",fontWeight:600}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {r.ingredientes.map((ing,i)=>{
                const p=produtos.find(x=>x.id===ing.produtoId);
                if(!p)return null;
                const pr=pPreco(p); const eq=pEmb(p);
                return(
                  <tr key={i} style={{borderBottom:"1px solid #F3F4F6"}}>
                    <td style={{padding:"10px 6px 10px 0",color:"#111827",fontWeight:500}}>{p.nome}</td>
                    <td style={{padding:"10px 6px",textAlign:"right",color:"#6B7280"}}>{ing.usadoQtd}{p.unidade}</td>
                    <td style={{padding:"10px 6px",textAlign:"right",color:"#6B7280"}}>{fmt(pr)}/{eq}{p.unidade}</td>
                    <td style={{padding:"10px 0",textAlign:"right",color:"#111827",fontWeight:600}}>{fmt(eq>0?(pr/eq)*ing.usadoQtd:0)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{borderTop:"2px solid #E5E7EB"}}><td colSpan={3} style={{padding:"12px 6px 6px 0",fontWeight:700,color:"#111827"}}>Custo Ingredientes</td><td style={{padding:"12px 0 6px",textAlign:"right",fontWeight:700,color:"#111827"}}>{fmt(ci)}</td></tr>
              <tr><td colSpan={3} style={{padding:"4px 6px 6px 0",color:"#6B7280",fontSize:12}}>Outros custos ({r.outrosCustos||30}%)</td><td style={{padding:"4px 0 6px",textAlign:"right",color:"#6B7280",fontSize:12}}>{fmt(outros)}</td></tr>
              {r.despesas>0&&<tr><td colSpan={3} style={{padding:"4px 6px 6px 0",color:"#6B7280",fontSize:12}}>Despesas extras</td><td style={{padding:"4px 0 6px",textAlign:"right",color:"#6B7280",fontSize:12}}>{fmt(r.despesas)}</td></tr>}
              <tr style={{borderTop:"2px solid #E5E7EB"}}><td colSpan={3} style={{padding:"10px 6px 0 0",fontWeight:700,fontSize:14,color:"#111827"}}>Custo Total</td><td style={{padding:"10px 0 0",textAlign:"right",fontWeight:700,fontSize:14,color:"#111827"}}>{fmt(total)}</td></tr>
            </tfoot>
          </table>
          {r.obs&&<div style={{marginTop:16,paddingTop:14,borderTop:"1px solid #E5E7EB"}}><div style={{fontSize:11,fontWeight:600,color:"#6B7280",textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Observações</div><div style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{r.obs}</div></div>}
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 2px 12px rgba(0,0,0,.06)",border:"1px solid #E5E7EB"}}>
          <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:600,color:"#111827",marginBottom:16}}>Precificação</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div style={s.pb}><div style={s.pl}>Custo/Un</div><div style={{...s.pv,fontSize:15}}>{fmt(porUn)}</div></div>
            <div style={s.pb}><div style={s.pl}>Margem</div><div style={{...s.pv,fontSize:15}}>{r.margem}%</div></div>
            <div style={s.pb}><div style={s.pl}>Preço s/ Taxa</div><div style={{...s.pv,fontSize:15}}>{fmt(semT)}</div></div>
            <div style={s.pb}><div style={s.pl}>Taxa ({r.taxaDelivery}%)</div><div style={{...s.pv,fontSize:15}}>{fmt(taxa)}</div></div>
          </div>
          <div style={{background:"#111827",borderRadius:12,padding:"16px",color:"#fff",marginBottom:8,textAlign:"center"}}>
            <div style={{fontSize:11,opacity:.7,marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Preço Sugerido</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:28,fontWeight:700}}>{fmt(f_)}</div>
            <div style={{fontSize:11,opacity:.6,marginTop:2}}>por unidade</div>
          </div>
          <div style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#92400E",marginBottom:4}}>Lucro Estimado</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:"#92400E"}}>{fmt(lucro)}</div>
            <div style={{fontSize:10,color:"#92400E88",marginTop:2}}>p/ {r.rendimento} un.</div>
          </div>
          {r.precoApp>0&&<>
            <div style={{background:"#F0FFF4",border:"1.5px solid #86EFAC",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#166534",marginBottom:4}}>Preço App</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:"#166534"}}>{fmt(r.precoApp)}</div>
            </div>
            {lucroApp!==null&&<div style={{background:"#F0FFF4",border:"1.5px solid #86EFAC",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#166534",marginBottom:4}}>Lucro App</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:"#166534"}}>{fmt(lucroApp)}</div>
            </div>}
          </>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16}} className="no-print">
        <button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:"1.5px solid #E5E7EB",background:"#fff",color:"#374151",fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onCopy}>Copiar</button>
        <button className="btn-h" style={{padding:"9px 16px",borderRadius:8,border:"1.5px solid #FCA5A5",background:"#fff",color:"#DC2626",fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}} onClick={onDelete}>Excluir</button>
      </div>
    </div>
  );
}
