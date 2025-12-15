import type { AuditActor } from "../types";
import type { AuthUser } from "../context/AuthContext";

export function actorFromUser(user: AuthUser | null): AuditActor {
  if (!user) {
    return { role: "system", id: null, name: "Sistema", email: null };
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
