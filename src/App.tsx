import { useEffect, useState } from "react";
import DashboardRoutes from "./routes/dashboard/DashboardRoutes";
import instance from "./hooks/instance";
import { Login } from "./pages/auth";
import LoadingPage from "./pages/LoadingPage";
import Cookies from "js-cookie";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await instance.get("/auth/my_data");
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) return <LoadingPage />;

  return isAuthenticated ? <DashboardRoutes /> : <Login />;
}

export default App;
