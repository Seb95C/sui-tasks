/**
 * Ticket Context
 * Manages tickets state and operations
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Ticket, CreateTicketInput, UpdateTicketInput, TicketStatus } from '@/types/ticket';
import {
  fetchProjectTickets,
  fetchTicketById,
  syncTicketToIndexer,
} from '@/lib/api/tickets';
import {
  buildCreateTicketTransaction,
  buildUpdateTicketTransaction,
  buildUpdateTicketStatusTransaction,
} from '@/lib/sui/transactions';
import { useWallet } from './WalletContext';

interface TicketContextType {
  // State
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadProjectTickets: (projectId: string) => Promise<void>;
  loadTicket: (ticketId: string) => Promise<void>;
  createTicket: (input: CreateTicketInput) => Promise<void>;
  updateTicket: (input: UpdateTicketInput) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  setCurrentTicket: (ticket: Ticket | null) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const { currentAccount, signAndExecuteTransaction } = useWallet();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all tickets for a project
   */
  const loadProjectTickets = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      // SIMULATION MODE: Using mock data
      // TODO: Uncomment when indexer is ready
      // const data = await fetchProjectTickets(projectId);

      const { mockTickets, simulateDelay } = await import('@/lib/mock/data');
      await simulateDelay();
      setTickets(mockTickets[projectId] || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load a specific ticket by ID
   */
  const loadTicket = useCallback(async (ticketId: string) => {
    setLoading(true);
    setError(null);

    try {
      // SIMULATION MODE: Using mock data
      // TODO: Uncomment when indexer is ready
      // const ticket = await fetchTicketById(ticketId);

      const { mockTickets, simulateDelay } = await import('@/lib/mock/data');
      await simulateDelay();

      // Find ticket across all projects
      let foundTicket = null;
      for (const projectTickets of Object.values(mockTickets)) {
        foundTicket = projectTickets.find(t => t.id === ticketId);
        if (foundTicket) break;
      }

      if (!foundTicket) {
        throw new Error('Ticket not found');
      }

      setCurrentTicket(foundTicket);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket');
      console.error('Error loading ticket:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new ticket on the blockchain
   */
  const createTicket = useCallback(
    async (input: CreateTicketInput) => {
      // SIMULATION MODE: Commenting out blockchain transactions
      // TODO: Uncomment when ready to use blockchain
      /*
      if (!currentAccount || !signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const tx = buildCreateTicketTransaction(input);

        const result = await signAndExecuteTransaction({
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });

        // Extract created ticket object ID
        const createdObjects = result.effects?.created || [];
        const ticketObject = createdObjects[0];

        if (ticketObject) {
          await syncTicketToIndexer(ticketObject.reference.objectId);
          await loadProjectTickets(input.projectId);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create ticket');
        console.error('Error creating ticket:', err);
        throw err;
      } finally {
        setLoading(false);
      }
      */

      // SIMULATION MODE: Mock ticket creation
      setLoading(true);
      setError(null);

      try {
        const { mockUsers, simulateDelay } = await import('@/lib/mock/data');
        await simulateDelay(1000);

        const newTicket: Ticket = {
          id: `ticket-${Date.now()}`,
          objectId: `ticket-${Date.now()}`,
          projectId: input.projectId,
          title: input.title,
          description: input.description,
          status: TicketStatus.TODO,
          priority: input.priority,
          assigneeId: input.assigneeId,
          assignee: input.assigneeId ? mockUsers.find(u => u.id === input.assigneeId) : undefined,
          creatorId: currentAccount?.address || mockUsers[0].id,
          creator: mockUsers[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setTickets(prev => [...prev, newTicket]);
        console.log('✅ Ticket created (simulation):', newTicket);
      } catch (err: any) {
        setError(err.message || 'Failed to create ticket');
        console.error('Error creating ticket:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentAccount, signAndExecuteTransaction, loadProjectTickets]
  );

  /**
   * Update an existing ticket
   */
  const updateTicket = useCallback(
    async (input: UpdateTicketInput) => {
      // SIMULATION MODE: Commenting out blockchain transactions
      // TODO: Uncomment when ready to use blockchain
      /*
      if (!currentAccount || !signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const tx = buildUpdateTicketTransaction(input);

        await signAndExecuteTransaction({
          transaction: tx,
        });

        // Reload the ticket
        if (currentTicket) {
          await loadTicket(input.ticketId);
        }

        // Reload tickets list if we have a current project
        const ticket = tickets.find(t => t.id === input.ticketId);
        if (ticket) {
          await loadProjectTickets(ticket.projectId);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to update ticket');
        console.error('Error updating ticket:', err);
        throw err;
      } finally {
        setLoading(false);
      }
      */

      // SIMULATION MODE: Mock ticket update
      setLoading(true);
      setError(null);

      try {
        const { simulateDelay } = await import('@/lib/mock/data');
        await simulateDelay(800);

        // Update ticket in state
        setTickets(prev =>
          prev.map(t =>
            t.id === input.ticketId
              ? {
                  ...t,
                  ...input,
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );

        // Update current ticket if it's the one being edited
        if (currentTicket?.id === input.ticketId) {
          setCurrentTicket(prev =>
            prev
              ? {
                  ...prev,
                  ...input,
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
        }

        console.log('✅ Ticket updated (simulation):', input);
      } catch (err: any) {
        setError(err.message || 'Failed to update ticket');
        console.error('Error updating ticket:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentAccount, signAndExecuteTransaction, currentTicket, tickets, loadTicket, loadProjectTickets]
  );

  /**
   * Update ticket status (used in Kanban drag-drop)
   */
  const updateTicketStatus = useCallback(
    async (ticketId: string, status: TicketStatus) => {
      // SIMULATION MODE: Commenting out blockchain transactions
      // TODO: Uncomment when ready to use blockchain
      /*
      if (!currentAccount || !signAndExecuteTransaction) {
        throw new Error('Wallet not connected');
      }

      // Optimistic update
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
      );

      try {
        const tx = buildUpdateTicketStatusTransaction(ticketId, status);

        await signAndExecuteTransaction({
          transaction: tx,
        });

        // Reload to get server state
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
          await loadProjectTickets(ticket.projectId);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to update ticket status');
        console.error('Error updating ticket status:', err);

        // Revert optimistic update on error
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
          await loadProjectTickets(ticket.projectId);
        }

        throw err;
      }
      */

      // SIMULATION MODE: Mock status update with optimistic UI
      // Optimistic update
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status, updatedAt: new Date().toISOString() }
            : t
        )
      );

      try {
        const { simulateDelay } = await import('@/lib/mock/data');
        await simulateDelay(500);

        console.log('✅ Ticket status updated (simulation):', { ticketId, status });
      } catch (err: any) {
        setError(err.message || 'Failed to update ticket status');
        console.error('Error updating ticket status:', err);
        throw err;
      }
    },
    [currentAccount, signAndExecuteTransaction, tickets, loadProjectTickets]
  );

  const value: TicketContextType = {
    tickets,
    currentTicket,
    loading,
    error,
    loadProjectTickets,
    loadTicket,
    createTicket,
    updateTicket,
    updateTicketStatus,
    setCurrentTicket,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
