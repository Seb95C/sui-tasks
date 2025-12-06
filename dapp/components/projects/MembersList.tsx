/**
 * Members List Component
 * Displays project members with their roles
 */

'use client';

import React, { useState } from 'react';
import { Avatar, Badge, Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { ProjectMember, MemberRole } from '@/types/user';
import { formatAddress } from '@/lib/utils/formatting';
import { Button } from '@/components/ui/Button';
import { getRoleCapabilities } from '@/lib/utils/permissions';

interface MembersListProps {
  members: ProjectMember[];
  canAddMembers: boolean;
  onAddMember?: () => void;
  currentUserAddress?: string;
}

export function MembersList({ members, canAddMembers, onAddMember, currentUserAddress }: MembersListProps) {
  const [showCapabilities, setShowCapabilities] = useState<string | null>(null);

  const getRoleBadgeColor = (role: MemberRole) => {
    switch (role) {
      case MemberRole.ADMIN:
        return 'plum';
      case MemberRole.MEMBER:
        return 'indigo';
      default:
        return 'gray';
    }
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case MemberRole.ADMIN:
        return '👑';
      case MemberRole.MEMBER:
        return '👤';
      default:
        return '👤';
    }
  };

  return (
    <Card variant="surface" size="3">
      <Flex align="center" justify="between" mb="4">
        <Heading size="5">Team Members</Heading>
        {canAddMembers && onAddMember && (
          <Button size="sm" onClick={onAddMember}>
            Add Member
          </Button>
        )}
      </Flex>

      <Flex direction="column" gap="3">
        {members.length === 0 ? (
          <Text color="gray" align="center">
            No members found
          </Text>
        ) : (
          members.map((member) => {
            const isCurrentUser = currentUserAddress && member.user.address === currentUserAddress;
            const capabilities = getRoleCapabilities(member.role);

            return (
              <Card
                key={member.id}
                variant={isCurrentUser ? 'classic' : 'surface'}
                size="2"
                className="transition-shadow"
              >
                <Flex align="center" justify="between" gap="3">
                  <Flex align="center" gap="3">
                    <Avatar
                      fallback={member.user.username?.[0]?.toUpperCase() || '?'}
                      color="indigo"
                      size="3"
                    />
                    <Flex direction="column" gap="1">
                      <Flex align="center" gap="2">
                        <Text weight="medium">
                          {member.user.username || formatAddress(member.user.address)}
                        </Text>
                        {isCurrentUser && (
                          <Badge color="green" variant="soft">
                            You
                          </Badge>
                        )}
                      </Flex>
                      <Text color="gray" size="1" style={{ fontFamily: 'monospace' }}>
                        {formatAddress(member.user.address)}
                      </Text>
                    </Flex>
                  </Flex>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCapabilities(showCapabilities === member.id ? null : member.id)}
                  >
                    <Flex align="center" gap="2">
                      <span>{getRoleIcon(member.role)}</span>
                      <Badge color={getRoleBadgeColor(member.role)} variant="soft">
                        {member.role}
                      </Badge>
                    </Flex>
                  </Button>
                </Flex>

                {showCapabilities === member.id && (
                  <Box
                    mt="3"
                    p="3"
                    style={{ border: '1px solid var(--gray-a4)', borderRadius: 10 }}
                  >
                    <Text size="1" weight="bold" color="gray">
                      {member.role} Capabilities:
                    </Text>
                    <Flex direction="column" gap="1" mt="2">
                      {capabilities.map((cap: string, idx: number) => (
                        <Text key={idx} size="1" color={cap.startsWith('✗') ? 'gray' : undefined}>
                          {cap}
                        </Text>
                      ))}
                    </Flex>
                  </Box>
                )}
              </Card>
            );
          })
        )}
      </Flex>
    </Card>
  );
}
