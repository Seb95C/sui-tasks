/**
 * Projects List Page
 * Displays all projects the user is a member of
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Container, Flex, Heading, Text } from '@radix-ui/themes';
import { useProjects } from '@/contexts/ProjectContext';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { Button } from '@/components/ui/Button';

export default function ProjectsPage() {
  const { projects, loading, loadUserProjects, createProject } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateWithMembers = async (input: any) => {
    await createProject(input);
  };

  useEffect(() => {
    loadUserProjects();
  }, [loadUserProjects]);

  return (
    <Container size="4" px="4" py="6">
      <Flex align="center" justify="between" mb="6">
        <Flex direction="column" gap="1">
          <Heading size="6">My Projects</Heading>
          <Text color="gray">Manage and view all your projects</Text>
        </Flex>
        <Button onClick={() => setIsCreateModalOpen(true)}>Create Project</Button>
      </Flex>

      <ProjectList
        projects={projects}
        loading={loading}
        onCreateProject={() => setIsCreateModalOpen(true)}
      />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWithMembers}
      />
    </Container>
  );
}
