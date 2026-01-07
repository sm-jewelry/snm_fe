import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const pathToLabel: Record<string, string> = {
  admin: 'Dashboard',
  categories: 'Categories',
  catalogs: 'Catalogs',
  collections: 'Collections',
  products: 'Products',
  reviews: 'Reviews',
  orders: 'Orders',
  customers: 'Customers',
  'import-export': 'Import/Export',
};

/**
 * AdminBreadcrumbs
 * Auto-generates breadcrumbs based on current route
 */
const AdminBreadcrumbs: React.FC = () => {
  const router = useRouter();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = router.pathname.split('/').filter((segment) => segment);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Skip if not in admin
    if (!pathSegments.includes('admin')) {
      return [];
    }

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Handle dynamic routes like [id]
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1);
        const paramValue = router.query[paramName];
        breadcrumbs.push({
          label: paramValue ? `${pathToLabel[pathSegments[index - 1]] || 'Item'} #${paramValue}` : 'Details',
        });
      } else {
        const label = pathToLabel[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === pathSegments.length - 1;

        breadcrumbs.push({
          label,
          path: isLast ? undefined : currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ color: 'text.primary' }}
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        if (isLast) {
          return (
            <Typography key={index} color="text.primary" fontWeight={600} fontSize="0.95rem">
              {isFirst && <HomeIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />}
              {crumb.label}
            </Typography>
          );
        }

        return (
          <Link key={index} href={crumb.path || '#'} passHref legacyBehavior>
            <Typography
              component="a"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.95rem',
                '&:hover': {
                  textDecoration: 'underline',
                  color: 'primary.main',
                },
              }}
            >
              {isFirst && <HomeIcon sx={{ fontSize: 18, mr: 0.5 }} />}
              {crumb.label}
            </Typography>
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default AdminBreadcrumbs;
