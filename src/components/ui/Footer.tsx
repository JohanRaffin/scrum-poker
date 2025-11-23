interface FooterProps {
  className?: string;
  position?: 'fixed' | 'static';
}

export function Footer({ className = '', position = 'static' }: FooterProps) {
  const positionClasses =
    position === 'fixed' ? 'fixed bottom-0 left-0 right-0' : '';

  return (
    <footer
      className={`bg-white border-t border-gray-200 py-4 px-6 ${positionClasses} ${className}`}
    >
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Mojo Studio.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
