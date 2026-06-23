import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { LoginBackground, BrandPanel, AppLogo } from "../../components/brand";
import ThemeToggle from "../../components/ThemeToggle";

const devEmailLoginEnabled =
  import.meta.env.VITE_DEV_EMAIL_LOGIN_ENABLED === "true";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const LoginPage: React.FC = () => {
  const { user, isReady, loginWithGoogle, loginWithEmailOnly } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };

  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from;
  const loading = googleLoading || emailLoading;

  const navigateRole = (authUser: { role?: string }) => {
    if (from?.pathname) {
      navigate(from.pathname, { replace: true });
      return;
    }
    const role = (authUser.role || "").toLowerCase();
    if (role === "leader") navigate("/leader", { replace: true });
    else if (role === "coordinator") navigate("/coordinator", { replace: true });
    else navigate("/admin", { replace: true });
  };

  useEffect(() => {
    if (isReady && user) {
      navigateRole(user);
    }
  }, [isReady, user]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      try {
        const authUser = await loginWithGoogle(tokenResponse.access_token);
        navigateRole(authUser);
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
        const msg =
          apiErr?.response?.data?.message ||
          apiErr?.message ||
          "No se pudo iniciar sesión con Google.";
        setError(msg);
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Autenticación con Google cancelada o fallida.");
      setGoogleLoading(false);
    },
    flow: "implicit",
    scope: "openid email profile",
  });

  const handleGoogleClick = () => {
    if (loading) return;
    setError(null);
    setGoogleLoading(true);
    googleLogin();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setError(null);
    setEmailLoading(true);

    try {
      const authUser = await loginWithEmailOnly(email);
      navigateRole(authUser);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        "No se pudo iniciar sesión con el correo indicado.";
      setError(msg);
      setEmailLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-brand-950">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-slate-950 selection:bg-brand-200/60 dark:text-white">
      <LoginBackground />

      <div className="absolute right-5 top-5 z-30 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:max-w-5xl">
          <BrandPanel />

          <main className="w-full lg:justify-self-start lg:pl-0 xl:pl-2">
            <div className="mx-auto w-full max-w-[460px] lg:mx-0">
            {/* Mobile branding */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6 flex flex-col items-center lg:hidden"
            >
              <AppLogo variant="login" bare />
            </motion.div>

            {/* Login card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="login-glass-card relative overflow-hidden rounded-[1.75rem] p-7 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-400/10 blur-2xl dark:bg-brand-400/15" />

              <div className="relative">
                <h2 className="text-2xl font-black leading-tight tracking-[-0.03em] text-slate-900 dark:text-white sm:text-[1.65rem]">
                  Iniciar sesión
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Accede con tu cuenta institucional @cun.edu.co
                </p>

                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-5 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 backdrop-blur-sm dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-300"
                  >
                    {error}
                  </motion.div>
                )}

                {devEmailLoginEnabled && (
                  <>
                    <form onSubmit={handleEmailSubmit} className="mt-6 space-y-3">
                      <input
                        id="dev-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre.apellido@cun.edu.co"
                        disabled={loading}
                        autoComplete="email"
                        className="w-full rounded-xl border border-slate-200/90 bg-white/90 px-4 py-3.5 text-sm text-slate-900 outline-none backdrop-blur-sm transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-400/25 dark:bg-white/8 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-brand-400/60 dark:focus:ring-brand-400/15"
                      />
                      <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/15 transition-all duration-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-brand-950"
                      >
                        {emailLoading ? "Ingresando..." : "Ingresar con correo"}
                      </button>
                    </form>

                    <div className="my-5 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-white/10" />
                      <span>o</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-white/10" />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className={[
                    devEmailLoginEnabled ? "mt-0" : "mt-6",
                    "group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white px-5 py-4 text-sm font-bold text-slate-800",
                    "shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all duration-200",
                    "hover:border-brand-300 hover:shadow-[0_8px_28px_rgba(16,185,129,0.14)] active:scale-[0.99]",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:ring-offset-2 dark:border-brand-400/25 dark:bg-white/10 dark:text-white dark:hover:border-brand-400/40 dark:hover:bg-white/14 dark:focus:ring-offset-transparent",
                    loading ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  {googleLoading ? <LoadingSpinner /> : <GoogleIcon />}
                  <span>{googleLoading ? "Conectando..." : "Continuar con Google"}</span>
                </button>

                {devEmailLoginEnabled && (
                  <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
                    Entorno de pruebas · acceso local habilitado
                  </p>
                )}
              </div>
            </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
