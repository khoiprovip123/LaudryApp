import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Spinner,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import {
  getCountOrdersTodayByStatus,
  getDashboardStats,
  type DashboardStatsDto,
  type GetCountOrdersTodayByStatusDto,
} from "../../api/dashboard";
import { useNavigate } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaBox,
  FaSpinner,
  FaCheckCircle,
  FaTruck,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { OrderStatus } from "@/constants/orderStatus";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
  }
> = {
  [OrderStatus.Received]: {
    label: "Đã nhận đồ",
    color: "blue.700",
    bgColor: "blue.50",
    borderColor: "blue.200",
    icon: <FaBox color="#3182CE" size={24} />,
  },
  [OrderStatus.Processing]: {
    label: "Đang giặt",
    color: "orange.700",
    bgColor: "orange.50",
    borderColor: "orange.200",
    icon: <FaSpinner color="#DD6B20" size={24} />,
  },
  [OrderStatus.Completed]: {
    label: "Đã giặt xong",
    color: "green.700",
    bgColor: "green.50",
    borderColor: "green.200",
    icon: <FaCheckCircle color="#38A169" size={24} />,
  },
  [OrderStatus.Delivered]: {
    label: "Đã giao",
    color: "purple.700",
    bgColor: "purple.50",
    borderColor: "purple.200",
    icon: <FaTruck color="#805AD5" size={24} />,
  },
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [countOrdersToday, setCountOrdersToday] = useState<
    GetCountOrdersTodayByStatusDto[]
  >([]);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      const countOrdersToday = await getCountOrdersTodayByStatus({
        dateFrom: new Date().toISOString(),
        dateTo: new Date().toISOString(),
      });
      setStats(data);
      setCountOrdersToday(countOrdersToday);
    } catch (err: any) {
      // Toast error đã được xử lý tự động bởi http wrapper
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box className="flex flex-col h-full w-full bg-gray-50 p-4">
      {/* Header */}
      <Box className="bg-white rounded-md p-4 mb-4">
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="gray.800">
            Tổng quan trong ngày
          </Heading>
          <Button
            colorScheme="blue"
            onClick={() => navigate("/reports")}
            _focus={{ boxShadow: "none", outline: "none" }}
          >
            Xem báo cáo chi tiết
          </Button>
        </Flex>
      </Box>

      {/* Trạng thái đơn hàng */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
        {countOrdersToday.map((item) => {
          const config = STATUS_CONFIG[item.status];

          if (!config) return null; // phòng trường hợp status lạ

          return (
            <Card
              key={item.status}
              bg={config.bgColor}
              borderColor={config.borderColor}
              borderWidth="2px"
              shadow="md"
              _hover={{
                shadow: "lg",
                transform: "translateY(-2px)",
                transition: "all 0.2s",
              }}
              transition="all 0.2s"
            >
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack spacing={3} w="full">
                    <Box>{config.icon}</Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      {config.label}
                    </Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" color={config.color}>
                    {item.count}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    đơn hàng
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Cảnh báo */}
      {stats.overdueOrders > 0 && (
        <Card bg="red.50" borderColor="red.200" borderWidth="1px" mb={4}>
          <CardBody>
            <HStack>
              <FaExclamationTriangle color="#E53E3E" size={24} />
              <Text fontWeight="bold" color="red.700">
                Có {stats.overdueOrders} đơn hàng quá hạn cần xử lý
              </Text>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => navigate("/orders?status=Completed")}
                ml="auto"
                _focus={{ boxShadow: "none", outline: "none" }}
              >
                Xem chi tiết
              </Button>
            </HStack>
          </CardBody>
        </Card>
      )}

      <Flex gap={4} flexDirection={{ base: "column", lg: "row" }}>
        {/* Biểu đồ Doanh thu 7 ngày */}
        <Card flex="1" mb={{ base: 4, lg: 0 }}>
          <CardBody>
            <Heading size="md" mb={4}>
              Doanh thu 7 ngày gần nhất
            </Heading>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyRevenues}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("vi-VN")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3182CE"
                  strokeWidth={2}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Top khách hàng */}
        <Card flex="1">
		<Card>
  <Text fontSize="sm" color="gray.500">Doanh thu hôm nay</Text>
  <Text fontSize="2xl" fontWeight="bold" color="green.500">
    50.000 ₫
  </Text>
</Card>
        </Card>
      </Flex>
    </Box>
  );
};

export default Dashboard;
