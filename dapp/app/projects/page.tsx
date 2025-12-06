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
      <div className="mb-10">
        <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-soft-lg overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
                My Projects
              </h1>
              <p className="text-purple-100 text-lg">
                Welcome back, <span className="font-semibold text-white">{username}</span>! ✨
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-white font-semibold">{projects.length} Projects</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl font-bold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Projects list */}
      <ProjectList
        projects={projects}
        loading={loading}
        onCreateProject={() => setIsCreateModalOpen(true)}
        currentUserAddress={currentAccount?.address}
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
