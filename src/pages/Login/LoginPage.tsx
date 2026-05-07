import React, { useCallback, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import { useAuth } from "../../context/AuthContext";
import AnimatedBackground from "../../components/AnimatedBackground";
import LogoCun from "../../assets/images/LogoCunColor.png";

const LoginPage: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from;
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const navigateRole = (user: any) => {
    if (from?.pathname) {
      navigate(from.pathname, { replace: true });
      return;
    }
    const role = (user.role || "").toLowerCase();
    if (role === "leader") navigate("/leader", { replace: true });
    else if (role === "coordinator") navigate("/coordinator", { replace: true });
    else navigate("/admin", { replace: true });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      // #region agent log
      fetch("http://127.0.0.1:7833/ingest/9cc374de-9782-41fb-b06c-07fc5e72b639", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "c5f22d",
        },
        body: JSON.stringify({
          sessionId: "c5f22d",
          hypothesisId: "H8",
          location: "LoginPage.tsx:googleLogin.onSuccess",
          message: "popup oauth success callback",
          data: { hasAccessToken: Boolean(tokenResponse?.access_token) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      try {
        const user = await loginWithGoogle(tokenResponse.access_token);
        navigateRole(user);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo iniciar sesión con Google.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Autenticación con Google cancelada o fallida.");
      setLoading(false);
    },
    flow: "implicit",
    scope: "openid email profile",
  });

  const handleGoogleClick = () => {
    setError(null);
    setLoading(true);
    // #region agent log
    fetch("http://127.0.0.1:7833/ingest/9cc374de-9782-41fb-b06c-07fc5e72b639", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "c5f22d",
      },
      body: JSON.stringify({
        sessionId: "c5f22d",
        hypothesisId: "H8",
        location: "LoginPage.tsx:handleGoogleClick",
        message: "popup oauth requested",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    googleLogin();
  };

  return (
    <div className="min-h-screen w-full bg-[#020308] relative overflow-hidden select-none">
      <AnimatedBackground />

      {/* Login-specific overlays */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 65%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={LogoCun}
              alt="CUN"
              className="w-28 h-auto select-none"
              draggable={false}
            />
          </div>

          {/* Glass Card */}
          <div className="relative group" ref={cardRef} onMouseMove={handleMouseMove}>
            {/* Glow behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-all duration-700" />

            {/* Card */}
            <div
              className="relative bg-[#060B16]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(6,182,212,0.04) 0%, transparent 60%)`,
              }}
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-60" />

              {/* Decorative corner dots */}
              <div className="absolute top-3 left-3 w-1 h-1 rounded-full bg-cyan-400/30" />
              <div className="absolute top-3 right-3 w-1 h-1 rounded-full bg-cyan-400/30" />
              <div className="absolute bottom-3 left-3 w-1 h-1 rounded-full bg-cyan-400/30" />
              <div className="absolute bottom-3 right-3 w-1 h-1 rounded-full bg-cyan-400/30" />

              {/* Title */}
              <div className="text-center mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Facilitadores
                </h1>
                <p className="text-sm text-slate-300">
                  Acceso seguro a la plataforma
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-start gap-2"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className={[
                  "w-full flex items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold",
                  "bg-white hover:bg-gray-50 text-slate-800",
                  "border border-slate-200/80 shadow-sm",
                  "transition-all duration-200 active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-2 focus:ring-offset-[#060B16]",
                  loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
                ].join(" ")}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
                )}
                <span>
                  {loading ? "Conectando..." : "Continuar con Google"}
                </span>
              </button>

              {/* Info text */}
              <p className="mt-3 text-center text-[11px] text-slate-400">
                Usa tu cuenta institucional{" "}
                <span className="text-slate-500">@cun.edu.co</span>
              </p>

              {/* Divider + footer */}
              <div className="mt-6 text-center">
                <div className="h-px w-20 bg-white/[0.06] mx-auto mb-3" />
                <p className="text-[10px] text-slate-500 tracking-wide">
                  Equipo de Desarrollo – Operaciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
