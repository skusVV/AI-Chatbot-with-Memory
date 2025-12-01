import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageRepository } from './repositories/message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageRepository],
  exports: [MessageRepository, TypeOrmModule],
})
export class DatabaseModule {}

