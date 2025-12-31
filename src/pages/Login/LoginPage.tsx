import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import BGImg from "../../assets/images/Gemini_Generated_Image_wsary2wsary2wsar (1).png";
import LogoCun from "../../assets/images/LogoCunColor.png";
import LogoCun2 from "../../assets/images/LogoCUN.png";
import Enciendete from "../../assets/images/Enciendete.png";
import BGVideo from "../../assets/videos/Op2_1.mp4";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ✅ Guardamos el objeto completo (pathname, state, etc.)
  const from = location.state?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) return;

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
    }
  };

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="relative grid h-screen grid-cols-1 lg:grid-cols-[30%_70%]">
        <div className="relative z-10 bg-white text-gray-900">
          <div className="h-full flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
              <div className="flex flex-col items-center text-center mb-10">
                <img
                  src={LogoCun}
                  alt="Logo CUN"
                  className="w-24 h-auto mb-1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Acceso a consolas por rol
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="ejemplo@cun.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-gray-200/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />

                <input
                  type="password"
                  required
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-gray-200/80 border border-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />

                <button
                  type="submit"
                  className="w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#91DC00] to-[#31AB2E]"
                >
                  Entrar
                </button>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
              </form>

              <p className="text-[11px] text-gray-400 pt-10 text-center">
                Tip: si venías de una ruta protegida, el sistema te regresa
                automáticamente al destino.
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <video
            src={BGVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />

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

          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-6 px-6 ">
            <img
              src={Enciendete}
              alt="Imagen 1"
              className="h-[140px] object-contain"
            />

            <img
              src={LogoCun2}
              alt="Imagen 2"
              className="ml-auto mt-10 h-[70px] object-contain opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
