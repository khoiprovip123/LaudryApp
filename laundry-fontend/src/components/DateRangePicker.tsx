import React, { useState, useEffect } from 'react';
import {
	Box,
	Input,
	InputGroup,
	InputRightElement,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverBody,
	Button,
	HStack,
	VStack,
	FormLabel,
	IconButton,
	Select,
	Flex,
} from '@chakra-ui/react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@chakra-ui/icons';
import type { InputProps } from '@chakra-ui/react';

interface DateRangePickerProps {
	dateFrom: string; // Format: YYYY-MM-DD
	dateTo: string; // Format: YYYY-MM-DD
	onDateFromChange: (date: string) => void;
	onDateToChange: (date: string) => void;
	labelFrom?: string;
	labelTo?: string;
	size?: InputProps['size'];
	w?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
	dateFrom,
	dateTo,
	onDateFromChange,
	onDateToChange,
	labelFrom = 'Ngày bắt đầu',
	labelTo = 'Ngày kết thúc',
	size = 'sm',
	w = '280px',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [leftMonth, setLeftMonth] = useState(new Date());
	const [rightMonth, setRightMonth] = useState(() => {
		const nextMonth = new Date();
		nextMonth.setMonth(nextMonth.getMonth() + 1);
		return nextMonth;
	});
	const [selectedOption, setSelectedOption] = useState<string>('custom');

	// Sync months với dateFrom khi dateFrom thay đổi
	useEffect(() => {
		if (dateFrom) {
			// Parse YYYY-MM-DD thành Date object (local timezone)
			const [year, month, day] = dateFrom.split('-').map(Number);
			const date = new Date(year, month - 1, day);
			setLeftMonth(new Date(date.getFullYear(), date.getMonth(), 1));
			setRightMonth(new Date(date.getFullYear(), date.getMonth() + 1, 1));
		}
	}, [dateFrom]);

	// Format date từ YYYY-MM-DD sang dd/mm/yyyy để hiển thị
	const formatDisplayDate = (dateString: string): string => {
		if (!dateString) return '';
		const [year, month, day] = dateString.split('-');
		return `${day}/${month}/${year}`;
	};

