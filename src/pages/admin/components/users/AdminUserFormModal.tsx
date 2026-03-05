// src/pages/admin/components/users/AdminUserFormModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Copy,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
  Wand2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UserRound,
  ChevronDown,
  Building2,
  Lock,
  Mail,
  Fingerprint,
} from "lucide-react";
import type { AdminUser, AdminUserRole, CreateAdminUserDto } from "../../adminTypes";
import { schoolsService, type SchoolOption } from "../../../../services/schoolsService";
import { useTheme } from "../../../../context/ThemeContext";

type Step = "FORM" | "REVIEW" | "SUCCESS";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (dto: CreateAdminUserDto & { schoolId?: string | null }) => Promise<any>;
  onUpdate: (id: string, patch: any) => Promise<void>;
  editingUser: AdminUser | null;
  lastCreatedCredentials: { email: string; tempPassword: string } | null;
  clearCredentials: () => void;
};

// --- Helpers (Lógica original intacta) ---
const emailLooksValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const roleLabel = (role: AdminUserRole) => {
  switch (role) {
    case "COORDINATOR": return "Coordinador";
    case "LEADER": return "Líder";
    case "ADMIN": return "Administrador";
    default: return role;
  }
};

const roleNeedsSchool = (role: AdminUserRole) => role === "COORDINATOR" || role === "LEADER";

const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const slugEmailPart = (s: string) =>
  stripAccents(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s.]/g, "").replace(/\s+/g, ".")
    .replace(/\.+/g, ".").replace(/^\.|\.$/g, "");

const roleSlug = (role: AdminUserRole) => {
  switch (role) {
    case "COORDINATOR": return "coordinator";
    case "LEADER": return "leader";
    case "ADMIN": return "admin";
    default: return slugEmailPart(role);
  }
};

const suggestEmail = (fullName: string, role: AdminUserRole) => {
  const base = slugEmailPart(fullName);
  const r = roleSlug(role);
  const local = [base, r].filter(Boolean).join(".");
  if (!local) return "";
  return `${local}@cun.edu.co`;
};

const splitFullName = (fullName: string) => {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { name: parts[0] ?? "", lastName: "" };
  const lastName = parts[parts.length - 1];
  const name = parts.slice(0, -1).join(" ");
  return { name, lastName };
};

// --- Nuevos Componentes de UI ---

