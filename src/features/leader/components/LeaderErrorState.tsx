import React from "react";

interface LeaderErrorStateProps {
  error: string;
  onReset: () => void;
}

export const LeaderErrorState: React.FC<LeaderErrorStateProps> = ({
  error,
  onReset,
}) => {
  return (
    <div className="animate-[shake_0.5s_ease-in-out] mx-auto max-w-2xl mt-8">
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-6 text-center shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Error en el análisis</h3>
        <p className="text-red-200/80 mb-6">{error}</p>

        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20"
        >
          Intentar Nuevamente
        </button>
      </div>
    </div>
  );
};

export default LeaderErrorState;
