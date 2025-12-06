import 'dotenv/config';
import { prisma } from './db';

/**
 * Example queries for the state tables
 * These show how to easily query the current state of projects, tasks, and members
 */

async function main() {
  // Example 1: Get all projects with their members and tasks
  console.log('=== Example 1: All Projects with Members and Tasks ===');
  const projects = await prisma.project.findMany({
    include: {
      members: true,
      tasks: {
        include: {
          subtasks: true,
          attachments: true,
        },
      },
    },
  });
  console.log(JSON.stringify(projects, null, 2));

  // Example 2: Get a specific project by ID
  console.log('\n=== Example 2: Specific Project ===');
  const projectId = projects[0]?.id;
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
        tasks: {
          include: {
            subtasks: true,
            attachments: true,
          },
        },
      },
    });
    console.log(JSON.stringify(project, null, 2));
  }

  // Example 3: Get all tasks for a specific project
  console.log('\n=== Example 3: Tasks for a Project ===');
  if (projectId) {
    const tasks = await prisma.task.findMany({
      where: { project_id: projectId },
      include: {
        subtasks: true,
        attachments: true,
      },
    });
    console.log(JSON.stringify(tasks, null, 2));
  }

  // Example 4: Get tasks assigned to a specific user
  console.log('\n=== Example 4: Tasks by Assignee ===');
  const assignee = projects[0]?.manager;
  if (assignee) {
    const assignedTasks = await prisma.task.findMany({
      where: { assignee },
      include: {
        project: true,
        subtasks: true,
        attachments: true,
      },
    });
    console.log(JSON.stringify(assignedTasks, null, 2));
  }

  // Example 5: Get all members of a project
  console.log('\n=== Example 5: Project Members ===');
  if (projectId) {
    const members = await prisma.member.findMany({
      where: { project_id: projectId },
      include: {
        project: true,
      },
    });
    console.log(JSON.stringify(members, null, 2));
  }

  // Example 6: Get tasks by state (e.g., state = 1)
  console.log('\n=== Example 6: Tasks by State ===');
  const tasksByState = await prisma.task.findMany({
    where: { state: 1 },
    include: {
      project: true,
      subtasks: true,
    },
  });
  console.log(JSON.stringify(tasksByState, null, 2));

  // Example 7: Get all projects managed by a specific address
  console.log('\n=== Example 7: Projects by Manager ===');
  const manager = projects[0]?.manager;
  if (manager) {
    const managedProjects = await prisma.project.findMany({
      where: { manager },
      include: {
        members: true,
        tasks: true,
      },
    });
    console.log(JSON.stringify(managedProjects, null, 2));
  }

  // Example 8: Count statistics
  console.log('\n=== Example 8: Statistics ===');
  const stats = {
    totalProjects: await prisma.project.count(),
    totalTasks: await prisma.task.count(),
    totalMembers: await prisma.member.count(),
    totalSubtasks: await prisma.subtask.count(),
    totalAttachments: await prisma.attachment.count(),
  };
  console.log(JSON.stringify(stats, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
