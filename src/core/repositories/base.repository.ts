import {
  Document,
  FilterQuery,
  Model,
  UpdateQuery,
  PipelineStage,
  SortOrder,
  PopulateOptions,
  QueryOptions,
  ClientSession,
  Connection,
  AggregateOptions,
  Query,
} from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, SortOrder>;
  select?: string | Record<string, number>;
  populate?: PopulateOptions | PopulateOptions[];
  lean?: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FindOptions extends PaginationOptions {
  filter?: FilterQuery<Document>;
  projection?: Record<string, number>;
  options?: QueryOptions;
  session?: ClientSession;
}

export interface UpdateOptions {
  new?: boolean;
  runValidators?: boolean;
  upsert?: boolean;
  setDefaultsOnInsert?: boolean;
  session?: ClientSession;
}

export interface DeleteOptions {
  session?: ClientSession;
}

export abstract class BaseRepository<D extends Document, E> {
  constructor(
    private readonly model: Model<D>,
    private readonly connection?: Connection,
  ) {}

  // Basic CRUD Operations
  async create(data: Partial<E>, session?: ClientSession): Promise<D> {
    if (session) {
      const result = await this.model.create([data], { session });
      return result[0];
    }
    const result = await this.model.create([data]);
    return result[0];
  }

  createMany(data: Partial<E>[], session?: ClientSession): Promise<D[]> {
    return this.model.create(data, { session });
  }

