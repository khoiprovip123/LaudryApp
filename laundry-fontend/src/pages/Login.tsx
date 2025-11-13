import React, { useState } from 'react';
import {
	Box,
	Button,
	Card,
	CardBody,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Stack,
	useToast,
} from '@chakra-ui/react';
import { loginApi, getSessionInfoApi } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../hooks/useErrorHandler';

const Login: React.FC = () => {
	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const setToken = useAuthStore((s) => s.setToken);
	const setUserInfo = useAuthStore((s) => s.setUserInfo);
	const toast = useToast();
	const navigate = useNavigate();
	const location = useLocation() as any;
	const { handleError } = useErrorHandler();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await loginApi({ userName, password });
			if (res.succeeded) {
				setToken(res.token);
				// Fetch session info ngay sau khi login thành công
				try {
					const sessionInfo = await getSessionInfoApi();
					setUserInfo({
						userId: sessionInfo.userId,
						userName: sessionInfo.userName,
						email: sessionInfo.email,
						companyId: sessionInfo.companyId || null,
						companyName: sessionInfo.companyName,
						isSuperAdmin: sessionInfo.isSuperAdmin,
					});
				} catch (sessionErr) {
					// Không block login nếu không load được session, SessionLoader sẽ thử lại
					handleError(sessionErr, { title: 'Cảnh báo', showToast: false });
				}
				const redirectTo = location.state?.from?.pathname || '/';
				navigate(redirectTo, { replace: true });
			} else {
				toast({ 
					status: 'error', 
					title: 'Đăng nhập thất bại', 
					description: res.message,
					duration: 5000,
					isClosable: true,
				});
			}
		} catch (err: unknown) {
			// Sử dụng error handler để parse và hiển thị lỗi
			handleError(err, { title: 'Đăng nhập thất bại' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box minH="100vh" bg="gray.50" display="flex" justifyContent="center" alignItems="center" p={4}>
			<Card w="full" maxW="400px" shadow="md">
				<CardBody>
					<Heading size="md" mb={6} textAlign="center">
						Laundry Management - Login
					</Heading>
					<Box as="form" onSubmit={handleSubmit}>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên đăng nhập</FormLabel>
								<Input value={userName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)} />
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Mật khẩu</FormLabel>
								<Input type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
							</FormControl>
							<Button type="submit" colorScheme="blue" isLoading={loading}>
								Đăng nhập
							</Button>
						</Stack>
					</Box>
				</CardBody>
			</Card>
		</Box>
	);
};

export default Login;


