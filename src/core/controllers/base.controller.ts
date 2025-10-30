import { Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';

import { Document, UpdateQuery } from 'mongoose';
import { BaseService } from '../services/base.service';

export abstract class BaseController<D extends Document, E> {
  constructor(private readonly service: BaseService<D, E>) {}

  @Post()
  async create(@Body() data: Partial<E>) {
    return this.service.create(data);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateQuery<D>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
