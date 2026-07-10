import { Link, type LinkProps } from 'react-router-dom';
import { cx } from '@/utils';

interface NavLinkProps extends Omit<LinkProps, 'className'> {
  className?: string;
}

export function NavLink({ className, children, ...rest }: NavLinkProps) {
  return (
    <Link className={cx('nav-link', className)} {...rest}>
      {children}
    </Link>
  );
}
