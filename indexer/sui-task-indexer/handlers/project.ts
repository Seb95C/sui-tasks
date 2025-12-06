
import { SuiEvent } from '@mysten/sui/client';
import { prisma, Prisma } from '../db';

// State management helper functions
async function handleProjectCreatedState(event: any) {
  await prisma.project.create({
    data: {
      id: event.id,
      name: event.name,
      description: event.description,
      manager: event.manager,
    },
  });
}

async function handleMemberAddedState(event: any) {
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
}

async function handleMemberRemovedState(event: any) {
  await prisma.member.deleteMany({
    where: {
      project_id: event.project_id,
      address: event.member_address,
    },
  });
}

async function handleTaskAddedState(event: any) {
  await prisma.task.create({
    data: {
      id: event.task_id,
      project_id: event.project_id,
      name: event.name,
      description: event.description,
      assignee: event.assignee,
      state: event.state,
      due_date: event.due_date,
    },
  });
}

async function handleDeleteTaskState(event: any) {
  await prisma.task.delete({
    where: {
      id: event.task_id,
    },
  });
}

async function handleTaskNameUpdatedState(event: any) {
  await prisma.task.update({
    where: {
      id: event.task_id,
    },
    data: {
      name: event.new_name,
    },
  });
}

async function handleTaskDescriptionUpdatedState(event: any) {
  // Note: The event doesn't contain the new description,
  // so we can only update the updated_at timestamp
  await prisma.task.update({
    where: {
      id: event.task_id,
    },
    data: {
      updated_at: new Date(),
    },
  });
}

async function handleTaskAssigneeUpdatedState(event: any) {
  await prisma.task.update({
    where: {
      id: event.task_id,
    },
    data: {
      assignee: event.new_assignee,
    },
  });
}

async function handleTaskStateUpdatedState(event: any) {
  await prisma.task.update({
    where: {
      id: event.task_id,
    },
    data: {
      state: event.new_state,
    },
  });
}

async function handleTaskDueDateUpdatedState(event: any) {
  await prisma.task.update({
    where: {
      id: event.task_id,
    },
    data: {
      due_date: event.new_due_date,
    },
  });
}

async function handleSubtaskAddedState(event: any) {
  await prisma.subtask.upsert({
    where: {
      task_id_subtask_id: {
        task_id: event.task_id,
        subtask_id: event.subtask_id,
      },
    },
    update: {
      name: event.name,
      description: event.description,
      state: event.state,
    },
    create: {
      task_id: event.task_id,
      subtask_id: event.subtask_id,
      name: event.name,
      description: event.description,
      state: event.state,
    },
  });
}

async function handleSubtaskUpdatedState(event: any) {
  // The event only contains task_id, subtask_id, and updated_by
  // We can't update the actual subtask data without more information
  // This is just to mark that an update occurred
  const subtask = await prisma.subtask.findUnique({
    where: {
      task_id_subtask_id: {
        task_id: event.task_id,
        subtask_id: event.subtask_id,
      },
    },
  });

  if (subtask) {
    // Trigger an update to refresh any computed fields if needed
    await prisma.subtask.update({
      where: {
        task_id_subtask_id: {
          task_id: event.task_id,
          subtask_id: event.subtask_id,
        },
      },
      data: {},
    });
  }
}

async function handleSubtaskDeletedState(event: any) {
  await prisma.subtask.deleteMany({
    where: {
      task_id: event.task_id,
      subtask_id: event.subtask_id,
    },
  });
}

async function handleAttachmentAddedState(event: any) {
  await prisma.attachment.upsert({
    where: {
      task_id_attachment_id: {
        task_id: event.task_id,
        attachment_id: event.attachment_id,
      },
    },
    update: {
      name: event.name,
      url: event.url,
    },
    create: {
      task_id: event.task_id,
      attachment_id: event.attachment_id,
      name: event.name,
      url: event.url,
    },
  });
}

async function handleAttachmentRemovedState(event: any) {
  await prisma.attachment.deleteMany({
    where: {
      task_id: event.task_id,
      attachment_id: event.attachment_id,
    },
  });
}

