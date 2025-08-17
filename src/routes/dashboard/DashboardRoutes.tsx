import { Route, Routes } from "react-router-dom";
import { HomeRoutes } from "../../hooks/paths";
import DashboardLayout from "../../provider/DashboardLayout";
import { Suspense } from "react";
import LoadingPage from "../../pages/LoadingPage";

const DashboardRoutes = () => {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          {HomeRoutes.map((item) => (
            <Route key={item.id} path={item.path} element={item.element} />
          ))}
        </Routes>
      </Suspense>
    </DashboardLayout>
  );
};

export default DashboardRoutes;
