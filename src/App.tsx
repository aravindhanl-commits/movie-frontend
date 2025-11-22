import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./context/UserContext";

const queryClient = new QueryClient();

// PrivateRoute component
const PrivateRoute = ({
  children,
  role,
}: {
  children: JSX.Element;
  role: "admin" | "user";
}) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token || !userRole) return <Navigate to="/auth" replace />; // redirect if not logged in
  if (userRole !== role)
    return <Navigate to={userRole === "admin" ? "/admin" : "/home"} replace />;

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UserProvider>
          <Routes>
            {/* ✅ Landing route logic fixed */}
            <Route
              path="/"
              element={
                localStorage.getItem("userRole") === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : localStorage.getItem("userRole") === "user" ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Home /> // show Home page for guests
                )
              }
            />

            {/* Auth page */}
            <Route path="/auth" element={<Auth />} />

            {/* User routes */}
            <Route
              path="/home"
              element={
                <PrivateRoute role="user">
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/movies"
              element={
                <PrivateRoute role="user">
                  <Movies />
                </PrivateRoute>
              }
            />
            <Route
              path="/movie/:id"
              element={
                <PrivateRoute role="user">
                  <MovieDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking/:showId"
              element={
                <PrivateRoute role="user">
                  <Booking />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <PrivateRoute role="user">
                  <Payment />
                </PrivateRoute>
              }
            />
            <Route
              path="/confirmation"
              element={
                <PrivateRoute role="user">
                  <Confirmation />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute role="user">
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Admin route */}
            <Route
              path="/admin"
              element={
                <PrivateRoute role="admin">
                  <Admin />
                </PrivateRoute>
              }
            />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
