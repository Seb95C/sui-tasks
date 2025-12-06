/**
 * Project Dashboard Component
 * Displays project overview with stats and members
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Flex, Grid, Heading, Text, Badge } from '@radix-ui/themes';
import { Project, ProjectStats } from '@/types/project';
import { ProjectMember } from '@/types/user';
import { MembersList } from './MembersList';
import { Button } from '@/components/ui/Button';

interface ProjectDashboardProps {
  project: Project;
  stats: ProjectStats;
  members: ProjectMember[];
  canAddMembers: boolean;
  currentUserAddress?: string;
  onAddMember: () => void;
  onCreateTicket: () => void;
}

export function ProjectDashboard({
  project,
  stats,
  members,
  canAddMembers,
  currentUserAddress,
  onAddMember,
  onCreateTicket,
}: ProjectDashboardProps) {
  return (
    <Flex direction="column" gap="5">
      <Card variant="surface" size="3">
        <Flex align="start" justify="between" mb="3" gap="4">
          <Flex direction="column" gap="2">
            <Heading size="6">{project.name}</Heading>
            <Text color="gray">{project.description}</Text>
          </Flex>

          <Button asChild>
            <Link href={`/projects/${project.id}/board`}>View Board</Link>
          </Button>
        </Flex>
      </Card>

      <Grid columns={{ initial: '1', md: '4' }} gap="4">
        <StatCard
          label="Total Tickets"
          value={stats.totalTickets}
          accent="indigo"
          helper="Across all statuses"
        />
        <StatCard label="To Do" value={stats.todoCount} accent="gray" helper="Backlog" />
        <StatCard label="In Progress" value={stats.inProgressCount} accent="yellow" helper="Being worked" />
        <StatCard label="Done" value={stats.doneCount} accent="green" helper="Completed" />
      </Grid>

      <MembersList
        members={members}
        canAddMembers={canAddMembers}
        currentUserAddress={currentUserAddress}
        onAddMember={onAddMember}
      />

      <Card variant="surface" size="3">
        <Heading size="4" mb="3">
          Quick Actions
        </Heading>
        <Flex gap="3" wrap="wrap">
          <Button onClick={onCreateTicket}>Create Ticket</Button>
          <Button variant="secondary" asChild>
            <Link href={`/projects/${project.id}/board`}>View Kanban Board</Link>
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  accent: 'indigo' | 'gray' | 'yellow' | 'green';
  helper?: string;
}

function StatCard({ label, value, accent, helper }: StatCardProps) {
  return (
    <Card variant="surface" size="3">
      <Flex align="center" justify="between">
        <Flex direction="column" gap="1">
          <Text color="gray" size="2">
            {label}
          </Text>
          <Heading size="6">{value}</Heading>
          {helper && (
            <Text color="gray" size="1">
              {helper}
            </Text>
          )}
        </Flex>
        <Badge color={accent} variant="soft">
          {label}
        </Badge>
      </Flex>
    </Card>
  );
}
