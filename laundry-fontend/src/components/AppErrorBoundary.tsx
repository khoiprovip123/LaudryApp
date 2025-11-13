import React from 'react';
import { Box, Button, Heading, Text, VStack, Code } from '@chakra-ui/react';

type State = { 
	hasError: boolean; 
	error?: Error;
	errorInfo?: React.ErrorInfo;
};

type Props = {
	children: React.ReactNode;
	fallback?: React.ReactNode;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error để debug
		console.error('App Error Boundary caught an error:', {
			error,
			errorInfo,
			componentStack: errorInfo.componentStack,
		});

		this.setState({ error, errorInfo });

		// Có thể gửi error lên error tracking service (Sentry, etc.)
		// Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
	}

	handleReset = () => {
		this.setState({ hasError: false, error: undefined, errorInfo: undefined });
	};

	handleReload = () => {
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			// Nếu có custom fallback, sử dụng nó
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			const isDev = import.meta.env.DEV;
			const errorMessage = this.state.error?.message || 'Đã xảy ra lỗi không xác định';

			return (
				<Box 
					minH="100vh" 
					bg="gray.50" 
					display="flex" 
					alignItems="center" 
					justifyContent="center" 
					p={8}
				>
					<Box 
						maxW="600px" 
						w="full" 
						bg="white" 
						p={8} 
						borderRadius="md" 
						shadow="md"
					>
						<VStack spacing={4} align="stretch">
							<Heading size="lg" color="red.500">
								⚠️ Có lỗi xảy ra
							</Heading>
							
							<Text color="gray.700" fontSize="md">
								{errorMessage}
							</Text>

							{isDev && this.state.error && (
								<Box>
									<Text fontWeight="bold" mb={2} color="gray.600">
										Chi tiết lỗi (chỉ hiển thị trong môi trường development):
									</Text>
									<Code 
										display="block" 
										whiteSpace="pre-wrap" 
										p={4} 
										bg="gray.100" 
										borderRadius="md"
										fontSize="sm"
										maxH="300px"
										overflowY="auto"
									>
										{this.state.error.stack}
									</Code>
									{this.state.errorInfo && (
										<Code 
											display="block" 
											whiteSpace="pre-wrap" 
											p={4} 
											bg="gray.100" 
											borderRadius="md"
											mt={2}
											fontSize="xs"
											maxH="200px"
											overflowY="auto"
										>
											{this.state.errorInfo.componentStack}
										</Code>
									)}
								</Box>
							)}

							<Box display="flex" gap={3} mt={4}>
								<Button 
									colorScheme="blue" 
									onClick={this.handleReset}
									flex={1}
								>
									Thử lại
								</Button>
								<Button 
									variant="outline" 
									onClick={this.handleReload}
									flex={1}
								>
									Tải lại trang
								</Button>
							</Box>

							<Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
								Nếu lỗi vẫn tiếp tục xảy ra, vui lòng liên hệ bộ phận hỗ trợ.
							</Text>
						</VStack>
					</Box>
				</Box>
			);
		}

		return this.props.children;
	}
}


