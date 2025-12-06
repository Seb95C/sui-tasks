/**
 * Button Component
 * Reusable button with different variants and sizes
 */

'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { Button as RadixButton, Spinner, Flex } from '@radix-ui/themes';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantToRadix = (variant: ButtonVariant) => {
  switch (variant) {
    case 'secondary':
      return { variant: 'soft' as const, color: 'gray' as const };
    case 'danger':
      return { variant: 'solid' as const, color: 'red' as const };
    case 'ghost':
      return { variant: 'ghost' as const, color: 'gray' as const };
    case 'primary':
    default:
      return { variant: 'solid' as const, color: 'indigo' as const };
  }
};

const sizeToRadix: Record<ButtonSize, '1' | '2' | '3'> = {
  sm: '1',
  md: '2',
  lg: '3',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  asChild = false,
  ...props
}: ButtonProps) {
  const radixVariant = variantToRadix(variant);

  return (
    <RadixButton
      {...radixVariant}
      size={sizeToRadix[size]}
      disabled={disabled || loading}
      style={fullWidth ? { width: '100%' } : undefined}
      asChild={asChild}
      {...props}
    >
      {loading ? (
        <Flex align="center" gap="2">
          <Spinner size="1" />
          <span>Loading...</span>
        </Flex>
      ) : (
        children
      )}
    </RadixButton>
  );
}
