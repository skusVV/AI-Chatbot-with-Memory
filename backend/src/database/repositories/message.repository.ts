import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageRole } from '../enums/message-role.enum';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,
  ) {}

  async create(role: MessageRole, content: string): Promise<Message> {
    const message = this.repository.create({ role, content });
    return await this.repository.save(message);
  }

  async getLastMessages(count: number): Promise<Message[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      take: count,
    });
  }

  async findAll(): Promise<Message[]> {
    return await this.repository.find({
      order: { createdAt: 'ASC' },
    });
  }
}

