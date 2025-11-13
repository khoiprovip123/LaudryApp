import React from 'react';
import { Image, Box } from '@chakra-ui/react';

/**
 * Ví dụ về cách sử dụng hình ảnh trong React/Vite
 * 
 * CÁCH 1: Import từ src/assets/ (KHUYÊN DÙNG)
 * - Tạo thư mục: src/assets/images/
 * - Đặt file ảnh vào đó: logo.png
 * - Import như module: import logo from '../assets/images/logo.png'
 * - Sử dụng: <img src={logo} alt="Logo" />
 * 
 * Lợi ích:
 * - Vite tự động optimize và thêm hash vào tên file
 * - Đường dẫn tự động resolve đúng trên mọi môi trường
 * - Hỗ trợ TypeScript type checking
 */

// Ví dụ import hình ảnh (uncomment khi có file thực tế)
// import logo from '../assets/images/logo.png';
// import banner from '../assets/images/banner.jpg';

const ImageExample: React.FC = () => {
	return (
		<Box p={4}>
			{/* 
				CÁCH 1: Import từ assets (KHUYÊN DÙNG)
				Đường dẫn sẽ tự động được resolve đúng trên mọi môi trường
			*/}
			{/* 
			<Image src={logo} alt="Logo" height="50px" />
			*/}

			{/* 
				CÁCH 2: Sử dụng từ public folder
				Chỉ dùng cho assets tĩnh như favicon, logo công ty
			*/}
			{/* 
			<Image src="/images/logo.png" alt="Logo" height="50px" />
			*/}

			{/* 
				CÁCH 3: Sử dụng với đường dẫn động
				Hữu ích khi cần load ảnh động từ API hoặc user upload
			*/}
			{/* 
			<Image 
				src={`${import.meta.env.VITE_API_URL}/uploads/${imageName}`} 
				alt="Dynamic Image" 
			/>
			*/}

			<p>Xem file HUONG_DAN_ANH.md để biết chi tiết</p>
		</Box>
	);
};

export default ImageExample;

