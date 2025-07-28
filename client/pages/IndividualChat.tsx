import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  Check,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isFromMe: boolean;
  status: "sending" | "sent" | "delivered" | "read";
}

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

const users: Record<string, User> = {
  "coach-holly": {
    id: "coach-holly",
    name: "Coach Holly Peristiani",
    avatar:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=60&h=60&fit=crop&crop=face",
    isOnline: true,
  },
  "ben-stuart": {
    id: "ben-stuart",
    name: "Ben Stuart",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    isOnline: false,
    lastSeen: "2h ago",
  },
  "dan-smith": {
    id: "dan-smith",
    name: "Dan Smith",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    isOnline: false,
    lastSeen: "1h ago",
  },
  "maggie-chang": {
    id: "maggie-chang",
    name: "Maggie Chang",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=60&h=60&fit=crop&crop=face",
    isOnline: false,
    lastSeen: "3d ago",
  },
};

const chatData: Record<string, Message[]> = {
  "coach-holly": [
    {
      id: "1",
      content: "Ben, want to head to the climbing gym tonight",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isFromMe: false,
      status: "read",
    },
    {
      id: "2",
      content: "Sounds great!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isFromMe: true,
      status: "read",
    },
    {
      id: "3",
      content: "I'll meet you at 8 PM!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isFromMe: false,
      status: "read",
    },
    {
      id: "4",
      content: "Looking forward! 😎",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isFromMe: true,
      status: "read",
    },
  ],
  "ben-stuart": [
    {
      id: "1",
      content: "Hey! Are you free for a cycling session this weekend?",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isFromMe: true,
      status: "delivered",
    },
    {
      id: "2",
      content: "Sure! What time works for you?",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isFromMe: false,
      status: "read",
    },
    {
      id: "3",
      content: "How about 7 AM? I know a great route through the park.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isFromMe: true,
      status: "sent",
    },
  ],
  "dan-smith": [
    {
      id: "1",
      content: "Thanks for the climbing tips yesterday!",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isFromMe: false,
      status: "read",
    },
    {
      id: "2",
      content: "Anytime! You're improving so fast 💪",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isFromMe: true,
      status: "read",
    },
    {
      id: "3",
      content: "Let's practice lead climbing next time?",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isFromMe: false,
      status: "read",
    },
  ],
  "maggie-chang": [
    {
      id: "1",
      content:
        "Hi! I saw you're organizing a hiking trip next month. Can you send me the details?",
      timestamp: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000),
      isFromMe: false,
      status: "read",
    },
    {
      id: "2",
      content: "Of course! I'll send you the full itinerary later today.",
      timestamp: new Date(
        Date.now() - 12 * 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
      ),
      isFromMe: true,
      status: "delivered",
    },
  ],
};

