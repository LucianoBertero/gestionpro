'use client';

import type { NavItem, NavGroup } from '@/types';
import { useAuthStore } from '@/features/auth/store/auth.store';

/**
 * Recursively filter navigation items based on user role.
 *
 * - If `roles` is undefined/empty → visible to all authenticated users
 * - If `roles` is defined → only visible if user's role is in the array
 * - Items with sub-items (collapsible parents) are removed if ALL their
 *   sub-items are filtered out.
 */
function filterNavItemsByRole(
  items: NavItem[],
  userRole: 'SOCIO' | 'COLABORADOR' | null
): NavItem[] {
  return items
    .filter((item) => {
      // Role-based filtering
      if (item.roles && item.roles.length > 0) {
        if (!userRole || !item.roles.includes(userRole)) {
          return false;
        }
      }
      return true;
    })
    .map((item) => {
      // Recursively filter sub-items
      if (item.items && item.items.length > 0) {
        const filteredSubs = filterNavItemsByRole(item.items, userRole);
        // If all sub-items were filtered out and the parent is a collapsible
        // (url === '#'), remove the parent too
        if (filteredSubs.length === 0 && item.url === '#') {
          return null;
        }
        return { ...item, items: filteredSubs };
      }
      return item;
    })
    .filter((item): item is NavItem => item !== null);
}

export function useFilteredNavItems(items: NavItem[]) {
  const user = useAuthStore((state) => state.user);
  return filterNavItemsByRole(items, user?.role ?? null);
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const user = useAuthStore((state) => state.user);

  return groups
    .map((group) => ({
      ...group,
      items: filterNavItemsByRole(group.items, user?.role ?? null)
    }))
    .filter((group) => group.items.length > 0);
}
