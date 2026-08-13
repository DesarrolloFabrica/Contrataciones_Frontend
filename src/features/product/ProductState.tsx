import { AlertTriangle, Inbox, LoaderCircle, ShieldX } from "lucide-react";
import type { ReactNode } from "react";

type Kind = "loading" | "empty" | "error" | "unauthorized" | "warning";

const iconByKind = {
  loading: <LoaderCircle className="h-6 w-6 animate-spin" />,
  empty: <Inbox className="h-6 w-6" />,
  error: <AlertTriangle className="h-6 w-6" />,
  unauthorized: <ShieldX className="h-6 w-6" />,
  warning: <AlertTriangle className="h-6 w-6" />,
};

export function ProductState({
  kind,
  title,
  description,
  action,
}: {
  kind: Kind;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const danger = kind === "error" || kind === "unauthorized";
  return (
    <section
      aria-live={kind === "loading" ? "polite" : undefined}
      role={danger ? "alert" : "status"}
      className={`rounded-2xl border p-8 text-center ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
          : kind === "warning"
            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200"
            : "app-card-surface text-slate-600 dark:text-slate-300"
      }`}
    >
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 dark:bg-black/10">
        {iconByKind[kind]}
      </span>
      <h2 className="mt-3 text-sm font-semibold">{title}</h2>
      {description && <p className="mx-auto mt-1 max-w-xl text-xs leading-5 opacity-80">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
