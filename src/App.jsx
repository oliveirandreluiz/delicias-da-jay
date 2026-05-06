import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT ───────────────────────────────────────────────────────
const SUPA_URL  = import.meta.env.VITE_SUPA_URL;
const SUPA_ANON = import.meta.env.VITE_SUPA_ANON;
const supabase  = createClient(SUPA_URL, SUPA_ANON, {
  auth: {
    persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
    storage: window.localStorage, storageKey: "delicias-jay-auth",
    lock: async (_n, _t, fn) => await fn(),
  },
});

// ─── CONSTANTES ────────────────────────────────────────────────────────────
const SEED_RECIPES = [];
const CAT_R  = ["Brownies","Docinhos","Copo da Felicidade","Bolo no Pote","Cones Trufados","Salgados","Outro"];
const CAT_P  = ["Secos","Laticínios","Chocolates","Embalagens","Outros"];
const UNIDS  = ["g","kg","ml","L","un","colher","xícara"];
const EMOJIS = ["🍫","🧁","🎂","🍰","🍬","🍮","🥧","🍩","🍪","🥐","🫙","🌋","🍇","🌽","🧇","🥮","🍭","☕","🌮","🥚","🧀"];
const CATEMOJI = {"Secos":"🌾","Laticínios":"🥛","Chocolates":"🍫","Embalagens":"📦","Outros":"🛒"};
const FORMAS_PAG = ["Pix","Cartão débito","Cartão crédito","Dinheiro","Boleto"];

// ─── HELPERS ───────────────────────────────────────────────────────────────
const fmt  = v => "R$ " + (parseFloat(v)||0).toFixed(2).replace(".",",");
const fmtN = v => (parseFloat(v)||0).toFixed(2).replace(".",",");
const genId = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).slice(2);
const pPreco = p => p.preco_ultimo !== undefined ? p.preco_ultimo : p.preco;
const pEmb   = p => p.embalagem_qtd !== undefined ? p.embalagem_qtd : p.embalagemQtd;

function calc(r, prods) {
  const ci = r.ingredientes.reduce((s,i) => {
    const p = prods.find(x => x.id === i.produtoId);
    if (!p) return s;
    const eq = pEmb(p);
    return eq > 0 ? s + (pPreco(p) / eq) * i.usadoQtd : s;
  }, 0);
  const pctOutros = (r.outrosCustos !== undefined ? r.outrosCustos : 30) / 100;
  const outros = ci * pctOutros;
  const total  = ci + outros + (r.despesas||0);
  const porUn  = r.rendimento > 0 ? total / r.rendimento : 0;
  const semT   = porUn * (1 + (r.margem||100) / 100);
  const tp     = (r.taxaDelivery||30) / 100;
  const final_ = tp < 1 ? semT / (1 - tp) : semT;
  const taxa   = final_ - semT;
  const lucro    = (final_ - taxa - porUn) * r.rendimento;
  const lucroApp = r.precoApp > 0 ? (r.precoApp - (r.precoApp * tp) - porUn) * r.rendimento : null;
  return { ci, outros, total, porUn, semT, taxa, final: final_, lucro, lucroApp };
}

// ─── CORES ─────────────────────────────────────────────────────────────────
const V="#4A1A2C", R="#C45C74", RL="#E8899A", RC="#F5D0D8", CR="#FFF0F3", G="#7A4A58", W="#fff";

// ─── ESTILOS ───────────────────────────────────────────────────────────────
const s = {
  app:{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:CR,fontFamily:"'DM Sans',sans-serif",color:V},
  hdr:{background:V,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100},
  logo:{fontFamily:"'Playfair Display',serif",color:RL,fontSize:17,lineHeight:1.2},
  lsub:{color:"#D4748866",fontSize:10,letterSpacing:".1em",textTransform:"uppercase"},
  bpri:{background:R,color:W,border:"none",borderRadius:50,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  bback:{background:"rgba(255,255,255,.12)",border:"none",color:W,borderRadius:50,padding:"7px 14px",fontSize:13,cursor:"pointer"},
  tabs:{display:"flex",borderBottom:`2px solid ${RC}`,background:W},
  tab:{flex:1,padding:"12px 8px",border:"none",background:"none",fontSize:12,fontWeight:600,color:`${G}88`,cursor:"pointer",borderBottom:"3px solid transparent",marginBottom:"-2px",fontFamily:"'DM Sans',sans-serif"},
  taba:{color:R,borderBottomColor:R},
  srchW:{margin:"12px 14px 0",position:"relative",display:"block"},
  srch:{width:"100%",padding:"10px 14px 10px 38px",borderRadius:50,border:`2px solid ${RC}`,background:CR,fontSize:13,color:V,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",display:"block"},
  chips:{display:"flex",gap:8,padding:"10px 14px