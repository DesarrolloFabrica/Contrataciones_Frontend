// src/features/boot/appBootStorage.ts
// Flag de sessionStorage que activa el splash post-login.
// Se marca SOLO en un login exitoso (no en refresh con token existente).
// Se limpia cuando el boot termina o al hacer logout.

const BOOT_PENDING_KEY = "cun-boot-pending";

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function isBootPending(): boolean {
  if (!hasStorage()) return false;
  try {
    return sessionStorage.getItem(BOOT_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function markBootPending(): void {
  if (!hasStorage()) return;
  try {
    sessionStorage.setItem(BOOT_PENDING_KEY, "1");
  } catch {
    // ignore quota / privacy mode
  }
}

export function clearBootPending(): void {
  if (!hasStorage()) return;
  try {
    sessionStorage.removeItem(BOOT_PENDING_KEY);
  } catch {
    // ignore
  }
}
