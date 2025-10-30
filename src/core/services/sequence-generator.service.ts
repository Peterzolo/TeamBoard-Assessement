import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SequenceCounter,
  SequenceCounterDocument,
} from '../entities/sequence-counter.entity';

@Injectable()
export class SequenceGeneratorService {
  constructor(
    @InjectModel(SequenceCounter.name)
    private readonly sequenceModel: Model<SequenceCounterDocument>,
  ) {}

  /**
   * Generate a unique reference number for service requests
   * Format: SR-YYYY-NNNNNN
   */
  async generateServiceRequestReference(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const sequenceName = `service_request_${currentYear}`;

    // Get or create sequence counter for current year
    const sequence = await this.sequenceModel.findOneAndUpdate(
      { name: sequenceName },
      { $inc: { value: 1 } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    // Format the reference number
    const paddedNumber = sequence.value.toString().padStart(6, '0');
    return `SR-${currentYear}-${paddedNumber}`;
  }

  /**
   * Generate a unique reference number for any entity type
   * @param prefix - The prefix for the reference (e.g., 'SR', 'INV', 'ORD')
   * @param entityType - The type of entity (e.g., 'service_request', 'invoice')
   */
  async generateReference(prefix: string, entityType: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const sequenceName = `${entityType}_${currentYear}`;

    const sequence = await this.sequenceModel.findOneAndUpdate(
      { name: sequenceName },
      { $inc: { value: 1 } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    const paddedNumber = sequence.value.toString().padStart(6, '0');
    return `${prefix}-${currentYear}-${paddedNumber}`;
  }

  /**
   * Get the next sequence number without incrementing
   * Useful for previewing what the next number will be
   */
  async getNextSequenceNumber(entityType: string): Promise<number> {
    const currentYear = new Date().getFullYear();
    const sequenceName = `${entityType}_${currentYear}`;

    const sequence = await this.sequenceModel.findOne({ name: sequenceName });
    return sequence ? sequence.value + 1 : 1;
  }

  /**
   * Reset sequence counter for a specific year
   * Useful for testing or administrative purposes
   */
  async resetSequence(entityType: string, year?: number): Promise<void> {
    const targetYear = year || new Date().getFullYear();
    const sequenceName = `${entityType}_${targetYear}`;

    await this.sequenceModel.findOneAndUpdate(
      { name: sequenceName },
      { value: 0 },
      { upsert: true },
    );
  }

  /**
   * Get statistics about sequence usage
   */
  async getSequenceStats(): Promise<{
    currentYear: number;
    serviceRequestCount: number;
    totalSequences: number;
  }> {
    const currentYear = new Date().getFullYear();
    const serviceRequestSequence = await this.sequenceModel.findOne({
      name: `service_request_${currentYear}`,
    });

    const totalSequences = await this.sequenceModel.countDocuments();

    return {
      currentYear,
      serviceRequestCount: serviceRequestSequence?.value || 0,
      totalSequences,
    };
  }
}









