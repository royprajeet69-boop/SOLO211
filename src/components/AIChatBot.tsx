import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, User, Loader2, Trash2, MessageSquare, ArrowRight } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions
  const quickQuestions = [
    "What services do you offer?",
    "Show me pricing plans",
    "Are your supplies safe?",
    "How can I book a session?",
  ];

  // Load chat history from localStorage if any
  useEffect(() => {
    const saved = localStorage.getItem("purespace_ai_chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
      }
    } else {
      // initial greeting
      const welcome: Message = {
        role: "assistant",
        content: "Hello! I'm **CleanBot**, your personal cleaning concierge. 🌟\n\nI can answer questions about our standard residential, business commercial, or deep cleaning services, as well as pricing and eco-friendly standards. What can I clean for you today?"
      };
      setMessages([welcome]);
    }
  }, []);

  // Save to localStorage when changed
  const saveChatHistory = (history: Message[]) => {
    setMessages(history);
    localStorage.setItem("purespace_ai_chat", JSON.stringify(history));
  };

  // Scroll to bottom helper
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    const updatedHistory: Message[] = [
      ...messages,
      { role: "user", content: textToSend }
    ];
    saveChatHistory(updatedHistory);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          history: updatedHistory
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = data.text;
      
      saveChatHistory([
        ...updatedHistory,
        { role: "assistant", content: assistantReply }
      ]);
    } catch (err: any) {
      console.error("AI chat error:", err);
      setErrorMsg(err.message || "Failed to get response from CleanBot. Is the API key configured?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const welcome: Message = {
      role: "assistant",
      content: "Hello! History cleared. Let's start fresh! Standard or deep clean queries, I'm ready. How can I assist you today?"
    };
    saveChatHistory([welcome]);
    setErrorMsg(null);
  };

  // Safe and clean parser for asterisks and list points returning inline react elements
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line.trim();

      // Check for bullet point
      const isBullet = content.startsWith("- ") || content.startsWith("* ") || content.startsWith("• ");
      if (isBullet) {
        content = content.substring(2).trim();
      }

      // Check for numbered list
      const numMatch = content.match(/^(\d+)\.\s(.*)/);
      const isNumbered = !!numMatch;
      let bulletNum = "";
      if (isNumbered && numMatch) {
        bulletNum = numMatch[1];
        content = numMatch[2].trim();
      }

      // Parse bold **text**
      const parts = content.split(/\*\*([^*]+)\*\*/g);
      const parsedLine = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return (
            <strong key={partIdx} className="font-semibold text-gray-900">
              {part}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-gray-750 my-1 leading-relaxed">
            {parsedLine}
          </li>
        );
      }

      if (isNumbered) {
        return (
          <div key={idx} className="flex gap-2 text-xs text-gray-755 my-1.5 leading-relaxed pl-1">
            <span className="font-mono font-bold text-[#4ECDC4]">{bulletNum}.</span>
            <div className="flex-1">{parsedLine}</div>
          </div>
        );
      }

      if (content === "") {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs text-gray-750 my-1 leading-relaxed">
          {parsedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* Closed floating trigger state on bottom left */}
      <div className="fixed bottom-6 left-6 z-30 flex flex-col items-start gap-2.5 pointer-events-none md:bottom-8 md:left-8">
        {!isOpen && (
          <>
            {/* Tooltip badge */}
            <div className="bg-slate-900 border border-teal-500/20 px-3.5 py-1.5 rounded-2xl shadow-xl text-[10px] font-mono text-[#4ECDC4] flex items-center gap-1.5 pointer-events-auto transition-all hover:scale-105 active:scale-95">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ECDC4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4ECDC4]"></span>
              </span>
              <span>AI CleanBot Active</span>
            </div>

            <button
              id="ai-chatbot-trigger"
              onClick={() => setIsOpen(true)}
              className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center shadow-2xl border border-gray-800/50 hover:border-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-[#1A1A2E] hover:scale-110 active:scale-95 transition-all text-sm group"
              title="Open AI Cleaning Assistant"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-12" />
            </button>
          </>
        )}
      </div>

      {/* Slide-out Panel on the Left */}
      <div
        id="ai-chatbot-drawer"
        className={`fixed inset-y-0 left-0 w-full sm:w-[380px] bg-white text-gray-900 shadow-2xl z-40 border-r border-gray-100/90 flex flex-col transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header bar */}
        <div className="p-4 bg-[#1A1A2E] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-[#4ECDC4] border border-teal-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm tracking-tight text-white leading-tight">
                PureSpace AI Assist
              </h3>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-gray-400 font-mono">CleanBot Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Clear entire chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Panel space */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-thin">
          {messages.map((msg, index) => {
            const isAI = msg.role === "assistant";
            return (
              <div
                key={index}
                className={`flex gap-2.5 ${isAI ? "justify-start" : "justify-end"}`}
              >
                {isAI && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#4ECDC4]">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl p-3 shadow-xs ${
                    isAI
                      ? "bg-white text-gray-800 border border-gray-100"
                      : "bg-[#4ECDC4] text-[#1A1A2E] font-medium"
                  }`}
                >
                  <div className="space-y-1">
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
                {!isAI && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#1A1A2E] flex items-center justify-center text-[#4ECDC4]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking animation state */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#4ECDC4]">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-white text-gray-400 border border-gray-100 rounded-2xl p-3 flex items-center gap-2 shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4ECDC4]" />
                <span className="text-[11px] font-mono tracking-wide">Polishing answer...</span>
              </div>
            </div>
          )}

          {/* Quick FAQ Suggestion Options when messages is tiny */}
          {messages.length <= 2 && !isLoading && (
            <div className="pt-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2 pl-1">
                Frequently Asked
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left bg-white hover:bg-teal-500/5 hover:border-teal-500/20 active:bg-teal-500/10 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 hover:text-[#1A1A2E] font-medium transition-all flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#4ECDC4]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 flex flex-col gap-1.5 animate-pulse">
              <p className="font-semibold">Chat Assistance Error:</p>
              <p>{errorMsg}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action input panel */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-3 border-t border-gray-150 bg-white"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder="Ask CleanBot something..."
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#4ECDC4] outline-none rounded-xl pl-3 pr-11 py-2.5 text-xs text-[#1A1A2E] placeholder-gray-400 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-1.5 w-8 h-8 rounded-lg bg-[#1A1A2E] hover:bg-[#4ECDC4] hover:text-[#1A1A2E] text-[#4ECDC4] flex items-center justify-center transition-all disabled:bg-gray-100 disabled:text-gray-300"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[9px] text-gray-400 text-center mt-2">
            Powered by Gemini AI · Eco-Centric Clean Care
          </p>
        </form>
      </div>

      {/* Dim overlay background when chat drawer is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-30 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
