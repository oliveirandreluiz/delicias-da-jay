import { supabase } from "../lib/supabase";

export async function login(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
  if (error) throw new Error("Email ou senha incorretos");
}

export async function cadastrar(email, senha, nomeNegocio) {
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password: senha,
    options: { data: { nome_negocio: nomeNegocio.trim() } },
  });
  if (error) throw new Error(error.message);
}

export async function logout() {
  try { await supabase.auth.signOut({ scope: "local" }); } catch (_) {}
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("sb-") || k.includes("delicias-jay-auth")) localStorage.removeItem(k);
    });
  } catch (_) {}
}

export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}
