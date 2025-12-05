/**
 * Project Context
 * Manages projects state and operations
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, CreateProjectInput, ProjectStats } from '@/types/project';
import { ProjectMember } from '@/types/user';
import {
  fetchUserProjects,
  fetchProjectById,
  fetchProjectStats,
  fetchProjectMembers,
  syncProjectToIndexer,
} from '@/lib/api/projects';
import {
  buildCreateProjectTransaction,
  buildAddMemberTransaction,
} from '@/lib/sui/transactions';
import { useWallet } from './WalletContext';

interface ProjectContextType {
  // State
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectStats | null;
  projectMembers: ProjectMember[];
  loading: boolean;
  error: string | null;

  // Actions
  loadUserProjects: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<string>;
  addMember: (projectId: string, userAddress: string, role: any) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentAccount, signAndExecuteTransaction } = useWallet();

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all projects for the connected user
   */
  const loadUserProjects = useCallback(async () => {
    // Note: Wallet connection not required in simulation mode
    // if (!currentAccount) return;

    setLoading(true);
    setError(null);

    try {
      // SIMULATION MODE: Using mock data
      // TODO: Uncomment when indexer is ready
      // const data = await fetchUserProjects(currentAccount.address);

      // For now, use mock data
      const { mockProjects, simulateDelay } = await import('@/lib/mock/data');
      await simulateDelay();
      setProjects(mockProjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, [currentAccount]);

  /**
   * Load a specific project with its details
   */
  const loadProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      // SIMULATION MODE: Using mock data
      // TODO: Uncomment when indexer is ready
      // const [project, stats, members] = await Promise.all([
      //   fetchProjectById(projectId),
      //   fetchProjectStats(projectId),
      //   fetchProjectMembers(projectId),
      // ]);

      // For now, use mock data
      const { mockProjects, mockProjectStats, mockProjectMembers, simulateDelay } = await import('@/lib/mock/data');
      await simulateDelay();

      const project = mockProjects.find(p => p.id === projectId);
      const stats = mockProjectStats[projectId];
      const members = mockProjectMembers[projectId] || [];

      if (!project) {
        throw new Error('Project not found');
      }

      setCurrentProject(project);
      setProjectStats(stats);
      setProjectMembers(members);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new project on the blockchain
   */
  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      // SIMULATION MODE: Commenting out blockchain transactions
      // TODO: Uncomment when ready to use blockchain
      /*
      if (!currentAccount || !signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        // Build the transaction
        const tx = buildCreateProjectTransaction(input);

        // Sign and execute on Sui blockchain
        const result = await signAndExecuteTransaction({
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });

        // Extract the created project object ID from the result
        const createdObjects = result.effects?.created || [];
        const projectObject = createdObjects[0]; // Assuming first created object is the project

        if (projectObject) {
          // Sync to indexer for fast queries
          await syncProjectToIndexer(projectObject.reference.objectId);

          // Reload user's projects
          await loadUserProjects();
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create project');
        console.error('Error creating project:', err);
        throw err;
      } finally {
        setLoading(false);
      }
      */

      // SIMULATION MODE: Mock project creation
      setLoading(true);
      setError(null);

      try {
        const { simulateDelay } = await import('@/lib/mock/data');
        await simulateDelay(1000);

        // Create a mock project
        const projectId = `project-${Date.now()}`;
        const newProject: Project = {
          id: projectId,
          objectId: projectId,
          name: input.name,
          description: input.description,
          creator: currentAccount?.address || '0x1234567890abcdef1234567890abcdef12345678',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          membersCount: 1,
          ticketsCount: 0,
        };

        setProjects(prev => [newProject, ...prev]);
        console.log('✅ Project created (simulation):', newProject);

        // Return the project ID so caller can add initial members
        return projectId;
      } catch (err: any) {
        setError(err.message || 'Failed to create project');
        console.error('Error creating project:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentAccount, signAndExecuteTransaction, loadUserProjects]
  );

  /**
   * Add a member to a project
   */
  const addMember = useCallback(
    async (projectId: string, userAddress: string, role: any) => {
      // SIMULATION MODE: Commenting out blockchain transactions
      // TODO: Uncomment when ready to use blockchain
      /*
      if (!currentAccount || !signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const tx = buildAddMemberTransaction({ projectId, userAddress, role });

        await signAndExecuteTransaction({
          transaction: tx,
        });

        // Reload project members
        if (currentProject?.id === projectId) {
          await loadProject(projectId);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to add member');
        console.error('Error adding member:', err);
        throw err;
      } finally {
        setLoading(false);
      }
      */

      // SIMULATION MODE: Mock add member
      setLoading(true);
      setError(null);

      try {
        const { mockUsers, simulateDelay } = await import('@/lib/mock/data');
        await simulateDelay(800);

        // Find or create a user for this address
        let user = mockUsers.find(u => u.address === userAddress);

        // If not found, create a new user
        if (!user) {
          user = {
            id: `user-${Date.now()}`,
            address: userAddress,
            username: `User ${userAddress.slice(0, 6)}`,
            createdAt: new Date().toISOString(),
          };
        }

        // Create new member
        const newMember: ProjectMember = {
          id: `member-${Date.now()}`,
          userId: user.id,
          projectId,
          role,
          user,
          joinedAt: new Date().toISOString(),
        };

        // Add to project members state
        setProjectMembers(prev => [...prev, newMember]);

        console.log('✅ Member added (simulation):', newMember);
      } catch (err: any) {
        setError(err.message || 'Failed to add member');
        console.error('Error adding member:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentAccount, signAndExecuteTransaction, currentProject, loadProject]
  );

  const value: ProjectContextType = {
    projects,
    currentProject,
    projectStats,
    projectMembers,
    loading,
    error,
    loadUserProjects,
    loadProject,
    createProject,
    addMember,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
