export interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  roles: string[];
}
