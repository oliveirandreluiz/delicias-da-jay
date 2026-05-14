import { useState, useEffect } from "react";
import { fmt } from "../../utils/formatters";
import s from "../../styles/formStyles";

export default function ConfigForm({ config, saving, onSaved, toast_ }) {
  const [f, setF] = useState({ custo_gas:"", custo_energia:"", custo_agua:"", custo_internet:"", custo_mei:"", custo_transporte:"", custo_outros:"", faturamento_mensal:"", margem_padrao:"100", canais_venda:[] });
  useEffect(() => {
    if (config) setF({
      custo_gas: String(config.custo_gas ?? "0"), custo_energia: String(config.custo_energia ?? "0"),
      custo_agua: String(config.custo_agua ?? "0"), custo_internet: String(config.custo_internet ?? "0"),
      custo_mei: String(config.custo_mei ?? "0"), custo_transporte: String(config.custo_transporte ?? "0"),
      custo_outros: String(config.custo_outros ?? "0"), faturamento_mensal: String(config.faturamento_mensal ?? "0"),
      margem_padrao: String(config.margem_padrao ?? "100"),
      canais_venda: config.canais_venda || [{"nome":"Balcão","taxa":0},{"nome":"iFood","taxa":30},{"nome":"Cartão crédito","taxa":3.5},{"nome":"Cartão débito","taxa":1.5},{"nome":"Pix","taxa":0}],
    });
  }, [config?.id]);
  const handleChange = (field, val) => setF(p => ({ ...p, [field]: val }));
  const handleCanalChange = (idx, field, val) => setF(p => { const c=[...p.canais_venda]; c[idx]={...c[idx],[field]:field==="taxa"?parseFloat(val)||0:val}; return {...p, canais_venda:c}; });
  const addCanal = () => setF(p => ({...p, canais_venda:[...p.canais_venda, {nome:"",taxa:0}]}));
  const removeCanal = idx => setF(p => ({...p, canais_venda:p.canais_venda.filter((_,i)=>i!==idx)}));

  const totalFixo = ["custo_gas","custo_energia","custo_agua","custo_internet","custo_mei","custo_transporte","custo_outros"].reduce((s,k) => s + (parseFloat(f[k])||0), 0);
  const fat = parseFloat(f.faturamento_mensal)||0;
  const pctFixo = fat > 0 ? (totalFixo / fat) * 100 : 0;

  const handleSave = () => {
    const payload = {
      custo_gas: parseFloat(f.custo_gas)||0, custo_energia: parseFloat(f.custo_energia)||0,
      custo_agua: parseFloat(f.custo_agua)||0, custo_internet: parseFloat(f.custo_internet)||0,
      custo_mei: parseFloat(f.custo_mei)||0, custo_transporte: parseFloat(f.custo_transporte)||0,
      custo_outros: parseFloat(f.custo_outros)||0, faturamento_mensal: parseFloat(f.faturamento_mensal)||0,
      margem_padrao: parseFloat(f.margem_padrao)||100,
      canais_venda: f.canais_venda.filter(c => c.nome.trim()),
    };
    onSaved(payload);
  };

  const custos = [
    {key:"custo_gas",label:"Gás",icon:"🔥",placeholder:"60.00"},
    {key:"custo_energia",label:"Energia elétrica",icon:"💡",placeholder:"150.00"},
    {key:"custo_agua",label:"Água",icon:"💧",placeholder:"40.00"},
    {key:"custo_internet",label:"Internet / Celular",icon:"📱",placeholder:"50.00"},
    {key:"custo_mei",label:"MEI / DAS (imposto)",icon:"📋",placeholder:"72.00"},
    {key:"custo_transporte",label:"Transporte / Gasolina",icon:"🚗",placeholder:"0.00"},
    {key:"custo_outros",label:"Outros (limpeza, manut.)",icon:"📦",placeholder:"30.00"},
  ];

  return (
    <>
      <div style={s.sec}>
        <div style={s.st}>Custos Fixos Mensais</div>
        <div style={s.help}>Informe a <b>média mensal</b> de cada gasto. Dica: soma as 3 últimas contas e divide por 3. Atualize a cada 3-6 meses.</div>
        {custos.map(c => (
          <div key={c.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:16,width:24,textAlign:"center"}}>{c.icon}</span>
            <label style={{fontSize:12,color:"#374151",fontWeight:500,width:160,flexShrink:0}}>{c.label}</label>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#6B7280"}}>R$</span>
              <input style={{...s.inp,marginBottom:0,paddingLeft:36,textAlign:"right"}} type="number" step="0.01" placeholder={c.placeholder} value={f[c.key]} onChange={e => handleChange(c.key, e.target.value)}/>
            </div>
          </div>
        ))}
        <div style={{background:"#111827",borderRadius:12,padding:"14px 16px",color:"#fff",margin:"12px 0"}}>
          <div style={{fontSize:11,opacity:.7,marginBottom:3}}>Total fixo mensal</div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:24,fontWeight:700}}>{fmt(totalFixo)}</div>
        </div>
      </div>
      <div style={s.sec}>
        <div style={s.st}>Faturamento Mensal</div>
        <div style={s.help}>Quanto você fatura por mês em média? Pode ser uma estimativa. Isso calcula o % real dos custos fixos.</div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#6B7280"}}>R$</span>
          <input style={{...s.inp,paddingLeft:36,textAlign:"right",fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:700,color:"#111827"}} type="number" step="0.01" placeholder="3500.00" value={f.faturamento_mensal} onChange={e => handleChange("faturamento_mensal", e.target.value)}/>
        </div>
        {fat > 0 && (
          <div style={{background:pctFixo > 30 ? "#FFEBEE" : pctFixo > 20 ? "#FFF3CD" : "#E8F5E9", border:`1.5px solid ${pctFixo > 30 ? "#EF9A9A" : pctFixo > 20 ? "#FFC107" : "#81C784"}`, borderRadius:12, padding:"14px 16px", textAlign:"center"}}>
            <div style={{fontSize:11,color:pctFixo>30?"#C62828":pctFixo>20?"#856404":"#2E7D32",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Seus custos fixos representam</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:700,color:pctFixo>30?"#C62828":pctFixo>20?"#856404":"#2E7D32"}}>{pctFixo.toFixed(1)}%</div>
            <div style={{fontSize:11,color:"#6B7280",marginTop:4}}>do faturamento ({fmt(totalFixo)} ÷ {fmt(fat)})</div>
          </div>
        )}
      </div>
      <div style={s.sec}>
        <div style={s.st}>Canais de Venda</div>
        <div style={s.help}>Configure as taxas de cada canal. O iFood geralmente cobra ~30%, cartão crédito ~3.5%, Pix 0%.</div>
        {f.canais_venda.map((ch, idx) => (
          <div key={idx} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
            <input style={{...s.inp,marginBottom:0,flex:1}} placeholder="Nome do canal" value={ch.nome} onChange={e => handleCanalChange(idx,"nome",e.target.value)}/>
            <div style={{position:"relative",width:90}}>
              <input style={{...s.inp,marginBottom:0,textAlign:"right",paddingRight:28}} type="number" step="0.1" placeholder="30" value={ch.taxa} onChange={e => handleCanalChange(idx,"taxa",e.target.value)}/>
              <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#6B7280"}}>%</span>
            </div>
            <button style={{background:"none",border:"none",color:"#DC2626",fontSize:14,cursor:"pointer",flexShrink:0}} onClick={() => removeCanal(idx)}>✕</button>
          </div>
        ))}
        <button style={s.badd} onClick={addCanal}>+ Adicionar canal</button>
      </div>
      <div className="drawer-actions">
        <button style={s.bsave} onClick={handleSave}>{saving ? "Salvando..." : "Salvar Configuração"}</button>
      </div>
    </>
  );
}
