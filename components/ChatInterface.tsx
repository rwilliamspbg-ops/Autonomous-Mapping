
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAnalyst } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QUICK_PROMPTS = [
  "Health pilot privacy",
  "Human rights reporting",
  "Climate sensor data",
  "Demo economics"
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello. I am your Impact Analyst. Ask me about privacy-preserving health pilots, human-rights reporting, climate resilience deployments, or the demo economics.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const [chatCopied, setChatCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [lastAnnouncedMsg, setLastAnnouncedMsg] = useState<string | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const confirmTimerRef = useRef<number | null>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const hasOverflow = scrollHeight > clientHeight + 10;
    const isAtBottom = !hasOverflow || (scrollHeight - scrollTop - clientHeight < 60);
    setIsScrolledUp(!isAtBottom);
  };

  useEffect(() => {
    if (!isScrolledUp) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledUp]);

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
      const textResponse = response || "I'm sorry, I couldn't process that request.";
      const aiMsg: ChatMessage = { role: 'assistant', content: textResponse, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      setLastAnnouncedMsg(`New message from Impact Analyst: ${textResponse}`);
    } catch (error) {
      console.error(error);
      const errorText = "Connection to intelligence servers lost. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorText, timestamp: Date.now() }]);
      setLastAnnouncedMsg(`New message from Impact Analyst: ${errorText}`);
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

  const handleCopyChatTranscript = () => {
    const transcript = messages.map(msg => {
      const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sender = msg.role === 'user' ? 'User' : 'Impact Analyst';
      return `[${formattedTime}] ${sender}: ${msg.content}`;
    }).join('\n');

    navigator.clipboard.writeText(transcript);
    setChatCopied(true);
    setLastAnnouncedMsg('Chat transcript copied to clipboard.');
    setTimeout(() => setChatCopied(false), 2000);
  };

  const handleClearChat = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = window.setTimeout(() => {
        setConfirmClear(false);
      }, 4000);
    } else {
      setMessages([
        { role: 'assistant', content: "Hello. I am your Impact Analyst. Ask me about privacy-preserving health pilots, human-rights reporting, climate resilience deployments, or the demo economics.", timestamp: Date.now() }
      ]);
      setLastAnnouncedMsg('Chat history cleared.');
      setConfirmClear(false);
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
      }
    };
  }, []);

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
                <>
                  <button
                    onClick={handleCopyChatTranscript}
                    aria-label="Copy Chat transcript to clipboard"
                    title="Copy Chat transcript"
                    className="px-2 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold mono text-[9px] uppercase tracking-wider rounded-md border border-blue-500/20 shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all active:scale-95 shrink-0"
                  >
                    {chatCopied ? 'Copied! ✓' : 'Copy Chat'}
                  </button>
                  <button
                    onClick={handleClearChat}
                  aria-label={confirmClear ? "Confirm clear chat messages" : "Clear chat messages"}
                  title={confirmClear ? "Confirm clear?" : "Clear chat messages"}
                  className={`transition-all duration-300 rounded-md outline-none px-2 py-1 text-xs font-bold mono uppercase flex items-center gap-1 active:scale-95 ${
                    confirmClear
                      ? 'bg-rose-500/20 border border-rose-500 text-rose-400 hover:bg-rose-500 hover:text-white'
                      : 'text-slate-400 hover:text-rose-400 focus-visible:ring-2 focus-visible:ring-rose-500'
                  }`}
                >
                  {confirmClear ? (
                    <>
                      <span>Sure?</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close Chat (Escape)"
                title="Close (Escape)"
                className="text-slate-400 hover:text-white transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md outline-none p-1 relative group"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <kbd aria-hidden="true" className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-slate-900 border border-blue-500/30 rounded text-[7px] text-blue-400 font-mono tracking-tighter uppercase select-none">Esc</kbd>
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            tabIndex={0}
            aria-label="Chat messages list"
            className="flex-1 overflow-y-auto p-4 space-y-4 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none relative"
          >
            <div role="status" aria-live="polite" className="sr-only">
              {copiedMsgIdx !== null ? "Message copied to clipboard." : chatCopied ? "Chat transcript copied to clipboard." : lastAnnouncedMsg || ""}
            </div>
            {messages.map((msg, idx) => {
              const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group relative`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm relative pr-10 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    <div className="break-words">{msg.content}</div>

                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-700/30 text-[9px] mono font-medium text-slate-400">
                      <span className="opacity-80">{formattedTime}</span>
                    </div>

                    {idx === 0 && messages.length === 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-slate-700/50">
                        <div className="w-full text-[9px] mono uppercase text-slate-400 font-bold tracking-wider mb-0.5">Suggested Prompts:</div>
                        {QUICK_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => {
                              setInput(prompt);
                              inputRef.current?.focus();
                            }}
                            aria-label={`Use prompt: ${prompt}`}
                            title={`Use prompt: ${prompt}`}
                            className="text-[10px] mono bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg border border-blue-500/20 transition-all font-semibold active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        setCopiedMsgIdx(idx);
                        setTimeout(() => setCopiedMsgIdx(null), 2000);
                      }}
                      aria-label={`Copy message from ${msg.role === 'user' ? 'you' : 'analyst'}: "${msg.content.substring(0, 30)}..." to clipboard`}
                      title="Copy message"
                      className={`absolute right-2 top-2 p-1 rounded-md transition-all active:scale-90 text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:opacity-100 outline-none opacity-0 group-hover:opacity-100 ${
                        copiedMsgIdx === idx ? 'opacity-100 text-emerald-400 hover:text-emerald-300' : ''
                      }`}
                    >
                      {copiedMsgIdx === idx ? (
                        <span className="text-[10px] font-bold mono">Copied! ✓</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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

          {isScrolledUp && (
            <button
              onClick={() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setIsScrolledUp(false);
              }}
              aria-label="Scroll to bottom of chat messages"
              title="Scroll to bottom"
              className="absolute bottom-20 right-4 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl border border-blue-400/40 shadow-lg backdrop-blur-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 z-10"
            >
              <span>Scroll to bottom</span>
              <span className="text-xs" aria-hidden="true">↓</span>
            </button>
          )}

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
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-1 select-none">
                {input.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInput('');
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear text input"
                    title="Clear text"
                    className="p-0.5 text-slate-400 hover:text-white transition-all rounded focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer active:scale-90"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <span
                  id="chat-char-counter"
                  aria-live="polite"
                  className={`mono text-[9px] uppercase tracking-tighter pointer-events-none ${counterColorClass}`}
                >
                  {inputLen}/{charLimit}
                </span>
              </div>
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label={isLoading ? "Sending message..." : "Send message"}
                title={isLoading ? "Sending message..." : !input.trim() ? "Type a message to send" : "Send message"}
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
