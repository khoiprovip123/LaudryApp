import React, { useState } from 'react';
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
	Stack,
	Switch,
	Textarea,
	Box,
	Divider,
	Heading,
} from '@chakra-ui/react';
import { useToast } from '../hooks/useToast';
import { createService } from '../api/services';
import type { CreateServiceRequest } from '../api/services';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyFormat';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
};

const ServiceCreateModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
	const [form, setForm] = useState<Omit<CreateServiceRequest, 'defaultCode'>>({
		name: '',
		unitPrice: 0,
		unitOfMeasure: 'chiếc',
		isWeightBased: false,
		minimumWeight: null,
		minimumPrice: null,
		description: '',
		active: true,
	});
	const [unitPriceDisplay, setUnitPriceDisplay] = useState<string>('');
	const [minimumPriceDisplay, setMinimumPriceDisplay] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	const update = <K extends keyof Omit<CreateServiceRequest, 'defaultCode'>>(k: K, v: Omit<CreateServiceRequest, 'defaultCode'>[K]) =>
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
			const payload: CreateServiceRequest = {
				name: form.name,
				unitPrice: form.unitPrice,
				unitOfMeasure: form.unitOfMeasure || 'chiếc',
				isWeightBased: form.isWeightBased,
				minimumWeight: form.isWeightBased ? form.minimumWeight : null,
				minimumPrice: form.isWeightBased ? form.minimumPrice : null,
				description: form.description,
				active: form.active,
			};
			await createService(payload);
			toast({ status: 'success', title: 'Tạo dịch vụ thành công' });
			onClose();
			// Reset form
			setForm({
				name: '',
				unitPrice: 0,
				unitOfMeasure: 'chiếc',
				isWeightBased: false,
				minimumWeight: null,
				minimumPrice: null,
				description: '',
				active: true,
			});
			setUnitPriceDisplay('');
			setMinimumPriceDisplay('');
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
					<ModalHeader>Thêm dịch vụ mới</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên dịch vụ</FormLabel>
								<Input value={form.name} onChange={(e) => update('name', e.target.value)} />
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
										<FormLabel>Giá theo đơn vị (VND)</FormLabel>
										<Input
											value={unitPriceDisplay}
											onChange={(e) => handleUnitPriceChange(e.target.value)}
											placeholder="VD: 1.000.000"
											type="text"
											inputMode="numeric"
										/>
									</FormControl>
									<FormControl display="flex" alignItems="center">
										<FormLabel mb="0">Tính trên kg</FormLabel>
										<Switch 
											isChecked={form.isWeightBased}
											onChange={(e) => {
												const checked = e.target.checked;
												update('isWeightBased', checked);
												if (checked) {
													update('unitOfMeasure', 'kg');
												} else {
													update('unitOfMeasure', 'chiếc');
													update('minimumWeight', null);
													update('minimumPrice', null);
													setMinimumPriceDisplay('');
												}
											}}
										/>
									</FormControl>
									{form.isWeightBased && (
										<>
											<FormControl>
												<FormLabel>Số kg tối thiểu</FormLabel>
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
												<FormLabel>Số tiền tối thiểu (VNĐ)</FormLabel>
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

export default ServiceCreateModal;

