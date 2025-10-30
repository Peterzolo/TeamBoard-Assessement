import { TaskDocument } from '../entities/task.entity';

export function toTaskResponse(doc: TaskDocument) {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: (doc as any).description,
    project: (doc as any).project?.toString?.(),
    createdBy: (doc as any).createdBy?.toString?.(),
    assignees: Array.isArray((doc as any).assignees)
      ? (doc as any).assignees.map((a: any) => a.toString?.() ?? a)
      : [],
    status: (doc as any).status,
    priority: (doc as any).priority,
    dueDate: (doc as any).dueDate,
    isActive: Boolean((doc as any).isActive),
    createdAt: (doc as any).createdAt,
    updatedAt: (doc as any).updatedAt,
  };
}

export function toTaskResponseList(docs: TaskDocument[]) {
  return docs.map(toTaskResponse);
}

export function toPaginatedTaskResponse(result: any) {
  return {
    data: toTaskResponseList(result.data),
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  };
}
