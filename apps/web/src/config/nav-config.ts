import type { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        items: [],
      },
      {
        title: 'Clientes',
        url: '/dashboard/clientes',
        icon: 'building',
        shortcut: ['c', 'c'],
        isActive: false,
        items: [],
      },
      {
        title: 'Tareas',
        url: '/dashboard/tareas',
        icon: 'tasks',
        shortcut: ['t', 't'],
        isActive: false,
        items: [],
      },
      {
        title: 'Liquidaciones',
        url: '/dashboard/liquidaciones',
        icon: 'calculator',
        shortcut: ['l', 'l'],
        isActive: false,
        items: [],
      },
      {
        title: 'Vencimientos',
        url: '/dashboard/vencimientos',
        icon: 'calendarClock',
        shortcut: ['v', 'v'],
        isActive: false,
        items: [],
      },
      {
        title: 'Agenda',
        url: '/dashboard/agenda',
        icon: 'calendar',
        shortcut: ['a', 'a'],
        isActive: false,
        items: [],
      },
      {
        title: 'Notificaciones',
        url: '/dashboard/notificaciones',
        icon: 'notification',
        shortcut: ['n', 'n'],
        isActive: false,
        items: [],
      },
      {
        title: 'Usuarios',
        url: '/dashboard/users',
        icon: 'user',
        shortcut: ['u', 'u'],
        isActive: false,
        items: [],
      },
    ],
  },
];
