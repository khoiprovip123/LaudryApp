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
	useToast,
	Box,
} from '@chakra-ui/react';
import { createEmployee } from '../api/employees';
import type { CreateEmployeeRequest } from '../api/employees';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
};

const EmployeeCreateModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
	const [form, setForm] = useState<CreateEmployeeRequest>({
		userName: '',
		email: '',
		phoneNumber: '',
		password: '',
		companyId: null,
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	const update = <K extends keyof CreateEmployeeRequest>(k: K, v: CreateEmployeeRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createEmployee(form);
			toast({ status: 'success', title: 'Tạo nhân viên thành công' });
			onClose();
			// Reset form
			setForm({
				userName: '',
				email: '',
				phoneNumber: '',
				password: '',
				companyId: null,
				active: true,
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
					<ModalHeader>Thêm nhân viên mới</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên đăng nhập</FormLabel>
								<Input value={form.userName} onChange={(e) => update('userName', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Mật khẩu</FormLabel>
								<Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Email</FormLabel>
								<Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
							</FormControl>
							<FormControl>
								<FormLabel>SĐT</FormLabel>
								<Input value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} />
							</FormControl>
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

export default EmployeeCreateModal;

