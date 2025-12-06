/**
 * Kanban Board Page
 * Interactive board view for managing project tickets
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Flex, Heading, Text, Spinner, IconButton } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useWallet } from '@/contexts/WalletContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useTickets } from '@/contexts/TicketContext';
import { KanbanBoard } from '@/components/tickets/KanbanBoard';
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import { Button } from '@/components/ui/Button';
import { Ticket, TicketStatus } from '@/types/ticket';
import { canCreateTicket } from '@/lib/utils/permissions';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, currentAccount } = useWallet();
  const { currentProject, projectMembers, loadProject } = useProjects();
  const {
    tickets,
    currentTicket,
    loading,
    loadProjectTickets,
    updateTicketStatus,
    setCurrentTicket,
    createTicket,
  } = useTickets();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const projectId = params.id as string;

  // SIMULATION MODE: Don't require wallet connection
  // TODO: Uncomment when ready to require authentication
  // useEffect(() => {
  //   if (!isConnected) {
  //     router.push('/');
  //   }
  // }, [isConnected, router]);

  // Load project and tickets (works with or without wallet)
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
      loadProjectTickets(projectId);
    }
  }, [projectId, loadProject, loadProjectTickets]);

  // Original wallet-dependent loading
  // useEffect(() => {
  //   if (isConnected && projectId) {
  //     loadProject(projectId);
  //     loadProjectTickets(projectId);
  //   }
  // }, [isConnected, projectId, loadProject, loadProjectTickets]);

  const handleTicketClick = (ticket: Ticket) => {
    setCurrentTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setCurrentTicket(null);
  };

  const userCanCreateTicket = currentAccount && currentProject
    ? canCreateTicket(projectMembers, currentAccount.address)
    : false;

  if (loading) {
    return (
      <Container size="4" px="4" py="8">
        <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
          <Spinner size="3" />
        </Flex>
      </Container>
    );
  }

  if (!currentProject) {
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

  return (
    <Container size="4" px="4" py="6">
      <Flex align="center" justify="between" mb="5">
        <Flex align="center" gap="3">
          <Link href={`/projects/${projectId}`}>
            <IconButton variant="ghost" color="gray" aria-label="Back to project">
              <ArrowLeftIcon />
            </IconButton>
          </Link>
          <div>
            <Heading size="5">{currentProject.name}</Heading>
            <Text color="gray" size="2">
              Kanban Board
            </Text>
          </div>
        </Flex>

        {userCanCreateTicket && (
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Ticket</Button>
        )}
      </Flex>

      <KanbanBoard
        tickets={tickets}
        onTicketClick={handleTicketClick}
        onStatusChange={handleStatusChange}
      />

      {currentTicket && (
        <TicketDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          ticket={currentTicket}
          projectMembers={projectMembers}
        />
      )}

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        members={projectMembers}
        onSubmit={createTicket}
      />
    </Container>
  );
}