	// Format Date object thành YYYY-MM-DD (local timezone, không dùng UTC)
	const formatDateToYYYYMMDD = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	// Lấy số ngày trong tháng
	const getDaysInMonth = (date: Date): number => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	};

	// Lấy ngày đầu tuần của tháng
	const getFirstDayOfWeek = (date: Date): number => {
		const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		return firstDay.getDay();
	};

	// Kiểm tra ngày có trong range không
	const isDateInRange = (day: number, month: Date): boolean => {
		const date = new Date(month.getFullYear(), month.getMonth(), day);
		const dateStr = formatDateToYYYYMMDD(date);
		
		if (!dateFrom || !dateTo) return false;
		
		return dateStr >= dateFrom && dateStr <= dateTo;
	};

	// Kiểm tra ngày có phải là ngày bắt đầu không
	const isStartDate = (day: number, month: Date): boolean => {
		const date = new Date(month.getFullYear(), month.getMonth(), day);
		const dateStr = formatDateToYYYYMMDD(date);
		return dateStr === dateFrom;
	};

	// Kiểm tra ngày có phải là ngày kết thúc không
	const isEndDate = (day: number, month: Date): boolean => {
		const date = new Date(month.getFullYear(), month.getMonth(), day);
		const dateStr = formatDateToYYYYMMDD(date);
		return dateStr === dateTo;
	};

	// Xử lý click vào ngày
	const handleDateClick = (actualDate: Date) => {
		const dateStr = formatDateToYYYYMMDD(actualDate);

		if (!dateFrom || (dateFrom && dateTo)) {
			// Nếu chưa có dateFrom hoặc đã có cả hai, set dateFrom mới
			onDateFromChange(dateStr);
			onDateToChange('');
			setSelectedOption('custom');
		} else if (dateFrom && !dateTo) {
			// Nếu đã có dateFrom, set dateTo
			if (dateStr >= dateFrom) {
				onDateToChange(dateStr);
				setIsOpen(false); // Đóng popover sau khi chọn xong range
			} else {
				// Nếu chọn ngày trước dateFrom, đổi lại
				onDateToChange(dateFrom);
				onDateFromChange(dateStr);
			}
			setSelectedOption('custom');
		}
	};

	// Quick date range options
	const handleQuickOption = (option: string) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		let fromDate: Date;
		let toDate: Date = new Date(today);

		switch (option) {
			case 'today':
				fromDate = new Date(today);
				break;
			case 'yesterday':
				fromDate = new Date(today);
				fromDate.setDate(fromDate.getDate() - 1);
				toDate = new Date(fromDate);
				break;
			case 'last7days':
				fromDate = new Date(today);
				fromDate.setDate(fromDate.getDate() - 6);
				break;
			case 'last30days':
				fromDate = new Date(today);
				fromDate.setDate(fromDate.getDate() - 29);
				break;
			case 'thisMonth':
				fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
				break;
			case 'lastMonth':
				fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
				toDate = new Date(today.getFullYear(), today.getMonth(), 0);
				break;
			default:
				return;
		}

		onDateFromChange(formatDateToYYYYMMDD(fromDate));
		onDateToChange(formatDateToYYYYMMDD(toDate));
		setSelectedOption(option);
		setIsOpen(false);
	};

	// Render một calendar
	const renderCalendar = (month: Date, isLeft: boolean) => {
		const daysInMonth = getDaysInMonth(month);
		const firstDayOfWeek = getFirstDayOfWeek(month);
		const days: Array<{ day: number; isCurrentMonth: boolean; isPrevMonth?: boolean; isNextMonth?: boolean }> = [];

		// Thêm các ngày của tháng trước
		const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
		const prevMonthDays = getDaysInMonth(prevMonth);
		for (let i = firstDayOfWeek - 1; i >= 0; i--) {
			days.push({ day: prevMonthDays - i, isCurrentMonth: false, isPrevMonth: true });
		}

		// Thêm các ngày trong tháng hiện tại
		for (let day = 1; day <= daysInMonth; day++) {
			days.push({ day, isCurrentMonth: true });
		}

		// Thêm các ngày của tháng sau để đủ 6 tuần (42 ngày)
		const totalDays = days.length;
		const remainingDays = 42 - totalDays;
		for (let day = 1; day <= remainingDays; day++) {
			days.push({ day, isCurrentMonth: false, isNextMonth: true });
		}

		const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
		const monthNames = [
			'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
			'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
		];

		// Tạo danh sách năm (từ năm hiện tại - 2 đến năm hiện tại + 2)
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let y = currentYear - 2; y <= currentYear + 2; y++) {
			years.push(y);
		}

		return (
			<VStack spacing={2} p={2} flex="1">
				{/* Header với tháng/năm và nút điều hướng */}
				<HStack justify="space-between" w="100%" px={2}>
					{isLeft ? (
						<IconButton
							aria-label="Tháng trước"
							icon={<ChevronLeftIcon />}
							size="sm"
							variant="ghost"
							onClick={() => {
								const newMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
								setLeftMonth(newMonth);
								setRightMonth(new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 1));
							}}
						/>
					) : (
						<Box w="32px" />
					)}
					
					<HStack spacing={1}>
						<Select
							size="sm"
							value={month.getMonth()}
							onChange={(e) => {
								const newMonth = new Date(month.getFullYear(), parseInt(e.target.value), 1);
								if (isLeft) {
									setLeftMonth(newMonth);
									setRightMonth(new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 1));
								} else {
									setRightMonth(newMonth);
									setLeftMonth(new Date(newMonth.getFullYear(), newMonth.getMonth() - 1, 1));
								}
							}}
							w="100px"
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							{monthNames.map((name, index) => (
								<option key={index} value={index}>
									{name}
								</option>
							))}
						</Select>
						<Select
							size="sm"
							value={month.getFullYear()}
							onChange={(e) => {
								const newMonth = new Date(parseInt(e.target.value), month.getMonth(), 1);
								if (isLeft) {
									setLeftMonth(newMonth);
									setRightMonth(new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 1));
								} else {
									setRightMonth(newMonth);
									setLeftMonth(new Date(newMonth.getFullYear(), newMonth.getMonth() - 1, 1));
								}
							}}
							w="80px"
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							{years.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</Select>
					</HStack>

					{!isLeft ? (
						<IconButton
							aria-label="Tháng sau"
							icon={<ChevronRightIcon />}
							size="sm"
							variant="ghost"
							onClick={() => {
								const newMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
								setRightMonth(newMonth);
								setLeftMonth(new Date(newMonth.getFullYear(), newMonth.getMonth() - 1, 1));
							}}
						/>
					) : (
						<Box w="32px" />
					)}
				</HStack>

				{/* Tên các ngày trong tuần */}
				<HStack spacing={1} w="100%">
					{weekDays.map((day, index) => (
						<Box key={index} flex="1" textAlign="center" fontSize="xs" fontWeight="semibold" color="gray.600" py={1}>
							{day}
						</Box>
					))}
				</HStack>

				{/* Lưới ngày */}
				<Box w="100%">
					{days.reduce((rows: Array<{ day: number; isCurrentMonth: boolean; isPrevMonth?: boolean; isNextMonth?: boolean }>[], dayItem, index) => {
						if (index % 7 === 0) {
							rows.push([]);
						}
						rows[rows.length - 1].push(dayItem);
						return rows;
					}, []).map((week, weekIndex) => (
						<HStack key={weekIndex} spacing={1} mb={1}>
							{week.map((dayItem, dayIndex) => {
								const { day, isCurrentMonth, isPrevMonth, isNextMonth } = dayItem;
								
								// Tính toán date thực tế để check range
								let actualDate: Date;
								if (isPrevMonth) {
									actualDate = new Date(month.getFullYear(), month.getMonth() - 1, day);
								} else if (isNextMonth) {
									actualDate = new Date(month.getFullYear(), month.getMonth() + 1, day);
								} else {
									actualDate = new Date(month.getFullYear(), month.getMonth(), day);
								}

								const isInRange = isCurrentMonth && isDateInRange(day, month);
								const isStart = isCurrentMonth && isStartDate(day, month);
								const isEnd = isCurrentMonth && isEndDate(day, month);
								const isToday = 
									isCurrentMonth &&
									day === new Date().getDate() &&
									month.getMonth() === new Date().getMonth() &&
									month.getFullYear() === new Date().getFullYear();

								return (
									<Button
										key={dayIndex}
										flex="1"
										size="sm"
										variant={isStart || isEnd ? 'solid' : isInRange ? 'ghost' : 'ghost'}
										colorScheme={isStart || isEnd ? 'blue' : 'gray'}
										bg={isStart || isEnd ? 'blue.500' : isInRange ? 'blue.100' : 'transparent'}
										color={
											isStart || isEnd 
												? 'white' 
												: !isCurrentMonth 
													? 'gray.300' 
													: isToday 
														? 'blue.600' 
														: 'gray.700'
										}
										fontWeight={isStart || isEnd || isToday ? 'bold' : 'normal'}
										onClick={() => handleDateClick(actualDate)}
										h="32px"
										minW="32px"
										p={0}
										_focus={{ boxShadow: 'none', outline: 'none' }}
										disabled={!isCurrentMonth}
										opacity={!isCurrentMonth ? 0.4 : 1}
									>
										{day}
									</Button>
								);
							})}
						</HStack>
					))}
				</Box>
			</VStack>
		);
	};

	const quickOptions = [
		{ value: 'today', label: 'Hôm nay' },
		{ value: 'yesterday', label: 'Hôm qua' },
		{ value: 'last7days', label: '7 ngày qua' },
		{ value: 'last30days', label: '30 ngày qua' },
		{ value: 'thisMonth', label: 'Tháng này' },
		{ value: 'lastMonth', label: 'Tháng trước' },
		{ value: 'custom', label: 'Tùy chọn' },
	];

	// Format range để hiển thị trong input
	const formatRangeDisplay = (): string => {
		if (!dateFrom && !dateTo) return '';
		if (dateFrom && !dateTo) return formatDisplayDate(dateFrom);
		if (!dateFrom && dateTo) return formatDisplayDate(dateTo);
		return `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`;
	};

	return (
		<Popover
			isOpen={isOpen}
			onOpen={() => setIsOpen(true)}
			onClose={() => setIsOpen(false)}
			placement="bottom-start"
		>
			<Box>
				<FormLabel fontSize="sm" color="gray.600" mb={1}>
					{labelFrom && labelTo ? `${labelFrom} - ${labelTo}` : labelFrom || labelTo}
				</FormLabel>
				<PopoverTrigger>
					<Box>
						<InputGroup size={size} w={w}>
							<Input
								type="text"
								value={formatRangeDisplay()}
								placeholder="dd/mm/yyyy - dd/mm/yyyy"
								readOnly
								onClick={() => setIsOpen(true)}
								_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
								cursor="pointer"
								pr={dateFrom || dateTo ? '60px' : '40px'}
							/>
							<InputRightElement width="auto" pr={2}>
								<HStack spacing={1}>
									{(dateFrom || dateTo) && (
										<IconButton
											aria-label="Xóa lọc"
											icon={<CloseIcon />}
											size="xs"
											variant="ghost"
											colorScheme="gray"
											onClick={(e) => {
												e.stopPropagation();
												onDateFromChange('');
												onDateToChange('');
												setSelectedOption('custom');
											}}
											_focus={{ boxShadow: 'none', outline: 'none' }}
											_hover={{ bg: 'gray.100' }}
										/>
									)}
									<CalendarIcon color="gray.400" />
								</HStack>
							</InputRightElement>
						</InputGroup>
					</Box>
				</PopoverTrigger>
			</Box>
			<PopoverContent w="700px" maxW="90vw">
				<PopoverBody p={0}>
					<Flex>
						{/* Left Sidebar - Quick Options */}
						<VStack
							align="stretch"
							w="180px"
							borderRight="1px solid"
							borderColor="gray.200"
							spacing={0}
						>
							{quickOptions.map((option) => (
								<Button
									key={option.value}
									variant="ghost"
									size="sm"
									justifyContent="flex-start"
									px={4}
									py={2}
									h="auto"
									borderRadius={0}
									bg={selectedOption === option.value ? 'blue.500' : 'transparent'}
									color={selectedOption === option.value ? 'white' : 'gray.700'}
									_hover={{
										bg: selectedOption === option.value ? 'blue.600' : 'gray.100',
									}}
									onClick={() => {
										if (option.value === 'custom') {
											setSelectedOption('custom');
										} else {
											handleQuickOption(option.value);
										}
									}}
									_focus={{ boxShadow: 'none', outline: 'none' }}
								>
									{option.label}
								</Button>
							))}
						</VStack>

						{/* Right Section - Two Calendars */}
						<Flex flex="1" borderLeft="1px solid" borderColor="gray.200">
							{renderCalendar(leftMonth, true)}
							<Box w="1px" bg="gray.200" />
							{renderCalendar(rightMonth, false)}
						</Flex>
					</Flex>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
};

export default DateRangePicker;
