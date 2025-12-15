// src/pages/admin/components/users/AdminUserFormModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Copy, X, CheckCircle2, Sparkles } from "lucide-react";
import type { AdminUser, AdminUserRole, CreateAdminUserDto } from "../../adminTypes";

type Props = {
  open: boolean;
  onClose: () => void;

  onCreate: (dto: CreateAdminUserDto) => { ok: boolean; password?: string; user?: AdminUser };
  onUpdate: (id: string, patch: any) => { ok: boolean };

  editingUser: AdminUser | null;

  lastCreatedCredentials: { email: string; password: string } | null;
  clearCredentials: () => void;
};

const emailLooksValid = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const roleLabel = (role: AdminUserRole) => {
  switch (role) {
    case "COORDINATOR": return "Coordinador";
    case "LEADER": return "Líder";
    case "ADMIN": return "Administrador";
    default: return role;
  }
};

const AdminUserFormModal: React.FC<Props> = ({
  open,
  onClose,
  onCreate,
  onUpdate,
  editingUser,
  lastCreatedCredentials,
  clearCredentials,
}) => {
  const isEdit = !!editingUser;

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cedula, setCedula] = useState("");

  const [role, setRole] = useState<AdminUserRole>("COORDINATOR");

  const [generatePassword, setGeneratePassword] = useState(true);
  const [password, setPassword] = useState("");

  const [mustChangePassword, setMustChangePassword] = useState(true);

  const [localError, setLocalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ NO useMemo para esto (no aporta y evita problemas)
  const title = isEdit ? "Editar usuario" : "Crear usuario";

  // ✅ Validación (esto sí puede ser useMemo)
  const validationError = useMemo(() => {
    if (!name.trim() || !lastName.trim()) return "Nombre y apellido son obligatorios.";

    if (!isEdit) {
      if (!email.trim()) return "El correo es obligatorio.";
      if (!emailLooksValid(email)) return "El correo no parece válido.";
      if (!generatePassword && password.trim().length < 8)
        return "La contraseña manual debe tener mínimo 8 caracteres.";
    }
    return null;
  }, [name, lastName, email, isEdit, generatePassword, password]);

  useEffect(() => {
    if (!open) return;

    setLocalError(null);
    setSaving(false);

    if (editingUser) {
      setName(editingUser.name);
      setLastName(editingUser.lastName);
      setEmail(editingUser.email);
      setCedula(editingUser.cedula ?? "");
      setRole(editingUser.role);
      setMustChangePassword(editingUser.mustChangePassword);

      setGeneratePassword(true);
      setPassword("");
    } else {
      setName("");
      setLastName("");
      setEmail("");
      setCedula("");
      setRole("COORDINATOR");
      setMustChangePassword(true);
      setGeneratePassword(true);
      setPassword("");
      clearCredentials();
    }
  }, [open, editingUser, clearCredentials]);

  // ✅ AHORA sí: retorno temprano después de hooks (OK)
  if (!open) return null;

  const close = () => {
    clearCredentials();
    onClose();
  };

  const copy = async (text: string) => {
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

  const handleSubmit = async () => {
    setLocalError(null);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setSaving(true);

    if (!isEdit) {
      const res = onCreate({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        cedula: cedula.trim() ? cedula.trim() : null,
        role,
        mustChangePassword,
        generatePassword,
        password: generatePassword ? undefined : password.trim(),
      });

      if (!res.ok) {
        setLocalError("No se pudo crear el usuario. Revisa los campos.");
        setSaving(false);
        return;
      }

      // ✅ dejamos abierto para copiar credenciales
      setSaving(false);
      return;
    }

    const res = onUpdate(editingUser!.id, {
      name: name.trim(),
      lastName: lastName.trim(),
      cedula: cedula.trim() ? cedula.trim() : null,
      role,
      mustChangePassword,
    });

    if (!res.ok) {
      setLocalError("No se pudo actualizar el usuario.");
      setSaving(false);
      return;
    }

    setSaving(false);
    close();
  };

  const primaryDisabled =
    saving || !!validationError || (!isEdit && !!lastCreatedCredentials);

  const primaryLabel = isEdit
    ? "Guardar cambios"
    : lastCreatedCredentials
    ? "Usuario creado"
    : "Crear usuario";

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#070707] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Gestión de usuarios
              </p>
              <h3 className="text-xl font-black text-white mt-1">{title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {isEdit
                  ? "Actualiza datos del usuario (sin exponer contraseñas)."
                  : "Crea un usuario y genera credenciales seguras."}
              </p>
            </div>

            <button
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              onClick={close}
              title="Cerrar"
            >
              <X className="w-4 h-4 text-gray-200" />
            </button>
          </div>

          {/* body */}
          <div className="px-6 py-5 space-y-5">
            {!isEdit && lastCreatedCredentials && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Credenciales generadas
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Estas credenciales se muestran <b>solo una vez</b>. Compártelas por un canal seguro.
                    </p>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-black/30 border border-white/10 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                          Email
                        </p>
                        <p className="text-sm text-white mt-1 truncate">
                          {lastCreatedCredentials.email}
                        </p>
                      </div>
                      <div className="bg-black/30 border border-white/10 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                          Contraseña temporal
                        </p>
                        <p className="text-sm text-white mt-1 truncate">
                          {lastCreatedCredentials.password}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    onClick={() =>
                      copy(
                        `Email: ${lastCreatedCredentials.email}\nPassword: ${lastCreatedCredentials.password}`
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                </div>
              </div>
            )}

            {/* form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-gray-500">
                  Nombres
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
                  placeholder="Ej. Ana María"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-widest text-gray-500">
                  Apellidos
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
                  placeholder="Ej. López"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-widest text-gray-500">
                  Correo (login)
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEdit}
                  className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none ${
                    isEdit
                      ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                      : "bg-[#0A0A0A] border-white/10 text-gray-200 focus:border-emerald-500/50"
                  }`}
                  placeholder="coordinador@cun.edu.co"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-widest text-gray-500">
                  Cédula (opcional)
                </label>
                <input
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/[^\d]/g, ""))}
                  className="mt-1 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
                  placeholder="1010101010"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-widest text-gray-500">
                  Rol
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminUserRole)}
                  className="mt-1 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
                >
                  <option value="COORDINATOR">{roleLabel("COORDINATOR")}</option>
                  <option value="LEADER">{roleLabel("LEADER")}</option>
                  <option value="ADMIN">{roleLabel("ADMIN")}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  checked={mustChangePassword}
                  onChange={(e) => setMustChangePassword(e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm text-gray-200">Forzar cambio de contraseña</p>
                  <p className="text-xs text-gray-500">Recomendado en primer inicio.</p>
                </div>
              </div>
            </div>

            {!isEdit && !lastCreatedCredentials && (
              <div className="bg-[#090909] border border-white/10 rounded-2xl p-4">
                <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">
                  Contraseña
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={generatePassword}
                    onChange={(e) => setGeneratePassword(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <p className="text-sm text-gray-200">
                    Generar automáticamente (recomendado)
                  </p>
                </div>

                {!generatePassword && (
                  <div className="mt-3">
                    <label className="text-[11px] uppercase tracking-widest text-gray-500">
                      Definir manualmente
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                )}
              </div>
            )}

            {(localError || validationError) && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-sm text-rose-200">
                {localError ?? validationError}
              </div>
            )}
          </div>

          {/* footer */}
          <div className="px-6 py-5 border-t border-white/10 flex items-center justify-between">
            <button
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest"
              onClick={close}
            >
              {lastCreatedCredentials ? "Cerrar" : "Cancelar"}
            </button>

            <button
              disabled={primaryDisabled}
              className={[
                "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors",
                primaryDisabled
                  ? "bg-white/5 text-neutral-500 border border-white/10 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white",
              ].join(" ")}
              onClick={handleSubmit}
            >
              {saving ? "Guardando..." : primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserFormModal;
