/**
 * Project Dashboard Page
 * Shows detailed view of a single project
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Flex, Spinner, Heading, Text } from '@radix-ui/themes';
import { useWallet } from '@/contexts/WalletContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useTickets } from '@/contexts/TicketContext';
import { ProjectDashboard } from '@/components/projects/ProjectDashboard';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import { AddMemberModal } from '@/components/projects/AddMemberModal';
import { canAddMembers } from '@/lib/utils/permissions';
import { Button } from '@/components/ui/Button';

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, currentAccount } = useWallet();
  const {
    currentProject,
    projectStats,
    projectMembers,
    loading,
    loadProject,
    addMember,
  } = useProjects();
  const { createTicket } = useTickets();

  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const projectId = params.id as string;

  // SIMULATION MODE: Don't require wallet connection
  // TODO: Uncomment when ready to require authentication
  // useEffect(() => {
  //   if (!isConnected) {
  //     router.push('/');
  //   }
  // }, [isConnected, router]);

  // Load project data (works with or without wallet)
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  // Original wallet-dependent loading
  // useEffect(() => {
  //   if (isConnected && projectId) {
  //     loadProject(projectId);
  //   }
  // }, [isConnected, projectId, loadProject]);

  if (loading) {
    return (
      <Container size="4" px="4" py="8">
        <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
          <Spinner size="3" />
        </Flex>
      </Container>
    );
  }

  if (!currentProject || !projectStats) {
    return (
      <Container size="4" px="4" py="8">
        <Flex direction="column" align="center" gap="3">
          <Heading size="5">Project not found</Heading>
          <Text color="gray">The requested project does not exist.</Text>
          <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
        </Flex>
      </Container>
    );
  }

  const userCanAddMembers = currentAccount
    ? canAddMembers(projectMembers, currentAccount.address)
    : false;

  return (
    <Container size="4" px="4" py="6">
      <ProjectDashboard
        project={currentProject}
        stats={projectStats}
        members={projectMembers}
        canAddMembers={userCanAddMembers}
        currentUserAddress={currentAccount?.address}
        onAddMember={() => setIsAddMemberModalOpen(true)}
        onCreateTicket={() => setIsCreateTicketModalOpen(true)}
      />

      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        projectId={projectId}
        members={projectMembers}
        onSubmit={createTicket}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        projectId={projectId}
        onSubmit={addMember}
      />
    </Container>
  );
}
