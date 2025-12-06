/**
 * Select Component
 * Radix-powered select with label and helper text
 */

'use client';

import React from 'react';
import { Flex, Select as RadixSelect, Text } from '@radix-ui/themes';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  value,
  onValueChange,
  disabled,
}: SelectProps) {
  return (
    <Flex direction="column" gap="1" className="w-full">
      {label && (
        <Text as="label" size="2" weight="medium" color="gray">
          {label}
        </Text>
      )}

      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          placeholder={placeholder}
          color={error ? 'red' : undefined}
          radius="large"
          variant="surface"
        />
        <RadixSelect.Content>
          {options.map((option) => (
            <RadixSelect.Item key={option.value} value={option.value}>
              {option.label}
            </RadixSelect.Item>
          ))}
        </RadixSelect.Content>
      </RadixSelect.Root>

      {error ? (
        <Text size="1" color="red">
          {error}
        </Text>
      ) : helperText ? (
        <Text size="1" color="gray">
          {helperText}
        </Text>
      ) : null}
    </Flex>
  );
}
