/**
 * Modal Component
 * Radix Dialog wrapper for consistent theming
 */

"use client";

import React, { ReactNode } from "react";
import { Dialog, Flex, IconButton } from "@radix-ui/themes";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
}

const sizeToWidth: Record<ModalSize, number> = {
  sm: 420,
  md: 520,
  lg: 720,
  xl: 960,
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => (!open ? onClose() : undefined)}
    >
      <Dialog.Content
        maxWidth={`${sizeToWidth[size]}px`}
        aria-describedby={undefined}
        style={{ width: "100%" }}
      >
        {(title || showCloseButton) && (
          <Flex justify="between" align="center" mb="3">
            {title ? <Dialog.Title>{title}</Dialog.Title> : <div />}
            {showCloseButton && (
              <Dialog.Close>
                <IconButton
                  variant="ghost"
                  color="gray"
                  aria-label="Close"
                ></IconButton>
              </Dialog.Close>
            )}
          </Flex>
        )}

        {children}
      </Dialog.Content>
    </Dialog.Root>
  );
}
