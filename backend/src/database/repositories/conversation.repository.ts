import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class ConversationRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly repository: Repository<Conversation>,
  ) {}

  async create(name: string, summary?: string): Promise<Conversation> {
    const conversation = this.repository.create({ name, summary });
    return await this.repository.save(conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Conversation[]> {
    return await this.repository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async updateSummary(id: string, summary: string): Promise<void> {
    await this.repository.update(id, { summary });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

