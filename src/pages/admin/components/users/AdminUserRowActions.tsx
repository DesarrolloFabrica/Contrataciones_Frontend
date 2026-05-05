import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Pencil,
  Power,
  X,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import type { AdminUser } from "../../adminTypes";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  user: AdminUser;
  onEdit: () => void;
  onToggleActive: () => Promise<{ ok: boolean }>;
  onViewSecurity?: (u: AdminUser) => void;
};

const AdminUserRowActions: React.FC<Props> = ({
  user,
  onEdit,
  onToggleActive,
  onViewSecurity,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(
    null
  );

  const [busy, setBusy] = useState<null | "toggle">(null);

  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const isActive = user.status === "ACTIVE";

  const closeMenu = useCallback(() => setOpen(false), []);
  const closeAllOverlays = useCallback(() => {
    setOpen(false);
    setConfirmToggleOpen(false);
    setBusy(null);
    setToggleError(null);
  }, []);

  const handleEdit = useCallback(() => {
    onEdit();
  }, [onEdit]);

  const handleViewSecurity = useCallback(() => {
    onViewSecurity?.(user);
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
        e?.response?.data?.message ?? e?.message ?? "No se pudo actualizar el estado del usuario."
      );
    } finally {
      setBusy(null);
    }
  }, [onToggleActive]);

  const iconCls = (color: string) =>
    `w-4 h-4 ${isDark ? color : color.replace("text-", "text-").replace("300", "600")}`;

  const items = useMemo(() => {
    const base: Array<{
      id: string;
      label: string;
      icon: React.ReactNode;
      onClick: () => void | Promise<void>;
      disabled: boolean;
    }> = [];
    if (onViewSecurity) {
      base.push({
        id: "security",
        label: "Estado y seguridad",
        icon: <ShieldCheck className={iconCls("text-cyan-300")} />,
        onClick: handleViewSecurity,
        disabled: busy !== null,
      });
    }
    base.push(
      {
        id: "edit",
        label: "Editar",
        icon: <Pencil className={iconCls("text-cyan-300")} />,
        onClick: handleEdit,
        disabled: busy !== null,
      },
      {
        id: "toggle",
        label: isActive ? "Desactivar usuario" : "Activar usuario",
        icon: <Power className={iconCls("text-rose-300")} />,
        onClick: handleToggleConfirm,
        disabled: busy !== null,
      }
    );
    return base;
  }, [handleEdit, handleToggleConfirm, isActive, busy, handleViewSecurity, onViewSecurity, isDark]);

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

  const overlayCls = isDark
    ? "bg-black/70 backdrop-blur-sm"
    : "bg-black/30 backdrop-blur-sm";

  return (
    <>
      <button
        ref={btnRef}
        className={[
          "p-2 rounded-xl border transition-colors",
          isDark
            ? "bg-white/5 border-white/10 hover:bg-white/10 text-gray-200"
            : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600",
        ].join(" ")}
        onClick={toggleMenu}
        title="Acciones"
        aria-label="Acciones"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

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
              <div
                className={[
                  "backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden",
                  isDark
                    ? "bg-[#0B0B0B]/95 border border-white/10"
                    : "bg-white/95 border border-slate-200",
                ].join(" ")}
              >
                <div
                  className={[
                    "px-3 py-2 text-[10px] uppercase tracking-widest border-b flex items-center justify-between",
                    isDark ? "text-neutral-500 border-white/5" : "text-slate-500 border-slate-200",
                  ].join(" ")}
                >
                  Acciones
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="p-1 rounded-lg hover:bg-white/10"
                    title="Cerrar"
                  >
                    <X className={isDark ? "w-4 h-4 text-neutral-400" : "w-4 h-4 text-slate-400"} />
                  </button>
                </div>
                <div className="p-1">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      disabled={!!it.disabled}
                      className={[
                        "w-full px-3 py-2.5 text-left text-sm rounded-xl flex items-center gap-3 transition-colors",
                        it.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : isDark
                            ? "hover:bg-white/5"
                            : "hover:bg-slate-50",
                        isDark ? "text-neutral-200" : "text-slate-700",
                      ].join(" ")}
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

      {confirmToggleOpen &&
        createPortal(
          <div className="fixed inset-0 z-[10000]">
            <div
              className={`absolute inset-0 ${overlayCls}`}
              onClick={() => setConfirmToggleOpen(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className={[
                  "w-full max-w-md rounded-3xl shadow-2xl overflow-hidden",
                  isDark ? "bg-[#070707] border border-white/10" : "bg-white border border-slate-200",
                ].join(" ")}
              >
                <div
                  className={[
                    "px-6 py-5 border-b flex items-start justify-between",
                    isDark ? "border-white/10" : "border-slate-200",
                  ].join(" ")}
                >
                  <div>
                    <p
                      className={`text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 ${isDark ? "text-yellow-300" : "text-amber-600"}`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Confirmar acción
                    </p>
                    <h3 className={`text-lg font-black mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                      {isActive ? "Desactivar usuario" : "Activar usuario"}
                    </h3>
                    <p className={`text-xs mt-1 ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
                      {isActive
                        ? "El usuario no podrá iniciar sesión hasta que lo actives de nuevo."
                        : "El usuario recuperará acceso al sistema."}
                    </p>
                  </div>
                  <button
                    className={[
                      "p-2 rounded-xl border transition-colors shrink-0",
                      isDark
                        ? "bg-white/5 hover:bg-white/10 border-white/10"
                        : "bg-white hover:bg-slate-100 border-slate-200",
                    ].join(" ")}
                    onClick={() => setConfirmToggleOpen(false)}
                    title="Cerrar"
                  >
                    <X className={`w-4 h-4 ${isDark ? "text-gray-200" : "text-slate-500"}`} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-3">
                  <div
                    className={[
                      "rounded-2xl border p-4",
                      isDark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {user.name} {user.lastName}
                    </p>
                    <p className={`text-xs ${isDark ? "text-neutral-500" : "text-slate-600"}`}>{user.email}</p>
                  </div>
                  {toggleError && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3">
                      <p className={`text-xs ${isDark ? "text-rose-200" : "text-rose-700"}`}>{toggleError}</p>
                    </div>
                  )}
                </div>

                <div
                  className={[
                    "px-6 py-5 border-t flex items-center justify-between",
                    isDark ? "border-white/10" : "border-slate-200",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    className={[
                      "px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-colors",
                      isDark
                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700",
                    ].join(" ")}
                    onClick={() => setConfirmToggleOpen(false)}
                    disabled={busy === "toggle"}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={runToggle}
                    disabled={busy === "toggle"}
                    className={[
                      "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors",
                      busy === "toggle"
                        ? isDark
                          ? "bg-white/5 text-neutral-500 border border-white/10 cursor-not-allowed"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                        : isActive
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-cyan-600 hover:bg-cyan-500 text-white",
                    ].join(" ")}
                  >
                    {busy === "toggle" ? "Procesando..." : isActive ? "Desactivar" : "Activar"}
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
