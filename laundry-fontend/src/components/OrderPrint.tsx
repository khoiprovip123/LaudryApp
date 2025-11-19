import React, { useEffect, useState } from 'react';
import { Box, Button, Spinner } from '@chakra-ui/react';
import { useToast } from '../hooks/useToast';
import { getOrderPrint, type OrderPrintDto } from '../api/orders';
import { FaPrint } from 'react-icons/fa';

interface OrderPrintProps {
	orderId: string;
	printType?: 'Receive' | 'Delivery';
	onClose?: () => void;
}

const OrderPrint: React.FC<OrderPrintProps> = ({ orderId, printType = 'Receive', onClose }) => {
	const [printData, setPrintData] = useState<OrderPrintDto | null>(null);
	const [loading, setLoading] = useState(true);
	const toast = useToast();

	useEffect(() => {
		const loadPrintData = async () => {
			setLoading(true);
			try {
				const data = await getOrderPrint(orderId, printType);
				setPrintData(data);
			} catch (err: any) {
				// Toast error đã được xử lý tự động
			} finally {
				setLoading(false);
			}
		};

		void loadPrintData();
	}, [orderId, printType]);

	const handlePrint = () => {
		window.print();
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return (
			<Box p={8} textAlign="center">
				<Spinner size="xl" />
			</Box>
		);
	}

	if (!printData) {
		return null;
	}

	const isReceive = printType === 'Receive';

	return (
		<Box>
			{/* Print controls - chỉ hiện khi không in */}
			<Box className="no-print" mb={4} textAlign="right">
				<Button
					leftIcon={<FaPrint />}
					colorScheme="blue"
					onClick={handlePrint}
					_focus={{ boxShadow: 'none', outline: 'none' }}
				>
					In phiếu
				</Button>
				{onClose && (
					<Button ml={2} onClick={onClose} _focus={{ boxShadow: 'none', outline: 'none' }}>
						Đóng
					</Button>
				)}
			</Box>

			{/* Print content */}
			<Box
				bg="white"
				p={8}
				maxW="800px"
				mx="auto"
				border="1px solid"
				borderColor="gray.200"
				className="print-content"
			>
				{/* Header */}
				<Box mb={6} textAlign="center" borderBottom="2px solid" borderColor="gray.300" pb={4}>
					<Box fontSize="24px" fontWeight="bold" mb={2}>
						{printData.companyName || 'CỬA HÀNG GIẶT LÀ'}
					</Box>
					{printData.companyPhone && (
						<Box fontSize="14px" color="gray.600">
							ĐT: {printData.companyPhone}
						</Box>
					)}
					{printData.companyAddress && (
						<Box fontSize="14px" color="gray.600">
							{printData.companyAddress}
						</Box>
					)}
				</Box>

				{/* Title */}
				<Box fontSize="20px" fontWeight="bold" textAlign="center" mb={6}>
					{isReceive ? 'PHIẾU NHẬN ĐỒ' : 'PHIẾU GIAO ĐỒ'}
				</Box>

				{/* Order Info */}
				<Box mb={4}>
					<Box display="flex" justifyContent="space-between" mb={2}>
						<Box fontWeight="semibold">Mã đơn:</Box>
						<Box>{printData.orderCode}</Box>
					</Box>
					<Box display="flex" justifyContent="space-between" mb={2}>
						<Box fontWeight="semibold">Ngày {isReceive ? 'nhận' : 'giao'}:</Box>
						<Box>{formatDate(printData.orderDate)}</Box>
					</Box>
					<Box display="flex" justifyContent="space-between" mb={2}>
						<Box fontWeight="semibold">Khách hàng:</Box>
						<Box>{printData.partnerDisplayName || printData.partnerName}</Box>
					</Box>
					{printData.partnerPhone && (
						<Box display="flex" justifyContent="space-between" mb={2}>
							<Box fontWeight="semibold">SĐT:</Box>
							<Box>{printData.partnerPhone}</Box>
						</Box>
					)}
					{printData.partnerAddress && (
						<Box display="flex" justifyContent="space-between" mb={2}>
							<Box fontWeight="semibold">Địa chỉ:</Box>
							<Box>{printData.partnerAddress}</Box>
						</Box>
					)}
				</Box>

				{/* Items Table */}
				<Box mb={4}>
					<Box
						as="table"
						width="100%"
						border="1px solid"
						borderColor="gray.300"
						borderCollapse="collapse"
					>
						<Box as="thead" bg="gray.100">
							<Box as="tr">
								<Box as="th" p={2} border="1px solid" borderColor="gray.300" textAlign="left">
									STT
								</Box>
								<Box as="th" p={2} border="1px solid" borderColor="gray.300" textAlign="left">
									Dịch vụ
								</Box>
								<Box as="th" p={2} border="1px solid" borderColor="gray.300" textAlign="right">
									Số lượng
								</Box>
								<Box as="th" p={2} border="1px solid" borderColor="gray.300" textAlign="right">
									Đơn giá
								</Box>
								<Box as="th" p={2} border="1px solid" borderColor="gray.300" textAlign="right">
									Thành tiền
								</Box>
							</Box>
						</Box>
						<Box as="tbody">
							{printData.items.map((item, index) => (
								<Box as="tr" key={index}>
									<Box as="td" p={2} border="1px solid" borderColor="gray.300" textAlign="center">
										{index + 1}
									</Box>
									<Box as="td" p={2} border="1px solid" borderColor="gray.300">
										{item.serviceName}
									</Box>
									<Box as="td" p={2} border="1px solid" borderColor="gray.300" textAlign="right">
										{item.quantity} {item.unitOfMeasure}
									</Box>
									<Box as="td" p={2} border="1px solid" borderColor="gray.300" textAlign="right">
										{formatCurrency(item.unitPrice)}
									</Box>
									<Box as="td" p={2} border="1px solid" borderColor="gray.300" textAlign="right" fontWeight="semibold">
										{formatCurrency(item.totalPrice)}
									</Box>
								</Box>
							))}
						</Box>
					</Box>
				</Box>

				{/* Summary */}
				<Box mb={4} textAlign="right">
					<Box display="flex" justifyContent="flex-end" mb={2}>
						<Box fontWeight="semibold" mr={4} width="150px">
							Tổng tiền:
						</Box>
						<Box fontWeight="bold" fontSize="18px" width="200px" textAlign="right">
							{formatCurrency(printData.totalAmount)}
						</Box>
					</Box>
					{printData.paidAmount > 0 && (
						<Box display="flex" justifyContent="flex-end" mb={2}>
							<Box fontWeight="semibold" mr={4} width="150px">
								Đã thanh toán:
							</Box>
							<Box width="200px" textAlign="right" color="green.600">
								{formatCurrency(printData.paidAmount)}
							</Box>
						</Box>
					)}
					{printData.remainingAmount > 0 && (
						<Box display="flex" justifyContent="flex-end" mb={2}>
							<Box fontWeight="semibold" mr={4} width="150px">
								Còn lại:
							</Box>
							<Box width="200px" textAlign="right" color="red.600" fontWeight="bold">
								{formatCurrency(printData.remainingAmount)}
							</Box>
						</Box>
					)}
				</Box>

				{/* Notes */}
				{printData.notes && (
					<Box mb={4}>
						<Box fontWeight="semibold" mb={2}>
							Ghi chú:
						</Box>
						<Box>{printData.notes}</Box>
					</Box>
				)}

				{/* Footer */}
				<Box mt={8} pt={4} borderTop="1px solid" borderColor="gray.300">
					<Box display="flex" justifyContent="space-between">
						<Box textAlign="center">
							<Box fontWeight="semibold" mb={2}>
								{isReceive ? 'Người nhận' : 'Người giao'}
							</Box>
							<Box h="60px" borderBottom="1px solid" borderColor="gray.400" />
							<Box fontSize="12px" color="gray.600" mt={1}>
								(Ký, ghi rõ họ tên)
							</Box>
						</Box>
						<Box textAlign="center">
							<Box fontWeight="semibold" mb={2}>
								Khách hàng
							</Box>
							<Box h="60px" borderBottom="1px solid" borderColor="gray.400" />
							<Box fontSize="12px" color="gray.600" mt={1}>
								(Ký, ghi rõ họ tên)
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* Print styles */}
			<style>
				{`
					@media print {
						.no-print {
							display: none !important;
						}
						.print-content {
							border: none !important;
							box-shadow: none !important;
						}
						body {
							background: white !important;
						}
					}
				`}
			</style>
		</Box>
	);
};

export default OrderPrint;

