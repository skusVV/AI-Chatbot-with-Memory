import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getAllConversations() {
    return await this.chatService.getAllConversations();
  }

  @Get('conversations/:id/messages')
  async getMessagesByConversationId(@Param('id') id: string) {
    return await this.chatService.getMessagesByConversationId(id);
  }

  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string) {
    await this.chatService.deleteConversation(id);
    return { message: 'Conversation deleted successfully' };
  }

  @Post()
  async handleChat(@Body() body: { message: string; conversationId?: string }) {
    const response = await this.chatService.sendMessage(body.message, body.conversationId);
    return { message: response.message, conversationId: response.conversationId };
  }
}

