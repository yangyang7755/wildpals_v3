import { useState } from "react";
import { X, MapPin, Navigation, Users, Calendar } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  type: string;
  location: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: string;
  organizer: string;
  coordinates?: { lat: number; lng: number };
}

interface MapViewProps {
  activities: Activity[];
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
}

export default function MapView({
  activities,
  onClose,
  onActivitySelect,
}: MapViewProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  // Real London coordinates for activities if not provided
  const londonLocations = [
    { lat: 51.5074, lng: -0.1278 }, // Central London
    { lat: 51.5155, lng: -0.0922 }, // Canary Wharf
    { lat: 51.4994, lng: -0.1248 }, // South Bank
    { lat: 51.5183, lng: -0.1755 }, // Paddington
    { lat: 51.4893, lng: -0.1441 }, // Battersea
    { lat: 51.5074, lng: -0.0896 }, // Tower Bridge
    { lat: 51.5287, lng: -0.1339 }, // Regent's Park
    { lat: 51.5033, lng: -0.1726 }, // Hyde Park
  ];

  const activitiesWithCoords = activities.map((activity, index) => ({
    ...activity,
    coordinates:
      activity.coordinates || londonLocations[index % londonLocations.length],
  }));

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "cycling":
        return "bg-blue-500";
      case "climbing":
        return "bg-red-500";
      case "running":
        return "bg-green-500";
      case "swimming":
        return "bg-cyan-500";
      case "hiking":
        return "bg-orange-500";
      case "yoga":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "cycling":
        return "🚴";
      case "climbing":
        return "🧗";
      case "running":
        return "🏃";
      case "swimming":
        return "🏊";
      case "hiking":
        return "🥾";
      case "yoga":
        return "🧘";
      default:
        return "🏃";
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-explore-green font-cabin">
            Activities Map
          </h2>
          <div className="bg-explore-green text-white px-2 py-1 rounded-full text-sm font-cabin">
            {activitiesWithCoords.length} activities
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
        {/* Real Map Background */}
        <div
          className="w-full h-full relative"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='streets' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Crect width='40' height='40' fill='%23f0f4f0'/%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23ddd' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23streets)'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        >
          {/* London Geography Features */}
          <div className="absolute inset-0">
            {/* Thames River */}
            <div
              className="absolute bg-blue-300 rounded-full"
              style={{
                left: "10%",
                top: "45%",
                width: "80%",
                height: "8px",
                transform: "rotate(-5deg)",
                background:
                  "linear-gradient(90deg, #87CEEB 0%, #4682B4 50%, #87CEEB 100%)",
              }}
            />

            {/* Hyde Park */}
            <div
              className="absolute bg-green-300 rounded-lg opacity-70"
              style={{ left: "35%", top: "25%", width: "15%", height: "20%" }}
            />

            {/* Regent's Park */}
            <div
              className="absolute bg-green-300 rounded-full opacity-70"
              style={{ left: "45%", top: "15%", width: "12%", height: "15%" }}
            />

            {/* Major Roads */}
            <div
              className="absolute bg-gray-400 h-1"
              style={{ top: "30%", left: "0%", width: "100%" }}
            />
            <div
              className="absolute bg-gray-400 h-1"
              style={{ top: "60%", left: "0%", width: "100%" }}
            />
            <div
              className="absolute bg-gray-400 w-1"
              style={{ left: "30%", top: "0%", height: "100%" }}
            />
            <div
              className="absolute bg-gray-400 w-1"
              style={{ left: "65%", top: "0%", height: "100%" }}
            />
          </div>

          {/* Activity Markers */}
          {activitiesWithCoords.map((activity) => {
            // Convert real lat/lng to screen coordinates for London area
            // London bounds: lat 51.45-51.55, lng -0.2 to 0.0
            const londonBounds = {
              north: 51.55,
              south: 51.45,
              west: -0.2,
              east: 0.0,
            };

            const lat = activity.coordinates!.lat;
            const lng = activity.coordinates!.lng;

            // Normalize coordinates to 0-100% for positioning
            const xPos =
              ((lng - londonBounds.west) /
                (londonBounds.east - londonBounds.west)) *
              100;
            const yPos =
              ((londonBounds.north - lat) /
                (londonBounds.north - londonBounds.south)) *
              100;

            return (
              <div
                key={activity.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${Math.max(5, Math.min(95, xPos))}%`,
                  top: `${Math.max(5, Math.min(95, yPos))}%`,
                }}
                onClick={() => setSelectedActivity(activity)}
              >
                {/* Activity Pin */}
                <div
                  className={`w-10 h-10 ${getActivityColor(activity.type)} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                {/* Pulse Animation */}
                <div
                  className={`absolute inset-0 ${getActivityColor(activity.type)} rounded-full animate-ping opacity-25`}
                ></div>

                {/* Quick Info Tooltip */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-max">
                  <div className="font-bold text-sm text-explore-green">
                    {activity.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {activity.date} • {activity.participants || 0}/
                    {activity.maxParticipants} people
                  </div>
                </div>
              </div>
            );
          })}

          {/* User Location - Notting Hill */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: "40%", top: "45%" }}
          >
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg">
              <div className="absolute inset-0 bg-blue-600 rounded-full animate-pulse opacity-50"></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-cabin text-blue-600 font-bold">
              You
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
            <h3 className="font-bold text-sm mb-2 font-cabin">
              Activity Types
            </h3>
            <div className="space-y-1">
              {["Cycling", "Climbing", "Running", "Swimming"].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 ${getActivityColor(type)} rounded-full`}
                  ></div>
                  <span className="text-xs font-cabin">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center on User Button */}
          <button className="absolute bottom-20 right-4 bg-white p-3 rounded-full shadow-lg">
            <Navigation className="w-5 h-5 text-explore-green" />
          </button>
        </div>

        {/* Activity Detail Panel */}
        {selectedActivity && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t rounded-t-xl p-4 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-explore-green font-cabin">
                  {selectedActivity.title}
                </h3>
                <p className="text-sm text-gray-600 font-cabin">
                  {selectedActivity.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-cabin">
                  {selectedActivity.date}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-cabin">
                  {selectedActivity.participants || 0}/
                  {selectedActivity.maxParticipants} people
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onActivitySelect(selectedActivity)}
                className="flex-1 bg-explore-green text-white py-3 rounded-lg font-cabin font-medium"
              >
                View Details
              </button>
              <button className="px-6 py-3 border-2 border-explore-green text-explore-green rounded-lg font-cabin font-medium">
                Get Directions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
