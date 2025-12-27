import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`flex flex-col gap-4 p-6 bg-zinc-900 rounded-xl border border-zinc-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

