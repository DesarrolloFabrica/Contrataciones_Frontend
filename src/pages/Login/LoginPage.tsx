// src/pages/Login/LoginPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

import LogoCun from "../../assets/images/LogoCunColor.png";
import LogoCun2 from "../../assets/images/LogoCUN.png";
import Enciendete from "../../assets/images/Enciendete.png";
import BGVideo from "../../assets/videos/Op2_1.mp4";

const inputBase =
  "w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm " +
  "border border-gray-200 shadow-sm " +
  "placeholder:text-gray-400 text-gray-900 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 " +
  "transition";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); //visualizar clave

  // ✅ Guardamos el objeto completo (pathname, state, etc.)
  const from = location.state?.from;

  const canSubmit = useMemo(() => {
    return !!email.trim() && !!password && !loading;
  }, [email, password, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const user = await login(email.trim(), password);

      // ✅ 1) Forzar reset si aplica
      if (user?.mustResetPassword) {
        navigate("/change-password", {
          replace: true,
          state: { email: user.email, from },
        });
        return;
      }

      // ✅ 2) Si venía de una ruta protegida, devolvemos ahí
      if (from?.pathname) {
        navigate(from.pathname, { replace: true });
        return;
      }

      // ✅ 3) Navegación por rol UI (minúscula)
      const role = (user.role || "").toLowerCase();

      if (role === "leader") {
        navigate("/leader", { replace: true });
      } else if (role === "coordinator") {
        navigate("/coordinator", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (err: any) {
      console.error("Error en login:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo iniciar sesión. Verifica tu correo y contraseña.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={[
        "min-h-screen w-full",
        isDark ? "bg-black" : "bg-gray-50",
      ].join(" ")}
    >
      <div className="relative grid h-screen grid-cols-1 lg:grid-cols-[30%_70%]">
        {/* Panel izquierdo */}
        <div className="relative z-10 bg-white text-gray-900 lg:border-r lg:border-gray-100 lg:shadow-[8px_0_30px_rgba(0,0,0,0.08)]">
          <div className="h-full flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
              <div className="flex flex-col items-center text-center mb-12">
                <img
                  src={LogoCun}
                  alt="Logo CUN"
                  className="w-24 h-auto mb-1 select-none"
                  draggable={false}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Acceso a consolas por rol
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="ejemplo@cun.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={!!error}
                  className={inputBase}
                />

                {/* Password con toggle */}
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    className={`${inputBase} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                    aria-label={
                      showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={[
                    "w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-widest text-white",
                    "bg-gradient-to-r from-[#91DC00] to-[#31AB2E]",
                    "transition active:scale-[0.99]",
                    canSubmit
                      ? "hover:brightness-105"
                      : "opacity-70 cursor-not-allowed",
                  ].join(" ")}
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ingresando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>
              {/* Sello equipo (sutil e institucional) */}
              <div className="mt-6 flex flex-col items-center">
                <div className="h-px w-24 bg-gray-200" />
                <p className="mt-3 text-[10px] text-gray-400 text-center tracking-wide">
                  Equipo de Desarrollo – Operaciones
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="relative hidden lg:block">
          {/* Video */}
          <video
            src={BGVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Difuminado lateral hacia el panel blanco */}
          <div
            className="absolute inset-y-0 left-0 w-16 pointer-events-none
      bg-gradient-to-r from-white/80 via-white/25 to-transparent"
          />

          {/* Overlay radial oscuro */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
        radial-gradient(
          ellipse at center,
          rgba(0,0,0,0.10) 0%,
          rgba(0,0,0,0.45) 70%,
          rgba(0,0,0,0.75) 100%
        )
      `,
            }}
          />

          {/* Logos inferiores */}
          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-6 px-6">
            <img
              src={Enciendete}
              alt="Enciéndete"
              className="h-[140px] object-contain select-none"
              draggable={false}
            />

            <img
              src={LogoCun2}
              alt="CUN"
              className="ml-auto mt-10 h-[70px] object-contain opacity-90 select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
