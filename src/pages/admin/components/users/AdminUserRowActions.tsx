// src/pages/admin/components/users/AdminUserRowActions.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Pencil,
  Power,
  KeyRound,
  Copy,
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import type { AdminUser, ResetPasswordResult } from "../../adminTypes";

type Props = {
  user: AdminUser;
  onEdit: () => void;

  // ✅ ahora async (para poder await y manejar errores)
  onToggleActive: () => Promise<{ ok: boolean }>;

  onResetPassword: () => Promise<ResetPasswordResult | null>;

  onViewSecurity: (u: AdminUser) => void;
};

type Pos = { top: number; left: number; width: number };

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
};

const AdminUserRowActions: React.FC<Props> = ({
  user,
  onEdit,
  onToggleActive,
  onResetPassword,
  onViewSecurity,
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);

  const [busy, setBusy] = useState<null | "reset" | "toggle">(null);

  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const [resetResult, setResetResult] = useState<ResetPasswordResult | null>(null);
  const [copied, setCopied] = useState(false);

  const isActive = user.status === "ACTIVE";

  const closeMenu = useCallback(() => setOpen(false), []);
  const closeAllOverlays = useCallback(() => {
    setOpen(false);
    setConfirmToggleOpen(false);
    setResetResult(null);
    setCopied(false);
    setBusy(null);
    setToggleError(null);
  }, []);

  const handleEdit = useCallback(() => {
    onEdit();
  }, [onEdit]);

  const handleViewSecurity = useCallback(() => {
    onViewSecurity(user);
  }, [onViewSecurity, user]);

  const handleToggleConfirm = useCallback(() => {
    setToggleError(null);
    setConfirmToggleOpen(true);
  }, []);

  const runToggle = useCallback(async () => {
    setBusy("toggle");
    setToggleError(null);

    try {
      const res = await onToggleActive();
      if (!res?.ok) throw new Error("No se pudo actualizar el estado del usuario.");

      setConfirmToggleOpen(false);
    } catch (e: any) {
      console.error(e);
      setToggleError(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudo actualizar el estado del usuario."
      );
      // 👈 dejamos el modal abierto para que el admin vea el error
    } finally {
      setBusy(null);
    }
  }, [onToggleActive]);

  const runReset = useCallback(async () => {
    try {
      setBusy("reset");
      setCopied(false);

      const res = await onResetPassword();

      // ✅ sin userId / sin any
      setResetResult(res ?? ({ temporaryPassword: "" } as ResetPasswordResult));
    } catch (e) {
      console.error(e);
      setResetResult(({ temporaryPassword: "" } as ResetPasswordResult));
    } finally {
      setBusy(null);
    }
  }, [onResetPassword]);

  const items = useMemo(
    () => [
      {
        id: "security",
        label: "Estado y seguridad",
        icon: <ShieldCheck className="w-4 h-4 text-emerald-300" />,
        onClick: handleViewSecurity,
        disabled: busy !== null,
      },
      {
        id: "edit",
        label: "Editar",
        icon: <Pencil className="w-4 h-4 text-cyan-300" />,
        onClick: handleEdit,
        disabled: busy !== null,
      },
      {
        id: "reset",
        label: busy === "reset" ? "Reseteando..." : "Resetear contraseña",
        icon: <KeyRound className="w-4 h-4 text-amber-300" />,
        onClick: runReset,
        disabled: busy !== null,
      },
      {
        id: "toggle",
        label: isActive ? "Desactivar usuario" : "Activar usuario",
        icon: <Power className="w-4 h-4 text-rose-300" />,
        onClick: handleToggleConfirm,
        disabled: busy !== null,
      },
    ],
    [handleEdit, runReset, handleToggleConfirm, isActive, busy, handleViewSecurity]
  );

  const computePosition = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const menuWidth = 240;
    const menuHeight = 44 + items.length * 44;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = Math.min(r.right - menuWidth, vw - menuWidth - 12);
    left = Math.max(12, left);

    const spaceBelow = vh - r.bottom;
    const openUp = spaceBelow < menuHeight + 12;
    const top = openUp ? r.top - menuHeight - 10 : r.bottom + 10;

    setPos({ top, left, width: menuWidth });
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    computePosition();

    const onResize = () => computePosition();
    const onScroll = () => computePosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      closeMenu();
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, closeMenu]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAllOverlays();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAllOverlays]);

  const toggleMenu = () => {
    if (!open) computePosition();
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        onClick={toggleMenu}
        title="Acciones"
        aria-label="Acciones"
      >
        <MoreVertical className="w-4 h-4 text-gray-200" />
      </button>

      {/* MENU */}
      {open &&
        pos &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" aria-hidden="true">
            <div className="absolute inset-0" onClick={closeMenu} />

            <div
              ref={menuRef}
              className="fixed"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
              <div className="bg-[#0B0B0B]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/5 flex items-center justify-between">
                  Acciones
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="p-1 rounded-lg hover:bg-white/5"
                    title="Cerrar"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>

                <div className="p-1">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      disabled={!!it.disabled}
                      className={`w-full px-3 py-2.5 text-left text-sm rounded-xl flex items-center gap-2 transition-colors
                        ${it.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"}
                      `}
                      onClick={async () => {
                        closeMenu();
                        await it.onClick();
                      }}
                    >
                      {it.icon}
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* CONFIRM TOGGLE */}
      {confirmToggleOpen &&
        createPortal(
          <div className="fixed inset-0 z-[10000]">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmToggleOpen(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-[#070707] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-yellow-300 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Confirmar acción
                    </p>
                    <h3 className="text-lg font-black text-white mt-1">
                      {isActive ? "Desactivar usuario" : "Activar usuario"}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      {isActive
                        ? "El usuario no podrá iniciar sesión hasta que lo actives de nuevo."
                        : "El usuario recuperará acceso al sistema."}
                    </p>
                  </div>

                  <button
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    onClick={() => setConfirmToggleOpen(false)}
                    title="Cerrar"
                  >
                    <X className="w-4 h-4 text-gray-200" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white font-semibold">
                      {user.name} {user.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>

                  {toggleError && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3">
                      <p className="text-xs text-rose-200">{toggleError}</p>
                    </div>
                  )}
                </div>

                <div className="px-6 py-5 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest"
                    onClick={() => setConfirmToggleOpen(false)}
                    disabled={busy === "toggle"}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={runToggle}
                    disabled={busy === "toggle"}
                    className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors ${
                      busy === "toggle"
                        ? "bg-white/5 text-neutral-500 border border-white/10 cursor-not-allowed"
                        : isActive
                        ? "bg-rose-600 hover:bg-rose-500 text-white"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {busy === "toggle"
                      ? "Procesando..."
                      : isActive
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* RESET RESULT (tu bloque actual sirve tal cual, no lo toqué) */}
      {/* ... deja el bloque como lo tienes ... */}
      {resetResult &&
        createPortal(
          <div className="fixed inset-0 z-[10000]">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setResetResult(null)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-[#070707] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Contraseña temporal
                    </p>
                    <h3 className="text-lg font-black text-white mt-1">
                      Reset de contraseña
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Comparte esta contraseña por un canal seguro. Se recomienda forzar cambio al iniciar.
                    </p>
                  </div>

                  <button
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    onClick={() => setResetResult(null)}
                    title="Cerrar"
                  >
                    <X className="w-4 h-4 text-gray-200" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white font-semibold">
                      {user.name} {user.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>

                  {resetResult.temporaryPassword ? (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Generada correctamente
                          </p>
                          <p className="text-sm text-white mt-2 break-all">
                            {resetResult.temporaryPassword}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-2">
                            Esta contraseña se muestra una sola vez.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            await copyText(resetResult.temporaryPassword!);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1200);
                          }}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          {copied ? "Copiado" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                      <p className="text-sm text-rose-200 font-semibold">
                        No se pudo generar la contraseña temporal.
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Intenta de nuevo o revisa la conexión con el backend.
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-6 py-5 border-t border-white/10 flex items-center justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest"
                    onClick={() => setResetResult(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default AdminUserRowActions;
