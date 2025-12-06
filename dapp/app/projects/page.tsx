/**
 * Projects List Page
 * Displays all projects the user is a member of
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useProjects } from '@/contexts/ProjectContext';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { Button } from '@/components/ui/Button';

export default function ProjectsPage() {
  // const router = useRouter();
  // const { isConnected, currentAccount } = useWallet();
  const {projects, isLoading, error, refetch} = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateWithMembers = async (input: any) => {
    const projectId = await createProject(input);
    // Note: In simulation mode, members would be added here
    // In real mode, this would be multiple blockchain transactions
  };

  // SIMULATION MODE: Don't require wallet connection
  // TODO: Uncomment when ready to require authentication
  // useEffect(() => {
  //   if (!isConnected) {
  //     router.push('/');
  //   }
  // }, [isConnected, router]);

  // Load projects on mount (works with or without wallet)
  useEffect(() => {
    loadUserProjects();
  }, [loadUserProjects]);

  // Original wallet-dependent loading
  // useEffect(() => {
  //   if (isConnected && currentAccount) {
  //     loadUserProjects();
  //   }
  // }, [isConnected, currentAccount, loadUserProjects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all your projects
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Project
        </Button>
      </div>

      {/* Projects list */}
      <ProjectList
        projects={projects}
        loading={loading}
        onCreateProject={() => setIsCreateModalOpen(true)}
      />

      {/* Create project modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWithMembers}
      />
    </div>
  );
}
