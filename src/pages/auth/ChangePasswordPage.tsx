// src/pages/ChangePasswordPage.tsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { authService } from "../../services/authService";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { user, logout, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const email = useMemo(() => {
    return location?.state?.email || user?.email || "";
  }, [location?.state?.email, user?.email]);

  const from = location?.state?.from;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ✅ detalles sutiles: “ojito”
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getDefaultRedirectByRole = () => {
    const role = user?.role;
    if (role === "leader") return "/leader";
    if (role === "coordinator") return "/coordinator";
    return "/admin";
  };

  // ✅ detalle sutil: barra de seguridad para la nueva contraseña
  const strength = useMemo(() => {
    const p = newPassword || "";
    const hasLen = p.length >= 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNum = /\d/.test(p);
    const hasSym = /[^A-Za-z0-9]/.test(p);

    const score = [hasLen, hasUpper, hasLower, hasNum, hasSym].filter(Boolean).length; // 0..5
    let label = "Débil";
    if (score >= 4) label = "Fuerte";
    else if (score >= 3) label = "Media";

    const pct = score <= 1 ? 20 : score === 2 ? 40 : score === 3 ? 65 : score === 4 ? 85 : 100;

    return { score, label, pct };
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    if (!currentPassword || !newPassword || !confirm) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      updateUser({ mustResetPassword: false });
      setOkMsg("Contraseña actualizada correctamente.");

      const redirect =
        (from?.pathname as string | undefined) || getDefaultRedirectByRole();

      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al actualizar la contraseña.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={[
        "min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans",
        isDark ? "bg-[#020202]" : "bg-gray-50",
      ].join(" ")}
    >
      {/* --- BACKGROUND FX --- */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        </>
      )}

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Seguridad de la Cuenta
            </h1>
            <p className="text-sm text-neutral-400">
              Es necesario actualizar tu contraseña para continuar como <br />
              <span className="text-emerald-400 font-medium font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mt-1 inline-block">
                {email}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input: Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">
                Contraseña Actual
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>

                {/* ✅ ojito */}
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-200 transition-colors"
                  aria-label={showCurrent ? "Ocultar contraseña" : "Ver contraseña"}
                  tabIndex={-1}
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#111] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="h-px bg-white/5 my-2"></div>

            {/* Input: New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">
                Nueva Contraseña
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>

                {/* ✅ ojito */}
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-200 transition-colors"
                  aria-label={showNew ? "Ocultar contraseña" : "Ver contraseña"}
                  tabIndex={-1}
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#111] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>

              {/* ✅ barra de seguridad (sutil y compacta) */}
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="h-1.5 w-32 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400/80 transition-all duration-300"
                    style={{ width: newPassword ? `${strength.pct}%` : "0%" }}
                  />
                </div>
                <span className="text-[11px] text-neutral-500">
                  {newPassword ? (
                    <>
                      Fortaleza:{" "}
                      <span className="text-neutral-300 font-semibold">
                        {strength.label}
                      </span>
                    </>
                  ) : (
                    "Fortaleza: —"
                  )}
                </span>
              </div>
            </div>

            {/* Input: Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">
                Confirmar Nueva
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>

                {/* ✅ ojito */}
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-200 transition-colors"
                  aria-label={showConfirm ? "Ocultar contraseña" : "Ver contraseña"}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#111] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />
              </div>

              {/* ✅ hint sutil si no coincide */}
              {confirm.length > 0 && confirm !== newPassword && (
                <p className="text-[11px] text-rose-300/80 ml-1">
                  Las contraseñas no coinciden.
                </p>
              )}
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {okMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {okMsg}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-black bg-white hover:bg-neutral-200 transition-all disabled:opacity-50 overflow-hidden shadow-lg shadow-white/5"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Actualizar Acceso
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium text-neutral-500 hover:text-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cancelar y Cerrar Sesión
              </button>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-[10px] text-neutral-600 mt-6 uppercase tracking-widest">
          Sistema de Gestión de Talento Seguro
        </p>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
