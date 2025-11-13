import React from 'react';
// @ts-ignore - react-icons sẽ được cài đặt sau
import { 
	// Material Design Icons
	MdHome, 
	MdSettings, 
	MdLogout,
} from 'react-icons/md';
// @ts-ignore - react-icons sẽ được cài đặt sau
import {
	// Font Awesome Icons
	FaBuilding,
} from 'react-icons/fa';

/**
 * Ví dụ sử dụng react-icons
 * 
 * react-icons bao gồm nhiều thư viện icon:
 * - Material Design: Md* (vd: MdHome, MdSettings)
 * - Font Awesome: Fa* (vd: FaBuilding, FaUsers)
 * - Hero Icons: Hi* (vd: HiOutlineHome)
 * - Bootstrap Icons: Bs* (vd: BsHouse)
 * - Ant Design: Ai* (vd: AiOutlineHome)
 * - Và nhiều thư viện khác...
 * 
 * Xem tất cả icons tại: https://react-icons.github.io/react-icons/
 */

const IconExample: React.FC = () => {
	return (
		<div className="p-4 space-y-4">
			<h2 className="text-xl font-bold mb-4">Ví dụ sử dụng react-icons</h2>
			
			{/* Sử dụng cơ bản */}
			<div className="flex items-center gap-2">
				<MdHome size={24} />
				<span>Home Icon</span>
			</div>

			{/* Với màu sắc */}
			<div className="flex items-center gap-2">
				<FaBuilding size={24} color="#3B82F6" />
				<span>Building Icon (màu xanh)</span>
			</div>

			{/* Với className từ Tailwind */}
			<div className="flex items-center gap-2">
				<MdSettings size={24} className="text-red-500 hover:text-red-700" />
				<span>Settings Icon (hover effect)</span>
			</div>

			{/* Trong button */}
			<button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
				<MdLogout size={20} />
				<span>Logout</span>
			</button>
		</div>
	);
};

export default IconExample;

