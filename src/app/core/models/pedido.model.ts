export type TipoEntrega = 'Delivery' | 'Recogida';
export type EstadoPedido =
  | 'Pendiente' | 'Confirmado' | 'EnPreparacion'
  | 'ListoParaEntregar' | 'EnCamino' | 'Entregado' | 'Cancelado';

export interface OrderItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUsd: number;
  precioCup: number;
}

export interface Pedido {
  id: string;
  idempotencyKey: string;
  clienteId: string | null;
  nombreInvitado: string | null;
  telefonoInvitado: string | null;
  dulceriaId: string | null;
  items: OrderItem[];
  subtotalUsd: number;
  costoEnvioUsd: number;
  totalUsd: number;
  totalCup: number;
  tasaCambioAplicada: number;
  direccionEntregaTexto: string | null;
  entregaLatitud: number | null;
  entregaLongitud: number | null;
  tipoEntrega: TipoEntrega;
  estado: EstadoPedido;
  razonCancelacion: string | null;
  rating: number | null;
  comentarioRating: string | null;
  creadoEn: string;
  aceptadoEn: string | null;
  entregadoEn: string | null;
}
