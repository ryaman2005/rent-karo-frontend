import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { MessageSquare, Loader2, ArrowUpRight } from "lucide-react";
import CinematicText from "../components/CinematicText";
import ChatModal from "../components/ChatModal";
import { useNavigate } from "react-router-dom";

function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatRental, setChatRental] = useState(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/rentals/inbox`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to load inbox", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16 px-6" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-1 animate-fade-in">
              <CinematicText text="Your " stagger={30} delay={100} />
              <span className="gradient-text">
                <CinematicText text="Inbox" stagger={30} delay={200} />
              </span>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] text-sm animate-fade-in delay-200">
              Coordinate pickups and drop-offs with your renters and owners.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={40} />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-24 animate-fade-in bg-[hsl(var(--card))]/50 rounded-2xl border border-[hsl(var(--border))]">
            <MessageSquare size={64} className="text-[hsl(var(--secondary-foreground))] mx-auto mb-5" />
            <h3 className="text-2xl font-semibold text-[hsl(var(--muted-foreground))] mb-2">No active conversations</h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-8">Chats will appear here when your rentals are confirmed.</p>
            <button
              onClick={() => navigate("/browse")}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              Browse Items <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((rental) => {
              const isOwner = rental.owner._id === currentUser._id;
              const otherUser = isOwner ? rental.user : rental.owner;

              return (
                <div
                  key={rental._id}
                  onClick={() => setChatRental(rental)}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--border))] rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-500 group animate-fade-in"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center overflow-hidden border border-[hsl(var(--border))]">
                      {otherUser.avatar ? (
                        <img src={otherUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-[hsl(var(--muted-foreground))]">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-[hsl(var(--primary))] transition-colors">
                        {otherUser.name}
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                        <span className="text-[hsl(var(--primary))]/80 font-medium">
                          {isOwner ? "Renting your" : "Owner of"}
                        </span>
                        {rental.productName}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors" style={{ backgroundColor: 'hsl(var(--primary))', color: '#fff' }}>
                      Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {chatRental && (
        <ChatModal rental={chatRental} onClose={() => setChatRental(null)} />
      )}
    </div>
  );
}

export default Inbox;
