import { NextRequest, NextResponse } from 'next/server';
import { getIndexerPool } from '@/lib/db/indexer';

export const revalidate = 0;

interface DbProject {
  id: string;
  name: string;
  description: string;
  manager: string;
  created_at: string;
  updated_at: string;
}

interface DbProjectCreated {
  project_id: string;
  manager_cap_id: string;
}

interface DbMember {
  id: string;
  project_id: string;
  address: string;
  display_name: string;
  joined_at: string;
}

interface DbTask {
  id: string;
  project_id: string;
  name: string;
  description: string;
  assignee: string;
  state: number;
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface DbSubtask {
  id: string;
  task_id: string;
  subtask_id: string;
  name: string;
  description: string;
  state: number;
}

interface DbAttachment {
  id: string;
  task_id: string;
  attachment_id: string;
  name: string;
  url: string;
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }

  const useMock = process.env.USE_INDEXER_MOCK === 'true';
  const addr = address.trim();
  const addrLower = addr.toLowerCase();

  if (useMock) {
    const { mockProjects } = await import('@/lib/mock/data');
    const filtered = mockProjects.filter(
      (p) =>
        p.manager.toLowerCase() === addrLower ||
        p.members.some((m: any) => m.address.toLowerCase() === addrLower),
    );
    return NextResponse.json(filtered);
  }

  try {
    const pool = getIndexerPool();

    const projectsRes = await pool.query<DbProject>(
      `
        SELECT DISTINCT p.id, p.name, p.description, p.manager, p.created_at, p.updated_at
        FROM "Project" p
        LEFT JOIN "Member" m ON m.project_id = p.id
        WHERE LOWER(TRIM(p.manager)) = $1 OR LOWER(TRIM(m.address)) = $1
        ORDER BY p.created_at DESC
      `,
      [addrLower],
    );

    if (projectsRes.rowCount === 0) {
      return NextResponse.json([]);
    }

    const projectIds = projectsRes.rows.map((p) => p.id);

    const membersRes = await pool.query<DbMember>(
      `
        SELECT id, project_id, address, display_name, joined_at
        FROM "Member"
        WHERE project_id = ANY($1::text[])
      `,
      [projectIds],
    );

    const tasksRes = await pool.query<DbTask>(
      `
        SELECT id, project_id, name, description, assignee, state, due_date, created_at, updated_at
        FROM "Task"
        WHERE project_id = ANY($1::text[])
        ORDER BY created_at DESC
      `,
      [projectIds],
    );

    const taskIds = tasksRes.rows.map((t) => t.id);

    const subtasksRes = taskIds.length
      ? await pool.query<DbSubtask>(
          `
            SELECT id, task_id, subtask_id, name, description, state
            FROM "Subtask"
            WHERE task_id = ANY($1::text[])
          `,
          [taskIds],
        )
      : { rows: [] as DbSubtask[] };

    const attachmentsRes = taskIds.length
      ? await pool.query<DbAttachment>(
          `
            SELECT id, task_id, attachment_id, name, url
            FROM "Attachment"
            WHERE task_id = ANY($1::text[])
          `,
          [taskIds],
        )
      : { rows: [] as DbAttachment[] };

    const capsRes = await pool.query<DbProjectCreated>(
      `
        SELECT id as project_id, manager_cap_id
        FROM "ProjectCreated"
        WHERE id = ANY($1::text[])
      `,
      [projectIds],
    );

    const capsByProject = new Map<string, string>();
    capsRes.rows.forEach((row) => capsByProject.set(row.project_id, row.manager_cap_id));

    const membersByProject = new Map<string, DbMember[]>();
    membersRes.rows.forEach((m) => {
      const list = membersByProject.get(m.project_id) || [];
      list.push(m);
      membersByProject.set(m.project_id, list);
    });

    const subtasksByTask = new Map<string, DbSubtask[]>();
    subtasksRes.rows.forEach((s) => {
      const list = subtasksByTask.get(s.task_id) || [];
      list.push(s);
      subtasksByTask.set(s.task_id, list);
    });

    const attachmentsByTask = new Map<string, DbAttachment[]>();
    attachmentsRes.rows.forEach((a) => {
      const list = attachmentsByTask.get(a.task_id) || [];
      list.push(a);
      attachmentsByTask.set(a.task_id, list);
    });

    const tasksByProject = new Map<string, any[]>();
    tasksRes.rows.forEach((t) => {
      const task = {
        id: t.id,
        projectId: t.project_id,
        name: t.name,
        description: t.description,
        assignee: t.assignee,
        state: t.state,
        dueDate: t.due_date,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        subtasks: subtasksByTask.get(t.id) || [],
        attachments: attachmentsByTask.get(t.id) || [],
      };
      const list = tasksByProject.get(t.project_id) || [];
      list.push(task);
      tasksByProject.set(t.project_id, list);
    });

    const payload = projectsRes.rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      manager: p.manager,
      managerCapId: capsByProject.get(p.id) || undefined,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      members: (membersByProject.get(p.id) || []).map((m) => ({
        id: m.id,
        projectId: m.project_id,
        address: m.address,
        displayName: m.display_name,
        joinedAt: m.joined_at,
      })),
      tasks: tasksByProject.get(p.id) || [],
    }));

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('Failed to fetch projects from indexer', err);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
