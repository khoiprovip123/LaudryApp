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
import { createEmployee } from '../../api/employees';
import type { CreateEmployeeRequest } from '../../api/employees';
import { useNavigate } from 'react-router-dom';

const EmployeeCreate: React.FC = () => {
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
	const navigate = useNavigate();

	const update = <K extends keyof CreateEmployeeRequest>(k: K, v: CreateEmployeeRequest[K]) =>
		setForm((s: CreateEmployeeRequest) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createEmployee(form);
			toast({ status: 'success', title: 'Tạo nhân viên thành công' });
			navigate('/employees');
		} catch (err: any) {
			toast({ status: 'error', title: 'Tạo thất bại', description: err?.message || 'Có lỗi xảy ra' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Thêm nhân viên</Heading>
			</Flex>

			<div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
				<div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden p-4">
					<Box as="form" onSubmit={handleSubmit} className="h-full flex flex-col">
						<Stack spacing={4} className="flex-1">
							<HStack>
								<FormControl isRequired>
									<FormLabel>Tên đăng nhập</FormLabel>
									<Input value={form.userName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('userName', e.target.value)} />
								</FormControl>
								<FormControl isRequired>
									<FormLabel>Mật khẩu</FormLabel>
									<Input type="password" value={form.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('password', e.target.value)} />
								</FormControl>
							</HStack>
							<HStack>
								<FormControl isRequired>
									<FormLabel>Email</FormLabel>
									<Input type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('email', e.target.value)} />
								</FormControl>
								<FormControl>
									<FormLabel>SĐT</FormLabel>
									<Input value={form.phoneNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('phoneNumber', e.target.value)} />
								</FormControl>
							</HStack>
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Hoạt động</FormLabel>
								<Switch isChecked={form.active} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('active', e.target.checked)} />
							</FormControl>
							<HStack mt="auto" pt={4}>
								<Button 
									onClick={() => navigate('/employees')}
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

export default EmployeeCreate;

