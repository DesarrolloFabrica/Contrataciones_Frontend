import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Mail, ShieldCheck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { BrandPanel, LoginBackground } from "../../components/brand";
import ThemeToggle from "../../components/ThemeToggle";

const devEmailLoginEnabled = import.meta.env.VITE_DEV_EMAIL_LOGIN_ENABLED === "true";

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

function LoadingSpinner({ className = "text-current" }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden>
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

  const navigateRole = (_authUser: { role?: string }) => {
    if (from?.pathname) {
      navigate(from.pathname, { replace: true });
      return;
    }

    navigate("/charlas", { replace: true });
  };

  useEffect(() => {
    if (isReady && user) navigateRole(user);
  }, [isReady, user]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      try {
        const authUser = await loginWithGoogle(tokenResponse.access_token);
        navigateRole(authUser);
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
        setError(
          apiErr?.response?.data?.message ||
            apiErr?.message ||
            "No se pudo iniciar sesión con Google.",
        );
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

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || loading) return;

    setError(null);
    setEmailLoading(true);

    try {
      const authUser = await loginWithEmailOnly(email);
      navigateRole(authUser);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        apiErr?.response?.data?.message ||
          apiErr?.message ||
          "No se pudo iniciar sesión con el correo indicado.",
      );
      setEmailLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-brand-600 dark:bg-brand-950 dark:text-brand-300">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] w-full overflow-x-hidden text-slate-950 selection:bg-brand-200/60 dark:text-white">
      <LoginBackground />

      <div className="absolute right-5 top-5 z-30 sm:right-8 sm:top-7 lg:right-10 lg:top-8">
        <ThemeToggle variant="login" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[1480px] grid-cols-1 items-center gap-8 px-5 py-24 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-12 lg:py-16 xl:gap-14 2xl:px-3">
        <BrandPanel />

        <main className="w-full lg:justify-self-center">
          <div className="mx-auto w-full max-w-[570px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6 flex flex-col items-center text-center lg:hidden"
            >
              <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg"><BriefcaseBusiness className="h-8 w-8" /></span>
              <h1 className="mt-4 text-2xl font-black tracking-[-0.035em] text-slate-950 dark:text-white">
                CHARLAS <span className="text-brand-700 dark:text-[#58bea1]">CUN</span>
              </h1>
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="login-glass-card relative overflow-hidden rounded-[1.8rem] px-6 py-8 sm:px-10 sm:py-10 xl:px-12 xl:py-11"
              aria-labelledby="login-title"
            >
              <div className="login-card-glow pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full blur-3xl" />

              <div className="relative">
                <header className="text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-200/80 bg-brand-100/75 text-brand-800 shadow-[0_12px_30px_-14px_rgba(16,185,129,0.65)] dark:border-[#4d8e80]/35 dark:bg-[#132f34]/70 dark:text-[#79cdb4] dark:shadow-[0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                    <ShieldCheck className="h-8 w-8" strokeWidth={1.8} />
                  </span>
                  <h2
                    id="login-title"
                    className="mt-5 text-[1.75rem] font-black leading-tight tracking-[-0.035em] text-slate-950 dark:text-white sm:text-[2rem]"
                  >
                    Iniciar sesión
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-700 dark:text-slate-200 sm:text-[15px]">
                    Accede con tu cuenta institucional{" "}
                    <span className="font-bold text-brand-700 dark:text-[#58bea1]">@cun.edu.co</span>
                  </p>
                </header>

                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 backdrop-blur-sm dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-300"
                  >
                    {error}
                  </motion.div>
                )}

                {devEmailLoginEnabled && (
                  <>
                    <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
                      <label htmlFor="dev-email" className="sr-only">
                        Correo institucional
                      </label>
                      <div className="login-email-field group relative flex items-center rounded-xl">
                        <Mail className="absolute left-5 h-5 w-5 text-brand-700 transition-colors group-focus-within:text-brand-800 dark:text-[#72c4ae]" strokeWidth={1.8} />
                        <input
                          id="dev-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="nombre.apellido@cun.edu.co"
                          disabled={loading}
                          autoComplete="email"
                          className="h-14 w-full rounded-xl border-0 bg-transparent py-3 pl-14 pr-4 text-[15px] font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white dark:placeholder:text-slate-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="login-primary-button group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-xl px-14 text-[15px] font-extrabold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-80 dark:focus-visible:ring-offset-[#08251d]"
                      >
                        <span className="relative z-10">
                          {emailLoading ? "Ingresando..." : "Ingresar con correo"}
                        </span>
                        <span className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-transform group-hover:translate-x-0.5">
                          {emailLoading ? <LoadingSpinner /> : <ArrowRight className="h-5 w-5" strokeWidth={2.3} />}
                        </span>
                      </button>
                    </form>

                    <div className="my-7 flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <div className="h-px flex-1 bg-slate-400/70 dark:bg-white/15" />
                      <span>o continúa con</span>
                      <div className="h-px flex-1 bg-slate-400/70 dark:bg-white/15" />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className={[
                    devEmailLoginEnabled ? "mt-0" : "mt-8",
                    "login-google-button group flex h-14 w-full items-center justify-center gap-3 rounded-xl px-5 text-[15px] font-extrabold",
                    "transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#08251d]",
                    loading ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  {googleLoading ? <LoadingSpinner className="text-slate-400" /> : <GoogleIcon />}
                  <span>{googleLoading ? "Conectando..." : "Continuar con Google"}</span>
                </button>

                {devEmailLoginEnabled && (
                  <p className="mt-7 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="h-5 w-5 text-brand-700 dark:text-[#58bea1]" strokeWidth={1.8} />
                    Entorno de pruebas · acceso local habilitado
                  </p>
                )}
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
