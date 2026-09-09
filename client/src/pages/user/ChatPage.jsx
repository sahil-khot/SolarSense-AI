import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  User as UserIcon,
  AlertCircle,
  Bot,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [assessmentContext, setAssessmentContext] = useState(null);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const welcomeMessage = {
    role: 'assistant',
    content: `Hello! I'm your SolarSense assistant.\n\nI can help explain your electricity bill, why a specific solar capacity was recommended, how much money you can save, and which solar installers suit your property.\n\nAsk me any question below or click one of the suggestions to get started!`,
    timestamp: new Date(),
  };

  useEffect(() => {
    const loadHistoryAndStatus = async () => {
      try {
        const historyRes = await chatService.getHistory();
        if (historyRes?.success) {
          if (historyRes.messages && historyRes.messages.length > 0) {
            setMessages(historyRes.messages);
          } else {
            setMessages([welcomeMessage]);
          }
          if (historyRes.assessmentContext) {
            setAssessmentContext(historyRes.assessmentContext);
          }
        } else {
          setMessages([welcomeMessage]);
        }
      } catch (err) {
        console.error('Failed to load chat data:', err);
        setMessages([welcomeMessage]);
      } finally {
        setInitialLoading(false);
      }
    };

    loadHistoryAndStatus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setError('');
    setLoading(true);

    try {
      const res = await chatService.sendMessage(text);
      if (res.success) {
        const aiMessage = {
          role: 'assistant',
          content: res.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        if (res.assessmentContext) {
          setAssessmentContext(res.assessmentContext);
        }
      } else {
        setError(res.message || 'The assistant is temporarily unavailable. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'The assistant is temporarily unavailable. Please try again.'
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Clear your conversation history?')) {
      try {
        await chatService.clearHistory();
        setMessages([
          {
            role: 'assistant',
            content: `Conversation cleared. What can I help you with regarding solar energy or your bill?`,
            timestamp: new Date(),
          },
        ]);
      } catch (err) {
        alert(err.message || 'Failed to clear chat history.');
      }
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-light-text">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-[15px] leading-relaxed text-light-text">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-[17px] font-bold text-light-text pt-2 pb-1 border-b border-light-border">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-[18px] font-bold text-light-text pt-2 pb-1 border-b border-light-border">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <div key={idx} className="p-3 my-2 rounded-r-lg bg-brand/5 border-l-4 border-brand text-light-text font-medium text-[14.5px]">
                {line.replace('> ', '')}
              </div>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const clean = line.substring(2);
            return (
              <li key={idx} className="ml-5 list-disc text-light-text">
                {formatBoldText(clean)}
              </li>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const clean = line.replace(/^\d+\.\s/, '');
            return (
              <div key={idx} className="ml-3 pl-1 flex gap-2 text-light-text">
                <span className="font-bold text-brand shrink-0">{line.match(/^\d+\./)[0]}</span>
                <span>{formatBoldText(clean)}</span>
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-light-text">
              {formatBoldText(line)}
            </p>
          );
        })}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Starting assistant..." />
      </div>
    );
  }

  const promptSuggestions = [
    'Why was this solar system recommended?',
    'How much can I save?',
    'Do I need a battery?',
    'Explain my electricity bill',
    'Which solar company should I choose?',
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* Top Header */}
      <div className="lc-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold text-light-text tracking-tight">
                SolarSense Assistant
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-light-muted mt-0.5">
              Ask any question about your solar recommendation, bills, or savings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {assessmentContext && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-btn bg-brand/5 border border-brand/20 text-xs font-medium text-brand">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>
                Based on your {assessmentContext.capacity} kW system
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleClearChat}
            className="lc-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Clear Chat Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="flex-1 lc-card p-5 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-light-text text-white'
                    : 'bg-brand text-white'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-xs ${
                  isUser
                    ? 'bg-brand text-white font-medium text-[15px]'
                    : 'bg-light-surface border border-light-border'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  renderMessageContent(msg.content)
                )}
                <span
                  className={`block text-[11px] mt-2 ${
                    isUser ? 'text-white/80 text-right' : 'text-light-muted'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-light-surface border border-light-border rounded-2xl p-4 text-sm text-light-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-btn bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 shrink-0">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-light-border text-light-text hover:border-brand hover:text-brand transition-colors cursor-pointer shadow-xs"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Footer */}
      <div className="lc-card p-2.5 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your question about solar panels, costs, savings, or your bill..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-light-surface border border-light-border rounded-btn text-base text-light-text placeholder:text-light-muted focus:outline-none focus:border-brand focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="lc-btn-brand py-2.5 px-5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
