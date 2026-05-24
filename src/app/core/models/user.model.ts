export type UserRole = 'Cliente' | 'Propietario' | 'Dulceria' | 'Admin' | 'Invitado';
export type PlanSuscripcion = 'Gratuito' | 'Basico' | 'Premium';

export interface User {
  id: string;
  nombre: string;
  email: string | null;
  telefonoWhatsapp: string | null;
  rol: UserRole;
  planSuscripcion: PlanSuscripcion;
  suscripcionVenceEn: string | null;
  activo: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
