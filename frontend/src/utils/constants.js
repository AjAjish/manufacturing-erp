// Order statuses
export const ORDER_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'quoted', label: 'Quoted', color: 'blue' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'in_production', label: 'In Production', color: 'yellow' },
  { value: 'quality_check', label: 'Quality Check', color: 'yellow' },
  { value: 'ready_for_dispatch', label: 'Ready for Dispatch', color: 'green' },
  { value: 'dispatched', label: 'Dispatched', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'on_hold', label: 'On Hold', color: 'red' },
];

// Priority levels
export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'High', color: 'yellow' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

// Customer types
export const CUSTOMER_TYPES = [
  { value: 'regular', label: 'Regular' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
];

// User roles
export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales / CRM' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'production', label: 'Production' },
  { value: 'quality', label: 'Quality / Inspection' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'management', label: 'Management' },
];

// Inspection results
export const INSPECTION_RESULTS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'pass', label: 'Pass', color: 'green' },
  { value: 'fail', label: 'Fail', color: 'red' },
  { value: 'conditional', label: 'Conditional Pass', color: 'yellow' },
  { value: 'rework', label: 'Rework Required', color: 'yellow' },
];

// Dispatch statuses
export const DISPATCH_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'packing', label: 'Packing', color: 'yellow' },
  { value: 'packed', label: 'Packed', color: 'blue' },
  { value: 'ready', label: 'Ready', color: 'blue' },
  { value: 'dispatched', label: 'Dispatched', color: 'green' },
  { value: 'in_transit', label: 'In Transit', color: 'green' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'returned', label: 'Returned', color: 'red' },
];

// Transport modes
export const TRANSPORT_MODES = [
  { value: 'road', label: 'Road Transport' },
  { value: 'rail', label: 'Rail Transport' },
  { value: 'air', label: 'Air Freight' },
  { value: 'sea', label: 'Sea Freight' },
  { value: 'courier', label: 'Courier' },
  { value: 'self_pickup', label: 'Self Pickup' },
];

// Material units
export const MATERIAL_UNITS = [
  { value: 'kg', label: 'Kilogram' },
  { value: 'gram', label: 'Gram' },
  { value: 'meter', label: 'Meter' },
  { value: 'mm', label: 'Millimeter' },
  { value: 'piece', label: 'Piece' },
  { value: 'sheet', label: 'Sheet' },
  { value: 'liter', label: 'Liter' },
];

// Fabrication process categories
export const FABRICATION_CATEGORIES = [
  { value: 'cutting', label: 'Cutting' },
  { value: 'forming', label: 'Forming' },
  { value: 'joining', label: 'Joining' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'assembly', label: 'Assembly' },
];

// Drawing types
export const DRAWING_TYPES = [
  { value: 'production', label: 'Production Drawing' },
  { value: 'assembly', label: 'Assembly Drawing' },
  { value: 'detail', label: 'Detail Drawing' },
  { value: 'layout', label: 'Layout Drawing' },
  { value: 'schematic', label: 'Schematic' },
  { value: '3d', label: '3D Model' },
  { value: 'other', label: 'Other' },
];