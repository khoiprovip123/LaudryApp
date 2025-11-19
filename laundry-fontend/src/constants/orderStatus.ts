/**
 * Order Status Constants - Đồng bộ với BE (Domain.Constants.OrderStatus)
 */
export const OrderStatus = {
	/** Received - Đã nhận đồ (Trạng thái khởi tạo) */
	Received: 'Received',
	/** Processing - Đang giặt */
	Processing: 'Processing',
	/** Completed - Đã giặt xong */
	Completed: 'Completed',
	/** Delivered - Đã giao cho khách */
	Delivered: 'Delivered',
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

/**
 * Mapping status sang text tiếng Việt
 */
export const OrderStatusLabels: Record<OrderStatusType, string> = {
	[OrderStatus.Received]: 'Đã nhận đồ',
	[OrderStatus.Processing]: 'Đang giặt',
	[OrderStatus.Completed]: 'Đã giặt xong',
	[OrderStatus.Delivered]: 'Đã giao cho khách',
};

/**
 * Mapping status sang màu cho Badge
 */
export const OrderStatusColors: Record<OrderStatusType, string> = {
	[OrderStatus.Received]: 'blue',      // Xanh dương - Trạng thái khởi tạo
	[OrderStatus.Processing]: 'yellow',  // Vàng - Đang xử lý
	[OrderStatus.Completed]: 'green',    // Xanh lá - Hoàn thành
	[OrderStatus.Delivered]: 'gray',     // Xám - Đã đóng
};

/**
 * Lấy label tiếng Việt cho status
 */
export const getOrderStatusLabel = (status: string): string => {
	return OrderStatusLabels[status as OrderStatusType] || status;
};

/**
 * Lấy màu cho Badge dựa trên status
 */
export const getOrderStatusColor = (status: string): string => {
	return OrderStatusColors[status as OrderStatusType] || 'gray';
};

/**
 * Kiểm tra status có hợp lệ không
 */
export const isValidOrderStatus = (status: string): boolean => {
	return Object.values(OrderStatus).includes(status as OrderStatusType);
};

