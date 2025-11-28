import React, { useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Heading, HStack, Input, Stack, Switch, Textarea, Divider } from '@chakra-ui/react';
import { useToast } from '../../hooks/useToast';
import { createService } from '../../api/services';
import type { CreateServiceRequest } from '../../api/services';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { formatPriceInput, parsePriceInput } from '../../utils/currencyFormat';

const ServiceCreate: React.FC = () => {
	const [form, setForm] = useState<CreateServiceRequest>({
		name: '',
		unitPrice: 0,
		unitOfMeasure: 'chiếc',
		isWeightBased: false,
		minimumWeight: null,
		minimumPrice: null,
		description: '',
		defaultCode: '',
		active: true,
	});
	const [unitPriceDisplay, setUnitPriceDisplay] = useState<string>('');
	const [minimumPriceDisplay, setMinimumPriceDisplay] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();
	const { handleError } = useErrorHandler();

	const update = <K extends keyof CreateServiceRequest>(k: K, v: CreateServiceRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		
		// Format hiển thị với dấu chấm
		const formatted = formatPriceInput(value);
		setUnitPriceDisplay(formatted);
		
		// Parse về số để lưu vào form
		const parsed = parsePriceInput(value);
		update('unitPrice', parsed);
	};

	const handleMinimumPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		
		// Format hiển thị với dấu chấm
		const formatted = formatPriceInput(value);
		setMinimumPriceDisplay(formatted);
		
		// Parse về số để lưu vào form
		const parsed = parsePriceInput(value);
		update('minimumPrice', parsed || null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			// Đảm bảo gửi đầy đủ các trường, kể cả khi không phải kg
			const payload: CreateServiceRequest = {
				name: form.name,
				unitPrice: form.unitPrice,
				unitOfMeasure: form.unitOfMeasure || 'chiếc',
				isWeightBased: form.isWeightBased,
				minimumWeight: form.isWeightBased ? form.minimumWeight : null,
				minimumPrice: form.isWeightBased ? form.minimumPrice : null,
				description: form.description,
				defaultCode: form.defaultCode,
				active: form.active,
			};
			await createService(payload);
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
							<FormControl>
								<FormLabel>Mô tả</FormLabel>
								<Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} />
							</FormControl>

							<Divider />

							<Box>
								<Heading size="sm" mb={4} color="gray.700">
									🔧 Cấu hình nâng cao cho dịch vụ
								</Heading>
								<Stack spacing={4}>
									<FormControl isRequired>
										<FormLabel>Giá theo đơn vị (VND)</FormLabel>
										<Input
											value={unitPriceDisplay}
											onChange={handleUnitPriceChange}
											placeholder="VD: 1.000.000"
											type="text"
											inputMode="numeric"
										/>
									</FormControl>
									<FormControl display="flex" alignItems="center">
										<FormLabel mb="0">Tính trên kg</FormLabel>
										<Switch 
											isChecked={form.isWeightBased}
											onChange={(e) => {
												const checked = e.target.checked;
												update('isWeightBased', checked);
												if (checked) {
													update('unitOfMeasure', 'kg');
												} else {
													update('unitOfMeasure', 'chiếc');
													update('minimumWeight', null);
													update('minimumPrice', null);
													setMinimumPriceDisplay('');
												}
											}}
										/>
									</FormControl>
									{form.isWeightBased && (
										<>
											<FormControl>
												<FormLabel>Số kg tối thiểu</FormLabel>
												<Input
													type="number"
													value={form.minimumWeight ?? ''}
													onChange={(e) => update('minimumWeight', e.target.value ? parseFloat(e.target.value) : null)}
													placeholder="VD: 2.5"
													step="0.1"
													min="0"
												/>
											</FormControl>
											<FormControl>
												<FormLabel>Số tiền tối thiểu (VNĐ)</FormLabel>
												<Input
													value={minimumPriceDisplay}
													onChange={handleMinimumPriceChange}
													placeholder="VD: 50.000"
													type="text"
													inputMode="numeric"
												/>
												<Box mt={1} fontSize="xs" color="gray.500">
													Tự động điền trên FE, có thể tùy chỉnh khi tạo đơn hàng
												</Box>
											</FormControl>
										</>
									)}
								</Stack>
							</Box>

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

