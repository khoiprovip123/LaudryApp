import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Heading, HStack, Input, Stack, Switch, Textarea, Select, Divider } from '@chakra-ui/react';
import { useToast } from '../../hooks/useToast';
import { getServiceById, updateService } from '../../api/services';
import type { UpdateServiceRequest } from '../../api/services';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyFormat';

const ServiceEdit: React.FC = () => {
	const params = useParams<{ id: string }>();
	const id = params.id!;
	const [form, setForm] = useState<UpdateServiceRequest>({
		id,
		name: '',
		unitPrice: 0,
		unitOfMeasure: 'kg',
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

	useEffect(() => {
		(async () => {
			try {
				const data = await getServiceById(id);
				setForm({
					id,
					name: data.name,
					unitPrice: data.unitPrice,
					unitOfMeasure: data.unitOfMeasure || 'kg',
					minimumWeight: data.minimumWeight ?? null,
					minimumPrice: data.minimumPrice ?? null,
					description: data.description,
					defaultCode: data.defaultCode,
					active: data.active,
				});
				// Format giá trị ban đầu để hiển thị
				setUnitPriceDisplay(formatCurrencyInput(data.unitPrice));
				if (data.minimumPrice) {
					setMinimumPriceDisplay(formatCurrencyInput(data.minimumPrice));
				}
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const update = <K extends keyof UpdateServiceRequest>(k: K, v: UpdateServiceRequest[K]) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleUnitPriceChange = (value: string) => {
		// Format hiển thị với dấu chấm
		const formatted = formatCurrencyInput(value);
		setUnitPriceDisplay(formatted);
		
		// Parse về số để lưu vào form
		const parsed = parseCurrencyInput(value);
		update('unitPrice', parsed);
	};

	const handleMinimumPriceChange = (value: string) => {
		// Format hiển thị với dấu chấm
		const formatted = formatCurrencyInput(value);
		setMinimumPriceDisplay(formatted);
		
		// Parse về số để lưu vào form
		const parsed = parseCurrencyInput(value);
		update('minimumPrice', parsed || null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			// Đảm bảo gửi đầy đủ các trường, kể cả khi không phải kg
			const payload: UpdateServiceRequest = {
				id: form.id,
				name: form.name,
				unitPrice: form.unitPrice,
				unitOfMeasure: form.unitOfMeasure || 'kg',
				minimumWeight: form.unitOfMeasure === 'kg' ? form.minimumWeight : null,
				minimumPrice: form.unitOfMeasure === 'kg' ? form.minimumPrice : null,
				description: form.description,
				defaultCode: form.defaultCode,
				active: form.active,
			};
			await updateService(id, payload);
			toast({ status: 'success', title: 'Cập nhật thành công' });
			navigate('/services');
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Sửa dịch vụ</Heading>
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
										<FormLabel>Loại tính</FormLabel>
										<Select 
											value={form.unitOfMeasure || 'kg'} 
											onChange={(e) => {
												const newUnitOfMeasure = e.target.value;
												update('unitOfMeasure', newUnitOfMeasure);
												// Reset minimumWeight và minimumPrice khi không phải kg
												if (newUnitOfMeasure !== 'kg') {
													update('minimumWeight', null);
													update('minimumPrice', null);
													setMinimumPriceDisplay('');
												}
											}}
										>
											<option value="kg">kg</option>
											<option value="chiếc">chiếc</option>
											<option value="bộ">bộ</option>
										</Select>
									</FormControl>
									<FormControl isRequired>
										<FormLabel>Giá theo đơn vị (VND)</FormLabel>
										<Input
											value={unitPriceDisplay}
											onChange={(e) => handleUnitPriceChange(e.target.value)}
											placeholder="VD: 1.000.000"
											type="text"
											inputMode="numeric"
										/>
									</FormControl>
									{form.unitOfMeasure === 'kg' && (
										<>
											<FormControl>
												<FormLabel>Khối lượng tối thiểu (kg)</FormLabel>
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
												<FormLabel>Giá tối thiểu (VNĐ)</FormLabel>
												<Input
													value={minimumPriceDisplay}
													onChange={(e) => handleMinimumPriceChange(e.target.value)}
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

export default ServiceEdit;

