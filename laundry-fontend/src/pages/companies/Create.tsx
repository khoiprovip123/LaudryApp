import React, { useState } from 'react';
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
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Thêm công ty</Heading>
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

export default CompanyCreate;