  findById(
    id: string,
    options?: {
      select?: string | Record<string, number>;
      populate?: PopulateOptions | PopulateOptions[];
      lean?: boolean;
      session?: ClientSession;
    },
  ): Promise<D | null> {
    let query: any = this.model.findById(id);

    if (options?.select) {
      query = query.select(options.select);
    }

    if (options?.populate) {
      query = query.populate(options.populate);
    }

    if (options?.lean) {
      query = query.lean();
    }

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  findOne(
    filter: FilterQuery<D>,
    options?: {
      select?: string | Record<string, number>;
      populate?: PopulateOptions | PopulateOptions[];
      lean?: boolean;
      session?: ClientSession;
    },
  ): Promise<D | null> {
    let query: any = this.model.findOne(filter);

    if (options?.select) {
      query = query.select(options.select);
    }

    if (options?.populate) {
      query = query.populate(options.populate);
    }

    if (options?.lean) {
      query = query.lean();
    }

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  findAll(
    filter?: FilterQuery<D>,
    options?: {
      select?: string | Record<string, number>;
      populate?: PopulateOptions | PopulateOptions[];
      lean?: boolean;
      session?: ClientSession;
      sort?: Record<string, SortOrder>;
    },
  ): Promise<D[]> {
    let query: any = this.model.find(filter || {});

    if (options?.select) {
      query = query.select(options.select);
    }

    if (options?.populate) {
      query = query.populate(options.populate);
    }

    if (options?.lean) {
      query = query.lean();
    }

    if (options?.session) {
      query = query.session(options.session);
    }

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    return query.exec();
  }

  findByIdAndUpdate(
    id: string,
    update: UpdateQuery<D>,
    options?: UpdateOptions,
  ): Promise<D | null> {
    const updateOptions = {
      new: true,
      runValidators: true,
      ...options,
    };

    let query: any = this.model.findByIdAndUpdate(id, update, updateOptions);

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  findOneAndUpdate(
    filter: FilterQuery<D>,
    update: UpdateQuery<D>,
    options?: UpdateOptions,
  ): Promise<D | null> {
    const updateOptions = {
      new: true,
      runValidators: true,
      ...options,
    };

    let query: any = this.model.findOneAndUpdate(filter, update, updateOptions);

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  updateMany(
    filter: FilterQuery<D>,
    update: UpdateQuery<D>,
    options?: UpdateOptions,
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    const updateOptions = {
      runValidators: true,
      ...options,
    };

    let query: any = this.model.updateMany(filter, update, updateOptions);

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  findByIdAndDelete(id: string, options?: DeleteOptions): Promise<D | null> {
    let query: any = this.model.findByIdAndDelete(id);

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  findOneAndDelete(
    filter: FilterQuery<D>,
    options?: DeleteOptions,
  ): Promise<D | null> {
    let query: any = this.model.findOneAndDelete(filter);

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  deleteMany(
    filter: FilterQuery<D>,
    options?: DeleteOptions,
  ): Promise<{ deletedCount: number }> {
    let query: any = this.model.deleteMany(filter);

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  // Pagination
  async findWithPagination(
    options: PaginationOptions & { filter?: FilterQuery<D> },
  ): Promise<PaginationResult<D>> {
    const {
      filter = {},
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select,
      populate,
      lean = false,
    } = options;

    const skip = (page - 1) * limit;

    let query: any = this.model.find(filter);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    const [data, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  // Advanced Find Operations
  async findWithOptions(options: FindOptions): Promise<D[]> {
    const {
      filter = {},
      projection,
      sort = { createdAt: -1 },
      select,
      populate,
      lean = false,
      session,
    } = options;

    let query: any = await this.model.find(filter);

    if (projection) {
      query = query.select(projection);
    }

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    if (session) {
      query = query.session(session);
    }

    return query.sort(sort).exec();
  }

  // Aggregation
  async aggregate(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
  ): Promise<any[]> {
    let aggregation = this.model.aggregate(pipeline);

    if (options?.session) {
      aggregation = aggregation.session(options.session);
    }

    return aggregation.exec();
  }

  // Count Operations
  count(filter?: FilterQuery<D>, session?: ClientSession): Promise<number> {
    let query: any = this.model.countDocuments(filter || {});

    if (session) {
      query = query.session(session);
    }

    return query.exec();
  }

  countDocuments(
    filter?: FilterQuery<D>,
    session?: ClientSession,
  ): Promise<number> {
    let query: any = this.model.countDocuments(filter || {});

    if (session) {
      query = query.session(session);
    }

    return query.exec();
  }

  // Exists Operations
  async exists(
    filter: FilterQuery<D>,
    session?: ClientSession,
  ): Promise<boolean> {
    let query: any = this.model.exists(filter);

    if (session) {
      query = query.session(session);
    }

    const result = await query.exec();
    return !!result;
  }

  // Distinct Operations
  distinct(
    field: string,
    filter?: FilterQuery<D>,
    session?: ClientSession,
  ): Promise<any[]> {
    let query: any = this.model.distinct(field, filter);

    if (session) {
      query = query.session(session);
    }

    return query.exec();
  }

  // Bulk Operations
  bulkWrite(operations: any[], session?: ClientSession): Promise<any> {
    const bulkWriteOptions = session ? { session } : {};
    return this.model.bulkWrite(operations, bulkWriteOptions);
  }

  // Transaction Support
  async startSession(): Promise<ClientSession> {
    if (!this.connection) {
      throw new Error('Database connection not available for sessions');
    }
    return this.connection.startSession();
  }

  async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    if (!this.connection) {
      throw new Error('Database connection not available for transactions');
    }

    const session = await this.connection.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  // Utility Methods
  findByIds(
    ids: string[],
    options?: {
      select?: string | Record<string, number>;
      populate?: PopulateOptions | PopulateOptions[];
      lean?: boolean;
      session?: ClientSession;
    },
  ): Promise<D[]> {
    let query: any = this.model.find({ _id: { $in: ids } });

    if (options?.select) {
      query = query.select(options.select);
    }

    if (options?.populate) {
      query = query.populate(options.populate);
    }

    if (options?.lean) {
      query = query.lean();
    }

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  async findRandom(
    filter?: FilterQuery<D>,
    limit: number = 1,
    options?: {
      select?: string | Record<string, number>;
      populate?: PopulateOptions | PopulateOptions[];
      lean?: boolean;
      session?: ClientSession;
    },
  ): Promise<D[]> {
    let query: any = this.model.aggregate([
      { $match: filter || {} },
      { $sample: { size: limit } },
    ]);

    if (options?.session) {
      query = query.session(options.session);
    }

    const results = await query.exec();

    if (options?.populate) {
      const populatedResults = await this.model.populate(
        results,
        options.populate,
      );
      return populatedResults as unknown as D[];
    }

    return results;
  }

  findWithTextSearch(
    searchText: string,
    fields: string[],
    options?: {
      filter?: FilterQuery<D>;
      select?: string | Record<string, number>;
      populate?: PopulateOptions | PopulateOptions[];
      lean?: boolean;
      session?: ClientSession;
    },
  ): Promise<D[]> {
    const textSearchFilter = {
      $text: { $search: searchText },
    };

    const combinedFilter = options?.filter
      ? { $and: [options.filter, textSearchFilter] }
      : textSearchFilter;

    let query: any = this.model.find(combinedFilter);

    if (options?.select) {
      query = query.select(options.select);
    }

    if (options?.populate) {
      query = query.populate(options.populate);
    }

    if (options?.lean) {
      query = query.lean();
    }

    if (options?.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  // Legacy methods for backward compatibility
  update(id: string, data: UpdateQuery<D>): Promise<D | null> {
    return this.findByIdAndUpdate(id, data);
  }

  delete(id: string): Promise<D | null> {
    return this.findByIdAndDelete(id);
  }
}
