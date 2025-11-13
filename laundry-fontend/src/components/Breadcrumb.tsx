import React from 'react';
import { Breadcrumb as ChakraBreadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronRightIcon } from '@chakra-ui/icons';

export type BreadcrumbItem = {
	label: string;
	to?: string;
};

type BreadcrumbProps = {
	items: BreadcrumbItem[];
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
	return (
		<ChakraBreadcrumb separator={<ChevronRightIcon color="gray.500" />} spacing="8px">
			{items.map((item, index) => {
				const isLast = index === items.length - 1;
				return (
					<BreadcrumbItem key={index} isCurrentPage={isLast}>
						{isLast || !item.to ? (
							<BreadcrumbLink as="span" color={isLast ? 'gray.700' : 'gray.500'} fontWeight={isLast ? 'semibold' : 'normal'}>
								{item.label}
							</BreadcrumbLink>
						) : (
							<BreadcrumbLink as={RouterLink} to={item.to} color="blue.500" _hover={{ textDecoration: 'underline' }}>
								{item.label}
							</BreadcrumbLink>
						)}
					</BreadcrumbItem>
				);
			})}
		</ChakraBreadcrumb>
	);
};

export default Breadcrumb;

