import React, { useState, useEffect } from 'react';

const API_CHAT_URL = `${import.meta.env.VITE_API_URL}/v1/chat`;
const API_CONVERSATIONS_URL = `${import.meta.env.VITE_API_URL}/v1/chat/conversations`;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // Fetch all conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(API_CONVERSATIONS_URL);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSelectChat = async (conversation) => {
    setSelectedChat(conversation);
    setConversationId(conversation.id);
    setMessages([]); // Clear current messages
    
    // Fetch and load messages for this conversation
    try {
      const response = await fetch(`${API_CHAT_URL}/conversations/${conversation.id}/messages`);
      const data = await response.json();
      
      // Convert backend message format to UI format
      const loadedMessages = data.map(msg => ({
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot'
      }));
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setConversationId(null);
    setMessages([]);
  };

  const handleDeleteChat = async (conversationId, e) => {
    e.stopPropagation(); // Prevent triggering the select chat handler
    
    try {
      await fetch(`${API_CHAT_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      
      // If the deleted conversation was selected, clear the chat
      if (selectedChat?.id === conversationId) {
        setSelectedChat(null);
        setConversationId(null);
        setMessages([]);
      }
      
      // Refresh conversations list
      fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(API_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputValue,
          conversationId: conversationId,
        }),
      });

      const data = await response.json();
      
      if (!conversationId) {
        setConversationId(data.conversationId);
        // Refresh conversations list to show the new one
        fetchConversations();
      }
      
      const botMessage = { text: data.message, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { text: 'Error: Could not connect to server', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-[900px] max-w-[90vw] h-[700px] max-h-[90vh] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Sidebar for conversations */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectChat(conv)}
              className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-gray-200 transition-colors flex items-center justify-between group ${
                selectedChat?.id === conv.id ? 'bg-gray-200' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">
                  {conv.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteChat(conv.id, e)}
                className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                aria-label="Delete conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-blue-600 text-white p-5 text-center border-b border-gray-200">
          <h1 className="text-2xl font-semibold">
            {selectedChat ? selectedChat.name : 'New Chat'}
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-gray-200 text-gray-900 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-gray-200 text-gray-900 rounded-bl-sm">
                Typing...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex p-4 border-t border-gray-200 bg-white gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-3xl text-sm outline-none focus:border-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          />
          <button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-3xl text-sm font-semibold cursor-pointer hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
