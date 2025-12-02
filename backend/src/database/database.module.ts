import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { MessageRepository } from './repositories/message.repository';
import { ConversationRepository } from './repositories/conversation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation])],
  providers: [MessageRepository, ConversationRepository],
  exports: [MessageRepository, ConversationRepository, TypeOrmModule],
})
export class DatabaseModule {}

