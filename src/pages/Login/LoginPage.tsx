import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BrainCircuit } from "lucide-react";

import BGVideo from "../../assets/videos/Op2_1.mp4";
import LogoCun from "../../assets/images/LogoCunColor.png";

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
  // ==============================
  // VARIABLES VISUALES (ESCALABLES)
  // ==============================
  const logoSizeClass = "w-24"; // Cambia a w-20 / w-28 / w-32 según necesites

  return (
    <div className="min-h-screen w-full bg-black">
      {/* IMPORTANTE: relative ayuda a manejar capas si hace falta */}
      <div className="relative grid h-screen grid-cols-1 lg:grid-cols-[30%_70%]">
        {/* =========================
            PANEL IZQUIERDO (BLANCO)
           ========================= */}
        <div className="relative z-10 bg-white text-gray-900">
          <div className="h-full flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
              {/* Encabezado (SIN VIDEO AQUÍ) */}
              <div className="flex flex-col items-center text-center mb-10">
                {/* Logo (escalable por clase) */}
                <img
                  src={LogoCun}
                  alt="Logo CUN"
                  className={`w-24 h-auto mb-1`}
                />
                <p className="text-xs text-gray-500 mt-2">Acceso a consolas por rol</p>
              </div>

              {/* Form (sin tarjeta interna) */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Ej. Sofia Coordinadora"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-gray-200/80 border border-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />

                <input
                  type="email"
                  required
                  placeholder="ejemplo@cun.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-gray-200/80 border border-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />

                <button
                  type="submit"
                  className="w-full rounded-2xl py-3 text-sm font-bold tracking-widest uppercase text-white bg-gradient-to-r from-[#91DC00] to-[#31AB2E] hover:from-[#31AB2E] hover:to-[#91DC00] transition"
                >
                  Entrar
                </button>

                <p className="text-[11px] text-gray-500 text-center pt-2">
                  Usa <span className="text-emerald-700 font-semibold">admin</span> o{" "}
                  <span className="text-emerald-700 font-semibold">coord</span> en el correo
                </p>
              </form>

              {/* Guía rápida (texto plano, sin card) */}
              <div className="mt-10 text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900 mb-2">Guía rápida</p>
                <p className="text-gray-600 mb-2">
                  Usa un correo “simulado” para elegir el rol:
                </p>
                <p>
                  • contiene{" "}
                  <span className="text-emerald-700 font-semibold">admin</span> → Admin
                </p>
                <p>
                  • contiene{" "}
                  <span className="text-emerald-700 font-semibold">coord</span> → Coordinador
                </p>
                <p>• cualquier otro → Líder</p>
              </div>

              <p className="text-[11px] text-gray-400 pt-10 text-center">
                Tip: si venías de una ruta protegida, el sistema te regresa automáticamente al
                destino.
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            COLUMNA DERECHA (VIDEO)
           ========================= */}
        <div className="relative hidden lg:block">
          {/* Video como background */}
          <video
            src={BGVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Overlay real (el tuyo estaba vacío) */}
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