const ModalHeader = ({
  title,
  subtitle,
  onClose,
  step,
  isEdit,
  isDark,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  step: Step;
  isEdit: boolean;
  isDark: boolean;
}) => (
  <div
    className={[
      "relative px-8 pt-8 pb-6 border-b",
      isDark ? "border-white/5 bg-zinc-950/50" : "border-slate-200 bg-slate-50",
    ].join(" ")}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h3
          className={[
            "text-xl font-medium tracking-tight flex items-center gap-2",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
            {isEdit ? <UserRound className="w-5 h-5 text-emerald-500" /> : <Sparkles className="w-5 h-5 text-emerald-500" />}
            {title}
        </h3>
        <p
          className={[
            "text-sm font-light max-w-sm leading-relaxed",
            isDark ? "text-zinc-400" : "text-slate-600",
          ].join(" ")}
        >
          {subtitle}
        </p>
      </div>
      <button
        onClick={onClose}
        className={[
          "group p-2 rounded-full transition-colors border",
          isDark
            ? "hover:bg-white/5 border-transparent hover:border-white/5"
            : "hover:bg-slate-200/60 border-transparent hover:border-slate-300",
        ].join(" ")}
      >
        <X
          className={[
            "w-5 h-5 transition-colors",
            isDark
              ? "text-zinc-500 group-hover:text-zinc-300"
              : "text-slate-500 group-hover:text-slate-700",
          ].join(" ")}
        />
      </button>
    </div>
    
    {/* Progress Indicator */}
    {!isEdit && (
      <div className="flex items-center gap-2 mt-6">
        <div
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            step === "FORM" || step === "REVIEW" || step === "SUCCESS"
              ? "bg-emerald-500"
              : isDark
                ? "bg-white/10"
                : "bg-slate-200"
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            step === "REVIEW" || step === "SUCCESS"
              ? "bg-emerald-500"
              : isDark
                ? "bg-white/10"
                : "bg-slate-200"
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            step === "SUCCESS"
              ? "bg-emerald-500"
              : isDark
                ? "bg-white/10"
                : "bg-slate-200"
          }`}
        />
      </div>
    )}
  </div>
);

const Field = ({
  label,
  required,
  children,
  hint,
  actions,
  icon: Icon
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div className="group space-y-2">
    <div className="flex items-end justify-between">
      <label className="text-xs font-medium text-zinc-400 group-focus-within:text-emerald-400 transition-colors flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>

    <div className="relative">
        {children}
    </div>
    
    {hint && <div className="text-[11px] text-zinc-500 pl-1 leading-snug">{hint}</div>}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <input
      {...props}
      className={[
        "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all duration-200",
        isDark
          ? "bg-zinc-900/50 border border-white/10 hover:border-white/20 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
          : "bg-white border border-slate-200 hover:border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
};

const SelectWrapper = ({ children, loading, icon }: { children: React.ReactNode, loading?: boolean, icon?: React.ElementType }) => (
    <div className="relative">
        {children}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                {/* Optional left icon implementation */}
            </div>
        )}
    </div>
)

const CardRow = ({ k, v, border = true }: { k: string; v: React.ReactNode, border?: boolean }) => (
  <div className={`flex items-center justify-between py-3 ${border ? 'border-b border-dashed border-white/10 last:border-0' : ''}`}>
    <p className="text-xs font-medium text-zinc-500">{k}</p>
    <div className="text-sm font-medium text-zinc-200 text-right truncate max-w-[60%]">{v}</div>
  </div>
);


const AdminUserFormModal: React.FC<Props> = ({
  open,
  onClose,
  onCreate,
  onUpdate,
  editingUser,
  lastCreatedCredentials,
  clearCredentials,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isEdit = !!editingUser;
  const [step, setStep] = useState<Step>("FORM");

  // State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [cedula, setCedula] = useState("");
  const [role, setRole] = useState<AdminUserRole>("COORDINATOR");
  const [generatePassword, setGeneratePassword] = useState(true);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [schoolId, setSchoolId] = useState<string>("");
  
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const title = isEdit ? "Editar usuario" : "Crear nuevo usuario";

  // --- Logic & Effects (Intacta) ---
  const validationError = useMemo(() => {
    const fn = fullName.trim();
    const parts = fn.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return "Escribe nombre y apellido en el campo Nombres.";
    const c = cedula.trim();
    if (!c) return "La cédula es obligatoria.";
    if (c.length < 6 || c.length > 10) return "La cédula debe tener entre 6 y 10 dígitos.";
    if (!email.trim()) return "El correo es obligatorio.";
    if (!emailLooksValid(email)) return "El correo no parece válido.";
    if (!isEdit) {
      if (!generatePassword) {
        if (password.trim().length < 8) return "La contraseña manual debe tener mínimo 8 caracteres.";
        if (password2.trim().length < 8) return "Confirma la contraseña.";
        if (password.trim() !== password2.trim()) return "Las contraseñas no coinciden.";
      }
    }
    if (roleNeedsSchool(role) && !schoolId.trim()) {
      return "Para este rol debes asignar una escuela.";
    }
    return null;
  }, [fullName, cedula, email, isEdit, generatePassword, password, password2, role, schoolId]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setSchoolsError(null);
    (async () => {
      try {
        setSchoolsLoading(true);
        const list = await schoolsService.list();
        if (!alive) return;
        setSchools(list);
      } catch (e: any) {
        if (!alive) return;
        setSchoolsError(e?.message || "Error cargando escuelas");
        setSchools([]);
      } finally {
        if (!alive) return;
        setSchoolsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setStep("FORM");
    setLocalError(null);
    setSaving(false);
    setCopied(false);

    if (editingUser) {
      const combined = `${editingUser.name ?? ""} ${editingUser.lastName ?? ""}`.trim();
      setFullName(combined);
      setEmail(editingUser.email);
      setEmailTouched(true);
      setCedula(String((editingUser as any).cedula ?? ""));
      setRole(editingUser.role);
      setMustChangePassword(Boolean((editingUser as any).mustChangePassword));
      setSchoolId(String((editingUser as any).schoolId ?? ""));
      setGeneratePassword(true);
      setPassword("");
      setPassword2("");
      clearCredentials();
    } else {
      setFullName("");
      setEmail("");
      setEmailTouched(false);
      setCedula("");
      setRole("COORDINATOR");
      setMustChangePassword(true);
      setGeneratePassword(true);
      setPassword("");
      setPassword2("");
      setSchoolId("");
      clearCredentials();
    }
  }, [open, editingUser, clearCredentials]);

  useEffect(() => {
    if (role === "ADMIN") setSchoolId("");
  }, [role]);

  useEffect(() => {
    if (!localError) return;
    setLocalError(null);
  }, [fullName, email, cedula, role, schoolId, mustChangePassword, generatePassword, password, password2]);

  if (!open) return null;

  const close = () => { clearCredentials(); setStep("FORM"); onClose(); };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback
    }
  };

  const applySuggestedEmail = () => {
    const s = suggestEmail(fullName, role);
    if (s) { setEmail(s); setEmailTouched(true); }
  };

  const buildDto = (): CreateAdminUserDto & { schoolId?: string | null } => {
    const parts = splitFullName(fullName);
    return {
      name: parts.name.trim(),
      lastName: parts.lastName.trim(),
      email: email.trim(),
      cedula: cedula.trim(),
      role,
      mustChangePassword,
      generatePassword,
      password: generatePassword ? undefined : password.trim(),
      schoolId: roleNeedsSchool(role) ? schoolId.trim() : null,
    };
  };

  const goReview = () => {
    setLocalError(null);
    if (validationError) { setLocalError(validationError); return; }
    setStep("REVIEW");
  };

  const runCreate = async () => {
    setLocalError(null);
    if (validationError) { setLocalError(validationError); return; }
    setSaving(true);
    try {
      await onCreate(buildDto());
      setStep("SUCCESS");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Error al crear usuario.";
      setLocalError(msg);
    } finally { setSaving(false); }
  };

  const runUpdate = async () => {
    setLocalError(null);
    if (validationError) { setLocalError(validationError); return; }
    setSaving(true);
    try {
      const parts = splitFullName(fullName);
      await onUpdate((editingUser as any).id, {
        name: parts.name.trim(),
        lastName: parts.lastName.trim(),
        email: email.trim(),
        cedula: cedula.trim(),
        role,
        mustChangePassword,
        schoolId: roleNeedsSchool(role) ? schoolId.trim() : null,
      });
      close();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Error al actualizar.";
      setLocalError(msg);
    } finally { setSaving(false); }
  };

  const createAnother = () => {
    clearCredentials();
    setStep("FORM");
    setFullName(""); setEmail(""); setEmailTouched(false);
    setCedula(""); setRole("COORDINATOR"); setMustChangePassword(true);
    setGeneratePassword(true); setPassword(""); setPassword2("");
    setSchoolId(""); setLocalError(null); setSaving(false);
  };

  const primaryDisabled = saving || (!!validationError && step !== "SUCCESS") || (!isEdit && step === "SUCCESS");
  const footerPrimaryAction = () => {
    if (isEdit) return runUpdate();
    if (step === "FORM") return goReview();
    if (step === "REVIEW") return runCreate();
    return;
  };
  const canCopy = Boolean((lastCreatedCredentials?.email ?? email.trim())?.length);
  const { name: previewName, lastName: previewLast } = splitFullName(fullName);

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl transition-opacity duration-300"
        onClick={close}
      />

      {/* Modal Card */}
      <div
        className={[
          "relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border",
          isDark
            ? "bg-zinc-950 border-white/10"
            : "bg-white border-slate-200 shadow-[0_24px_80px_rgba(15,23,42,0.30)]",
        ].join(" ")}
      >
        
        <ModalHeader 
            title={title} 
            subtitle={
                isEdit ? "Actualiza la información del usuario existente." 
                : step === 'SUCCESS' ? "El usuario ha sido creado correctamente."
                : "Completa los datos para dar de alta un nuevo administrativo."
            }
            onClose={close}
            step={step}
            isEdit={isEdit}
            isDark={isDark}
        />

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="space-y-6">
            
            {/* --- SUCCESS STEP --- */}
            {!isEdit && step === "SUCCESS" && (
              <div className="space-y-6">
                <div
                  className={[
                    "rounded-2xl p-5 flex gap-4 items-start border",
                    isDark
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-emerald-50 border-emerald-200",
                  ].join(" ")}
                >
                    <div className="p-2 bg-emerald-500/10 rounded-full shrink-0">
                        <CheckCircle2
                          className={[
                            "w-5 h-5",
                            isDark ? "text-emerald-400" : "text-emerald-600",
                          ].join(" ")}
                        />
                    </div>
                    <div>
                        <h4
                          className={[
                            "text-sm font-semibold",
                            isDark ? "text-emerald-100" : "text-emerald-800",
                          ].join(" ")}
                        >
                          Usuario registrado
                        </h4>
                        <p
                          className={[
                            "text-xs mt-1 leading-relaxed",
                            isDark
                              ? "text-emerald-200/60"
                              : "text-emerald-700",
                          ].join(" ")}
                        >
                            El usuario ya se encuentra activo. Si se generaron credenciales temporales, 
                            esta es la única vez que se mostrarán.
                        </p>
                    </div>
                </div>

                <div
                  className={[
                    "rounded-2xl p-1 relative overflow-hidden group border",
                    isDark
                      ? "bg-black/40 border-white/10"
                      : "bg-slate-50 border-slate-200",
                  ].join(" ")}
                >
                     {/* Decorative noise/gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    
                    <div
                      className={[
                        "p-5 border border-dashed rounded-xl space-y-4",
                        isDark
                          ? "border-white/10"
                          : "border-slate-200",
                      ].join(" ")}
                    >
                        <div className="flex justify-between items-start">
                            <span
                              className={[
                                "text-[10px] uppercase tracking-widest font-semibold",
                                isDark ? "text-zinc-500" : "text-slate-500",
                              ].join(" ")}
                            >
                              Credenciales de Acceso
                            </span>
                            <UserRound
                              className={[
                                "w-4 h-4",
                                isDark ? "text-zinc-600" : "text-slate-400",
                              ].join(" ")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p
                                  className={[
                                    "text-xs mb-1",
                                    isDark ? "text-zinc-500" : "text-slate-500",
                                  ].join(" ")}
                                >
                                  Usuario / Correo
                                </p>
                                <p
                                  className={[
                                    "text-sm font-mono select-all",
                                    isDark ? "text-white" : "text-slate-900",
                                  ].join(" ")}
                                >
                                  {(lastCreatedCredentials?.email ??
                                    email.trim()) || "—"}
                                </p>
                            </div>
                            <div>
                                <p
                                  className={[
                                    "text-xs mb-1",
                                    isDark ? "text-zinc-500" : "text-slate-500",
                                  ].join(" ")}
                                >
                                  Contraseña Temporal
                                </p>
                                <p
                                  className={[
                                    "text-sm font-mono select-all",
                                    isDark ? "text-white" : "text-slate-900",
                                  ].join(" ")}
                                >
                                    {lastCreatedCredentials?.tempPassword ? lastCreatedCredentials.tempPassword : (generatePassword ? "—" : "Manual")}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 mt-2 border-t border-white/5 flex gap-2">
                             <button
                                onClick={() => copy(`Nombre: ${fullName.trim()}\nEmail: ${lastCreatedCredentials?.email ?? email.trim()}\nPassword: ${lastCreatedCredentials?.tempPassword ?? ""}`)}
                                disabled={!canCopy}
                                className={[
                                  "flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2",
                                  isDark
                                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                                    : "bg-slate-900 hover:bg-slate-800 text-white",
                                ].join(" ")}
                            >
                                <Copy className="w-3.5 h-3.5" />
                                {copied ? "Copiado al portapapeles" : "Copiar credenciales"}
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* --- REVIEW STEP --- */}
            {!isEdit && step === "REVIEW" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div
                  className={[
                    "rounded-2xl border p-5",
                    isDark
                      ? "border-white/10 bg-zinc-900/30"
                      : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                          className={[
                            "p-2 rounded-lg border",
                            isDark
                              ? "bg-zinc-900 border-white/10"
                              : "bg-white border-slate-200",
                          ].join(" ")}
                        >
                            <ShieldCheck
                              className={[
                                "w-5 h-5",
                                isDark
                                  ? "text-emerald-400"
                                  : "text-emerald-600",
                              ].join(" ")}
                            />
                        </div>
                        <div>
                            <p
                              className={[
                                "text-sm font-medium",
                                isDark ? "text-zinc-200" : "text-slate-900",
                              ].join(" ")}
                            >
                              Confirmación de datos
                            </p>
                            <p
                              className={[
                                "text-xs",
                                isDark ? "text-zinc-500" : "text-slate-600",
                              ].join(" ")}
                            >
                              Verifica que todo esté correcto antes de crear.
                            </p>
                        </div>
                    </div>
                    
                    <div
                      className={[
                        "rounded-xl border p-4 space-y-1",
                        isDark
                          ? "bg-zinc-950/50 border-white/5"
                          : "bg-white border-slate-200",
                      ].join(" ")}
                    >
                        <CardRow k="Nombre completo" v={`${previewName} ${previewLast}`} />
                        <CardRow
                          k="Rol asignado"
                          v={
                            <span
                              className={[
                                "px-2 py-0.5 rounded-full border text-xs",
                                isDark
                                  ? "bg-white/5 border-white/10 text-zinc-100"
                                  : "bg-emerald-50 border-emerald-200 text-emerald-700",
                              ].join(" ")}
                            >
                              {roleLabel(role)}
                            </span>
                          }
                        />
                        <CardRow k="Documento" v={cedula.trim()} />
                        <CardRow k="Correo electrónico" v={email.trim()} />
                        <CardRow k="Escuela / Facultad" v={schools.find((s) => s.id === schoolId)?.name ?? (schoolId || "No aplica")} />
                        <CardRow k="Método de contraseña" v={generatePassword ? "Generada automáticamente" : "Manual"} border={false} />
                    </div>
                </div>
              </div>
            )}

            {/* --- FORM STEP --- */}
            {step === "FORM" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                
                <div className="md:col-span-2">
                     <Field label="Nombre Completo" required hint="Ingresa nombres y apellidos" icon={UserRound}>
                        <Input 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ej. Ana María López"
                            autoFocus
                        />
                     </Field>
                </div>

                    <Field label="Rol de Usuario" required icon={ShieldCheck}>
                   <SelectWrapper>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as AdminUserRole)}
                            className={[
                              "w-full appearance-none rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all",
                              isDark
                                ? "bg-zinc-900/50 border border-white/10 text-zinc-100 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                : "bg-white border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
                            ].join(" ")}
                        >
                            <option value="COORDINATOR">{roleLabel("COORDINATOR")}</option>
                            <option value="LEADER">{roleLabel("LEADER")}</option>
                            <option value="ADMIN">{roleLabel("ADMIN")}</option>
                        </select>
                   </SelectWrapper>
                </Field>

                <Field label="Cédula de Ciudadanía" required icon={Fingerprint}>
                    <Input 
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value.replace(/[^\d]/g, ""))}
                        placeholder="6 a 10 dígitos"
                        inputMode="numeric"
                    />
                </Field>

                <div className="md:col-span-2">
                    <Field 
                        label="Correo Institucional" 
                        required 
                        icon={Mail}
                        hint="Este será el usuario de acceso al sistema."
                        actions={
                            <button
                                type="button"
                                onClick={applySuggestedEmail}
                                className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                            >
                                <Wand2 className="w-3 h-3" />
                                Sugerir
                            </button>
                        }
                    >
                        <Input 
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                            placeholder="nombre.apellido.rol@cun.edu.co"
                        />
                    </Field>
                </div>

                <div className="md:col-span-2">
                    <Field 
                        label={`Escuela Asignada ${roleNeedsSchool(role) ? "" : "(Opcional)"}`} 
                        required={roleNeedsSchool(role)}
                        icon={Building2}
                    >
                         <SelectWrapper loading={schoolsLoading}>
                            <select
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                disabled={role === "ADMIN" || schoolsLoading}
                                className={[
                                  "w-full appearance-none rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all",
                                  role === "ADMIN" ? "opacity-50 cursor-not-allowed" : "",
                                  isDark
                                    ? "bg-zinc-900/50 border border-white/10 text-zinc-100 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                    : "bg-white border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                            >
                                <option value="">
                                    {role === "ADMIN" ? "No aplica para Administradores" : schoolsLoading ? "Cargando..." : "Selecciona una escuela..."}
                                </option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                         </SelectWrapper>
                         {schoolsError && role !== "ADMIN" && <p className="mt-1.5 text-xs text-amber-400/90">{schoolsError}</p>}
                    </Field>
                </div>

                <div className="md:col-span-2 py-2">
                    <label
                      className={[
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        isDark
                          ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100",
                      ].join(" ")}
                    >
                        <input
                            type="checkbox"
                            checked={mustChangePassword}
                            onChange={(e) => setMustChangePassword(e.target.checked)}
                            className="mt-0.5 rounded border-white/20 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/40"
                        />
                        <div className="space-y-0.5">
                            <span
                              className={[
                                "text-sm font-medium",
                                isDark ? "text-zinc-200" : "text-slate-900",
                              ].join(" ")}
                            >
                              Forzar cambio de contraseña
                            </span>
                            <p
                              className={[
                                "text-xs",
                                isDark ? "text-zinc-500" : "text-slate-600",
                              ].join(" ")}
                            >
                              El usuario deberá asignar una nueva clave al
                              iniciar sesión por primera vez.
                            </p>
                        </div>
                    </label>
                </div>

                {!isEdit && (
                    <div className="md:col-span-2 pt-4 border-t border-white/5">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Lock className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Seguridad</span>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={generatePassword}
                                    onChange={(e) => setGeneratePassword(e.target.checked)}
                                    className="rounded-sm border-white/20 bg-zinc-900 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                                />
                                <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">Generar automáticamente</span>
                            </label>
                         </div>

                        {!generatePassword && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <Field label="Contraseña Manual" required>
                                    <Input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 8 caracteres"
                                    />
                                </Field>
                                <Field label="Confirmar Contraseña" required>
                                    <Input 
                                        type="password"
                                        value={password2}
                                        onChange={(e) => setPassword2(e.target.value)}
                                        placeholder="Repetir contraseña"
                                    />
                                </Field>
                            </div>
                        )}
                    </div>
                )}
              </div>
            )}

            {localError && (
              <div
                className={[
                  "animate-in slide-in-from-bottom-2 fade-in rounded-xl p-3 flex items-start gap-3 border",
                  isDark
                    ? "bg-rose-500/10 border-rose-500/20"
                    : "bg-rose-50 border-rose-200",
                ].join(" ")}
              >
                  <div className="p-1 bg-rose-500/20 rounded-full shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-rose-500" />
                  </div>
                  <p
                    className={[
                      "text-sm",
                      isDark ? "text-rose-200" : "text-rose-700",
                    ].join(" ")}
                  >
                    {localError}
                  </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={[
            "px-8 py-5 border-t flex items-center justify-between z-10",
            isDark ? "border-white/5 bg-zinc-950/50" : "border-slate-200 bg-slate-50",
          ].join(" ")}
        >
            <button
                onClick={close}
                className={[
                  "text-xs font-medium transition-colors px-2 py-1",
                  isDark
                    ? "text-zinc-500 hover:text-zinc-300"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
            >
                {step === "SUCCESS" ? "Cerrar ventana" : "Cancelar operación"}
            </button>

            <div className="flex items-center gap-3">
                {!isEdit && step === "REVIEW" && (
                     <button
                        onClick={() => setStep("FORM")}
                        disabled={saving}
                        className={[
                          "px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2",
                          isDark
                            ? "text-zinc-400 hover:text-white hover:bg-white/5"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
                        ].join(" ")}
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Volver
                    </button>
                )}

                {step === 'SUCCESS' ? (
                     <button
                        onClick={createAnother}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-lg shadow-black/20 transition-all flex items-center gap-2"
                    >
                        Crear otro usuario
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <button
                        onClick={footerPrimaryAction}
                        disabled={primaryDisabled}
                        className={`px-5 py-2.5 rounded-lg text-xs font-semibold shadow-lg transition-all flex items-center gap-2 ${
                            primaryDisabled 
                                ? isDark
                                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 border border-emerald-500/50"
                        }`}
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isEdit ? "Guardar cambios" : step === "FORM" ? "Continuar" : "Confirmar creación"}
                        {!saving && step === "FORM" && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserFormModal;