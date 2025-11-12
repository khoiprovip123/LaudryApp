import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardBody, FormControl, FormLabel, Heading, Input, Stack, Switch, useToast } from '@chakra-ui/react';
import { getCustomerById, updateCustomer } from '../../api/customers';
import type { UpdateCustomerRequest } from '../../api/customers';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerEdit: React.FC = () => {
	const params = useParams<{ id: string }>();
	const id = params.id!;
	const [form, setForm] = useState<UpdateCustomerRequest>({
		id,
		name: '',
		phone: '',
		address: '',
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const data = await getCustomerById(id);
				setForm({
					id,
					name: data.name,
					phone: data.phone,
					address: data.address ?? '',
					active: data.active,
				});
			} catch (err: any) {
				toast({ status: 'error', title: 'Không tải được dữ liệu', description: err?.message || 'Có lỗi xảy ra' });
			}
		})();
	}, [id, toast]);

	const update = <K extends keyof UpdateCustomerRequest>(k: K, v: UpdateCustomerRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateCustomer(id, form);
			toast({ status: 'success', title: 'Cập nhật thành công' });
			navigate('/customers');
		} catch (err: any) {
			toast({ status: 'error', title: 'Cập nhật thất bại', description: err?.message || 'Có lỗi xảy ra' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			<Heading size="md" mb={4}>
				Sửa khách hàng
			</Heading>
			<Card>
				<CardBody>
					<Box as="form" onSubmit={handleSubmit}>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên khách hàng</FormLabel>
								<Input value={form.name} onChange={(e) => update('name', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>SĐT</FormLabel>
								<Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
							</FormControl>
							<FormControl>
								<FormLabel>Địa chỉ</FormLabel>
								<Input value={form.address ?? ''} onChange={(e) => update('address', e.target.value)} />
							</FormControl>
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Active</FormLabel>
								<Switch isChecked={form.active} onChange={(e) => update('active', e.target.checked)} />
							</FormControl>
							<Box display="flex" gap={2}>
								<Button onClick={() => navigate('/customers')}>Hủy</Button>
								<Button type="submit" colorScheme="blue" isLoading={loading}>
									Lưu
								</Button>
							</Box>
						</Stack>
					</Box>
				</CardBody>
			</Card>
		</Box>
	);
};

export default CustomerEdit;


