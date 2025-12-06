/**
 * Project Card Component
 * Displays a single project in the projects list
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import { formatAddress, formatRelativeTime } from '@/lib/utils/formatting';

interface ProjectCardProps {
  project: Project;
  currentUserAddress?: string;
}

export function ProjectCard({ project, currentUserAddress }: ProjectCardProps) {
  const isManager = currentUserAddress &&
    project.manager.toLowerCase() === currentUserAddress.toLowerCase();

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group relative bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-soft-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-ocean opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500"></div>

        {/* Project name */}
        <div className="relative flex items-center gap-2 mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {project.name}
          </h3>
          {isManager && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
              Manager
            </span>
          )}
        </div>

        {/* Project description */}
        <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Project stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-5">
            <div className="flex items-center text-gray-600 group/stat hover:text-primary-600 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center mr-2 group-hover/stat:bg-primary-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span className="font-medium">{formatAddress(project.manager)}</span>
            </div>

            {/* Members count */}
            <div className="flex items-center text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <span className="font-medium">{project.members?.length || 0}</span>
            </div>

            {/* Tasks count */}
            <div className="flex items-center text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <span className="font-medium">{project.tasks?.length || 0}</span>
            </div>
          </div>

          {/* Created date */}
          <span className="text-gray-400 text-xs font-medium">
            {formatRelativeTime(project.createdAt)}
          </span>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress</span>
            <span className="font-semibold">
              {project.tasks?.filter(t => t.state === 2).length || 0} / {project.tasks?.length || 0} completed
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${project.tasks?.length ? (project.tasks.filter(t => t.state === 2).length / project.tasks.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
