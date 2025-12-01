import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChat(@Body() body: any) {
    const response = await this.chatService.sendMessage(body.message);

    return { title: response };
  }
}

