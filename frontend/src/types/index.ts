export interface User {
  user_id?: number;
  username: string;
  email: string;
  phone?: string;
  real_name?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface Service {
  service_id?: number;
  service_name: string;
  description?: string;
  price: number;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  features?: any;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive';
}

export interface Subscription {
  subscription_id?: number;
  user_id: number;
  service_id: number;
  start_date: string;
  end_date: string;
  auto_renew?: boolean;
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
  payment_method?: string;
  amount_paid?: number;
  created_at?: string;
  updated_at?: string;
  cancelled_at?: string | null;
  // Extended fields from join
  username?: string;
  email?: string;
  service_name?: string;
  price?: number;
  billing_cycle?: string;
}

export interface Notification {
  notification_id?: number;
  user_id: number;
  subscription_id?: number | null;
  notification_type: 'renewal_reminder' | 'expiry_warning' | 'payment_success' | 'payment_failed' | 'cancellation';
  title: string;
  message: string;
  is_read?: boolean;
  sent_at?: string;
  read_at?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
