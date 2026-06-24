export type QuoteStatus = 'pending' | 'paid' | 'voided' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mercadopago';

export interface Quote {
  quote_id: string;
  appointment_id: string;
  procedure: {
    code: string;
    name: string;
    base_price_cents: number;
  };
  coverage?: {
    type: string;
    provider: string;
    plan: string;
    coverage_percent: number;
    co_pay_percent: number;
    co_pay_fixed_cents: number;
  };
  totals: {
    subtotal_cents: number;
    discount_cents: number;
    co_pay_cents: number;
    total_cents: number;
  };
  status: QuoteStatus;
}

export interface Payment {
  payment_id: string;
  quote_id: string;
  amount_cents: number;
  payment_method: PaymentMethod;
  notes?: string;
  status: string;
  created_at: string;
}

export interface RegisterPaymentCommand {
  amount_cents: number;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface PatientAccount {
  patient_id: string;
  patient_name: string;
  balance_cents: number;
  pending_quotes: Quote[];
}
