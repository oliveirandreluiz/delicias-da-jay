const authCard = { background:"#fff", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:380, boxShadow:"0 4px 24px rgba(0,0,0,.08)", border:"1px solid #f3f4f6" };
const authInp = (err) => ({ width:"100%", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${err?"#f87171":"#e5e7eb"}`, background:"#fff", fontSize:14, color:"#111827", outline:"none", boxSizing:"border-box", marginBottom:12, fontFamily:"'DM Sans',sans-serif", transition:"border-color .15s" });

function Spinner({ text }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-3">🍰</div>
        <div className="text-gray-500 text-sm">{text}</div>
        <div style={{width:24,height:24,border:"2px solid #e5e7eb",borderTop:"2px solid #c8566b",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"16px auto 0"}}></div>
      </div>
    </div>
  );
}

export function LoadingScreen() { return <Spinner text="Carregando..."/>; }
export function DataLoadingScreen({ negocioNome }) { return <Spinner text={negocioNome||"Carregando..."}/>; }

export function EmailConfirmScreen({ email, onBack }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div style={authCard} className="text-center">
        <div className="text-5xl mb-4">📧</div>
        <div className="text-xl font-semibold text-gray-800 mb-2">Verifique seu email</div>
        <div className="text-sm text-gray-500 leading-relaxed mb-6">Enviamos um link para<br/><span className="font-medium text-gray-700">{email}</span><br/><br/>Confirme e volte para entrar.</div>
        <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors" onClick={onBack}>← Voltar para o login</button>
      </div>
    </div>
  );
}

export function CadastroScreen({ authForm, authError, authLoading, setAuthForm, setAuthError, setAuthView, fazerCadastro }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div style={authCard}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🍰</div>
          <div className="text-xl font-semibold text-gray-800">Criar conta</div>
          <div className="text-xs text-gray-400 mt-1">Novo negócio</div>
        </div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nome do negócio</label>
        <input style={authInp(!!authError)} type="text" placeholder="Ex: Confeitaria da Jay" value={authForm.nomeNegocio} onChange={e=>{setAuthForm({...authForm,nomeNegocio:e.target.value});setAuthError("");}}/>
        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
        <input style={authInp(!!authError)} type="email" placeholder="seu@email.com" value={authForm.email} onChange={e=>{setAuthForm({...authForm,email:e.target.value});setAuthError("");}}/>
        <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
        <input style={authInp(!!authError)} type="password" placeholder="Mínimo 6 caracteres" value={authForm.senha} onChange={e=>{setAuthForm({...authForm,senha:e.target.value});setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&fazerCadastro()}/>
        {authError && <div className="text-red-400 text-xs mb-3">{authError}</div>}
        <button className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors mb-4" onClick={fazerCadastro} disabled={authLoading}>{authLoading?"Criando conta...":"Criar conta"}</button>
        <div className="text-center"><button className="text-sm text-gray-400 hover:text-gray-600 transition-colors" onClick={()=>{setAuthView("login");setAuthError("");}}>Já tenho conta → Entrar</button></div>
      </div>
    </div>
  );
}

export function LoginScreen({ authForm, authError, authLoading, setAuthForm, setAuthError, setAuthView, fazerLogin }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div style={authCard}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍰</div>
          <div className="text-xl font-semibold text-gray-800">Delícias da Jay</div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Gestão</div>
        </div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
        <input style={authInp(!!authError)} type="email" placeholder="seu@email.com" value={authForm.email} onChange={e=>{setAuthForm({...authForm,email:e.target.value});setAuthError("");}}/>
        <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
        <input style={{...authInp(!!authError),animation:authError?"shake .3s":""}} type="password" placeholder="••••••••" value={authForm.senha} onChange={e=>{setAuthForm({...authForm,senha:e.target.value});setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&fazerLogin()}/>
        {authError && <div className="text-red-400 text-xs mb-3">{authError}</div>}
        <button className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors mb-4" onClick={fazerLogin} disabled={authLoading}>{authLoading?"Entrando...":"Entrar"}</button>
        <div className="text-center"><button className="text-sm text-gray-400 hover:text-gray-600 transition-colors" onClick={()=>{setAuthView("cadastro");setAuthError("");setAuthForm({email:"",senha:"",nomeNegocio:""});}}>Criar novo negócio →</button></div>
      </div>
    </div>
  );
}
