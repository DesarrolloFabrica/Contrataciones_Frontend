// src/features/boot/AppBootProvider.tsx
// Maquina de fases del splash post-login.
//
//   idle      -> hay usuario y isBootPending()  -> loading
//   loading   -> waitForBootReady resuelve     -> exiting
//   exiting   -> tras BOOT_EXIT_DURATION_MS    -> done
//   done      -> render normal (el dashboard ya esta montado detras del overlay)
//
// Al hacer logout se vuelve a idle para que un proximo login pueda re-activar el splash.

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { queryClient } from "../../services/queryClient";
import { isBootPending, clearBootPending } from "./appBootStorage";
import { waitForBootReady } from "./waitForBootReady";
import { BOOT_EXIT_DURATION_MS } from "./appBootConfig";
import { AppBootLoader } from "../../components/boot/AppBootLoader";

export type BootPhase = "idle" | "loading" | "exiting" | "done";

interface AppBootContextValue {
  phase: BootPhase;
  degraded: boolean;
}

const AppBootContext = createContext<AppBootContextValue | null>(null);

export const AppBootProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<BootPhase>("idle");
  const [degraded, setDegraded] = useState(false);

  const startedRef = useRef(false);
  const loadingStartedRef = useRef(false);

  // 1) Activacion: solo tras login exitoso (user + flag de boot).
  useEffect(() => {
    if (startedRef.current) return;
    if (!user) return;
    if (!isBootPending()) return;
    startedRef.current = true;
    setPhase("loading");
  }, [user]);

  // 2) Loading: dispara el prefetch por rol y espera a que este listo.
  useEffect(() => {
    if (phase !== "loading") return;
    if (!user) return;
    if (loadingStartedRef.current) return;
    loadingStartedRef.current = true;

    let cancelled = false;

    waitForBootReady({ role: user.role, queryClient }).then(
      ({ degraded: isDegraded }) => {
        if (cancelled) return;
        setDegraded(isDegraded);
        clearBootPending();
        setPhase("exiting");
      }
    );

    return () => {
      cancelled = true;
    };
  }, [phase, user]);

  // 3) Exiting -> done tras el fade de salida.
  useEffect(() => {
    if (phase !== "exiting") return;
    const t = setTimeout(() => setPhase("done"), BOOT_EXIT_DURATION_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // 4) Reset en logout: sin usuario permitimos re-activar el splash en el proximo login.
  useEffect(() => {
    if (user) return;
    startedRef.current = false;
    loadingStartedRef.current = false;
    setPhase("idle");
    setDegraded(false);
  }, [user]);

  const showOverlay = phase === "loading" || phase === "exiting";

  return (
    <AppBootContext.Provider value={{ phase, degraded }}>
      {children}
      {showOverlay && (
        <AppBootLoader exiting={phase === "exiting"} />
      )}
    </AppBootContext.Provider>
  );
};

export function useAppBoot(): AppBootContextValue {
  const ctx = useContext(AppBootContext);
  return ctx ?? { phase: "idle", degraded: false };
}
