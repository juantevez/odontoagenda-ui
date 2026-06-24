import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.string().min(1, 'Debe seleccionar un rol'),
  family_name: z.string().optional(),
});

export const patientSchema = z.object({
  full_name: z.string().min(3, 'Nombre muy corto'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  gender: z.enum(['M', 'F', 'NB', 'NS']),
  doc_type: z.enum(['DNI', 'PASAPORTE', 'CUIT', 'CUIL', 'CE']),
  doc_number: z.string().min(7, 'Documento inválido'),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Formato inválido. Ej: +5491112345678'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  emergency_name: z.string().optional(),
  emergency_phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Formato inválido. Ej: +5491112345678').optional().or(z.literal('')),
});

export const appointmentSchema = z.object({
  patient_id: z.string().uuid('Paciente inválido'),
  professional_id: z.string().uuid('Profesional inválido'),
  clinic_id: z.string().uuid('Sede inválida'),
  procedure_code: z.string().min(1, 'Debe seleccionar un procedimiento'),
  slot_start: z.string().min(1, 'Debe seleccionar un horario'),
  slot_end: z.string().min(1),
  coverage_type: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PatientFormData = z.infer<typeof patientSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
