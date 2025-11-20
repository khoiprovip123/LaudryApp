import React, { useEffect, useState } from 'react';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Button,
	FormControl,
	FormLabel,
	Input,
	NumberInput,
	NumberInputField,
	Stack,
	Switch,
	Textarea,
	Box,
	Select,
	Divider,
	Heading,
} from '@chakra-ui/react';
import { useToast } from '../hooks/useToast';
import { getServiceById, updateService } from '../api/services';
import type { UpdateServiceRequest } from '../api/services';
import { numberToWords } from '../utils/numberToWords';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyFormat';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	serviceId: string;
	onSuccess?: () => void;
};

const ServiceEditModal: React.FC<Props> = ({ isOpen, onClose, serviceId, onSuccess }) => {
	const [form, setForm] = useState<UpdateServiceRequest>({
		id: serviceId,
		name: '',
		unitPrice: 0,
		unitOfMeasure: 'kg',
		minimumWeight: null,
		minimumPrice: null,
		description: '',
		defaultCode: '',
		active: true,
	});
	const [unitPriceDisplay, setUnitPriceDisplay] = useState<string>('');
	const [minimumPriceDisplay, setMinimumPriceDisplay] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	useEffect(() => {
		if (isOpen && serviceId) {
			(async () => {
				try {
					const data = await getServiceById(serviceId);
					setForm({
						id: serviceId,
						name: data.name,
						unitPrice: data.unitPrice,
						unitOfMeasure: data.unitOfMeasure || 'kg',
						minimumWeight: data.minimumWeight ?? null,
						minimumPrice: data.minimumPrice ?? null,
						description: data.description,
						defaultCode: data.defaultCode,
						active: data.active,
					});
					setUnitPriceDisplay(formatCurrencyInput(data.unitPrice));
					if (data.minimumPrice) {
						setMinimumPriceDisplay(formatCurrencyInput(data.minimumPrice));
					}
				} catch (err: any) {
					// Toast error đã được xử lý tự động bởi http wrapper
				}
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, serviceId]);

	const update = <K extends keyof UpdateServiceRequest>(k: K, v: UpdateServiceRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleUnitPriceChange = (value: string) => {
		const formatted = formatCurrencyInput(value);
		setUnitPriceDisplay(formatted);
		const parsed = parseCurrencyInput(value);
		update('unitPrice', parsed);
	};

	const handleMinimumPriceChange = (value: string) => {
		const formatted = formatCurrencyInput(value);
		setMinimumPriceDisplay(formatted);
		const parsed = parseCurrencyInput(value);
		update('minimumPrice', parsed || null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			// Đảm bảo gửi đầy đủ các trường
			const payload: UpdateServiceRequest = {
				id: form.id,
				name: form.name,
				unitPrice: form.unitPrice,
				unitOfMeasure: form.unitOfMeasure || 'kg',
				minimumWeight: form.unitOfMeasure === 'kg' ? form.minimumWeight : null,
				minimumPrice: form.unitOfMeasure === 'kg' ? form.minimumPrice : null,
				description: form.description,
				defaultCode: form.defaultCode,
				active: form.active,
			};
			await updateService(serviceId, payload);
			toast({ status: 'success', title: 'Cập nhật thành công' });
			onClose();
			onSuccess?.();
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalOverlay />
			<ModalContent>
				<Box as="form" onSubmit={handleSubmit}>
					<ModalHeader>Sửa dịch vụ</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên dịch vụ</FormLabel>
								<Input value={form.name} onChange={(e) => update('name', e.target.value)} />
							</FormControl>
							<FormControl>
								<FormLabel>Mã dịch vụ</FormLabel>
								<Input value={form.defaultCode} isReadOnly bg="gray.50" cursor="not-allowed" />
							</FormControl>
							<FormControl>
								<FormLabel>Mô tả</FormLabel>
								<Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} />
							</FormControl>

							<Divider />

							<Box>
								<Heading size="sm" mb={4} color="gray.700">
									🔧 Cấu hình nâng cao cho dịch vụ
								</Heading>
								<Stack spacing={4}>
									<FormControl isRequired>
										<FormLabel>Loại tính</FormLabel>
										<Select 
											value={form.unitOfMeasure || 'kg'} 
											onChange={(e) => {
												const newUnitOfMeasure = e.target.value;
												update('unitOfMeasure', newUnitOfMeasure);
												if (newUnitOfMeasure !== 'kg') {
													update('minimumWeight', null);
													update('minimumPrice', null);
													setMinimumPriceDisplay('');
												}
											}}
										>
											<option value="kg">kg</option>
											<option value="chiếc">chiếc</option>
											<option value="bộ">bộ</option>
										</Select>
									</FormControl>
									<FormControl isRequired>
										<FormLabel>Giá theo đơn vị (VND)</FormLabel>
										<Input
											value={unitPriceDisplay}
											onChange={(e) => handleUnitPriceChange(e.target.value)}
											placeholder="VD: 1.000.000"
											type="text"
											inputMode="numeric"
										/>
									</FormControl>
									{form.unitOfMeasure === 'kg' && (
										<>
											<FormControl>
												<FormLabel>Khối lượng tối thiểu (kg)</FormLabel>
												<Input
													type="number"
													value={form.minimumWeight ?? ''}
													onChange={(e) => update('minimumWeight', e.target.value ? parseFloat(e.target.value) : null)}
													placeholder="VD: 2.5"
													step="0.1"
													min="0"
												/>
											</FormControl>
											<FormControl>
												<FormLabel>Giá tối thiểu (VNĐ)</FormLabel>
												<Input
													value={minimumPriceDisplay}
													onChange={(e) => handleMinimumPriceChange(e.target.value)}
													placeholder="VD: 50.000"
													type="text"
													inputMode="numeric"
												/>
												<Box mt={1} fontSize="xs" color="gray.500">
													Tự động điền trên FE, có thể tùy chỉnh khi tạo đơn hàng
												</Box>
											</FormControl>
										</>
									)}
								</Stack>
							</Box>

							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Hoạt động</FormLabel>
								<Switch isChecked={form.active} onChange={(e) => update('active', e.target.checked)} />
							</FormControl>
						</Stack>
					</ModalBody>
					<ModalFooter>
						<Button 
							mr={3} 
							onClick={onClose}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							Hủy
						</Button>
						<Button 
							type="submit" 
							colorScheme="blue" 
							isLoading={loading}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							Lưu
						</Button>
					</ModalFooter>
				</Box>
			</ModalContent>
		</Modal>
	);
};

export default ServiceEditModal;

