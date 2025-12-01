import React, { useState } from 'react';

const API_CHAT_URL = `${import.meta.env.VITE_API_URL}/v1/chat`;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        body: JSON.stringify({ message: inputValue }),
      });

      const data = await response.json();
      
      const botMessage = { text: data.title, sender: 'bot' };
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
    <div className="w-[600px] max-w-[90vw] h-[700px] max-h-[90vh] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      <div className="bg-blue-600 text-white p-5 text-center border-b border-gray-200">
        <h1 className="text-2xl font-semibold">Simple Chatbot</h1>
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
  );
}

export default App;
