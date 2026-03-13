import type { Tenant } from '@depaneuria/types';

const API_BASE = '/api/v1/tenants';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(res.statusText || 'Requête échouée');
  }
  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

export async function fetchTenants(): Promise<Tenant[]> {
  const res = await fetch(API_BASE);
  return handleResponse<Tenant[]>(res);
}
