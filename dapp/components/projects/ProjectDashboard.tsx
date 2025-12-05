/**
 * Project Dashboard Component
 * Displays project overview with stats and members
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Project, ProjectStats } from '@/types/project';
import { ProjectMember } from '@/types/user';
import { MembersList } from './MembersList';
import { Button } from '@/components/ui/Button';

interface ProjectDashboardProps {
  project: Project;
  stats: ProjectStats;
  members: ProjectMember[];
  canAddMembers: boolean;
  currentUserAddress?: string;
  onAddMember: () => void;
  onCreateTicket: () => void;
}

export function ProjectDashboard({
  project,
  stats,
  members,
  canAddMembers,
  currentUserAddress,
  onAddMember,
  onCreateTicket,
}: ProjectDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {project.name}
            </h1>
            <p className="text-gray-600">{project.description}</p>
          </div>

          <Link href={`/projects/${project.id}/board`}>
            <Button>
              View Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTickets}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">To Do</p>
              <p className="text-3xl font-bold text-gray-600">{stats.todoCount}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-400 rounded" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgressCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Done</p>
              <p className="text-3xl font-bold text-green-600">{stats.doneCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Members section */}
      <MembersList
        members={members}
        canAddMembers={canAddMembers}
        currentUserAddress={currentUserAddress}
        onAddMember={onAddMember}
      />

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-3">
          <Button onClick={onCreateTicket}>
            Create Ticket
          </Button>
          <Link href={`/projects/${project.id}/board`}>
            <Button variant="secondary">
              View Kanban Board
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
