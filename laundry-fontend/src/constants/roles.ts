/**
 * Roles constants - Đồng bộ với backend
 */
export const Roles = {
  SuperAdmin: 'SuperAdmin',
  UserRoot: 'UserRoot', // Chủ cửa hàng - có toàn quyền trong cửa hàng của mình
  Admin: 'Admin',
  Manager: 'Manager',
  Employee: 'Employee',
  Customer: 'Customer',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

