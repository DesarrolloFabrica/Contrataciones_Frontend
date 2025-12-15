// src/pages/admin/components/users/AdminUserRowActions.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Power, KeyRound } from "lucide-react";
import type { AdminUser, ResetPasswordResult } from "../../adminTypes";

type Props = {
  user: AdminUser;
  onEdit: () => void;
  onToggleActive: () => void;
  onResetPassword: () => ResetPasswordResult | null;
};

type Pos = { top: number; left: number; width: number };

const AdminUserRowActions: React.FC<Props> = ({
  user,
  onEdit,
  onToggleActive,
  onResetPassword,
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);

  const isActive = user.status === "ACTIVE";

  const items = useMemo(
    () => [
      {
        id: "edit",
        label: "Editar usuario",
        icon: <Pencil className="w-4 h-4 text-cyan-300" />,
        onClick: () => onEdit(),
      },
      {
        id: "reset",
        label: "Resetear contraseña",
        icon: <KeyRound className="w-4 h-4 text-amber-300" />,
        onClick: () => {
          const res = onResetPassword();
          if (!res) {
            alert("No se pudo resetear la contraseña (mock).");
            return;
          }
          alert(
            `Contraseña temporal generada:\n\n${res.temporaryPassword}\n\nCompártela por un canal seguro.`
          );
        },
      },
      {
        id: "toggle",
        label: isActive ? "Desactivar" : "Activar",
        icon: <Power className="w-4 h-4 text-rose-300" />,
        onClick: () => onToggleActive(),
      },
    ],
    [onEdit, onResetPassword, onToggleActive, isActive]
  );

  const computePosition = () => {
    const el = btnRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const menuWidth = 240;
    const menuHeight = 44 + items.length * 44; // header + items (aprox)

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = Math.min(r.right - menuWidth, vw - menuWidth - 12);
    left = Math.max(12, left);

    const spaceBelow = vh - r.bottom;
    const openUp = spaceBelow < menuHeight + 12;

    const top = openUp ? r.top - menuHeight - 10 : r.bottom + 10;

    setPos({ top, left, width: menuWidth });
  };

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    computePosition();

    const onResize = () => computePosition();
    const onScroll = () => computePosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true); // captura scroll dentro de contenedores

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      close();
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const toggle = () => {
    if (!open) computePosition();
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        onClick={toggle}
        title="Acciones"
        aria-label="Acciones"
      >
        <MoreVertical className="w-4 h-4 text-gray-200" />
      </button>

      {open && pos &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" aria-hidden="true">
            {/* overlay invisible para cerrar */}
            <div className="absolute inset-0" onClick={close} />

            <div
              ref={menuRef}
              className="fixed"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
              <div className="bg-[#0B0B0B]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/5">
                  Acciones
                </div>

                <div className="p-1">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-white/5 rounded-xl flex items-center gap-2 transition-colors"
                      onClick={() => {
                        close();
                        it.onClick();
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
    </>
  );
};

export default AdminUserRowActions;
