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
  useToast,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Text,
  HStack,
  VStack,
  SimpleGrid,
  Tooltip,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import type { PermissionGroupDto } from "../../api/permissionGroups";
import { deletePermissionGroup, getPermissionGroups } from "../../api/permissionGroups";
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, EditIcon, DeleteIcon, SettingsIcon } from "@chakra-ui/icons";
import { ProtectedButton } from "../../components/ProtectedButton";

const PermissionGroupsList: React.FC = () => {
  const [items, setItems] = useState<PermissionGroupDto[]>([]);
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
      const res = await getPermissionGroups({ limit: pageSize, offset });
      setItems(res.items || []);
      setTotalItems(res.totalItems || 0);
    } catch (err: any) {
      toast({
        status: "error",
        title: "Lỗi tải danh sách",
        description: err?.message || "Có lỗi xảy ra",
      });
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
      await deletePermissionGroup(id);
      toast({ status: "success", title: "Xóa nhóm quyền thành công" });
      await load();
    } catch (err: any) {
      toast({
        status: "error",
        title: "Xóa thất bại",
        description: err?.message || "Có lỗi xảy ra",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box className="flex flex-col h-full w-full p-4" bg="gray.50">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.700">Quản lý nhóm quyền</Heading>
        <ProtectedButton
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => navigate("/permission-groups/new")}
          size="md"
        >
          Thêm nhóm quyền mới
        </ProtectedButton>
      </Flex>

      {loading && items.length === 0 ? (
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" thickness="4px" color="blue.500" />
        </Flex>
      ) : items.length === 0 ? (
        <Card>
          <CardBody>
            <Text textAlign="center" color="gray.500" fontSize="lg" py={8}>
              Chưa có nhóm quyền nào. Hãy tạo nhóm quyền đầu tiên!
            </Text>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} flex="1" overflowY="auto" pb={4}>
          {items.map((item) => (
            <Card 
              key={item.id} 
              shadow="md" 
              borderRadius="lg" 
              overflow="hidden" 
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }} 
              transition="all 0.2s"
              bg="white"
            >
              <CardHeader bg={item.active ? "blue.50" : "gray.50"} pb={3}>
                <Flex justify="space-between" align="start">
                  <VStack align="start" spacing={2} flex="1">
                    <Heading size="md" color="gray.800" noOfLines={1}>
                      {item.name || 'Chưa có tên'}
                    </Heading>
                    <Badge colorScheme={item.active ? "green" : "red"} fontSize="xs" w="fit-content">
                      {item.active ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </VStack>
                  <ButtonGroup size="sm" variant="ghost" spacing={1}>
                    <Tooltip label="Quản lý nhân viên">
                      <IconButton
                        aria-label="Quản lý nhân viên"
                        icon={<SettingsIcon />}
                        colorScheme="blue"
                        onClick={() => navigate(`/permission-groups/${item.id}/employees`)}
                      />
                    </Tooltip>
                    <Tooltip label="Sửa nhóm quyền">
                      <IconButton
                        aria-label="Sửa"
                        icon={<EditIcon />}
                        colorScheme="gray"
                        onClick={() => navigate(`/permission-groups/${item.id}/edit`)}
                      />
                    </Tooltip>
                    <Tooltip label="Xóa nhóm quyền">
                      <IconButton
                        aria-label="Xóa"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => handleDelete(item.id)}
                        isLoading={deletingId === item.id}
                      />
                    </Tooltip>
                  </ButtonGroup>
                </Flex>
              </CardHeader>
              
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {item.description && (
                    <Text fontSize="sm" color="gray.600" noOfLines={3}>
                      {item.description}
                    </Text>
                  )}
                  
                  <HStack justify="space-between" spacing={4}>
                    <VStack align="start" spacing={1} flex="1">
                      <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase">
                        Số quyền
                      </Text>
                      <Badge colorScheme="blue" fontSize="lg" px={3} py={1} borderRadius="md">
                        {item.permissions?.length || 0}
                      </Badge>
                    </VStack>
                    <VStack align="end" spacing={1} flex="1">
                      <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase">
                        Số nhân viên
                      </Text>
                      <Badge colorScheme="green" fontSize="lg" px={3} py={1} borderRadius="md">
                        {item.employeeCount || 0}
                      </Badge>
                    </VStack>
                  </HStack>

                  <Button
                    size="sm"
                    leftIcon={<SettingsIcon />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => navigate(`/permission-groups/${item.id}/employees`)}
                    w="full"
                  >
                    Quản lý nhân viên
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={6} pt={4} borderTop="1px solid" borderColor="gray.200">
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">Hiển thị:</Text>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setOffset(0);
              }}
              w="120px"
              size="sm"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </Select>
          </HStack>

          <ButtonGroup size="sm">
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
                colorScheme={page === currentPage ? "blue" : "gray"}
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
              Xóa nhóm quyền
            </AlertDialogHeader>
            <AlertDialogBody>
              Bạn có chắc chắn muốn xóa nhóm quyền này?
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

export default PermissionGroupsList;

