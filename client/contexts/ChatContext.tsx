import { createContext, useContext, useState, ReactNode } from "react";

export interface JoinRequest {
  id: string;
  activityTitle: string;
  activityOrganizer: string;
  requesterName: string;
  message: string;
  timestamp: Date;
  status: "pending" | "accepted" | "declined";
}

export interface ChatMessage {
  id: string;
  type: "join_request" | "general";
  sender: string;
  content: string;
  timestamp: Date;
  activityTitle?: string;
  activityOrganizer?: string;
}

interface ChatContextType {
  joinRequests: JoinRequest[];
  chatMessages: ChatMessage[];
  addJoinRequest: (
    request: Omit<JoinRequest, "id" | "timestamp" | "status">,
  ) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    // Default messages for demonstration
    {
      id: "1",
      type: "general",
      sender: "Coach Holly Peristiani",
      content: "Sent 2h ago",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "general",
      sender: "Ben Stuart",
      content: "Liked a message . 2h",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "general",
      sender: "Dan Smith",
      content: "Reacted 😢 to your message . 3h",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: "4",
      type: "general",
      sender: "UCLMC",
      content: "lewis_tay: Let's do it",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "5",
      type: "general",
      sender: "Maggie Chang",
      content: "Can you send me the address ... 12w",
      timestamp: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const addJoinRequest = (
    requestData: Omit<JoinRequest, "id" | "timestamp" | "status">,
  ) => {
    const newRequest: JoinRequest = {
      ...requestData,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: "pending",
    };
    setJoinRequests((prev) => [newRequest, ...prev]);

    // Check if there's already a chat with this organizer
    const existingChatIndex = chatMessages.findIndex(
      (msg) =>
        msg.sender === requestData.activityOrganizer &&
        msg.type === "join_request",
    );

    if (existingChatIndex !== -1) {
      // Update existing chat message with the new request
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[existingChatIndex] = {
          ...updated[existingChatIndex],
          content:
            requestData.message ||
            `Requested to join "${requestData.activityTitle}"`,
          timestamp: new Date(),
          activityTitle: requestData.activityTitle,
        };
        return updated;
      });
    } else {
      // Create new chat message for this organizer
      const chatMessage: ChatMessage = {
        id: Date.now().toString() + "_chat",
        type: "join_request",
        sender: requestData.activityOrganizer,
        content:
          requestData.message ||
          `You requested to join "${requestData.activityTitle}"`,
        timestamp: new Date(),
        activityTitle: requestData.activityTitle,
        activityOrganizer: requestData.activityOrganizer,
      };
      setChatMessages((prev) => [chatMessage, ...prev]);
    }
  };

  const addChatMessage = (
    messageData: Omit<ChatMessage, "id" | "timestamp">,
  ) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setChatMessages((prev) => [newMessage, ...prev]);
  };

  return (
    <ChatContext.Provider
      value={{ joinRequests, chatMessages, addJoinRequest, addChatMessage }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
