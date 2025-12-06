/**
 * Members List Component
 * Displays project members with their roles
 */

'use client';

import React from 'react';
import { ProjectMember } from '@/types/project';
import { formatAddress, formatDate } from '@/lib/utils/formatting';
import { Button } from '@/components/ui/Button';

interface MembersListProps {
  members: ProjectMember[];
  managerAddress?: string;
  canAddMembers: boolean;
  onAddMember?: () => void;
  currentUserAddress?: string;
}

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        {canAddMembers && onAddMember && (
          <Button size="sm" onClick={onAddMember}>
            Add Member
          </Button>
        )}
      </div>

      {/* Members list */}
      <div className="divide-y divide-gray-200">
        {members.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No members found
          </div>
        ) : (
          members.map((member) => {
            const isCurrentUser =
              currentUserAddress &&
              member.address.toLowerCase() === currentUserAddress.toLowerCase();
            const isManager =
              managerAddress &&
              managerAddress.toLowerCase() === member.address.toLowerCase();

            return (
              <div
                key={member.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center relative">
                      <span className="text-primary-700 font-medium text-sm">
                        {member.displayName?.[0]?.toUpperCase() || '?'}
                      </span>
                      {isCurrentUser && (
                        <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Member info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.displayName || formatAddress(member.address)}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        {isManager && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Manager
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-mono">
                        {formatAddress(member.address)}
                      </p>
                      {member.joinedAt && (
                        <p className="text-xs text-gray-400">
                          Joined {formatDate(member.joinedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
