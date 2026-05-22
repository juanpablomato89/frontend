export interface Dulceria {
  id: string;
  usuarioId: string;
  nombre: string;
  descripcion: string | null;
  fotoPerfilUrl: string | null;
  fotosLocalUrls: string | null;
  latitud: number;
  longitud: number;
  direccionTexto: string;
  municipio: string;
  provincia: string;
  telefonoContacto: string;
  horario: string | null;
  tieneDelivery: boolean;
  radioDeliveryKm: number | null;
  estaActiva: boolean;
  aprobada: boolean;
  qrCodeUrl: string | null;
  creadoEn: string;
}
