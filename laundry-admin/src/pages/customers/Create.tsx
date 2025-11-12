import React, { useState } from 'react';
import { Box, Button, Card, CardBody, FormControl, FormLabel, Heading, Input, Stack, Switch, useToast } from '@chakra-ui/react';
import { createCustomer } from '../../api/customers';
import type { CreateCustomerRequest } from '../../api/customers';
import { useNavigate } from 'react-router-dom';

const CustomerCreate: React.FC = () => {
	const [form, setForm] = useState<CreateCustomerRequest>({
		name: '',
		phone: '',
		address: '',
		isCompany: false,
	});
	const [active, setActive] = useState(true);
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	const update = <K extends keyof CreateCustomerRequest>(k: K, v: CreateCustomerRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createCustomer(form);
			toast({ status: 'success', title: 'Tạo khách hàng thành công' });
			navigate('/customers');
		} catch (err: any) {
			toast({ status: 'error', title: 'Tạo thất bại', description: err?.message || 'Có lỗi xảy ra' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			<Heading size="md" mb={4}>
				Thêm khách hàng
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
								<Switch isChecked={active} onChange={(e) => setActive(e.target.checked)} />
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

export default CustomerCreate;


