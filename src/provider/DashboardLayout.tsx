import type { ReactNode } from "react";
import { Menu } from "../modules";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <div className="pb-[80px]">{children}</div>
      <Menu />
    </div>
  );
};

export default DashboardLayout;
