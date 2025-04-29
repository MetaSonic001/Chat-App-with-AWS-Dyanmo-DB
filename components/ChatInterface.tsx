import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Settings,
  User,
  ChevronDown,
  Loader,
  AlertCircle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ChatMessage {
  messageId: string;
  conversationId: string;
  sender: string;
  message: string;
  timestamp: number;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sender, setSender] = useState("User");
  const [conversationId, setConversationId] = useState("default-conversation");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function fetchMessages() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load messages. Please check your DynamoDB connection.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setError(null);

    const tempMessage: ChatMessage = {
      messageId: uuidv4(),
      conversationId,
      sender,
      message: newMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const res = await fetch("/api/messages/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          sender,
          message: newMessage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send message");
      }

      fetchMessages(); // Refresh with real messages from backend
    } catch (err) {
      console.error("Send error:", err);
      setError("Failed to send message. Please check your DynamoDB connection.");
      setMessages(prev => prev.filter(msg => msg.messageId !== tempMessage.messageId));
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-blue-500" />
          <h1 className="text-xl font-semibold">Chat App</h1>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Settings size={20} className="text-gray-600" />
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white p-4 border-b border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conversation ID</label>
            <input
              type="text"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <div className="flex gap-2 items-center">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronDown size={16} />
              Close Settings
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="bg-red-50 p-4 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader size={24} className="text-blue-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle size={48} className="mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isUser = msg.sender === sender;
              const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;

              return (
                <div key={msg.messageId} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} max-w-lg gap-2`}>
                    {showAvatar && (
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold
                        ${isUser ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}
                      >
                        {msg.sender.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        isUser
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      <p className="mb-1">{msg.message}</p>
                      <p className={`text-xs ${isUser ? "text-blue-100" : "text-gray-500"}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full text-white transition-colors ${
              newMessage.trim() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
