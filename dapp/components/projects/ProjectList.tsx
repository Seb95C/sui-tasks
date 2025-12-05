/**
 * Project List Component
 * Displays a grid of project cards
 */

'use client';

import React from 'react';
import { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/Button';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  onCreateProject: () => void;
}

export function ProjectList({ projects, loading, onCreateProject }: ProjectListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
        <p className="mt-2 text-gray-500">
          Get started by creating your first project.
        </p>
        <div className="mt-6">
          <Button onClick={onCreateProject}>
            Create Project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
