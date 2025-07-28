import { createContext, useContext, useState, ReactNode } from "react";
import { Activity } from "./ActivitiesContext";

interface SavedActivitiesContextType {
  savedActivities: Activity[];
  saveActivity: (activity: Activity) => void;
  unsaveActivity: (activityId: string) => void;
  isActivitySaved: (activityId: string) => boolean;
}

const SavedActivitiesContext = createContext<
  SavedActivitiesContextType | undefined
>(undefined);

export function SavedActivitiesProvider({ children }: { children: ReactNode }) {
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);

  const saveActivity = (activity: Activity) => {
    setSavedActivities((prev) => {
      if (prev.some((saved) => saved.id === activity.id)) {
        return prev; // Already saved
      }
      return [...prev, activity];
    });
  };

  const unsaveActivity = (activityId: string) => {
    setSavedActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId),
    );
  };

  const isActivitySaved = (activityId: string) => {
    return savedActivities.some((activity) => activity.id === activityId);
  };

  return (
    <SavedActivitiesContext.Provider
      value={{ savedActivities, saveActivity, unsaveActivity, isActivitySaved }}
    >
      {children}
    </SavedActivitiesContext.Provider>
  );
}

export function useSavedActivities() {
  const context = useContext(SavedActivitiesContext);
  if (context === undefined) {
    throw new Error(
      "useSavedActivities must be used within a SavedActivitiesProvider",
    );
  }
  return context;
}
