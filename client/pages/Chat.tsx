import { Link, useNavigate } from "react-router-dom";
import { useChat } from "../contexts/ChatContext";

export default function Chat() {
  const { chatMessages } = useChat();
  const navigate = useNavigate();

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

    if (diffWeeks > 0) return `${diffWeeks}w`;
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return "Just now";
  };

  const getAvatarImage = (sender: string) => {
    const avatars = {
      "Coach Holly Peristiani":
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=60&h=60&fit=crop&crop=face",
      "Ben Stuart":
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      "Dan Smith":
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
      UCLMC:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop",
      "Maggie Chang":
        "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=60&h=60&fit=crop&crop=face",
    };
    return (
      avatars[sender as keyof typeof avatars] ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    );
  };

  const getUserId = (sender: string) => {
    const userIds = {
      "Coach Holly Peristiani": "coach-holly",
      "Ben Stuart": "ben-stuart",
      "Dan Smith": "dan-smith",
      UCLMC: "uclmc",
      "Maggie Chang": "maggie-chang",
    };
    return userIds[sender as keyof typeof userIds] || "unknown";
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
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

      {/* Main Content */}
      <div className="px-6 pb-20">
        {/* Title */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            Chat!
          </h1>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
          <FilterChip label="All" active />
          <FilterChip label="Primary" />
          <FilterChip label="General" />
          <FilterChip label="Requests" />
          <FilterChip label="Clubs" />
        </div>

        {/* Chat Messages */}
        <div className="space-y-4">
          {chatMessages.map((message) => (
            <ChatItem
              key={message.id}
              message={message}
              getTimeAgo={getTimeAgo}
              getAvatarImage={getAvatarImage}
              onClick={() => {
                const userId = getUserId(message.sender);
                navigate(`/chat/${userId}`);
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function FilterChip({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`px-5 py-2 rounded-lg border border-black font-bold text-sm font-cabin whitespace-nowrap ${
        active
          ? "bg-explore-green text-white"
          : "bg-explore-gray text-explore-green"
      }`}
    >
      {label}
    </div>
  );
}

function ChatItem({
  message,
  getTimeAgo,
  getAvatarImage,
  onClick,
}: {
  message: any;
  getTimeAgo: (timestamp: Date) => string;
  getAvatarImage: (sender: string) => string;
  onClick: () => void;
}) {
  const hasNotification = message.sender === "UCLMC";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2 relative hover:bg-gray-50 rounded-lg px-2 transition-colors text-left"
    >
      {/* Avatar */}
      <img
        src={getAvatarImage(message.sender)}
        alt={message.sender}
        className="w-15 h-15 rounded-full border border-black object-cover flex-shrink-0"
      />

      {/* Message Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3
              className={`font-cabin text-lg ${message.type === "join_request" ? "font-bold text-explore-green" : "font-normal text-black"}`}
            >
              {message.sender}
            </h3>
            <p className="text-gray-500 text-lg font-cabin">
              {message.type === "join_request" && message.activityTitle
                ? `You: ${message.content}`
                : message.content}{" "}
              · {getTimeAgo(message.timestamp)}
            </p>
          </div>

          {/* Notification dot */}
          {hasNotification && (
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
          )}
        </div>
      </div>
    </button>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200 max-w-md mx-auto">
      {/* Home Icon */}
      <Link to="/explore" className="p-2">
        <svg className="w-8 h-7" viewBox="0 0 35 31" fill="none">
          <path
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 19.5132 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </Link>

      {/* Clock Icon */}
      <div className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="15" cy="15" r="12.5" />
          <path d="M15 7.5V15L20 17.5" />
        </svg>
      </div>

      {/* Plus Icon */}
      <Link to="/create" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6.25V23.75M6.25 15H23.75" />
        </svg>
      </Link>

      {/* Chat Icon - Active */}
      <div className="p-2">
        <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
          <path
            d="M2.5 27.5V5C2.5 4.3125 2.74479 3.72396 3.23438 3.23438C3.72396 2.74479 4.3125 2.5 5 2.5H25C25.6875 2.5 26.276 2.74479 26.7656 3.23438C27.2552 3.72396 27.5 4.3125 27.5 5V20C27.5 20.6875 27.2552 21.276 26.7656 21.7656C26.276 22.2552 25.6875 22.5 25 22.5H7.5L2.5 27.5Z"
            fill="#1D1B20"
          />
        </svg>
      </div>

      {/* Profile Icon */}
      <div className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </div>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
