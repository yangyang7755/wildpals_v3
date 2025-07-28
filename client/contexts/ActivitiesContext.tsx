import { createContext, useContext, useState, ReactNode } from "react";

export interface Activity {
  id: string;
  type: "cycling" | "climbing";
  title: string;
  date: string;
  time: string;
  location: string;
  meetupLocation: string;
  organizer: string;
  distance?: string;
  distanceUnit?: "km" | "miles";
  elevation?: string;
  elevationUnit?: "m" | "feet";
  pace?: string;
  paceUnit?: "kph" | "mph";
  maxParticipants: string;
  specialComments: string;
  imageSrc?: string;
  climbingLevel?: string;
  languages?: string;
  gearRequired?: string;
  routeLink?: string;
  cafeStop?: string;
  subtype?: string;
  gender?: string;
  ageMin?: string;
  ageMax?: string;
  visibility?: string;
  club?: string; // Club ID if this is a club activity
  createdAt: Date;
}

interface ActivitiesContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => void;
  searchActivities: (query: string) => Activity[];
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(
  undefined,
);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "sample-westway-climb",
      type: "climbing",
      title: "Westway women's+ climbing morning",
      date: "2025-01-26",
      time: "10:00",
      location: "Westway Climbing Centre",
      meetupLocation: "Westway Climbing Centre",
      organizer: "Coach Holly Peristiani",
      maxParticipants: "12",
      specialComments:
        "This session is perfect for meeting fellow climbers and boosting your confidence.",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
      climbingLevel: "Intermediate",
      gender: "Female only",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "sample-sunday-ride",
      type: "cycling",
      title: "Sunday Morning Social Ride",
      date: "2025-02-02",
      time: "08:00",
      location: "Richmond Park",
      meetupLocation: "Richmond Park Main Gate",
      organizer: "Richmond Cycling Club",
      distance: "25",
      distanceUnit: "km",
      pace: "20",
      paceUnit: "kph",
      elevation: "150",
      elevationUnit: "m",
      maxParticipants: "15",
      specialComments:
        "Join us for a friendly social ride through Richmond Park.",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "sample-chaingang",
      type: "cycling",
      title: "Intermediate Chaingang",
      date: "2025-01-28",
      time: "18:30",
      location: "Box Hill, Surrey",
      meetupLocation: "Box Hill car park",
      organizer: "Surrey Road Cycling",
      distance: "40",
      distanceUnit: "km",
      pace: "32",
      paceUnit: "kph",
      elevation: "420",
      elevationUnit: "m",
      maxParticipants: "12",
      specialComments:
        "High-intensity training session for intermediate to advanced cyclists.",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "sample-peak-climb",
      type: "climbing",
      title: "Peak District Sport Climbing",
      date: "2025-02-15",
      time: "09:00",
      location: "Stanage Edge & Burbage",
      meetupLocation: "Stanage Edge car park",
      organizer: "Peak Adventures",
      maxParticipants: "8",
      specialComments: "Weekend climbing adventure in the Peak District.",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      climbingLevel: "Advanced",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
  ]);

  const addActivity = (activityData: Omit<Activity, "id" | "createdAt">) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const searchActivities = (query: string): Activity[] => {
    if (!query.trim()) return activities;

    const lowercaseQuery = query.toLowerCase();
    return activities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(lowercaseQuery) ||
        activity.location.toLowerCase().includes(lowercaseQuery) ||
        activity.meetupLocation.toLowerCase().includes(lowercaseQuery) ||
        activity.organizer.toLowerCase().includes(lowercaseQuery) ||
        activity.specialComments.toLowerCase().includes(lowercaseQuery),
    );
  };

  return (
    <ActivitiesContext.Provider
      value={{ activities, addActivity, searchActivities }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error("useActivities must be used within an ActivitiesProvider");
  }
  return context;
}
