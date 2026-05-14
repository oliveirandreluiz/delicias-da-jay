const GLOBAL_CSS = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#F9FAFB;font-family:'Inter',system-ui,sans-serif;}
  input,select,textarea{color:#111827!important;-webkit-text-fill-color:#111827!important;}
  input:focus,select:focus,textarea:focus{border-color:#6B7280!important;background:#fff!important;}
  input::placeholder{color:#9CA3AF!important;-webkit-text-fill-color:#9CA3AF!important;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  .card-h:hover{background:#F3F4F6!important;cursor:pointer;}
  .card-hl:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)!important;transform:translateY(-1px);cursor:pointer;}
  .btn-h:hover{opacity:.85;cursor:pointer;}
  .ch:hover{border-color:#9CA3AF!important;transform:translateY(-1px);}
  .po:hover{background:#F9FAFB!important;}

  /* ── RESPONSIVE DRAWER CSS ── */
  @media(max-width:767px){
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; flex-direction: column; }
    .drawer-container { width: 100%; min-height: 100vh; background: #ffffff; display: flex; flex-direction: column; overflow-y: auto; }
    .drawer-header { background: #ffffff; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #E5E7EB; flex-shrink: 0; }
    .drawer-header h2 { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: #111827; margin: 0; }
    .drawer-body { padding: 16px 16px 100px; flex: 1; background: #F9FAFB; }
    .drawer-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
  }

  @media(min-width:768px){
    .desk-grid{display:grid!important;grid-template-columns:280px 1fr;height:100vh;overflow:hidden;}
    .desk-main{background:#F9FAFB;overflow-y:auto;display:flex;flex-direction:column;}

    /* Drawer Desktop */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; justify-content: flex-end; backdrop-filter: blur(2px); overflow: hidden; }
    .drawer-container { width: 500px; height: 100vh; background: #ffffff; box-shadow: -4px 0 24px rgba(0,0,0,0.15); animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: flex; flex-direction: column; overflow: hidden; }
    .drawer-header { padding: 20px 24px; background: #ffffff; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .drawer-header h2 { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 600; color: #111827; margin: 0; }
    .drawer-body { padding: 24px; overflow-y: auto; flex: 1; background: #F9FAFB; }
    @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }

    /* Forms Desktop Inputs */
    .desk-row { display: flex; gap: 12px; }
    .desk-row > div { flex: 1; min-width: 0; }
    .drawer-actions { display: flex; flex-direction: row-reverse; justify-content: flex-start; gap: 10px; margin-top: 24px; border-top: 1px solid #E5E7EB; padding-top: 16px; }
    .drawer-actions button { width: auto!important; padding: 12px 24px!important; border-radius: 8px!important; margin-top: 0!important; }
  }

  /* ── PRINT CSS OTIMIZADO ── */
  @media print {
    .no-print, .desk-side, header, .tabs, .drawer-overlay, button, .sync, .tst {
      display: none !important;
    }
    .print-only { display: block !important; }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body, .app, #root {
      background: #fff !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .desk-grid {
      display: block !important;
      height: auto !important;
      overflow: visible !important;
    }

    .desk-main {
      overflow: visible !important;
      background: #fff !important;
      padding: 0 !important;
      height: auto !important;
    }

    .desk-detail-grid {
      display: grid !important;
      grid-template-columns: 1fr 280px !important;
      gap: 20px !important;
      align-items: start !important;
      break-inside: avoid;
    }

    .desk-detail-grid > div {
      box-shadow: none !important;
      border: 1px solid #E5E7EB !important;
      break-inside: avoid;
    }
  }
`;

export default GLOBAL_CSS;
