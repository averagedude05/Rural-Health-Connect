export interface AuthUser {
  id: string;
  role?: string;
  username?: string;
  email?: string;
  roles: string[];
}
