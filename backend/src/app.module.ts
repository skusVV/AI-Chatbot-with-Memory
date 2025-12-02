import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433', 10),
      username: process.env.DB_USERNAME || 'chatbot',
      password: String(process.env.DB_PASSWORD || 'chatbot123'),
      database: process.env.DB_NAME || 'chatbot_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SharedModule,
    DatabaseModule,
    ChatModule,
  ],
})
export class AppModule {}

