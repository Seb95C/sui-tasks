/**
 * Header Component
 * Main navigation header with wallet connection
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, Flex, Box, Text, Card } from "@radix-ui/themes";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { Button } from "@/components/ui/Button";

export function Header() {
  const pathname = usePathname();

  const navItems = [{ label: "Projects", href: "/projects" }];

  return (
    <Box
      position="sticky"
      top="0"
      zIndex="2"
      className="backdrop-blur-xl bg-white/80 border-b border-gray-200"
    >
      <Container size="4" px="4">
        <Flex align="center" justify="between" height="64px">
          <Flex align="center" gap="3">
            <Link href="/" className="flex items-center gap-2">
              <Card
                size="2"
                variant="surface"
                style={{
                  borderRadius: 12,
                  background: "rgba(99, 102, 241, 0.12)",
                }}
              >
                <Text weight="bold" color="indigo">
                  Sui Tasks
                </Text>
              </Card>
            </Link>

            <Flex align="center" gap="2" ml="4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "primary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                );
              })}
            </Flex>
          </Flex>

          <WalletConnect />
        </Flex>
      </Container>
    </Box>
  );
}
