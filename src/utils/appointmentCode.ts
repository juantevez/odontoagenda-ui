/**
 * Mapeos front-end para codes amigables de turno y paciente.
 * No requiere cambios en el backend: todo se deriva determinísticamente
 * desde los campos ya disponibles en la API.
 */

const PROCEDURE_ABBR: Record<string, string> = {
  ODONTOLOGIA_GENERAL:    'ODG',
  ORTODONCIA:             'ORT',
  ENDODONCIA:             'END',
  PERIODONCIA:            'PER',
  CIRUGIA:                'CIR',
  CIRUGIA_ORAL:           'CIR',
  BLANQUEAMIENTO:         'BLQ',
  RADIOGRAFIA:            'RAD',
  LIMPIEZA:               'LIM',
  IMPLANTE:               'IMP',
  IMPLANTES:              'IMP',
  PROTESIS:               'PRO',
  ESTETICA:               'EST',
  PEDIATRIA:              'PED',
};

const PROCEDURE_LABEL: Record<string, string> = {
  ODONTOLOGIA_GENERAL:    'Odontología General',
  ORTODONCIA:             'Ortodoncia',
  ENDODONCIA:             'Endodoncia',
  PERIODONCIA:            'Periodoncia',
  CIRUGIA:                'Cirugía',
  CIRUGIA_ORAL:           'Cirugía Oral',
  BLANQUEAMIENTO:         'Blanqueamiento',
  RADIOGRAFIA:            'Radiografía',
  LIMPIEZA:               'Limpieza Dental',
  IMPLANTE:               'Implante',
  IMPLANTES:              'Implantes',
  PROTESIS:               'Prótesis',
  ESTETICA:               'Estética Dental',
  PEDIATRIA:              'Odontología Pediátrica',
};

/** Devuelve la abreviatura de 3 chars del procedimiento. */
export function procedureAbbr(code: string): string {
  const key = code.toUpperCase();
  return PROCEDURE_ABBR[key] ?? key.replace(/_/g, '').slice(0, 3);
}

/**
 * Devuelve el label legible del procedimiento.
 * Si no está en el mapa, convierte SNAKE_CASE → Title Case.
 */
export function procedureLabel(code: string): string {
  const key = code.toUpperCase();
  return PROCEDURE_LABEL[key] ?? code
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Genera un código de turno estilo IATA: ODG-2907-1A40
 *   ODG  → abreviatura del procedimiento
 *   2907 → día + mes del turno  (DDMM)
 *   1A40 → primeros 4 chars del appointmentId en mayúsculas
 *
 * Es determinístico: el mismo turno siempre produce el mismo código.
 */
export function apptCode(
  appointmentId: string,
  slotStart: string,
  procedureCode: string,
): string {
  const abbr     = procedureAbbr(procedureCode);
  // slotStart puede venir con o sin 'Z'; tomamos los chars de posición fija
  const day      = slotStart.slice(8, 10);   // DD
  const month    = slotStart.slice(5, 7);    // MM
  const uuidPart = appointmentId.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `${abbr}-${day}${month}-${uuidPart}`;
}

/**
 * Código corto de paciente para vistas de staff: PAC-0001
 * Toma los últimos 4 chars del UUID, garantizando un sufijo visible.
 */
export function patientCode(patientId: string): string {
  const suffix = patientId.replace(/-/g, '').slice(-4).toUpperCase();
  return `PAC-${suffix}`;
}
