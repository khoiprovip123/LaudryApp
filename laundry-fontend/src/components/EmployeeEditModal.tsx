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
import { getEmployeeById, updateEmployee } from '../api/employees';
import type { UpdateEmployeeRequest } from '../api/employees';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	employeeId: string;
	onSuccess?: () => void;
};

const EmployeeEditModal: React.FC<Props> = ({ isOpen, onClose, employeeId, onSuccess }) => {
	const [form, setForm] = useState<UpdateEmployeeRequest>({
		id: employeeId,
		email: '',
		phoneNumber: '',
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	useEffect(() => {
		if (isOpen && employeeId) {
			(async () => {
				try {
					const data = await getEmployeeById(employeeId);
					setForm({
						id: employeeId,
						email: data.email,
						phoneNumber: data.phoneNumber,
						active: data.active,
					});
				} catch (err: any) {
					// Toast error đã được xử lý tự động bởi http wrapper
				}
			})();
		}
	}, [isOpen, employeeId, toast]);

	const update = <K extends keyof UpdateEmployeeRequest>(k: K, v: UpdateEmployeeRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateEmployee(employeeId, form);
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
					<ModalHeader>Sửa nhân viên</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
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

export default EmployeeEditModal;

