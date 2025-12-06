/**
 * Project List Component
 * Displays a grid of project cards
 */

'use client';

import React from 'react';
import { Grid, Flex, Text, Spinner, Box } from '@radix-ui/themes';
import { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/Button';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  onCreateProject: () => void;
}

export function ProjectList({ projects, loading, onCreateProject }: ProjectListProps) {
  if (loading) {
    return (
      <Flex align="center" justify="center" py="8">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (projects.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" py="9" gap="3">
        <Box
          width="72px"
          height="72px"
          className="rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl"
        >
          +
        </Box>
        <Text weight="medium" size="4">
          No projects yet
        </Text>
        <Text color="gray" size="2">
          Get started by creating your first project.
        </Text>
        <Button onClick={onCreateProject}>Create Project</Button>
      </Flex>
    );
  }

  return (
    <Grid columns={{ initial: '1', md: '2', lg: '3' }} gap="4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Grid>
  );
}
