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
  ShieldCheck, // ✅ NEW
} from "lucide-react";
import type { AdminUser, ResetPasswordResult } from "../../adminTypes";

type Props = {
  user: AdminUser;
  onEdit: () => void;
  onToggleActive: () => void;
  onResetPassword: () => Promise<ResetPasswordResult | null>;

  // ✅ NEW: abrir panel de estado/seguridad
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
  onViewSecurity, // ✅ NEW
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);

  const [busy, setBusy] = useState<null | "reset" | "toggle">(null);

  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
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
  }, []);

  const handleEdit = useCallback(() => {
    onEdit();
  }, [onEdit]);

  const handleViewSecurity = useCallback(() => {
    onViewSecurity(user);
  }, [onViewSecurity, user]);

  const handleToggleConfirm = useCallback(() => {
    setConfirmToggleOpen(true);
  }, []);

  const runToggle = useCallback(async () => {
    try {
      setBusy("toggle");
      onToggleActive();
    } finally {
      setBusy(null);
      setConfirmToggleOpen(false);
    }
  }, [onToggleActive]);

  const runReset = useCallback(async () => {
    try {
      setBusy("reset");
      setCopied(false);

      const res = await onResetPassword();
      if (!res) {
        setResetResult({ userId: user.id, temporaryPassword: "" } as any);
        return;
      }
      setResetResult(res);
    } catch (e) {
      console.error(e);
      setResetResult({ userId: user.id, temporaryPassword: "" } as any);
    } finally {
      setBusy(null);
    }
  }, [onResetPassword, user.id]);

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

      {/* ... el resto (confirm toggle + reset result) igual */}
      {/* (sin cambios debajo) */}
      {/* CONFIRM TOGGLE */}
      {confirmToggleOpen && /* ... */ null}
      {/* RESET RESULT */}
      {resetResult && /* ... */ null}
    </>
  );
};

export default AdminUserRowActions;
