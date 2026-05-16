// ============================================================
// User Service — Backend API
// ============================================================
import api, { unwrap } from '@/lib/api/client';
import type {
  UserFilters,
  UsersResponse,
  UserMutationPayload,
  User,
} from './types';

export async function getUsers(
  _filters?: UserFilters
): Promise<UsersResponse> {
  const result = await api.GET('/v1/admin/user');
  const data = unwrap<User[]>(result.data);
  return { data, total: data.length };
}

export async function createUser(data: UserMutationPayload) {
  const result = await api.POST('/v1/auth/signup', { body: data });
  return unwrap<User>(result.data);
}

export async function updateUser(
  id: string,
  data: Partial<UserMutationPayload>
) {
  const result = await api.PATCH('/v1/admin/user/{id}', {
    params: { path: { id } },
    body: data,
  });
  return unwrap<User>(result.data);
}

export async function deleteUser(id: string) {
  await api.DELETE('/v1/admin/user/{id}', {
    params: { path: { id } },
  });
}
