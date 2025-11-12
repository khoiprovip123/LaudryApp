import React from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

type State = { hasError: boolean; message?: string };

export default class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(error: any): State {
		return { hasError: true, message: error?.message ?? 'Đã xảy ra lỗi' };
	}

	componentDidCatch(error: any) {
		console.error('App crashed:', error);
	}

	render() {
		if (this.state.hasError) {
			return (
				<Box p={8}>
					<Heading size="md" mb={2}>Có lỗi xảy ra</Heading>
					<Text color="gray.600" mb={4}>{this.state.message}</Text>
					<Button onClick={() => location.reload()}>Tải lại trang</Button>
				</Box>
			);
		}
		return this.props.children;
	}
}


