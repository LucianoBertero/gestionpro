export interface HonorariosData {
  mes: string;
  facturado: number;
  cobrado: number;
  pendiente: number;
}

export interface RentabilidadData {
  mes: string;
  ingresos: number;
  costos: number;
  ganancia: number;
}

export interface ProyeccionData {
  mes: string;
  real: number;
  proyectado: number;
}

export interface FinancieroResumen {
  totalClientes: number;
  clientesActivos: number;
  ingresoPromedio: number;
  morosidad: number;
  honorarios: HonorariosData[];
  rentabilidad: RentabilidadData[];
  proyeccion: ProyeccionData[];
}
