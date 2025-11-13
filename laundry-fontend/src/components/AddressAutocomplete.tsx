import React, { useState, useEffect, useRef } from 'react';
import {
	Box,
	Input,
	VStack,
	Text,
	useOutsideClick,
	Spinner,
} from '@chakra-ui/react';

type AddressSuggestion = {
	display_name: string;
	address: {
		city?: string;
		district?: string;
		ward?: string;
		street?: string;
	};
	lat?: number;
	lon?: number;
};

type Props = {
	value: string;
	onChange: (value: string) => void;
	onSelect?: (address: AddressSuggestion) => void;
	placeholder?: string;
};

const AddressAutocomplete: React.FC<Props> = ({ value, onChange, onSelect, placeholder = 'Nhập địa chỉ...' }) => {
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>();

	useOutsideClick({
		ref: containerRef,
		handler: () => setShowSuggestions(false),
	});

	useEffect(() => {
		// Clear previous debounce
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		// Don't search if value is too short
		if (value.length < 3) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		// Debounce search
		debounceRef.current = setTimeout(async () => {
			setIsLoading(true);
			try {
				// Sử dụng API từ Nominatim (OpenStreetMap) - miễn phí, không cần API key
				// Thêm accept-language=vi để chỉ lấy kết quả tiếng Việt
				const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=vn&limit=5&addressdetails=1&accept-language=vi`;
				
				const response = await fetch(apiUrl, {
					headers: {
						'User-Agent': 'LaundryApp/1.0', // Required by Nominatim
						'Accept-Language': 'vi', // Chỉ lấy kết quả tiếng Việt
					},
				});

				if (response.ok) {
					const data = await response.json();
					const formattedSuggestions: AddressSuggestion[] = data.map((item: any) => ({
						display_name: item.display_name,
						address: {
							city: item.address?.city || item.address?.state || item.address?.province,
							district: item.address?.district || item.address?.county,
							ward: item.address?.ward || item.address?.suburb || item.address?.neighbourhood,
							street: item.address?.road || item.address?.street,
						},
						lat: parseFloat(item.lat),
						lon: parseFloat(item.lon),
					}));
					setSuggestions(formattedSuggestions);
					setShowSuggestions(formattedSuggestions.length > 0);
				}
			} catch (error) {
				console.error('Error fetching address suggestions:', error);
				setSuggestions([]);
			} finally {
				setIsLoading(false);
			}
		}, 300); // Debounce 300ms

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [value]);

	const handleSelect = (suggestion: AddressSuggestion) => {
		onChange(suggestion.display_name);
		setShowSuggestions(false);
		setSelectedIndex(-1);
		onSelect?.(suggestion);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!showSuggestions || suggestions.length === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
		} else if (e.key === 'Enter' && selectedIndex >= 0) {
			e.preventDefault();
			handleSelect(suggestions[selectedIndex]);
		} else if (e.key === 'Escape') {
			setShowSuggestions(false);
			setSelectedIndex(-1);
		}
	};

	return (
		<Box ref={containerRef} position="relative" width="100%">
			<Input
				ref={inputRef}
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					setSelectedIndex(-1);
				}}
				onFocus={() => {
					if (suggestions.length > 0) {
						setShowSuggestions(true);
					}
				}}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
			/>
			{isLoading && (
				<Box position="absolute" right="8px" top="50%" transform="translateY(-50%)">
					<Spinner size="sm" />
				</Box>
			)}
			{showSuggestions && suggestions.length > 0 && (
				<Box
					position="absolute"
					top="100%"
					left={0}
					right={0}
					mt={1}
					bg="white"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="md"
					boxShadow="lg"
					zIndex={1000}
					maxH="300px"
					overflowY="auto"
				>
					<VStack align="stretch" spacing={0}>
						{suggestions.map((suggestion, index) => (
							<Box
								key={index}
								px={4}
								py={2}
								cursor="pointer"
								bg={selectedIndex === index ? 'blue.50' : 'transparent'}
								_hover={{ bg: 'blue.50' }}
								onClick={() => handleSelect(suggestion)}
								borderBottom={index < suggestions.length - 1 ? '1px solid' : 'none'}
								borderColor="gray.100"
							>
								<Text fontSize="sm" fontWeight="medium" color="gray.800">
									{suggestion.display_name}
								</Text>
								{suggestion.address.street && (
									<Text fontSize="xs" color="gray.500" mt={1}>
										{suggestion.address.street}
										{suggestion.address.ward && `, ${suggestion.address.ward}`}
										{suggestion.address.district && `, ${suggestion.address.district}`}
										{suggestion.address.city && `, ${suggestion.address.city}`}
									</Text>
								)}
							</Box>
						))}
					</VStack>
				</Box>
			)}
		</Box>
	);
};

export default AddressAutocomplete;
export type { AddressSuggestion };

