import { BaseRepository } from '../repositories/base.repository';
import { Document, UpdateQuery, FilterQuery } from 'mongoose';

export abstract class BaseService<D extends Document, E> {
  constructor(private readonly repository: BaseRepository<D, E>) {}

  async create(data: Partial<E>): Promise<D> {
    return this.repository.create(data);
  }

  async findById(id: string): Promise<D | null> {
    return this.repository.findById(id);
  }

  async findOne(filter: FilterQuery<D>): Promise<D | null> {
    return this.repository.findOne(filter);
  }

  async findAll(filter?: FilterQuery<D>): Promise<D[]> {
    return this.repository.findAll(filter);
  }

  async update(id: string, data: UpdateQuery<D>): Promise<D | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<D | null> {
    return this.repository.delete(id);
  }
}
