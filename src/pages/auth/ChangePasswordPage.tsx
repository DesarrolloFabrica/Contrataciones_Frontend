import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;

  // ✅ ahora usamos updateUser
  const { user, logout, updateUser } = useAuth();

  const email = useMemo(() => {
    return location?.state?.email || user?.email || "";
  }, [location?.state?.email, user?.email]);

  // opcional (volver a ruta protegida)
  const from = location?.state?.from;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getDefaultRedirectByRole = () => {
    const role = user?.role; // "admin" | "coordinator" | "leader"
    if (role === "leader") return "/leader";
    if (role === "coordinator") return "/coordinator";
    return "/admin";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    if (!currentPassword || !newPassword || !confirm) {
      setError("Completa todos los campos.");
      return;
    }
    if (newPassword !== confirm) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Llama al backend: /auth/change-password
      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      // ✅ IMPORTANTE: apagar el flag en el contexto + localStorage
      updateUser({ mustResetPassword: false });

      setOkMsg("Contraseña actualizada. Redirigiendo...");

      // ✅ Volver a where-you-came-from o a consola por rol
      const redirect =
        (from?.pathname as string | undefined) || getDefaultRedirectByRole();

      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 600);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo actualizar la contraseña.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-xl">
        <h1 className="text-xl font-extrabold text-gray-900">
          Cambiar contraseña
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Usuario: <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl bg-gray-200/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl bg-gray-200/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />

          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl bg-gray-200/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#91DC00] to-[#31AB2E] disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Actualizar"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {okMsg && <p className="text-sm text-emerald-700">{okMsg}</p>}

          <button
            type="button"
            onClick={() => {
              // Si cancela, mejor salir del sistema
              logout();
              navigate("/login", { replace: true });
            }}
            className="w-full rounded-xl py-3 text-sm font-semibold text-gray-700 border border-gray-200 mt-2"
          >
            Cancelar (cerrar sesión)
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
