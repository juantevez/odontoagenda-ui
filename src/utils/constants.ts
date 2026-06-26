export const DOC_TYPES = ['DNI', 'PASAPORTE', 'CUIT', 'CUIL', 'CE'] as const;

// Especialidades odontológicas — código backend → nombre en español
export const SPECIALTY_LABELS: Record<string, string> = {
  // Core / Clínicas
  ODONTOLOGIA_GENERAL:  'Odontología General',
  ODONTOPEDIATRIA:      'Odontopediatría',
  ORTODONCIA:           'Ortodoncia',
  ENDODONCIA:           'Endodoncia',
  // Quirúrgicas y Alta Complejidad
  PERIODONCIA:          'Periodoncia',
  IMPLANTOLOGIA:        'Implantología',
  CIRUGIA_ORAL:         'Cirugía Oral',
  CIRUGIA_MAXILOFACIAL: 'Cirugía Maxilofacial',
  // Rehabilitación y Estética
  REHABILITACION_ORAL:  'Rehabilitación Oral',
  ESTETICA_DENTAL:      'Estética Dental',
  // Diagnóstico y Soporte
  ESTOMATOLOGIA:        'Estomatología',
  IMAGENOLOGIA_DENTAL:  'Imaginología Dental',
};

/** Convierte un código de especialidad al nombre legible. */
export function specialtyLabel(code: string): string {
  return SPECIALTY_LABELS[code] ?? code;
}

export const GENDERS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'NB', label: 'No binario' },
  { value: 'NS', label: 'Prefiero no decir' },
] as const;

export const USER_ROLES = [
  { value: 'paciente', label: 'Paciente' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'admin_sucursal', label: 'Admin de Sede' },
] as const;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  // lowercase (legacy / frontend-only)
  scheduled:  'Programado',
  confirmed:  'Confirmado',
  checked_in: 'En sala',
  completed:  'Completado',
  cancelled:  'Cancelado',
  no_show:    'No se presentó',
  // PascalCase (backend domain values)
  Pending:    'Pendiente',
  Confirmed:  'Confirmado',
  InProgress: 'En sala',
  Completed:  'Completado',
  Cancelled:  'Cancelado',
  NoShow:     'No se presentó',
};

export const APPOINTMENT_STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
  // lowercase
  scheduled:  'info',
  confirmed:  'primary',
  checked_in: 'success',
  completed:  'info',
  cancelled:  'error',
  no_show:    'default',
  // PascalCase
  Pending:    'default',
  Confirmed:  'primary',
  InProgress: 'success',
  Completed:  'info',
  Cancelled:  'error',
  NoShow:     'warning',
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'mercadopago', label: 'MercadoPago' },
] as const;
