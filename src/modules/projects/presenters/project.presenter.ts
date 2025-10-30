import { ProjectDocument } from '../entities/project.entity';

export interface ProjectResponse {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  team?: string;
  projectManager?: string;
  memberCount: number;
  taskCount: number;
}

export function toProjectResponse(doc: ProjectDocument): ProjectResponse {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    description: (doc as any).description,
    isActive: Boolean((doc as any).isActive),
    createdAt: (doc as any).createdAt,
    updatedAt: (doc as any).updatedAt,
    createdBy: (doc as any).createdBy?.toString?.() ?? (doc as any).createdBy,
    team: (doc as any).team?.toString?.(),
    projectManager: (doc as any).projectManager?.toString?.(),
    memberCount: Array.isArray((doc as any).members)
      ? (doc as any).members.length
      : 0,
    taskCount: Array.isArray((doc as any).tasks)
      ? (doc as any).tasks.length
      : 0,
  };
}

export function toProjectResponseList(
  docs: ProjectDocument[],
): ProjectResponse[] {
  return docs.map(toProjectResponse);
}

export function toPaginatedProjectResponse(result: {
  data: ProjectDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}) {
  return {
    data: toProjectResponseList(result.data),
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
