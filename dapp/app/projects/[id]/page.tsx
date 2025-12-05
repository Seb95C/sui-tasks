/**
 * Project Dashboard Page
 * Shows detailed view of a single project
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useTickets } from '@/contexts/TicketContext';
import { ProjectDashboard } from '@/components/projects/ProjectDashboard';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import { AddMemberModal } from '@/components/projects/AddMemberModal';
import { canAddMembers } from '@/lib/utils/permissions';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!currentProject || !projectStats) {
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

  const userCanAddMembers = currentAccount
    ? canAddMembers(projectMembers, currentAccount.address)
    : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProjectDashboard
        project={currentProject}
        stats={projectStats}
        members={projectMembers}
        canAddMembers={userCanAddMembers}
        currentUserAddress={currentAccount?.address}
        onAddMember={() => setIsAddMemberModalOpen(true)}
        onCreateTicket={() => setIsCreateTicketModalOpen(true)}
      />

      {/* Create ticket modal */}
      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        projectId={projectId}
        members={projectMembers}
        onSubmit={createTicket}
      />

      {/* Add member modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        projectId={projectId}
        onSubmit={addMember}
      />
    </div>
  );
}
