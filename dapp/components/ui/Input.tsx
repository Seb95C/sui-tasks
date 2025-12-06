/**
 * Input Component
 * Reusable form input with label and error message
 */

'use client';

import React, { InputHTMLAttributes } from 'react';
import { Flex, Text, TextField, TextArea as RadixTextArea } from '@radix-ui/themes';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <Flex direction="column" gap="1" className="w-full">
      {label && (
        <Text as="label" htmlFor={inputId} size="2" weight="medium" color="gray">
          {label}
        </Text>
      )}

      <TextField.Root color={error ? 'red' : undefined} size="2" radius="large" variant="surface">
        <TextField.Input id={inputId} {...props} />
      </TextField.Root>

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

/**
 * Textarea variant
 */
interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

export function Textarea({
  label,
  error,
  helperText,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <Flex direction="column" gap="1" className="w-full">
      {label && (
        <Text as="label" htmlFor={inputId} size="2" weight="medium" color="gray">
          {label}
        </Text>
      )}

      <RadixTextArea
        id={inputId}
        rows={rows}
        variant="surface"
        color={error ? 'red' : undefined}
        radius="large"
        {...props}
      />

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
