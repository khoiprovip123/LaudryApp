import React, { useEffect, useState } from 'react';
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
import { getCompanyById, updateCompany } from '../../api/companies';
import type { UpdateCompanyRequest } from '../../api/companies';
import { useNavigate, useParams } from 'react-router-dom';

const CompanyEdit: React.FC = () => {
	const params = useParams<{ id: string }>();
	const id = params.id!;
	const [form, setForm] = useState<UpdateCompanyRequest>({
		id,
		companyName: '',
		ownerName: '',
		phone: '',
		subscriptionStartDate: new Date().toISOString().slice(0, 10),
		periodLockDate: null,
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const data = await getCompanyById(id);
				setForm({
					id,
					companyName: data.companyName,
					ownerName: data.ownerName,
					phone: data.phone,
					subscriptionStartDate: data.subscriptionStartDate.slice(0, 10),
					periodLockDate: data.periodLockDate ? data.periodLockDate.slice(0, 10) : null,
					active: data.active,
				});
			} catch (err: any) {
				toast({ status: 'error', title: 'Không tải được dữ liệu', description: err?.message || 'Có lỗi xảy ra' });
			}
		})();
	}, [id, toast]);

	const update = <K extends keyof UpdateCompanyRequest>(k: K, v: UpdateCompanyRequest[K]) =>
		setForm((s: UpdateCompanyRequest) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateCompany(id, {
				...form,
				subscriptionStartDate: new Date(form.subscriptionStartDate).toISOString(),
				periodLockDate: form.periodLockDate ? new Date(form.periodLockDate).toISOString() : null,
			});
			toast({ status: 'success', title: 'Cập nhật thành công' });
			navigate('/companies');
		} catch (err: any) {
			toast({ status: 'error', title: 'Cập nhật thất bại', description: err?.message || 'Có lỗi xảy ra' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			<Heading size="md" mb={4}>
				Sửa công ty
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
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Active</FormLabel>
								<Switch isChecked={form.active} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('active', e.target.checked)} />
							</FormControl>
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

export default CompanyEdit;


