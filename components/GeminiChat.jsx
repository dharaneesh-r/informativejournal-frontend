'use client';

import { useState, useRef, useEffect } from 'react';

const GeminiChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your news assistant. Ask me about current events in technology, sports, politics, or any other topic.", isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Your specific Gemini API endpoint
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB1gjUzTWABW_XYyne_G_VXbBIakNPxoB4";

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        GEMINI_API_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful news assistant. Provide accurate, concise information about current events regarding: "${input}". 
                If the topic is too broad, ask the user to be more specific. 
                Format your response with clear paragraphs and bullet points when listing multiple items. 
                Include important dates, locations, and sources when relevant.`
              }]
            }]
          }),
        }
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const reply = data.candidates[0]?.content.parts[0]?.text || 
                   "Sorry, I couldn't process that request. Please try again.";
      
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting to the news service. Please try again later.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    // Auto-submit if mobile device for better UX
    if (window.innerWidth < 768) {
      const mockEvent = { preventDefault: () => {} };
      handleSubmit(mockEvent);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">News Assistant</h2>
        <p className="text-sm opacity-80">Powered by Gemini AI</p>
      </div>
      
      {/* Quick prompts */}
      <div className="p-3 bg-gray-50 flex flex-wrap gap-2 border-b">
        <button 
          onClick={() => handleQuickPrompt("Top tech news today")}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition"
        >
          Tech News
        </button>
        <button 
          onClick={() => handleQuickPrompt("Latest sports updates")}
          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition"
        >
          Sports
        </button>
        <button 
          onClick={() => handleQuickPrompt("Current political headlines")}
          className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition"
        >
          Politics
        </button>
        <button 
          onClick={() => handleQuickPrompt("World news summary")}
          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition"
        >
          World News
        </button>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`mb-4 ${msg.isUser ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block px-4 py-2 rounded-lg max-w-xs md:max-w-md lg:max-w-lg ${msg.isUser 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any news topic..."
            className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeminiChat;