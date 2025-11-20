import React, { useEffect, useState } from 'react';
import {
	Box,
	Button,
	Flex,
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
				// Toast error đã được xử lý tự động bởi http wrapper
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

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
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Sửa công ty</Heading>
			</Flex>

			<div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
				<div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden p-4">
					<Box as="form" onSubmit={handleSubmit} className="h-full flex flex-col">
						<Stack spacing={4} className="flex-1">
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
										lang="vi-VN"
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Khóa kỳ</FormLabel>
									<Input
										type="date"
										value={form.periodLockDate ?? ''}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('periodLockDate', e.target.value || null)}
										lang="vi-VN"
									/>
								</FormControl>
							</HStack>
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Active</FormLabel>
								<Switch isChecked={form.active} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('active', e.target.checked)} />
							</FormControl>
							<HStack mt="auto" pt={4}>
								<Button 
									onClick={() => navigate('/companies')}
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
							</HStack>
						</Stack>
					</Box>
				</div>
			</div>
		</Box>
	);
};

export default CompanyEdit;