export const handleProjectEvents = async (events: SuiEvent[], type: string) => {
  const eventsByType = new Map<string, any[]>();

  for (const event of events) {
    if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
    const eventData = eventsByType.get(event.type) || [];
    eventData.push(event.parsedJson);
    eventsByType.set(event.type, eventData);
  }

  await Promise.all(
    Array.from(eventsByType.entries()).map(async ([eventType, events]) => {
      const eventName = eventType.split('::').pop() || eventType;
      switch (eventName) {
        case 'ProjectCreated':
          // Store events for audit trail
          await prisma.projectCreated.createMany({
            data: events as Prisma.ProjectCreatedCreateManyInput[],
          });
          // Update state tables
          for (const event of events) {
            await handleProjectCreatedState(event);
          }
          console.log('Created ProjectCreated events and updated state');
          break;
        case 'MemberAdded':
          await prisma.memberAdded.createMany({
            data: events as Prisma.MemberAddedCreateManyInput[],
          });
          for (const event of events) {
            await handleMemberAddedState(event);
          }
          console.log('Created MemberAdded events and updated state');
          break;
        case 'MemberRemoved':
          await prisma.memberRemoved.createMany({
            data: events as Prisma.MemberRemovedCreateManyInput[],
          });
          for (const event of events) {
            await handleMemberRemovedState(event);
          }
          console.log('Created MemberRemoved events and updated state');
          break;
        case 'TaskAdded':
          await prisma.taskAdded.createMany({
            data: events as Prisma.TaskAddedCreateManyInput[],
          });
          for (const event of events) {
            await handleTaskAddedState(event);
          }
          console.log('Created TaskAdded events and updated state');
          break;
        case 'DeleteTask':
          await prisma.deleteTask.createMany({
            data: events as Prisma.DeleteTaskCreateManyInput[],
          });
          for (const event of events) {
            await handleDeleteTaskState(event);
          }
          console.log('Created DeleteTask events and updated state');
          break;
        case 'TaskNameUpdated':
          await prisma.taskNameUpdated.createMany({
            data: events as Prisma.TaskNameUpdatedCreateManyInput[],
          });
          for (const event of events) {
            await handleTaskNameUpdatedState(event);
          }
          console.log('Created TaskNameUpdated events and updated state');
          break;
        case 'TaskDescriptionUpdated':
          await prisma.taskDescriptionUpdated.createMany({
            data: events as Prisma.TaskDescriptionUpdatedCreateManyInput[],
          });
          for (const event of events) {
            await handleTaskDescriptionUpdatedState(event);
          }
          console.log('Created TaskDescriptionUpdated events and updated state');
          break;
        case 'TaskAssigneeUpdated':
          await prisma.taskAssigneeUpdated.createMany({
            data: events as Prisma.TaskAssigneeUpdatedCreateManyInput[],
          });
          for (const event of events) {
            await handleTaskAssigneeUpdatedState(event);
          }
          console.log('Created TaskAssigneeUpdated events and updated state');
          break;
        case 'TaskStateUpdated':
          await prisma.taskStateUpdated.createMany({
            data: events as Prisma.TaskStateUpdatedCreateManyInput[],
          });
          for (const event of events) {
            await handleTaskStateUpdatedState(event);
          }
          console.log('Created TaskStateUpdated events and updated state');
          break;
        case 'TaskDueDateUpdated':
          await prisma.taskDueDateUpdated.createMany({
            data: events as Prisma.TaskDueDateUpdatedCreateManyInput[],
          });
          for (const event of events) {
            await handleTaskDueDateUpdatedState(event);
          }
          console.log('Created TaskDueDateUpdated events and updated state');
          break;
        case 'SubtaskAdded':
          await prisma.subtaskAdded.createMany({
            data: events as Prisma.SubtaskAddedCreateManyInput[],
          });
          for (const event of events) {
            await handleSubtaskAddedState(event);
          }
          console.log('Created SubtaskAdded events and updated state');
          break;
        case 'SubtaskUpdated':
          await prisma.subtaskUpdated.createMany({
            data: events as Prisma.SubtaskUpdatedCreateManyInput[],
          });
          for (const event of events) {
            await handleSubtaskUpdatedState(event);
          }
          console.log('Created SubtaskUpdated events and updated state');
          break;
        case 'SubtaskDeleted':
          await prisma.subtaskDeleted.createMany({
            data: events as Prisma.SubtaskDeletedCreateManyInput[],
          });
          for (const event of events) {
            await handleSubtaskDeletedState(event);
          }
          console.log('Created SubtaskDeleted events and updated state');
          break;
        case 'AttachmentAdded':
          await prisma.attachmentAdded.createMany({
            data: events as Prisma.AttachmentAddedCreateManyInput[],
          });
          for (const event of events) {
            await handleAttachmentAddedState(event);
          }
          console.log('Created AttachmentAdded events and updated state');
          break;
        case 'AttachmentRemoved':
          await prisma.attachmentRemoved.createMany({
            data: events as Prisma.AttachmentRemovedCreateManyInput[],
          });
          for (const event of events) {
            await handleAttachmentRemovedState(event);
          }
          console.log('Created AttachmentRemoved events and updated state');
          break;
        default:
          console.log('Unknown event type:', eventName);
      }
    }),
  );
};
