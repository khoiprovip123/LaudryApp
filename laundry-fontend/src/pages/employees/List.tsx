import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  IconButton,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import type { EmployeeDto } from "../../api/employees";
import { deleteEmployee, getEmployees } from "../../api/employees";
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { ProtectedButton } from "../../components/ProtectedButton";

const EmployeesList: React.FC = () => {
  const [items, setItems] = useState<EmployeeDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const cancelRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getEmployees({ limit: pageSize, offset });
      setItems(res.items || []);
      setTotalItems(res.totalItems || 0);
    } catch (err: any) {
      // Toast error đã được xử lý tự động bởi http wrapper
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, pageSize]);

  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.ceil(totalItems / pageSize);
  const canPrev = offset > 0;
  const canNext = useMemo(
    () => offset + pageSize < totalItems,
    [offset, pageSize, totalItems]
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteEmployee(id);
      toast({ status: "success", title: "Xóa nhân viên thành công" });
      await load();
    } catch (err: any) {
      // Toast error đã được xử lý tự động bởi http wrapper
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box className="flex flex-col h-full w-full p-4">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Danh sách nhân viên</Heading>
        <ProtectedButton
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => navigate("/employees/new")}
        >
          Thêm mới
        </ProtectedButton>
      </Flex>

      <Box flex="1" overflow="auto" bg="white" borderRadius="md">
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Tên đăng nhập</Th>
                <Th>Email</Th>
                <Th>SĐT</Th>
                <Th>Vai trò</Th>
                <Th>Trạng thái</Th>
                <Th>Thao tác</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading && items.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Spinner />
                  </Td>
                </Tr>
              ) : items.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    Không có dữ liệu
                  </Td>
                </Tr>
              ) : (
                items.map((item) => (
                  <Tr key={item.id}>
                    <Td>{item.userName || '-'}</Td>
                    <Td>{item.email || '-'}</Td>
                    <Td>{item.phoneNumber || '-'}</Td>
                    <Td>
                      {item.roles && item.roles.length > 0 ? (
                        item.roles.map((role) => (
                          <Badge key={role} colorScheme="blue" mr={1}>
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <Badge colorScheme="gray">Chưa có vai trò</Badge>
                      )}
                    </Td>
                    <Td>
                      <Badge colorScheme={item.active ? "green" : "red"}>
                        {item.active ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </Td>
                    <Td>
                      <ButtonGroup size="sm">
                        <IconButton
                          aria-label="Sửa"
                          icon={<EditIcon />}
                          onClick={() => navigate(`/employees/${item.id}/edit`)}
                        />
                        <IconButton
                          aria-label="Xóa"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          onClick={() => handleDelete(item.id)}
                          isLoading={deletingId === item.id}
                        />
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4}>
          <Select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setOffset(0);
            }}
            w="120px"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </Select>

          <ButtonGroup>
            <IconButton
              aria-label="Trang trước"
              icon={<ChevronLeftIcon />}
              onClick={() => setOffset(Math.max(0, offset - pageSize))}
              isDisabled={!canPrev}
            />
            {getPageNumbers().map((page, idx) => (
              <Button
                key={idx}
                onClick={() => typeof page === 'number' && setOffset((page - 1) * pageSize)}
                variant={page === currentPage ? "solid" : "outline"}
                isDisabled={page === '...'}
              >
                {page}
              </Button>
            ))}
            <IconButton
              aria-label="Trang sau"
              icon={<ChevronRightIcon />}
              onClick={() => setOffset(offset + pageSize)}
              isDisabled={!canNext}
            />
          </ButtonGroup>
        </Flex>
      )}

      <AlertDialog
        isOpen={deletingId !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingId(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Xóa nhân viên
            </AlertDialogHeader>
            <AlertDialogBody>
              Bạn có chắc chắn muốn xóa nhân viên này?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setDeletingId(null)}>Hủy</Button>
              <Button
                colorScheme="red"
                onClick={() => deletingId && handleDelete(deletingId)}
                ml={3}
              >
                Xóa
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default EmployeesList;

