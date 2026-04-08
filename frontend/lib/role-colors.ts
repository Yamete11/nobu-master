const defaultRoleClasses = {
  badge: "border-border bg-muted text-foreground",
  border: "border-border/60",
};

type RoleColorConfig = {
  badge: string;
  border: string;
};

const roleColorMap: Record<string, RoleColorConfig> = {
  Waiter: {
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    border: "border-blue-500/50",
  },
  Runner: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    border: "border-amber-500/50",
  },
  Host: {
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    border: "border-purple-500/50",
  },
  Bartender: {
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    border: "border-rose-500/50",
  },
};

export function getRoleBadgeClass(role: string): string {
  return roleColorMap[role]?.badge ?? defaultRoleClasses.badge;
}

export function getRoleBorderClass(role: string): string {
  return roleColorMap[role]?.border ?? defaultRoleClasses.border;
}
