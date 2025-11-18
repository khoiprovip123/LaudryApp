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
	NumberInput,
	NumberInputField,
	Stack,
	Switch,
	Textarea,
	useToast,
	Box,
} from '@chakra-ui/react';
import { createService } from '../api/services';
import type { CreateServiceRequest } from '../api/services';
import { numberToWords } from '../utils/numberToWords';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
};

const ServiceCreateModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
	const [form, setForm] = useState<Omit<CreateServiceRequest, 'defaultCode'>>({
		name: '',
		unitPrice: 0,
		description: '',
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	const update = <K extends keyof Omit<CreateServiceRequest, 'defaultCode'>>(k: K, v: Omit<CreateServiceRequest, 'defaultCode'>[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createService(form);
			toast({ status: 'success', title: 'Tạo dịch vụ thành công' });
			onClose();
			// Reset form
			setForm({
				name: '',
				unitPrice: 0,
				description: '',
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
					<ModalHeader>Thêm dịch vụ mới</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên dịch vụ</FormLabel>
								<Input value={form.name} onChange={(e) => update('name', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Đơn giá</FormLabel>
								<NumberInput
									value={form.unitPrice}
									onChange={(_, value) => update('unitPrice', isNaN(value) ? 0 : value)}
									min={0}
									precision={2}
								>
									<NumberInputField />
								</NumberInput>
								{form.unitPrice > 0 && (
									<Box mt={2} fontSize="sm" color="gray.600" fontStyle="italic">
										{numberToWords(form.unitPrice)}
									</Box>
								)}
							</FormControl>
							<FormControl>
								<FormLabel>Mô tả</FormLabel>
								<Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} />
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

export default ServiceCreateModal;

