'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

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
                    onClick={() => handleInputChange({ target: { value: "What counties have the most violations?" } } as any)}
                    className="p-3 bg-brand-cream-50 rounded-md border border-brand-cream-200 hover:bg-brand-cream-100 text-left"
                  >
                    "What counties have the most violations?"
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "Show me water systems in Atlanta" } } as any)}
                    className="p-3 bg-brand-cream-50 rounded-md border border-brand-cream-200 hover:bg-brand-cream-100 text-left"
                  >
                    "Show me water systems in Atlanta"
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "Give me Georgia water quality stats" } } as any)}
                    className="p-3 bg-brand-cream-50 rounded-md border border-brand-cream-200 hover:bg-brand-cream-100 text-left"
                  >
                    "Give me Georgia water quality stats"
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "Which systems have high risk violations?" } } as any)}
                    className="p-3 bg-brand-cream-50 rounded-md border border-brand-cream-200 hover:bg-brand-cream-100 text-left"
                  >
                    "Which systems have high risk violations?"
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
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  ) : (
                    <div className="text-sm prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-li:text-gray-900">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-900">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-900">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 text-gray-900">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-gray-900">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-gray-900">{children}</ol>,
                          li: ({ children }) => <li className="mb-1 text-gray-900">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-900">{children}</em>,
                          code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">{children}</code>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
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