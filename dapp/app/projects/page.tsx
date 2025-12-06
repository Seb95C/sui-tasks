/**
 * Projects List Page
 * Displays all projects the user is a member of
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { Button } from '@/components/ui/Button';
import { fetchUsernameByAddress } from '@/lib/api/usernames';
import { buildMintProjectTx } from '@/lib/sui/transactions';

// API response type - matches the API structure
interface ApiProject {
  id: string;
  name: string;
  description: string;
  manager: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    projectId: string;
    address: string;
    displayName: string;
    joinedAt: string;
  }>;
  tasks: Array<any>;
}

export default function ProjectsPage() {
  const { isConnected, currentAccount, signAndExecuteTransaction } = useWallet();
  const router = useRouter();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Check if user is connected and has username
  useEffect(() => {
    async function checkAuth() {
      if (!isConnected || !currentAccount?.address) {
        router.push('/');
        return;
      }

      // Check for username
      const usernameRecord = await fetchUsernameByAddress(currentAccount.address);
      if (!usernameRecord) {
        // User doesn't have username, redirect to home
        router.push('/');
        return;
      }

      setUsername(usernameRecord.username);
    }

    checkAuth();
  }, [isConnected, currentAccount, router]);

  // Fetch projects when user is authenticated
  useEffect(() => {
    async function loadProjects() {
      if (!currentAccount?.address || !username) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/projects/by-address?address=${encodeURIComponent(currentAccount.address)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [currentAccount?.address, username]);

  const handleCreateProject = async (input: { name: string; description: string }) => {
    if (!currentAccount?.address || !username) {
      return;
    }

    try {
      const tx = buildMintProjectTx({
        name: input.name,
        description: input.description,
        managerDisplayName: username, // Use the fetched username as display name
      });

      await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            // Wait for indexer to pick up the new project
            setTimeout(() => {
              // Reload projects
              window.location.reload();
            }, 2000);
          },
          onError: (error) => {
            console.error('Failed to create project:', error);
            throw error;
          },
        }
      );

      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error('Project creation error:', error);
      throw new Error(error.message || 'Failed to create project');
    }
  };

  if (!username) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">
            Welcome, {username}! Manage and view all your projects
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
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
