import 'dotenv/config';
import { prisma } from './db';

/**
 * Backfill state tables from existing events
 * This script reconstructs the current state from all historical events
 */

async function backfillProjects() {
  console.log('=== Backfilling Projects ===');
  const events = await prisma.projectCreated.findMany();

  for (const event of events) {
    try {
      await prisma.project.upsert({
        where: { id: event.id },
        update: {
          name: event.name,
          description: event.description,
          manager: event.manager,
        },
        create: {
          id: event.id,
          name: event.name,
          description: event.description,
          manager: event.manager,
        },
      });
      console.log(`✓ Created/Updated project: ${event.name} (${event.id})`);
    } catch (error) {
      console.error(`✗ Error processing project ${event.id}:`, error);
    }
  }
  console.log(`Processed ${events.length} ProjectCreated events\n`);
}

async function backfillMembers() {
  console.log('=== Backfilling Members ===');

  // Add members
  const addedEvents = await prisma.memberAdded.findMany();
  const addedMap = new Map<string, any>();

  for (const event of addedEvents) {
    const key = `${event.project_id}_${event.member_address}`;
    addedMap.set(key, event);
  }

  // Remove members that were later removed
  const removedEvents = await prisma.memberRemoved.findMany();
  for (const event of removedEvents) {
    const key = `${event.project_id}_${event.member_address}`;
    addedMap.delete(key);
  }

  // Create members that are still active
  for (const event of addedMap.values()) {
    try {
      await prisma.member.upsert({
        where: {
          project_id_address: {
            project_id: event.project_id,
            address: event.member_address,
          },
        },
        update: {
          display_name: event.display_name,
          joined_at: event.joined_at,
        },
        create: {
          project_id: event.project_id,
          address: event.member_address,
          display_name: event.display_name,
          joined_at: event.joined_at,
        },
      });
      console.log(`✓ Created member: ${event.display_name} in project ${event.project_id}`);
    } catch (error) {
      console.error(`✗ Error processing member:`, error);
    }
  }
  console.log(`Processed ${addedMap.size} active members\n`);
}

async function backfillTasks() {
  console.log('=== Backfilling Tasks ===');

  // Add tasks
  const addedEvents = await prisma.taskAdded.findMany();
  const tasksMap = new Map<string, any>();

  for (const event of addedEvents) {
    tasksMap.set(event.task_id, {
      id: event.task_id,
      project_id: event.project_id,
      name: event.name,
      description: event.description,
      assignee: event.assignee,
      state: event.state,
      due_date: event.due_date,
    });
  }

  // Remove deleted tasks
  const deletedEvents = await prisma.deleteTask.findMany();
  for (const event of deletedEvents) {
    tasksMap.delete(event.task_id);
  }

  // Apply updates
  const nameUpdates = await prisma.taskNameUpdated.findMany();
  for (const event of nameUpdates) {
    const task = tasksMap.get(event.task_id);
    if (task) task.name = event.new_name;
  }

  const assigneeUpdates = await prisma.taskAssigneeUpdated.findMany();
  for (const event of assigneeUpdates) {
    const task = tasksMap.get(event.task_id);
    if (task) task.assignee = event.new_assignee;
  }

  const stateUpdates = await prisma.taskStateUpdated.findMany();
  for (const event of stateUpdates) {
    const task = tasksMap.get(event.task_id);
    if (task) task.state = event.new_state;
  }

  const dueDateUpdates = await prisma.taskDueDateUpdated.findMany();
  for (const event of dueDateUpdates) {
    const task = tasksMap.get(event.task_id);
    if (task) task.due_date = event.new_due_date;
  }

  // Create tasks
  for (const task of tasksMap.values()) {
    try {
      await prisma.task.upsert({
        where: { id: task.id },
        update: task,
        create: task,
      });
      console.log(`✓ Created task: ${task.name} (${task.id})`);
    } catch (error) {
      console.error(`✗ Error processing task ${task.id}:`, error);
    }
  }
  console.log(`Processed ${tasksMap.size} active tasks\n`);
}

async function backfillSubtasks() {
  console.log('=== Backfilling Subtasks ===');

  // Add subtasks
  const addedEvents = await prisma.subtaskAdded.findMany();
  const subtasksMap = new Map<string, any>();

  for (const event of addedEvents) {
    const key = `${event.task_id}_${event.subtask_id}`;
    subtasksMap.set(key, {
      task_id: event.task_id,
      subtask_id: event.subtask_id,
      name: event.name,
      description: event.description,
      state: event.state,
    });
  }

  // Remove deleted subtasks
  const deletedEvents = await prisma.subtaskDeleted.findMany();
  for (const event of deletedEvents) {
    const key = `${event.task_id}_${event.subtask_id}`;
    subtasksMap.delete(key);
  }

  // Create subtasks
  for (const subtask of subtasksMap.values()) {
    try {
      await prisma.subtask.upsert({
        where: {
          task_id_subtask_id: {
            task_id: subtask.task_id,
            subtask_id: subtask.subtask_id,
          },
        },
        update: subtask,
        create: subtask,
      });
      console.log(`✓ Created subtask: ${subtask.name}`);
    } catch (error) {
      console.error(`✗ Error processing subtask:`, error);
    }
  }
  console.log(`Processed ${subtasksMap.size} active subtasks\n`);
}

async function backfillAttachments() {
  console.log('=== Backfilling Attachments ===');

  // Add attachments
  const addedEvents = await prisma.attachmentAdded.findMany();
  const attachmentsMap = new Map<string, any>();

  for (const event of addedEvents) {
    const key = `${event.task_id}_${event.attachment_id}`;
    attachmentsMap.set(key, {
      task_id: event.task_id,
      attachment_id: event.attachment_id,
      name: event.name,
      url: event.url,
    });
  }

  // Remove deleted attachments
  const removedEvents = await prisma.attachmentRemoved.findMany();
  for (const event of removedEvents) {
    const key = `${event.task_id}_${event.attachment_id}`;
    attachmentsMap.delete(key);
  }

  // Create attachments
  for (const attachment of attachmentsMap.values()) {
    try {
      await prisma.attachment.upsert({
        where: {
          task_id_attachment_id: {
            task_id: attachment.task_id,
            attachment_id: attachment.attachment_id,
          },
        },
        update: attachment,
        create: attachment,
      });
      console.log(`✓ Created attachment: ${attachment.name}`);
    } catch (error) {
      console.error(`✗ Error processing attachment:`, error);
    }
  }
  console.log(`Processed ${attachmentsMap.size} active attachments\n`);
}

async function main() {
  console.log('Starting state table backfill from events...\n');

  await backfillProjects();
  await backfillMembers();
  await backfillTasks();
  await backfillSubtasks();
  await backfillAttachments();

  console.log('=== Backfill Complete ===');
  console.log('\nFinal state:');
  const stats = {
    projects: await prisma.project.count(),
    members: await prisma.member.count(),
    tasks: await prisma.task.count(),
    subtasks: await prisma.subtask.count(),
    attachments: await prisma.attachment.count(),
  };
  console.log(JSON.stringify(stats, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
