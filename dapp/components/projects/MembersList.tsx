/**
 * Members List Component
 * Displays project members with their roles
 */

'use client';

import React, { useState } from 'react';
import { ProjectMember, MemberRole } from '@/types/user';
import { formatAddress } from '@/lib/utils/formatting';
import { Button } from '@/components/ui/Button';

interface MembersListProps {
  members: ProjectMember[];
  canAddMembers: boolean;
  onAddMember?: () => void;
  currentUserAddress?: string;
}

export function MembersList({ members, canAddMembers, onAddMember, currentUserAddress }: MembersListProps) {
  const [showCapabilities, setShowCapabilities] = useState<string | null>(null);

  const getRoleBadgeColor = (role: MemberRole) => {
    switch (role) {
      case MemberRole.ADMIN:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case MemberRole.MEMBER:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case MemberRole.ADMIN:
        return '👑';
      case MemberRole.MEMBER:
        return '👤';
      default:
        return '👤';
    }
  };

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
            const isCurrentUser = currentUserAddress && member.user.address === currentUserAddress;
            const { getRoleCapabilities } = require('@/lib/utils/permissions');
            const capabilities = getRoleCapabilities(member.role);

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
                        {member.user.username?.[0]?.toUpperCase() || '?'}
                      </span>
                      {isCurrentUser && (
                        <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Member info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.user.username || formatAddress(member.user.address)}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-mono">
                        {formatAddress(member.user.address)}
                      </p>
                    </div>
                  </div>

                  {/* Role badge with capabilities */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCapabilities(showCapabilities === member.id ? null : member.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 hover:shadow-md transition-shadow ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      <span>{getRoleIcon(member.role)}</span>
                      <span>{member.role}</span>
                      <span className="text-xs opacity-60">ⓘ</span>
                    </button>
                  </div>
                </div>

                {/* Capabilities dropdown */}
                {showCapabilities === member.id && (
                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm animate-fade-in">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      {member.role} Capabilities:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {capabilities.map((cap: string, idx: number) => (
                        <li key={idx} className={cap.startsWith('✗') ? 'text-gray-400' : ''}>
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
