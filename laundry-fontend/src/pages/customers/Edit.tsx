import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Heading, HStack, Input, Stack, Switch } from '@chakra-ui/react';
import { useToast } from '../../hooks/useToast';
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
		phoneLastThreeDigits: '',
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
					phoneLastThreeDigits: data.phoneLastThreeDigits ?? '',
					address: data.address ?? '',
					active: data.active,
				});
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const update = <K extends keyof UpdateCustomerRequest>(k: K, v: UpdateCustomerRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	// Hàm tự động lấy 3 số cuối từ số điện thoại
	const extractLastThreeDigits = (phone: string): string => {
		if (!phone) return '';
		// Tìm tất cả các chuỗi số trong phone
		const digitsOnly = phone.match(/\d+/g);
		if (digitsOnly && digitsOnly.length > 0) {
			const lastMatch = digitsOnly[digitsOnly.length - 1];
			if (lastMatch.length >= 3) {
				return lastMatch.substring(lastMatch.length - 3);
			} else if (lastMatch.length > 0) {
				return lastMatch;
			}
		}
		return '';
	};

	// Xử lý khi thay đổi số điện thoại
	const handlePhoneChange = (value: string) => {
		update('phone', value);
		// Nếu chưa có phoneLastThreeDigits hoặc đang rỗng, tự động điền từ phone
		if (!form.phoneLastThreeDigits || form.phoneLastThreeDigits === '') {
			const lastThree = extractLastThreeDigits(value);
			if (lastThree) {
				update('phoneLastThreeDigits', lastThree);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateCustomer(id, form);
			toast({ status: 'success', title: 'Cập nhật thành công' });
			navigate('/customers');
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Sửa khách hàng</Heading>
			</Flex>

			<div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
				<div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden p-4">
					<Box as="form" onSubmit={handleSubmit} className="h-full flex flex-col">
						<Stack spacing={4} className="flex-1">
							<FormControl isRequired>
								<FormLabel>Tên khách hàng</FormLabel>
								<Input value={form.name} onChange={(e) => update('name', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>SĐT</FormLabel>
								<Input 
									value={form.phone} 
									onChange={(e) => handlePhoneChange(e.target.value)} 
									placeholder="VD: 0123456789"
								/>
							</FormControl>
							<FormControl>
								<FormLabel>3 số cuối SĐT (để tìm kiếm nhanh)</FormLabel>
								<Input 
									value={form.phoneLastThreeDigits ?? ''} 
									onChange={(e) => {
										// Chỉ cho phép nhập số và tối đa 3 ký tự
										const value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
										update('phoneLastThreeDigits', value);
									}}
									maxLength={3}
									placeholder="Tự động điền từ SĐT hoặc nhập thủ công"
									disabled={!!form.phone && extractLastThreeDigits(form.phone) === form.phoneLastThreeDigits}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Địa chỉ</FormLabel>
								<Input value={form.address ?? ''} onChange={(e) => update('address', e.target.value)} />
							</FormControl>
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Active</FormLabel>
								<Switch isChecked={form.active} onChange={(e) => update('active', e.target.checked)} />
							</FormControl>
							<HStack mt="auto" pt={4}>
								<Button 
									onClick={() => navigate('/customers')}
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

export default CustomerEdit;


