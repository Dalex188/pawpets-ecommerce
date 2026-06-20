/** User roles for authorization across the app. */
export enum UserRole {
  CLIENT = "CLIENT",
  ADMIN = "ADMIN",
}

/** Navigation link descriptor used by layout components. */
export interface NavLink {
  label: string;
  href: string;
  requiresAuth?: boolean;
  requiredRole?: UserRole;
}
