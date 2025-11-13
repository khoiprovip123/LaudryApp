import React, { useEffect, useMemo, useState } from "react";
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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import type { CompanyDto } from "../../api/companies";
import { deleteCompany, getCompanies } from "../../api/companies";
import { ChevronLeftIcon, ChevronRightIcon, AddIcon } from "@chakra-ui/icons";
import CompanyEditModal from "../../components/CompanyEditModal";

const CompaniesList: React.FC = () => {
  const [items, setItems] = useState<CompanyDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCompanies({ limit: pageSize, offset });
      setItems(res.items);
      setTotalItems(res.totalItems);
    } catch (err: any) {
      toast({
        status: "error",
        title: "Lỗi tải danh sách",
        description: err?.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, pageSize]);

  // Tính toán phân trang
  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.ceil(totalItems / pageSize);
  const canPrev = offset > 0;
  const canNext = useMemo(
    () => offset + pageSize < totalItems,
    [offset, pageSize, totalItems]
  );

  // Tạo danh sách số trang để hiển thị
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Số trang tối đa hiển thị
    
    if (totalPages <= maxVisible) {
      // Nếu tổng số trang <= maxVisible, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic hiển thị trang với ellipsis
      if (currentPage <= 3) {
        // Trang đầu
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Trang cuối
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // Trang giữa
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * pageSize;
    setOffset(newOffset);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setOffset(0); // Reset về trang đầu khi đổi page size
  };

  const onConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCompany(deletingId);
      toast({ status: "success", title: "Đã xóa (soft delete)" });
      setDeletingId(null);
      void load();
    } catch (err: any) {
      toast({
        status: "error",
        title: "Xóa thất bại",
        description: err?.message || "Có lỗi xảy ra",
      });
    }
  };

  const cancelRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Box className="flex flex-col h-full w-full">
      <Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
        <Heading size="md">Cửa hàng</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => navigate("/companies/new")}
          _focus={{ boxShadow: 'none', outline: 'none' }}
        >
          Thêm mới
        </Button>
      </Flex>

      <div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
        <div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden">
          {loading ? (
            <Flex justify="center" align="center" className="h-full">
              <Spinner />
            </Flex>
          ) : (
            <>
              <TableContainer 
                flex="1"
                minH="0"
                overflowY="auto" 
                overflowX="auto"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
              >
                <Table size="sm">
                  <Thead position="sticky" top={0} zIndex={10} bg="gray.100">
                    <Tr>
                      <Th bg="gray.100">Tên công ty</Th>
                      <Th bg="gray.100">Chủ sở hữu</Th>
                      <Th bg="gray.100">Điện thoại</Th>
                      <Th isNumeric bg="gray.100">Hoạt động</Th>
                      <Th bg="gray.100">Ngày bắt đầu</Th>
                      <Th bg="gray.100">Khóa kỳ</Th>
                      <Th bg="gray.100">Hành động</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((c) => (
                      <Tr key={c.id}>
                        <Td>{c.companyName}</Td>
                        <Td>{c.ownerName}</Td>
                        <Td>{c.phone}</Td>
                        <Td isNumeric>{c.active ? "✔️" : "❌"}</Td>
                        <Td>
                          {new Date(c.subscriptionStartDate).toLocaleDateString()}
                        </Td>
                        <Td>
                          {c.periodLockDate
                            ? new Date(c.periodLockDate).toLocaleDateString()
                            : "-"}
                        </Td>
                        <Td>
                          <ButtonGroup size="sm" variant="outline">
                            <Button
                              colorScheme="blue"
                              onClick={() => setEditingId(c.id)}
                              _focus={{ boxShadow: 'none', outline: 'none' }}
                            >
                              Sửa
                            </Button>
                            <Button
                              colorScheme="red"
                              onClick={() => setDeletingId(c.id)}
                              _focus={{ boxShadow: 'none', outline: 'none' }}
                            >
                              Xóa
                            </Button>
                          </ButtonGroup>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Flex justify="space-between" mt={4} mb={2} px={2} align="center" flexWrap="wrap" gap={4} flexShrink={0}>
                <Flex align="center" gap={2}>
                  <Box fontSize="sm" color="gray.600" whiteSpace="nowrap">
                    Hiển thị
                  </Box>
                  <Select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    size="sm"
                    w="80px"
                    _focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Select>
                  <Box fontSize="sm" color="gray.600" whiteSpace="nowrap">
                    / trang
                  </Box>
                </Flex>

                <Flex align="center" gap={2}>
                  <Button
                    onClick={() => goToPage(1)}
                    isDisabled={!canPrev || currentPage === 1}
                    size="sm"
                    variant="outline"
                    leftIcon={<ChevronLeftIcon />}
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                  >
                    Đầu
                  </Button>
                  <IconButton
                    aria-label="Trang trước"
                    icon={<ChevronLeftIcon />}
                    onClick={() => goToPage(currentPage - 1)}
                    isDisabled={!canPrev}
                    size="sm"
                    variant="outline"
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                  />
                  
                  <Flex gap={1}>
                    {getPageNumbers().map((page, idx) => {
                      if (page === '...') {
                        return (
                          <Box key={`ellipsis-${idx}`} px={2} py={1} fontSize="sm" color="gray.500">
                            ...
                          </Box>
                        );
                      }
                      const pageNum = page as number;
                      const isActive = pageNum === currentPage;
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={isActive ? 'solid' : 'outline'}
                          colorScheme={isActive ? 'blue' : 'gray'}
                          onClick={() => goToPage(pageNum)}
                          minW="40px"
                          _focus={{ boxShadow: 'none', outline: 'none' }}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </Flex>

                  <IconButton
                    aria-label="Trang sau"
                    icon={<ChevronRightIcon />}
                    onClick={() => goToPage(currentPage + 1)}
                    isDisabled={!canNext}
                    size="sm"
                    variant="outline"
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                  />
                  <Button
                    onClick={() => goToPage(totalPages)}
                    isDisabled={!canNext || currentPage === totalPages}
                    size="sm"
                    variant="outline"
                    rightIcon={<ChevronRightIcon />}
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                  >
                    Cuối
                  </Button>
                </Flex>

                <Box fontSize="sm" color="gray.600" whiteSpace="nowrap">
                  {Math.min(offset + 1, totalItems)}-{Math.min(offset + pageSize, totalItems)} / {totalItems}
                </Box>
              </Flex>
            </>
          )}
        </div>
      </div>
		<AlertDialog
         isOpen={!!deletingId}
         onClose={() => setDeletingId(null)}
		 leastDestructiveRef={cancelRef}
       >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Xác nhận xóa</AlertDialogHeader>
            <AlertDialogBody>
              Bạn có chắc muốn xóa công ty này?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={() => setDeletingId(null)} 
                mr={3}
                _focus={{ boxShadow: 'none', outline: 'none' }}
              >
                Hủy
              </Button>
              <Button 
                colorScheme="red" 
                onClick={onConfirmDelete}
                _focus={{ boxShadow: 'none', outline: 'none' }}
              >
                Xóa
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {editingId && (
        <CompanyEditModal
          isOpen={!!editingId}
          onClose={() => setEditingId(null)}
          companyId={editingId}
          onSuccess={() => {
            setEditingId(null);
            void load();
          }}
        />
      )}
    </Box>
  );
};

export default CompaniesList;
