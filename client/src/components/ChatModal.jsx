import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, Send, Loader2 } from "lucide-react";
import { getSocket } from "../services/socketService";
import { API_URL } from "../config";

export default function ChatModal({ rental, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const socket = getSocket();

  // The 'other' user to message depends on if it's populated (Inbox) or a raw string (MyRentals)
  const ownerId = typeof rental.owner === "object" ? rental.owner?._id : rental.owner;
  const userId = typeof rental.user === "object" ? rental.user?._id : rental.user;

  const isOwner = currentUser._id === ownerId;
  const receiverId = isOwner ? userId : ownerId;

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/chat/${rental._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // 2. Join Socket.io room for this rental
    socket.emit("join_chat", rental._id);

    // 3. Listen for incoming messages
    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [rental._id, socket]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/chat`,
        { rentalId: rental._id, text: text.trim(), receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const savedMessage = res.data;
      // We don't manually add to state because we will receive it via socket 'receive_message' soon.
      // Wait, we DO want to emit it via socket!
      socket.emit("send_message", savedMessage);
      
      setText("");
    } catch (err) {
      console.error("Failed to send", err);
      alert("Error sending message: " + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--card))]">
          <div>
            <h3 className="text-lg font-bold text-white">
              Chat about <span className="text-[hsl(var(--primary))]">{rental.productName}</span>
            </h3>
            <p className="text-xs text-gray-400">
              {isOwner ? "Chatting with Renter" : "Chatting with Owner"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Messages Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
              <p>No messages yet.</p>
              <p className="text-sm">Say hi to coordinate your rental!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender._id === currentUser._id;
              return (
                <div key={msg._id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] text-gray-500 mb-1 px-1">
                    {msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                    isMe 
                    ? "bg-[hsl(var(--primary))] text-white rounded-tr-sm" 
                    : "bg-[hsl(var(--muted))] text-gray-200 border border-[hsl(var(--border))] rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[hsl(var(--muted))] border-none text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))] text-sm"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="bg-[hsl(var(--primary))] text-white p-2.5 rounded-xl hover:bg-[hsl(var(--primary)/0.08)]0 transition disabled:opacity-50 flex items-center justify-center"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
