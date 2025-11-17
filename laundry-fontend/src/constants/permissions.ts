/**
 * Permissions constants - Đồng bộ với backend
 */
export const Permissions = {
  // Companies
  Companies_View: 'Companies.View',
  Companies_Create: 'Companies.Create',
  Companies_Update: 'Companies.Update',
  Companies_Delete: 'Companies.Delete',

  // Partners
  Partners_View: 'Partners.View',
  Partners_Create: 'Partners.Create',
  Partners_Update: 'Partners.Update',
  Partners_Delete: 'Partners.Delete',

  // Services
  Services_View: 'Services.View',
  Services_Create: 'Services.Create',
  Services_Update: 'Services.Update',
  Services_Delete: 'Services.Delete',

  // Orders
  Orders_View: 'Orders.View',
  Orders_Create: 'Orders.Create',
  Orders_Update: 'Orders.Update',
  Orders_Delete: 'Orders.Delete',

  // Payments
  Payments_View: 'Payments.View',
  Payments_Create: 'Payments.Create',
  Payments_Update: 'Payments.Update',
  Payments_Delete: 'Payments.Delete',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

