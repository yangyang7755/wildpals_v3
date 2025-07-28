import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import AuthLanding from "./pages/AuthLanding";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Index from "./pages/Index";
import Activities from "./pages/Activities";
import ActivityDetails from "./pages/ActivityDetails";
import CreateActivity from "./pages/CreateActivity";
import CreateCycling from "./pages/CreateCycling";
import CreateClimbing from "./pages/CreateClimbing";
import CreateRunning from "./pages/CreateRunning";
import Chat from "./pages/Chat";
import IndividualChat from "./pages/IndividualChat";
import ClubWestway from "./pages/ClubWestway";
import ClubOxford from "./pages/ClubOxford";
import ClubRapha from "./pages/ClubRapha";
import ClubVauxwall from "./pages/ClubVauxwall";
import ClubRichmond from "./pages/ClubRichmond";
import ClubThames from "./pages/ClubThames";
import CoachHolly from "./pages/CoachHolly";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Followers from "./pages/Followers";
import Following from "./pages/Following";
import NotFound from "./pages/NotFound";
import { ActivitiesProvider } from "./contexts/ActivitiesContext";
import { ChatProvider } from "./contexts/ChatContext";
import { SavedActivitiesProvider } from "./contexts/SavedActivitiesContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ActivitiesProvider>
        <SavedActivitiesProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/auth" element={<AuthLanding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/explore" element={<Index />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/create" element={<CreateActivity />} />
                <Route path="/create/cycling" element={<CreateCycling />} />
                <Route path="/create/climbing" element={<CreateClimbing />} />
                <Route path="/create/running" element={<CreateRunning />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:userId" element={<IndividualChat />} />
                <Route path="/club/westway" element={<ClubWestway />} />
                <Route path="/club/oxford-cycling" element={<ClubOxford />} />
                <Route path="/club/rapha-cycling" element={<ClubRapha />} />
                <Route
                  path="/club/vauxwall-climbing"
                  element={<ClubVauxwall />}
                />
                <Route
                  path="/club/richmond-runners"
                  element={<ClubRichmond />}
                />
                <Route path="/club/thames-cyclists" element={<ClubThames />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/followers" element={<Followers />} />
                <Route path="/following" element={<Following />} />
                <Route
                  path="/activity/:activityId"
                  element={<ActivityDetails />}
                />
                <Route path="/profile/coach-holly" element={<CoachHolly />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ChatProvider>
        </SavedActivitiesProvider>
      </ActivitiesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root")!;

// Check if root already exists to prevent multiple createRoot calls
if (!rootElement._reactRoot) {
  const root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
  root.render(<App />);
} else {
  (rootElement as any)._reactRoot.render(<App />);
}
