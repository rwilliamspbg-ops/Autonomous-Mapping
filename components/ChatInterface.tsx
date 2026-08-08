
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAnalyst } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello. I am your Impact Analyst. Ask me about privacy-preserving health pilots, human-rights reporting, climate resilience deployments, or the demo economics.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (controlledOpen === undefined) return;
    setInternalOpen(controlledOpen);
  }, [controlledOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
        lastActiveElementRef.current = null;
      }
      return;
    }
    lastActiveElementRef.current = document.activeElement as HTMLElement;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const setOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAnalyst(messages.map(m => ({ role: m.role, content: m.content })), input);
      const aiMsg: ChatMessage = { role: 'assistant', content: response || "I'm sorry, I couldn't process that request.", timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection to intelligence servers lost. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const charLimit = 200;
  const inputLen = input.length;
  const counterColorClass =
    inputLen > 180 ? 'text-rose-500 font-bold' :
    inputLen > 150 ? 'text-amber-500' :
    'text-slate-500';

  const handleClearChat = () => {
    setMessages([
      { role: 'assistant', content: "Hello. I am your Impact Analyst. Ask me about privacy-preserving health pilots, human-rights reporting, climate resilience deployments, or the demo economics.", timestamp: Date.now() }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 md:w-96 h-[500px] bg-slate-900/95 backdrop-blur-lg rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h3 className="font-semibold text-white">Impact Chat</h3>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  aria-label="Clear chat messages"
                  title="Clear chat messages"
                  className="text-slate-400 hover:text-rose-400 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 rounded-md outline-none p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close Chat (Escape)"
                title="Close (Escape)"
                className="text-slate-400 hover:text-white transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md outline-none p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div
            tabIndex={0}
            aria-label="Chat messages list"
            className="flex-1 overflow-y-auto p-4 space-y-4 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                className="flex justify-start"
              >
                <span className="sr-only">Analyzing data points...</span>
                <div className="bg-slate-800 text-slate-300 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 border border-slate-700/50 shadow-inner">
                  <span className="font-mono text-[10px] text-blue-400 uppercase font-black tracking-widest animate-pulse">ANALYZING</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800">
            <label htmlFor="chat-input" className="sr-only">
              Ask about a pilot or funding story
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                maxLength={charLimit}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a pilot or funding story..."
                aria-describedby="chat-char-counter"
                className="w-full bg-slate-800 border-none rounded-xl py-2 pl-4 pr-24 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center pr-2 pointer-events-none select-none">
                <span
                  id="chat-char-counter"
                  aria-live="polite"
                  className={`mono text-[9px] uppercase tracking-tighter ${counterColorClass}`}
                >
                  {inputLen}/{charLimit}
                </span>
              </div>
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label={isLoading ? "Sending message..." : "Send message"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md outline-none flex items-center justify-center w-6 h-6"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          aria-label="Open Impact Chat (Press c or C)"
          title="Open Impact Chat (C)"
          className="relative bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
        >
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <kbd aria-hidden="true" className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-slate-900 border border-blue-500/40 rounded text-[8px] text-blue-400 font-mono tracking-tighter shadow-lg">C</kbd>
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
