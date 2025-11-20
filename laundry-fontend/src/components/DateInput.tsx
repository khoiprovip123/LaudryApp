import React from 'react';
import { Input } from '@chakra-ui/react';
import type { InputProps } from '@chakra-ui/react';

interface DateInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
	value: string;
	onChange: (value: string) => void;
}

/**
 * DateInput component với format hiển thị ngày/tháng/năm
 * Wrapper cho HTML5 date input với styling nhất quán
 */
const DateInput: React.FC<DateInputProps> = ({ value, onChange, ...props }) => {
	return (
		<Input
			type="date"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			lang="vi-VN"
			_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
			{...props}
		/>
	);
};

export default DateInput;

