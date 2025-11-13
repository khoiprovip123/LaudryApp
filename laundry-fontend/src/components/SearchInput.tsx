import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, InputGroup, InputLeftElement, Box } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

type Props = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	debounceMs?: number; // Thời gian debounce, mặc định 300ms
};

const SearchInput: React.FC<Props> = ({ value, onChange, placeholder = 'Tìm kiếm...', debounceMs = 300 }) => {
	const [inputValue, setInputValue] = useState(value);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>();
	const onChangeRef = useRef(onChange);

	// Cập nhật ref khi onChange thay đổi
	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	// Sync với value từ bên ngoài
	useEffect(() => {
		setInputValue(value);
	}, [value]);

	// Debounce onChange
	useEffect(() => {
		// Clear previous debounce
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		// Debounce onChange
		debounceRef.current = setTimeout(() => {
			onChangeRef.current(inputValue);
		}, debounceMs);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [inputValue, debounceMs]);

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	}, []);

	return (
		<Box width="100%">
			<InputGroup>
				<InputLeftElement pointerEvents="none">
					<SearchIcon color="gray.400" />
				</InputLeftElement>
				<Input
					value={inputValue}
					onChange={handleChange}
					placeholder={placeholder}
					_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
				/>
			</InputGroup>
		</Box>
	);
};

export default SearchInput;

