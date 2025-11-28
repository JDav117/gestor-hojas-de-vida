import React from 'react';

type IconProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
};

export default function Icon({ name, size, className = '', style }: IconProps) {
  const sizeClass = size ? size : '';
  return (
    <span 
      className={`material-symbols-outlined ${sizeClass} ${className}`.trim()} 
      style={style}
    >
      {name}
    </span>
  );
}
