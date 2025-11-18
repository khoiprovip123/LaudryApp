import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	Flex,
	Heading,
	HStack,
	useToast,
	Spinner,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	Checkbox,
	Badge,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	useDisclosure,
	VStack,
	Text,
	IconButton,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPermissionGroupById, getEmployeesByPermissionGroup, addEmployeesToPermissionGroup, removeEmployeesFromPermissionGroup } from '../../api/permissionGroups';
import { getEmployees, type EmployeeDto } from '../../api/employees';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';

const ManageEmployees: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	
	const [permissionGroup, setPermissionGroup] = useState<any>(null);
	const [employees, setEmployees] = useState<EmployeeDto[]>([]);
	const [allEmployees, setAllEmployees] = useState<EmployeeDto[]>([]);
	const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
	const [loadingData, setLoadingData] = useState(true);
	const [adding, setAdding] = useState(false);
	const [removing, setRemoving] = useState<string | null>(null);

	useEffect(() => {
		const loadData = async () => {
			if (!id) return;
			setLoadingData(true);
			try {
				const [group, employeesData] = await Promise.all([
					getPermissionGroupById(id),
					getEmployeesByPermissionGroup(id),
				]);
				setPermissionGroup(group);
				setEmployees(employeesData);
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
				navigate('/permission-groups');
			} finally {
				setLoadingData(false);
			}
		};
		void loadData();
	}, [id, navigate, toast]);

	const loadAllEmployees = async () => {
		try {
			const res = await getEmployees({ limit: 1000 });
			// Lọc ra các nhân viên chưa có trong nhóm
			const existingIds = employees.map(e => e.id);
			const availableEmployees = res.items.filter(e => !existingIds.includes(e.id));
			setAllEmployees(availableEmployees);
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		}
	};

	const handleOpenModal = async () => {
		await loadAllEmployees();
		setSelectedEmployeeIds([]);
		onOpen();
	};

	const handleAddEmployees = async () => {
		if (selectedEmployeeIds.length === 0) {
			toast({
				status: 'warning',
				title: 'Vui lòng chọn nhân viên',
			});
			return;
		}

		setAdding(true);
		try {
			await addEmployeesToPermissionGroup(id!, {
				permissionGroupId: id!,
				employeeIds: selectedEmployeeIds,
			});
			toast({ status: 'success', title: 'Thêm nhân viên thành công' });
			onClose();
			// Reload danh sách nhân viên
			const employeesData = await getEmployeesByPermissionGroup(id!);
			setEmployees(employeesData);
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setAdding(false);
		}
	};

	const handleRemoveEmployee = async (employeeId: string) => {
		setRemoving(employeeId);
		try {
			await removeEmployeesFromPermissionGroup(id!, {
				permissionGroupId: id!,
				employeeIds: [employeeId],
			});
			toast({ status: 'success', title: 'Xóa nhân viên thành công' });
			// Reload danh sách nhân viên
			const employeesData = await getEmployeesByPermissionGroup(id!);
			setEmployees(employeesData);
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setRemoving(null);
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
		<Box className="flex flex-col h-full w-full p-4">
			<Flex justify="space-between" align="center" mb={4}>
				<Heading size="md">Quản lý nhân viên - {permissionGroup?.name}</Heading>
				<HStack>
					<Button onClick={() => navigate('/permission-groups')}>
						Quay lại
					</Button>
					<Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleOpenModal}>
						Thêm nhân viên
					</Button>
				</HStack>
			</Flex>

			<Box flex="1" overflow="auto" bg="white" borderRadius="md">
				<TableContainer>
					<Table variant="simple">
						<Thead>
							<Tr>
								<Th>Tên đăng nhập</Th>
								<Th>Email</Th>
								<Th>SĐT</Th>
								<Th>Trạng thái</Th>
								<Th>Thao tác</Th>
							</Tr>
						</Thead>
						<Tbody>
							{employees.length === 0 ? (
								<Tr>
									<Td colSpan={5} textAlign="center" py={8}>
										<Text color="gray.500">Chưa có nhân viên nào trong nhóm quyền này</Text>
									</Td>
								</Tr>
							) : (
								employees.map((employee) => (
									<Tr key={employee.id}>
										<Td>{employee.userName}</Td>
										<Td>{employee.email}</Td>
										<Td>{employee.phoneNumber}</Td>
										<Td>
											<Badge colorScheme={employee.active ? 'green' : 'red'}>
												{employee.active ? 'Hoạt động' : 'Không hoạt động'}
											</Badge>
										</Td>
										<Td>
											<IconButton
												aria-label="Xóa"
												icon={<DeleteIcon />}
												colorScheme="red"
												size="sm"
												onClick={() => handleRemoveEmployee(employee.id)}
												isLoading={removing === employee.id}
											/>
										</Td>
									</Tr>
								))
							)}
						</Tbody>
					</Table>
				</TableContainer>
			</Box>

			<Modal isOpen={isOpen} onClose={onClose} size="xl">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Thêm nhân viên vào nhóm quyền</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack align="stretch" spacing={2} maxH="400px" overflowY="auto">
							{allEmployees.length === 0 ? (
								<Text color="gray.500" textAlign="center" py={4}>
									Không còn nhân viên nào để thêm
								</Text>
							) : (
								allEmployees.map((employee) => (
									<Checkbox
										key={employee.id}
										isChecked={selectedEmployeeIds.includes(employee.id)}
										onChange={(e) => {
											if (e.target.checked) {
												setSelectedEmployeeIds([...selectedEmployeeIds, employee.id]);
											} else {
												setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== employee.id));
											}
										}}
									>
										<Box>
											<Text fontSize="sm" fontWeight="medium">{employee.userName}</Text>
											<Text fontSize="xs" color="gray.500">{employee.email}</Text>
										</Box>
									</Checkbox>
								))
							)}
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button mr={3} onClick={onClose}>
							Hủy
						</Button>
						<Button colorScheme="blue" onClick={handleAddEmployees} isLoading={adding}>
							Thêm
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default ManageEmployees;

