import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/shared/protected-route";

import LandingPage from "@/features/landing/landing-page";
import LoginPage from "@/features/auth/login-page";
import RegisterPage from "@/features/auth/register-page";
import DashboardPage from "@/features/dashboard/dashboard-page";
import CalendarPage from "@/features/calendar/calendar-page";
import WeightPage from "@/features/weight/weight-page";
import MealsPage from "@/features/meals/meals-page";
import WorkoutsPage from "@/features/workouts/workouts-page";
import HabitsPage from "@/features/habits/habits-page";
import JournalPage from "@/features/journal/journal-page";
import SmokingPage from "@/features/smoking/smoking-page";
import AlcoholPage from "@/features/alcohol/alcohol-page";
import ProfilePage from "@/features/profile/profile-page";
import SettingsPage from "@/features/settings/settings-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/weight", element: <WeightPage /> },
          { path: "/meals", element: <MealsPage /> },
          { path: "/workouts", element: <WorkoutsPage /> },
          { path: "/habits", element: <HabitsPage /> },
          { path: "/journal", element: <JournalPage /> },
          { path: "/smoking", element: <SmokingPage /> },
          { path: "/alcohol", element: <AlcoholPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
