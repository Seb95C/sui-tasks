/**
 * Home Page
 * Landing page with CTA to connect wallet and view projects
 */

"use client";

import React from "react";
import Link from "next/link";
import { Container, Flex, Grid, Heading, Text, Button, Card, Box, Badge } from "@radix-ui/themes";
import { useWallet } from "@/contexts/WalletContext";

const features = [
  {
    title: "Blockchain Powered",
    description:
      "Projects and tickets are anchored on the Sui blockchain for auditability and trust.",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12l2 2 4-4" />
        <path d="M20.618 5.984A11.955 11.955 0 0012 2.944a11.955 11.955 0 00-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Team Collaboration",
    description:
      "Invite contributors, manage permissions, and keep everyone in sync on-chain.",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Fast & Efficient",
    description:
      "Hybrid indexer keeps queries quick while preserving blockchain integrity.",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const { isConnected, connect } = useWallet();

  return (
    <Box
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.08), transparent 30%)",
      }}
    >
      <Container size="3" px="4" py={{ initial: "7", md: "9" }}>
        <Flex direction="column" gap="7" align="center">
          <Flex
            direction="column"
            gap="3"
            align="center"
            style={{ textAlign: "center", maxWidth: 780 }}
          >
            <Badge variant="soft" color="indigo">
              Built on Sui
            </Badge>
            <Heading size={{ initial: "7", md: "8" }}>
              Decentralized Project Management
            </Heading>
            <Text size="4" color="gray">
              Manage your projects and tickets on-chain with transparent
              workflows, immutable records, and wallet-native collaboration.
            </Text>
          </Flex>

          <Flex gap="3" wrap="wrap" justify="center">
            {isConnected ? (
              <Button size="3" asChild>
                <Link href="/projects">View My Projects</Link>
              </Button>
            ) : (
              <Button size="3" onClick={connect}>
                Connect Wallet to Get Started
              </Button>
            )}
          </Flex>

          <Grid columns={{ initial: "1", md: "3" }} gap="4" width="100%" mt="3">
            {features.map((feature) => (
              <Card key={feature.title} size="3" variant="surface">
                <Flex direction="column" gap="3">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(99, 102, 241, 0.12)",
                      color: "rgb(79, 70, 229)",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Heading size="4">{feature.title}</Heading>
                  <Text color="gray">{feature.description}</Text>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Flex>
      </Container>
    </Box>
  );
}
