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
	HStack,
	Switch,
} from '@chakra-ui/react';
import { useToast } from '../hooks/useToast';
import { getCompanyById, updateCompany } from '../api/companies';
import type { UpdateCompanyRequest } from '../api/companies';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	companyId: string;
	onSuccess?: () => void;
};

const CompanyEditModal: React.FC<Props> = ({ isOpen, onClose, companyId, onSuccess }) => {
	const [form, setForm] = useState<UpdateCompanyRequest>({
		id: companyId,
		companyName: '',
		ownerName: '',
		phone: '',
		subscriptionStartDate: new Date().toISOString().slice(0, 10),
		periodLockDate: null,
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	useEffect(() => {
		if (isOpen && companyId) {
			(async () => {
				try {
					const data = await getCompanyById(companyId);
					setForm({
						id: companyId,
						companyName: data.companyName,
						ownerName: data.ownerName,
						phone: data.phone,
						subscriptionStartDate: data.subscriptionStartDate.slice(0, 10),
						periodLockDate: data.periodLockDate ? data.periodLockDate.slice(0, 10) : null,
						active: data.active,
					});
				} catch (err: any) {
					// Toast error đã được xử lý tự động bởi http wrapper
				}
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, companyId]);

	const update = <K extends keyof UpdateCompanyRequest>(k: K, v: UpdateCompanyRequest[K]) =>
		setForm((s: UpdateCompanyRequest) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateCompany(companyId, {
				...form,
				subscriptionStartDate: new Date(form.subscriptionStartDate).toISOString(),
				periodLockDate: form.periodLockDate ? new Date(form.periodLockDate).toISOString() : null,
			});
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
					<ModalHeader>Sửa công ty</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên công ty</FormLabel>
								<Input value={form.companyName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('companyName', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Chủ sở hữu</FormLabel>
								<Input value={form.ownerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('ownerName', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>SĐT</FormLabel>
								<Input value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('phone', e.target.value)} />
							</FormControl>
							<HStack>
								<FormControl isRequired>
									<FormLabel>Ngày bắt đầu</FormLabel>
									<Input
										type="date"
										value={form.subscriptionStartDate}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('subscriptionStartDate', e.target.value)}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Khóa kỳ</FormLabel>
									<Input
										type="date"
										value={form.periodLockDate ?? ''}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('periodLockDate', e.target.value || null)}
									/>
								</FormControl>
							</HStack>
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Hoạt động</FormLabel>
								<Switch isChecked={form.active} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('active', e.target.checked)} />
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

export default CompanyEditModal;

