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

  async create(role: MessageRole, content: string, conversationId: string): Promise<Message> {
    const message = this.repository.create({ role, content, conversationId });
    return await this.repository.save(message);
  }

  async getLastMessagesByConversation(conversationId: string, count: number): Promise<Message[]> {
    return await this.repository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: count,
    });
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return await this.repository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async findAll(): Promise<Message[]> {
    return await this.repository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async deleteByConversationId(conversationId: string): Promise<void> {
    await this.repository.delete({ conversationId });
  }
}

