import { TeamDocument } from '../entities/team.entity';

export interface TeamResponse {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  teamLeader?: string;
  memberCount: number;
  taskCount: number;
}

export function toTeamResponse(doc: TeamDocument): TeamResponse {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    isActive: Boolean((doc as any).isActive),
    createdAt: (doc as any).createdAt,
    updatedAt: (doc as any).updatedAt,
    createdBy: (doc as any).createdBy?.toString?.() ?? (doc as any).createdBy,
    teamLeader: (doc as any).teamLeader?.toString?.(),
    memberCount: Array.isArray((doc as any).members)
      ? (doc as any).members.length
      : 0,
    taskCount: Array.isArray((doc as any).tasks)
      ? (doc as any).tasks.length
      : 0,
  };
}

export function toTeamResponseList(docs: TeamDocument[]): TeamResponse[] {
  return docs.map(toTeamResponse);
}

export function toPaginatedTeamResponse(result: {
  data: TeamDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}) {
  return {
    data: toTeamResponseList(result.data),
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
