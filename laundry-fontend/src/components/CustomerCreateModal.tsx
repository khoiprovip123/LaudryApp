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
	useToast,
	Box,
} from '@chakra-ui/react';
import { createCustomer } from '../api/customers';
import type { CreateCustomerRequest } from '../api/customers';
import AddressAutocomplete, { type AddressSuggestion } from './AddressAutocomplete';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
};

const CustomerCreateModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
	const [form, setForm] = useState<CreateCustomerRequest>({
		name: '',
		phone: '',
		phoneLastThreeDigits: '',
		address: '',
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	const handleAddressSelect = (address: AddressSuggestion) => {
		// Có thể lưu thêm thông tin địa chỉ chi tiết nếu cần
		// Ví dụ: cityCode, districtCode, wardCode từ address object
		if (address.address.city) {
			// Có thể cập nhật form với thông tin chi tiết hơn
		}
	};

	const update = <K extends keyof CreateCustomerRequest>(k: K, v: CreateCustomerRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createCustomer(form);
			toast({ status: 'success', title: 'Tạo khách hàng thành công' });
			onClose();
			// Reset form
			setForm({
				name: '',
				phone: '',
				address: '',
				phoneLastThreeDigits: '',
			});
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
					<ModalHeader>Thêm khách hàng mới</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên khách hàng</FormLabel>
								<Input value={form.name} onChange={(e) => update('name', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>SĐT</FormLabel>
								<Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
							</FormControl>
							<FormControl>
								<FormLabel>3 số cuối SĐT (để tìm kiếm nhanh)</FormLabel>
								<Input 
									value={form.phoneLastThreeDigits ?? ''} 
									onChange={(e) => {
										// Chỉ cho phép nhập số và tối đa 3 ký tự
										const value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
										update('phoneLastThreeDigits', value);
									}}
									maxLength={3}
									placeholder="VD: 678"
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Địa chỉ</FormLabel>
								<AddressAutocomplete
									value={form.address ?? ''}
									onChange={(value) => update('address', value)}
									onSelect={handleAddressSelect}
									placeholder="Nhập địa chỉ để tìm kiếm..."
								/>
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

export default CustomerCreateModal;

