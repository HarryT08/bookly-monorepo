import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  className?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  exact = false,
  className
}) => {
  const router = useRouter();
  
  const isActive = exact 
    ? router.pathname === href
    : router.pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
        isActive 
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
          : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-white hover:bg-secondary-50 dark:hover:bg-secondary-700',
        className
      )}
    >
      {children}
    </Link>
  );
};
