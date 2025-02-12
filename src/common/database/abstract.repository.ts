import { FilterQuery, Model, PipelineStage, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { Logger } from '@nestjs/common';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (await createdDocument.save()).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery).lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery:', filterQuery);
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery:', filterQuery);
    }

    return document;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery).lean<TDocument[]>(true);
  }

  async findOneAndDelete(filterQuery: FilterQuery<TDocument>): Promise<TDocument | null> {
    const document = this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery:', filterQuery);
    }

    return document;
  }

  async aggregate<T = TDocument>(pipeline: PipelineStage[]): Promise<T[]> {
    try {
      const documents = await this.model.aggregate<T>(pipeline);

      if (!documents || documents.length === 0) {
        this.logger.warn('No documents found for aggregate pipeline');
      }

      return documents;
    } catch (error) {
      this.logger.error('Aggregate operation failed:', error);
      throw error;
    }
  }
}
