import React, { useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Heading, HStack, Input, NumberInput, NumberInputField, Stack, Switch, Textarea, useToast } from '@chakra-ui/react';
import { createService } from '../../api/services';
import type { CreateServiceRequest } from '../../api/services';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const ServiceCreate: React.FC = () => {
	const [form, setForm] = useState<CreateServiceRequest>({
		name: '',
		unitPrice: 0,
		description: '',
		defaultCode: '',
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();
	const { handleError } = useErrorHandler();

	const update = <K extends keyof CreateServiceRequest>(k: K, v: CreateServiceRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createService(form);
			toast({ 
				status: 'success', 
				title: 'Tạo dịch vụ thành công',
				duration: 3000,
				isClosable: true,
			});
			navigate('/services');
		} catch (err: unknown) {
			// Sử dụng error handler để tự động parse và hiển thị lỗi từ BE
			handleError(err, { title: 'Tạo dịch vụ thất bại' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Thêm dịch vụ mới</Heading>
			</Flex>

			<div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
				<div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden p-4">
					<Box as="form" onSubmit={handleSubmit} className="h-full flex flex-col">
						<Stack spacing={4} className="flex-1">
							<FormControl isRequired>
								<FormLabel>Tên dịch vụ</FormLabel>
								<Input value={form.name} onChange={(e) => update('name', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Mã dịch vụ</FormLabel>
								<Input value={form.defaultCode} onChange={(e) => update('defaultCode', e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Đơn giá</FormLabel>
								<NumberInput
									value={form.unitPrice}
									onChange={(_, value) => update('unitPrice', isNaN(value) ? 0 : value)}
									min={0}
									precision={2}
								>
									<NumberInputField />
								</NumberInput>
							</FormControl>
							<FormControl>
								<FormLabel>Mô tả</FormLabel>
								<Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} />
							</FormControl>
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Active</FormLabel>
								<Switch isChecked={form.active} onChange={(e) => update('active', e.target.checked)} />
							</FormControl>
							<HStack mt="auto" pt={4}>
								<Button 
									onClick={() => navigate('/services')}
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

export default ServiceCreate;

