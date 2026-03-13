export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Address {
  id: string;
  customerId: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressInput {
  label?: string;
  street: string;
  city: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  notes?: string;
}
