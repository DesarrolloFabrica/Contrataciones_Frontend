import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import BGImg from "../../assets/images/Gemini_Generated_Image_wsary2wsary2wsar (1).png";
import LogoCun from "../../assets/images/LogoCunColor.png";
import LogoCun2 from "../../assets/images/LogoCun.png";
import Enciendete from "../../assets/images/Enciendete.png";
import VideoFondo from "../../assets/videos/Op2_1.mp4";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return;

    try {
      const user = await login(email.trim(), name.trim() || undefined);

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (user.role === "leader") {
        navigate("/leader", { replace: true });
      } else if (user.role === "coordinator") {
        navigate("/coordinator", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (err: any) {
      console.error("Error en login:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo iniciar sesión. Verifica tu correo institucional.";
      setError(msg);
    }
  };

  const logoSizeClass = "w-24";

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[30%_70%]">
        {/* =========================
            PANEL IZQUIERDO
        ========================= */}
        <div className="relative z-10 bg-white text-gray-900">
          <div className="h-full flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
              <div className="flex flex-col items-center text-center mb-10">
                <img
                  src={LogoCun}
                  alt="Logo CUN"
                  className={`${logoSizeClass} h-auto mb-1`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Acceso a consolas por rol
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Ej. Sofia Coordinadora"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-gray-200/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />

                <input
                  type="email"
                  required
                  placeholder="ejemplo@cun.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-gray-200/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />

                <button
                  type="submit"
                  className="w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#91DC00] to-[#31AB2E]"
                >
                  Entrar
                </button>

                <p className="text-[11px] text-gray-500 text-center pt-2">
                  Usa <span className="font-semibold text-emerald-700">admin</span> o{" "}
                  <span className="font-semibold text-emerald-700">coord</span>
                </p>
              </form>

              <div className="mt-10 text-sm text-gray-700">
                <p className="font-semibold mb-2">Guía rápida</p>
                <p>• admin → Admin</p>
                <p>• coord → Coordinador</p>
                <p>• cualquier otro → Líder</p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            COLUMNA DERECHA (VIDEO)
        ========================= */}
        <div className="relative hidden lg:flex h-full bg-black items-center justify-center overflow-hidden">
          <div className="relative w-full h-full overflow-hidden">

            {/* VIDEO DE FONDO */}
            <video
              src={VideoFondo}
              autoPlay
              loop
              muted
              playsInline
              className="
                absolute inset-0
                w-full h-full
                object-cover
                scale-100
              "
            />

           

           

            {/* LOGO INFERIOR */}
            <img
              src={LogoCun2}
              alt="Logo CUN"
              className="
                absolute bottom-6 right-6
                w-28 md:w-32
                opacity-90
                drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]
                pointer-events-none
              "
            />

            <img
              src={Enciendete}
              alt="Divergente"
              className="
                absolute bottom-6 left-6
                w-28 md:w-32
                
                drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]
                pointer-events-none
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