export default function IndividualChat() {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>(
    chatData[userId || ""] || [],
  );
  const [newMessage, setNewMessage] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const user = users[userId || ""];

  if (!user) {
    return <div>User not found</div>;
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      isFromMe: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "sent" } : msg,
        ),
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "delivered" } : msg,
        ),
      );
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const renderMessageStatus = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return (
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        );
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "delivered":
        return (
          <div className="flex">
            <Check className="w-4 h-4 text-gray-400 -mr-1" />
            <Check className="w-4 h-4 text-gray-400" />
          </div>
        );
      case "read":
        return (
          <div className="flex">
            <Check className="w-4 h-4 text-blue-500 -mr-1" />
            <Check className="w-4 h-4 text-blue-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative flex flex-col">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm"></div>
            ))}
          </div>
          <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
            <rect
              x="1"
              y="3"
              width="22"
              height="10"
              rx="2"
              stroke="black"
              strokeWidth="1"
              fill="none"
            />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <Link to="/chat" className="p-1">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>

        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 flex-1"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full border border-black object-cover"
          />
          <div className="text-left">
            <h2 className="font-bold text-lg text-black font-cabin">
              {user.name}
            </h2>
            <p className="text-sm text-gray-600 font-cabin">
              {user.isOnline ? "Active now" : `Last seen ${user.lastSeen}`}
            </p>
          </div>
        </button>

        <div className="flex gap-2">
          <button className="p-2">
            <Phone className="w-5 h-5 text-explore-green" />
          </button>
          <button className="p-2">
            <Video className="w-5 h-5 text-explore-green" />
          </button>
          <button className="p-2">
            <MoreVertical className="w-5 h-5 text-explore-green" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isFromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isFromMe
                  ? "bg-explore-green text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <p className="font-cabin">{message.content}</p>
              <div
                className={`flex items-center gap-1 mt-1 ${
                  message.isFromMe ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`text-xs font-cabin ${
                    message.isFromMe ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>
                {message.isFromMe && (
                  <div className="ml-1">
                    {renderMessageStatus(message.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <button className="p-2">
            <Smile className="w-6 h-6 text-gray-400" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full border border-gray-300 rounded-full py-3 px-4 pr-12 font-cabin focus:outline-none focus:border-explore-green"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-explore-green rounded-full"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile user={user} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}

function UserProfile({ user, onClose }: { user: User; onClose: () => void }) {
  const profileData = {
    "coach-holly": {
      bio: "Professional climbing coach with 10+ years experience. Love helping people reach new heights!",
      activities: ["Climbing", "Bouldering"],
      joinedActivities: 45,
      preferredTerrain: ["Indoor", "Sport", "Trad"],
      gear: ["Lead belay ✓", "Multipitch ✓", "Rescue", "First aid"],
      clubs: ["Westway", "London Climbers"],
      location: "London, UK",
      tags: ["Coach", "Expert"],
    },
    "ben-stuart": {
      bio: "Weekend warrior. Always up for some mountain adventures",
      activities: ["Climbing", "Cycling"],
      joinedActivities: 18,
      preferredTerrain: ["Indoor", "Sport"],
      gear: [
        "Lead belay ✓",
        "Multipitch ✓",
        "Trad rack",
        "Rope",
        "Quickdraws",
        "Helmet",
      ],
      clubs: ["Westway", "CUMC"],
      location: "Notting Hill, London",
      tags: ["Sport climber", "Road cyclist"],
    },
    "dan-smith": {
      bio: "New to climbing but passionate about learning. Always looking for climbing partners!",
      activities: ["Climbing", "Hiking"],
      joinedActivities: 12,
      preferredTerrain: ["Indoor", "Beginner"],
      gear: ["Basic gear", "Harness", "Shoes"],
      clubs: ["Westway"],
      location: "East London",
      tags: ["Beginner", "Enthusiastic"],
    },
    "maggie-chang": {
      bio: "Love outdoor adventures and meeting new people. Organizing group trips regularly!",
      activities: ["Hiking", "Climbing", "Trail Running"],
      joinedActivities: 28,
      preferredTerrain: ["Outdoor", "Multi-pitch"],
      gear: ["Complete kit", "Navigation", "First aid"],
      clubs: ["London Hikers", "Outdoor Club"],
      location: "Central London",
      tags: ["Organizer", "Outdoor enthusiast"],
    },
  };

  const profile = profileData[user.id as keyof typeof profileData];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 text-center border-b">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full border-2 border-black mx-auto mb-4 object-cover"
          />
          <h2 className="text-xl font-bold text-black font-cabin">
            {user.name}
          </h2>
          <div className="flex justify-center gap-2 mt-3">
            <button className="px-4 py-1 border border-explore-green text-explore-green rounded text-sm font-cabin">
              Share
            </button>
            <button className="px-4 py-1 border border-explore-green text-explore-green rounded text-sm font-cabin">
              Edit
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {profile.tags.map((tag, index) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded text-sm font-bold font-cabin border border-black ${
                  index === 0
                    ? "bg-explore-green text-white"
                    : "bg-gray-100 text-explore-green"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Bio */}
          <p className="text-explore-green font-cabin text-lg">{profile.bio}</p>

          {/* Activity Chips */}
          <div className="flex gap-2">
            {profile.activities.map((activity, index) => (
              <span
                key={activity}
                className={`px-3 py-1 rounded text-sm font-bold font-cabin border border-black ${
                  index === 0
                    ? "bg-explore-green text-white"
                    : "bg-gray-100 text-explore-green"
                }`}
              >
                {activity}
              </span>
            ))}
          </div>

          {/* Activities Joined */}
          <div>
            <h3 className="text-xl font-medium text-black font-cabin mb-2">
              Activities joined
            </h3>
            <p className="text-lg text-explore-green font-cabin">
              {profile.joinedActivities} activities
            </p>
            <p className="text-sm text-black font-cabin mt-1">
              Preferred terrain:
            </p>
            <ul className="list-disc list-inside text-sm text-black font-cabin ml-2">
              {profile.preferredTerrain.map((terrain) => (
                <li key={terrain}>{terrain}</li>
              ))}
            </ul>
          </div>

          {/* Gear & Skills */}
          <div>
            <h3 className="text-xl font-medium text-black font-cabin mb-2">
              Gear & skills
            </h3>
            <div className="space-y-1">
              {profile.gear.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-cabin"
                >
                  <span className="text-explore-green">🛠</span>
                  <span className="text-black">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clubs */}
          <div>
            <h3 className="text-xl font-medium text-black font-cabin mb-2">
              Clubs
            </h3>
            <div className="flex gap-2">
              {profile.clubs.map((club) => (
                <span
                  key={club}
                  className="px-3 py-1 bg-gray-100 text-explore-green rounded text-sm font-cabin border border-black"
                >
                  🏔️ {club}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xl font-medium text-black font-cabin mb-2">
              Location
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-explore-green">📍</span>
              <span className="text-black font-cabin">{profile.location}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-explore-green text-white rounded-lg font-cabin font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
