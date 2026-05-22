export interface Producto {
  id: string;
  dulceriaId: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  precioUsd: number;
  precioCup: number;
  imagenUrl: string | null;
  stock: number;
  disponible: boolean;
  creadoEn: string;
}
