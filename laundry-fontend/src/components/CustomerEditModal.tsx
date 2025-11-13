import React, { useEffect, useState } from 'react';
import {
	Box,
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
	useToast,
} from '@chakra-ui/react';
import { getCustomerById, updateCustomer } from '../api/customers';
import type { UpdateCustomerRequest } from '../api/customers';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	customerId: string;
	onSuccess?: () => void;
};

const CustomerEditModal: React.FC<Props> = ({ isOpen, onClose, customerId, onSuccess }) => {
	const [form, setForm] = useState<UpdateCustomerRequest>({
		id: customerId,
		name: '',
		phone: '',
		address: '',
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	useEffect(() => {
		if (isOpen && customerId) {
			(async () => {
				try {
					const data = await getCustomerById(customerId);
					setForm({
						id: customerId,
						name: data.name,
						phone: data.phone,
						address: data.address ?? '',
						active: data.active,
					});
				} catch (err: any) {
					toast({ status: 'error', title: 'Không tải được dữ liệu', description: err?.message || 'Có lỗi xảy ra' });
				}
			})();
		}
	}, [isOpen, customerId, toast]);

	const update = <K extends keyof UpdateCustomerRequest>(k: K, v: UpdateCustomerRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateCustomer(customerId, form);
			toast({ status: 'success', title: 'Cập nhật thành công' });
			onClose();
			onSuccess?.();
		} catch (err: any) {
			toast({ status: 'error', title: 'Cập nhật thất bại', description: err?.message || 'Có lỗi xảy ra' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalOverlay />
			<ModalContent>
				<Box as="form" onSubmit={handleSubmit}>
					<ModalHeader>Sửa khách hàng</ModalHeader>
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
								<FormLabel>Địa chỉ</FormLabel>
								<Input value={form.address ?? ''} onChange={(e) => update('address', e.target.value)} />
							</FormControl>
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Active</FormLabel>
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

export default CustomerEditModal;

