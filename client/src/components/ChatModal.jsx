import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, Send, Loader2 } from "lucide-react";
import { getSocket } from "../services/socketService";
import { API_URL } from "../config";

export default function ChatModal({ rental, targetUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const socket = getSocket();

  // If it's a rental chat, we derive the 'other' user. 
  // If it's a direct user chat (Support), we use 'targetUser'.
  const rentalId = rental?._id || null;
  const ownerId = rental ? (typeof rental.owner === "object" ? rental.owner?._id : rental.owner) : null;
  const userId = rental ? (typeof rental.user === "object" ? rental.user?._id : rental.user) : null;

  const isOwner = currentUser._id === ownerId;
  const receiverId = rental ? (isOwner ? userId : ownerId) : targetUser?._id;

  // Stable room ID for direct messages: sort IDs to ensure both parties join the same room
  const directRoomId = !rental ? [currentUser._id, targetUser._id].sort().join("_") : null;
  const roomId = rentalId || directRoomId;

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const url = rental 
          ? `${API_URL}/api/chat/${rentalId}`
          : `${API_URL}/api/chat/direct/${targetUser._id}`;
        
        const res = await axios.get(url, {
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

    // 2. Join Socket.io room
    socket.emit("join_chat", roomId);

    // 3. Listen for incoming messages
    const handleReceiveMessage = (newMessage) => {
      // Check if message belongs to this view (rental match index OR DM match)
      if (rental && newMessage.rentalId === rentalId) {
        setMessages((prev) => [...prev, newMessage]);
      } else if (!rental && !newMessage.rentalId) {
        // For DMs, verify sender/receiver match this thread
        const senderMatch = [newMessage.sender._id, newMessage.sender].includes(currentUser._id) || [newMessage.sender._id, newMessage.sender].includes(targetUser._id);
        const receiverMatch = [newMessage.receiver._id, newMessage.receiver].includes(currentUser._id) || [newMessage.receiver._id, newMessage.receiver].includes(targetUser._id);
        if (senderMatch && receiverMatch) {
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [roomId, socket, rentalId, targetUser?._id]);

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
        { rentalId, text: text.trim(), receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const savedMessage = res.data;
      // Emit with the correct roomId so the other party receives it
      socket.emit("send_message", { ...savedMessage, rentalId: roomId });
      
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
            <h3 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              {rental ? (
                <span className="text-[hsl(var(--primary))]">{rental.productName}</span>
              ) : (
                <span>Support Thread: <span className="text-[hsl(var(--primary))]">{targetUser.name}</span></span>
              )}
            </h3>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {rental 
                ? (isOwner ? "Chatting with Renter" : "Chatting with Owner")
                : "Administrative Direct Message"
              }
            </p>
          </div>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition rounded-xl p-1 hover:bg-[hsl(var(--muted))]">
            <X size={20} />
          </button>
        </div>

        {/* Messages Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: 'hsl(var(--muted))' }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <p className="font-medium">No messages yet.</p>
              <p className="text-sm">Say hi to coordinate your rental!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              // Handle both populated ({_id, name}) and unpopulated (string) sender
              const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
              const senderName = typeof msg.sender === "object" ? msg.sender.name : "";
              const isMe = senderId === currentUser._id;
              return (
                <div key={msg._id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] mb-1 px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                    isMe 
                    ? "bg-[hsl(var(--primary))] text-white rounded-tr-sm" 
                    : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-tl-sm"
                  }`} style={isMe ? {} : { color: 'hsl(var(--foreground))' }}>
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
