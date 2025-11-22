import { getInitials } from '../../utils/avatarGenerator';

interface AvatarProps {
  name: string;
  avatar: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({
  name,
  avatar,
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={`${avatar} ${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
