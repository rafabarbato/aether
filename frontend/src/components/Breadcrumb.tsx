import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-aether-text-muted" />
          )}
          {item.path ? (
            <Link
              to={item.path}
              className="text-aether-blue-primary hover:text-aether-blue-dark font-mono uppercase tracking-wider transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-aether-text-muted font-mono uppercase tracking-wider">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
