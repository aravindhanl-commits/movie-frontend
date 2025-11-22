import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  role: "admin" | "user";
}

const PrivateRoute = ({ children, role }: PrivateRouteProps) => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole) return <Navigate to="/auth" />; // Not logged in
  if (userRole !== role) return <Navigate to={userRole === "admin" ? "/admin" : "/"} />;
  return children;
};

export default PrivateRoute;
