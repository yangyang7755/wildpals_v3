import { useState } from "react";
import { X } from "lucide-react";
import { useChat } from "../contexts/ChatContext";

interface RequestJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  organizerName: string;
  organizerImage: string;
}

export default function RequestJoinModal({
  isOpen,
  onClose,
  activityTitle,
  organizerName,
  organizerImage,
}: RequestJoinModalProps) {
  const [requestMessage, setRequestMessage] = useState("");
  const { addJoinRequest } = useChat();

  if (!isOpen) return null;

  const handleSendRequest = () => {
    addJoinRequest({
      activityTitle: activityTitle,
      activityOrganizer: organizerName,
      requesterName: "You",
      message: requestMessage || "Hi! I'd like to join this activity.",
    });

    setRequestMessage("");
    onClose();
    alert("Request sent! You can check your message in the Chat page.");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-explore-green font-cabin">
            Quick Request
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Activity info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={organizerImage}
              alt={organizerName}
              className="w-10 h-10 rounded-full border border-black object-cover"
            />
            <div>
              <div className="font-bold text-sm text-explore-green font-cabin line-clamp-1">
                {activityTitle}
              </div>
              <div className="text-xs text-gray-600 font-cabin">
                By {organizerName}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 font-cabin mb-3">
            Send a message to {organizerName} (optional):
          </p>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Hi! I'd like to join this activity..."
            className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-20 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSendRequest}
            className="flex-1 py-3 bg-explore-green text-white rounded-lg font-cabin font-medium"
          >
            Send Request
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={onClose}
            className="text-sm text-explore-green underline font-cabin"
          >
            View full details instead
          </button>
        </div>
      </div>
    </div>
  );
}
