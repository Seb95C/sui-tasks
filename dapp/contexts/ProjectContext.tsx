'use context'
import React, { createContext, useContext, ReactNode } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

// ---------------------------
// Types
// ---------------------------
export interface Project {
  id: string;
  name: string;
  description: string;
  manager: string;
  created_at: Date;
  updated_at: Date;
  members: Member[];
  tasks: Task[];
}

export interface Member {
  id: string;
  project_id: string;
  address: string;
  display_name: string;
  joined_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string;
  assignee: string;
  state: number;
  due_date: string;
  created_at: Date;
  updated_at: Date;
  subtasks: Subtask[];
  attachments: Attachment[];
}

export interface Subtask {
  id: string;
  task_id: string;
  subtask_id: string;
  name: string;
  description: string;
  state: number;
}

export interface Attachment {
  id: string;
  task_id: string;
  attachment_id: string;
  name: string;
  url: string;
}

// ---------------------------
// Context Type
// ---------------------------
type ProjectsContextType = {
  projects: Project[];
  loading: boolean;
  error: unknown;
  refetch: () => void;

  // (future mutation support)
  createProject?: (data: any) => Promise<void>;
  addMember?: (projectId: string, member: any) => Promise<void>;
};

// ---------------------------
const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined
);

// ---------------------------
// Fetch many projects
// ---------------------------
async function fetchProjects(address: string): Promise<Project[]> {
  const res = await fetch(`/api/projects?address=${address}`);

  if (!res.ok) {
    console.warn("Failed fetching projects");
    return [];
  }

  return res.json();
}

// ---------------------------
// Provider
// ---------------------------
export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const account = useCurrentAccount();
  const address = account?.address;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["projects", address],
    queryFn: () => fetchProjects(address!),
    enabled: !!address,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <ProjectsContext.Provider
      value={{
        projects: data ?? [],
        loading: isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

// ---------------------------
// Hook
// ---------------------------
export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within ProjectsProvider");
  }
  return context;
};
