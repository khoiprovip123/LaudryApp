import React, { useState } from 'react';
import {
	Box,
	Button,
	Card,
	CardBody,
	FormControl,
	FormLabel,
	Heading,
	HStack,
	Input,
	Stack,
	Switch,
	useToast,
} from '@chakra-ui/react';
import { createCompany } from '../../api/companies';
import type { CreateCompanyRequest } from '../../api/companies';
import { useNavigate } from 'react-router-dom';

const CompanyCreate: React.FC = () => {
	const [form, setForm] = useState<CreateCompanyRequest>({
		companyName: '',
		ownerName: '',
		userName: '',
		password: '',
		phone: '',
		subscriptionStartDate: new Date().toISOString().slice(0, 10),
		periodLockDate: null,
		active: true,
		isActive: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	const update = <K extends keyof CreateCompanyRequest>(k: K, v: CreateCompanyRequest[K]) =>
		setForm((s: CreateCompanyRequest) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createCompany({
				...form,
				subscriptionStartDate: new Date(form.subscriptionStartDate).toISOString(),
				periodLockDate: form.periodLockDate ? new Date(form.periodLockDate).toISOString() : null,
			});
			toast({ status: 'success', title: 'Tạo công ty thành công' });
			navigate('/companies');
		} catch (err: any) {
			toast({ status: 'error', title: 'Tạo thất bại', description: err?.message || 'Có lỗi xảy ra' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			<Heading size="md" mb={4}>
				Thêm công ty
			</Heading>
			<Card>
				<CardBody>
					<Box as="form" onSubmit={handleSubmit}>
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
							<HStack>
								<FormControl display="flex" alignItems="center">
									<FormLabel mb="0">Active</FormLabel>
									<Switch isChecked={form.active} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('active', e.target.checked)} />
								</FormControl>
								<FormControl display="flex" alignItems="center">
									<FormLabel mb="0">Partner Active</FormLabel>
									<Switch isChecked={form.isActive} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('isActive', e.target.checked)} />
								</FormControl>
							</HStack>
							<HStack>
								<FormControl isRequired>
									<FormLabel>UserName (tạo user gốc)</FormLabel>
									<Input value={form.userName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('userName', e.target.value)} />
								</FormControl>
								<FormControl isRequired>
									<FormLabel>Password</FormLabel>
									<Input type="password" value={form.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('password', e.target.value)} />
								</FormControl>
							</HStack>
							<HStack>
								<Button onClick={() => navigate('/companies')}>Hủy</Button>
								<Button type="submit" colorScheme="blue" isLoading={loading}>
									Lưu
								</Button>
							</HStack>
						</Stack>
					</Box>
				</CardBody>
			</Card>
		</Box>
	);
};

export default CompanyCreate;


