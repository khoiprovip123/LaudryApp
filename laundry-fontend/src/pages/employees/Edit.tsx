import React, { useState, useEffect } from 'react';
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
	Spinner,
} from '@chakra-ui/react';
import { updateEmployee, getEmployeeById } from '../../api/employees';
import type { UpdateEmployeeRequest } from '../../api/employees';
import { useNavigate, useParams } from 'react-router-dom';

const EmployeeEdit: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [form, setForm] = useState<UpdateEmployeeRequest>({
		id: id || '',
		email: '',
		phoneNumber: '',
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		const loadData = async () => {
			if (!id) return;
			setLoadingData(true);
			try {
				const employee = await getEmployeeById(id);
				setForm({
					id: employee.id,
					email: employee.email,
					phoneNumber: employee.phoneNumber,
					active: employee.active,
				});
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
				navigate('/employees');
			} finally {
				setLoadingData(false);
			}
		};
		void loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const update = <K extends keyof UpdateEmployeeRequest>(k: K, v: UpdateEmployeeRequest[K]) =>
		setForm((s: UpdateEmployeeRequest) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateEmployee(id!, form);
			toast({ status: 'success', title: 'Cập nhật nhân viên thành công' });
			navigate('/employees');
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	if (loadingData) {
		return (
			<Flex justify="center" align="center" h="100%">
				<Spinner />
			</Flex>
		);
	}

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Sửa nhân viên</Heading>
			</Flex>

			<div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
				<div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden p-4">
					<Box as="form" onSubmit={handleSubmit} className="h-full flex flex-col">
						<Stack spacing={4} className="flex-1">
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

export default EmployeeEdit;

