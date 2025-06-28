'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

export default function AIPage() {
  const [isThinking, setIsThinking] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onResponse: () => setIsThinking(false),
    onFinish: () => setIsThinking(false),
    onError: (error) => {
      console.error('Chat error:', error)
      setIsThinking(false)
    }
  })

  const handleFormSubmit = (e: React.FormEvent) => {
    setIsThinking(true)
    handleSubmit(e)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            Water Quality AI Assistant
          </h2>
        </div>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Ask questions about Georgia's water systems, violations, counties, or get insights from our data. 
          Try asking: "What counties have the most violations?" or "Show me systems serving Atlanta"
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-md shadow-sm border border-brand-cream-200">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 space-y-4">
              <Bot className="h-12 w-12 text-primary-300 mx-auto" />
              <div>
                <p className="font-medium">Welcome! I can help you explore Georgia's water quality data.</p>
                <p className="text-sm mt-2">Try asking:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                  <button 
                    onClick={() => handleInputChange({ target: { value: "What counties have the most water violations?" } } as any)}
                    className="p-3 bg-brand-cream-50 rounded-md border border-brand-cream-200 hover:bg-brand-cream-100 text-left"
                  >
                    "What counties have the most water violations?"
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "Show me water systems in Atlanta" } } as any)}
                    className="p-3 bg-brand-cream-50 rounded-md border border-brand-cream-200 hover:bg-brand-cream-100 text-left"
                  >
                    "Show me water systems in Atlanta"
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "How many people are affected by violations?" } } as any)}
                    className="p-3 bg-brand-cream-50 rounded-md border border-brand-cream-200 hover:bg-brand-cream-100 text-left"
                  >
                    "How many people are affected by violations?"
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "What are the safest counties for water?" } } as any)}
                    className="p-3 bg-brand-cream-50 rounded-md border border-brand-cream-200 hover:bg-brand-cream-100 text-left"
                  >
                    "What are the safest counties for water?"
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white ml-3'
                      : 'bg-brand-cream-200 text-primary-600 mr-3'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-brand-cream-50 text-gray-900 border border-brand-cream-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(isLoading || isThinking) && (
            <div className="flex justify-start">
              <div className="flex flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-brand-cream-200 text-primary-600 mr-3">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-3 rounded-lg bg-brand-cream-50 border border-brand-cream-200">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                    <span className="text-sm text-gray-600">Analyzing water data...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-brand-cream-200 p-4">
          <form onSubmit={handleFormSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about water quality, violations, counties, or specific systems..."
              className="flex-1 px-4 py-3 border border-brand-cream-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading || isThinking}
            />
            <button
              type="submit"
              disabled={isLoading || isThinking || !input.trim()}
              className="px-4 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          This AI assistant analyzes real Georgia water quality data. 
          For emergencies, call{' '}
          <a href="tel:404-656-4713" className="text-primary-600 hover:text-primary-700 font-medium">
            (404) 656-4713
          </a>
        </p>
      </div>
    </div>
  )
}