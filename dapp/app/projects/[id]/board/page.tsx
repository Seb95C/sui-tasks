/**
 * Kanban Board Page
 * Interactive board view for managing project tickets
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <button
            onClick={() => router.push('/projects')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href={`/projects/${projectId}`}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentProject.name}
            </h1>
            <p className="text-gray-600 text-sm">Kanban Board</p>
          </div>
        </div>

        {userCanCreateTicket && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Ticket
          </Button>
        )}
      </div>

      {/* Kanban board */}
      <KanbanBoard
        tickets={tickets}
        onTicketClick={handleTicketClick}
        onStatusChange={handleStatusChange}
      />

      {/* Ticket detail modal */}
      {currentTicket && (
        <TicketDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          ticket={currentTicket}
          projectMembers={projectMembers}
        />
      )}

      {/* Create ticket modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        members={projectMembers}
        onSubmit={createTicket}
      />
    </div>
  );
}
