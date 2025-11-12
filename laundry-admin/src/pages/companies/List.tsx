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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { CompanyDto } from "../../api/companies";
import { deleteCompany, getCompanies } from "../../api/companies";
import { ChevronLeftIcon, ChevronRightIcon, AddIcon } from "@chakra-ui/icons";

const PAGE_SIZE = 10;

const CompaniesList: React.FC = () => {
  const [items, setItems] = useState<CompanyDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCompanies({ limit: PAGE_SIZE, offset });
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
  }, [offset]);

  const canPrev = offset > 0;
  const canNext = useMemo(
    () => offset + PAGE_SIZE < totalItems,
    [offset, totalItems]
  );

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
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Companies</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => navigate("/companies/new")}
        >
          Thêm mới
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner />
        </Flex>
      ) : (
        <TableContainer
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Tên công ty</Th>
                <Th>Chủ sở hữu</Th>
                <Th>Điện thoại</Th>
                <Th isNumeric>Hoạt động</Th>
                <Th>Ngày bắt đầu</Th>
                <Th>Khóa kỳ</Th>
                <Th>Hành động</Th>
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
                        as={RouterLink}
                        to={`/companies/${c.id}/edit`}
                        colorScheme="blue"
                      >
                        Sửa
                      </Button>
                      <Button
                        colorScheme="red"
                        onClick={() => setDeletingId(c.id)}
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
      )}

      <Flex justify="space-between" mt={4} align="center">
        <Button
          leftIcon={<ChevronLeftIcon />}
          onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
          isDisabled={!canPrev}
        >
          Trang trước
        </Button>
        <Flex align="center" gap={2}>
          <IconButton
            aria-label="prev"
            icon={<ChevronLeftIcon />}
            onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            isDisabled={!canPrev}
          />
          <IconButton
            aria-label="next"
            icon={<ChevronRightIcon />}
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
            isDisabled={!canNext}
          />
        </Flex>
        <Box fontSize="sm" color="gray.600">
          Hiển thị {Math.min(offset + 1, totalItems)}-
          {Math.min(offset + PAGE_SIZE, totalItems)} / {totalItems}
        </Box>
      </Flex>

		<AlertDialog
         isOpen={!!deletingId}
         onClose={() => setDeletingId(null)}
		 leastDestructiveRef={cancelRef}
       >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Xác nhận xóa</AlertDialogHeader>
            <AlertDialogBody>
              Bạn có chắc muốn xóa công ty này? (sẽ chuyển Active=false)
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingId(null)} mr={3}>
                Hủy
              </Button>
              <Button colorScheme="red" onClick={onConfirmDelete}>
                Xóa
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CompaniesList;
