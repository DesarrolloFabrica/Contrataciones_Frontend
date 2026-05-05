// src/components/UserHeaderProfile.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";

const roleLine: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordinador",
  leader: "Líder",
};

const backendRoleLine: Record<string, string> = {
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador",
  LIDER: "Líder",
};

/**
 * Perfil del usuario logueado (nombre y avatar de Google desde AuthContext).
 * No hace peticiones; usa solo lo persistido en sesión.
 */
export function UserHeaderProfile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [imgError, setImgError] = useState(false);

  if (!user) return null;

  const displayName =
    user.name && user.name.trim() ? user.name.trim() : user.email;

  const initial = (
    displayName.charAt(0) ||
    user.email.charAt(0) ||
    "?"
  ).toUpperCase();

  const subtitle =
    roleLine[user.role] ?? backendRoleLine[user.backendRole] ?? user.email;
  const showImg = Boolean(user.googlePicture?.trim() && !imgError);

  return (
    <div className="flex items-center gap-3 min-w-0">
      {showImg ? (
        <img
          src={user.googlePicture!.trim()}
          alt=""
          className={cn(
            "w-10 h-10 shrink-0 rounded-full object-cover",
            isDark ? "border border-white/10" : "border border-slate-200"
          )}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            "w-10 h-10 shrink-0 rounded-full border flex items-center justify-center text-sm font-bold",
            isDark
              ? "border-white/10 bg-white/10 text-white"
              : "border-slate-200 bg-slate-200 text-slate-700"
          )}
          aria-hidden
        >
          {initial}
        </div>
      )}
      <div className="min-w-0 text-left">
        <p
          className={cn(
            "text-sm font-semibold truncate",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          {displayName}
        </p>
        <p
          className={cn(
            "text-xs truncate",
            isDark ? "text-slate-400" : "text-slate-400"
          )}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default UserHeaderProfile;
