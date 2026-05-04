import React from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

interface ExampleProfilesToolbarProps {
  onLoadApproved: () => void;
  onLoadMedium: () => void;
  onLoadRejected: () => void;
  sticky?: boolean;
}

export const ExampleProfilesToolbar: React.FC<ExampleProfilesToolbarProps> = ({
  onLoadApproved,
  onLoadMedium,
  onLoadRejected,
  sticky = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`${sticky ? "sticky top-4 z-50" : ""} flex justify-center`}>
      <div
        className={[
          "backdrop-blur-xl p-1.5 rounded-2xl border flex flex-wrap justify-center gap-1",
          isDark
            ? "bg-[#0A0A0A]/90 border-white/10 shadow-2xl"
            : "bg-white border-slate-200 shadow-[0_14px_40px_rgba(15,23,42,0.16)]",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onLoadApproved}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all"
        >
          <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="hidden sm:inline">Perfil Aprobado</span>
        </button>
        <div className="w-px h-6 bg-white/5 self-center mx-1"></div>
        <button
          type="button"
          onClick={onLoadMedium}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
        >
          <AlertCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="hidden sm:inline">Perfil Medio</span>
        </button>
        <div className="w-px h-6 bg-white/5 self-center mx-1"></div>
        <button
          type="button"
          onClick={onLoadRejected}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <XCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="hidden sm:inline">Perfil Rechazado</span>
        </button>
      </div>
    </div>
  );
};

export default ExampleProfilesToolbar;
