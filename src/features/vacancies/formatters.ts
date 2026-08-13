import type { AxiosError } from "axios";

export function formatDate(value: string | null | undefined) {
  if (!value) return "No disponible";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function apiErrorMessage(error: unknown) {
  const response = (error as AxiosError<{ message?: string | string[] }>)?.response?.data;
  const message = response?.message;
  if (Array.isArray(message)) return message.join(". ");
  return message || "No fue posible completar la operación.";
}

export function coreUnavailableMessage() {
  return "Orbit no está disponible temporalmente. Puedes continuar trabajando con la información sincronizada.";
}

export function intelligenceUnavailableMessage() {
  return "El análisis automático no está disponible. Las charlas y respuestas permanecen guardadas.";
}

export function humanize(value: string | null | undefined) {
  if (!value) return "No informado";
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
