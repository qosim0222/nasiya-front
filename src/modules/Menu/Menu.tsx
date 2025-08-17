import { NavLink } from "react-router-dom";
import { DebtorIcon, HomeIcon, PaymentIcon, SettingIcon } from "@/assets/icons";
import { paths } from "../../hooks/paths";

const Menu = () => {
  return (
    <div className="border-t-[1px] mt-[200px] fixed w-full z-50 bg-white bottom-0 border-t-[#ECECEC] p-[10px]">
      <div className="containers">
        <div className="flex items-center justify-between">
          <NavLink to={paths.home} className="flex flex-col items-center justify-center space-y-[3px] text-[#637D92]">
            <HomeIcon />
            <p>Asosiy</p>
          </NavLink>
          <NavLink to={paths.debtors} className="flex flex-col items-center justify-center space-y-[3px] text-[#637D92]">
            <DebtorIcon />
            <p>Mijozlar</p>
          </NavLink>
          <NavLink to={paths.pay} className="flex flex-col items-center justify-center space-y-[3px] text-[#637D92]">
            <PaymentIcon />
            <p>Hisobot</p>
          </NavLink>
          <NavLink to={paths.set} className="flex flex-col items-center justify-center space-y-[3px] text-[#637D92]">
            <SettingIcon />
            <p>Sozlama</p>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Menu;
