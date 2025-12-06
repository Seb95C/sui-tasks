/**
 * Project Card Component
 * Displays a single project in the projects list
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Flex, Text, Heading, Badge } from '@radix-ui/themes';
import { Project } from '@/types/project';
import { formatRelativeTime } from '@/lib/utils/formatting';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card
        size="3"
        variant="surface"
        className="hover:shadow-md transition-shadow cursor-pointer"
        style={{ height: '100%' }}
      >
        <Flex direction="column" gap="3">
          <Heading size="4">{project.name}</Heading>
          <Text color="gray" size="2" className="line-clamp-2">
            {project.description}
          </Text>

          <Flex align="center" justify="between" mt="2">
            <Flex align="center" gap="3">
              <Badge color="indigo" variant="soft">
                {project.membersCount || 0} members
              </Badge>
              <Badge color="gray" variant="soft">
                {project.ticketsCount || 0} tickets
              </Badge>
            </Flex>
            <Text color="gray" size="1">
              {formatRelativeTime(project.createdAt)}
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
}
