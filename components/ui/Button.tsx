import { ButtonHTMLAttributes, forwardRef, ReactElement, cloneElement } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  children?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, children, ...props }, ref) => {
    const buttonClasses = cn(
      // 基本スタイル
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',

      // バリエーション
      {
        'bg-blue-600 text-white hover:bg-blue-700': variant === 'default',
        'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
        'border border-gray-300 bg-white hover:bg-gray-50': variant === 'outline',
        'hover:bg-gray-100': variant === 'ghost',
      },

      // サイズ
      {
        'h-8 px-3 text-sm': size === 'sm',
        'h-10 px-4': size === 'md',
        'h-12 px-6 text-lg': size === 'lg',
      },

      className
    )

    if (asChild && children) {
      const child = children as ReactElement
      const childProps = (child.props || {}) as Record<string, any>
      return cloneElement(child, {
        ...props,
        className: cn(buttonClasses, childProps.className),
      } as any)
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button