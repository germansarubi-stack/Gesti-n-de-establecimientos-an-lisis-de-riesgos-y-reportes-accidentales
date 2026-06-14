// models/establishment.model.ts
export interface Establishment {
  id: number;
  nombre: string;
  areaRubro: string;
  localidad: string;
  ciudad: string;
  direccion: string;
  especificacion: string;
  provincia?: string;
  // --- Nuevos campos para la Inteligencia Artificial ---
  ciiuCode?: string;         // Guarda el código de 6 dígitos
  ciiuDescription?: string;  // Guarda la descripción de la AFIP
  loadingCiiu?: boolean;     // Para mostrar el "Pensando..."
  showCiiu?: boolean;        // Para abrir/cerrar el globito

  // --- Nuevos campos para Estadísticas ---
  showStats?: boolean;
  statsLoading?: boolean;
  analisisIA?: string;
  chartData?: any;
}

export interface User {
  id: string;
  username: string;
}

