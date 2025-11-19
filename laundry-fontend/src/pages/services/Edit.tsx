import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Heading, HStack, Input, Stack, Switch, Textarea, useToast } from '@chakra-ui/react';
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
		description: '',
		defaultCode: '',
		active: true,
	});
	const [unitPriceDisplay, setUnitPriceDisplay] = useState<string>('');
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
					description: data.description,
					defaultCode: data.defaultCode,
					active: data.active,
				});
				// Format giá trị ban đầu để hiển thị
				setUnitPriceDisplay(formatCurrencyInput(data.unitPrice));
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
			}
		})();
	}, [id, toast]);

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateService(id, form);
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
							<FormControl isRequired>
								<FormLabel>Đơn giá (VND)</FormLabel>
								<Input
									value={unitPriceDisplay}
									onChange={(e) => handleUnitPriceChange(e.target.value)}
									placeholder="VD: 1.000.000"
									type="text"
									inputMode="numeric"
								/>
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

export default ServiceEdit;

