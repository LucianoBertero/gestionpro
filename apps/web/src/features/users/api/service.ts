// ============================================================
// User Service — Backend API
// ============================================================
import api from '@/lib/auth/axios-instance';
import type {
  UserFilters,
  UsersResponse,
  UserMutationPayload,
  User,
} from './types';

export async function getUsers(
  _filters?: UserFilters
): Promise<UsersResponse> {
  const { data: envelope } = await api.get('/v1/admin/user');
  return { data: envelope.data as User[], total: (envelope.data as User[]).length };
}

export async function createUser(data: UserMutationPayload) {
  const { data: envelope } = await api.post('/v1/auth/signup', data);
  return envelope.data as User;
}

export async function updateUser(
  id: string,
  data: Partial<UserMutationPayload>
) {
  const { data: envelope } = await api.patch(`/v1/admin/user/${id}`, data);
  return envelope.data as User;
}

export async function deleteUser(id: string) {
  await api.delete(`/v1/admin/user/${id}`);
}
