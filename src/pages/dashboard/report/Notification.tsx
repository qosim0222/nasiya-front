

import {  Segmented } from "antd";
import { EditOutlined } from "@ant-design/icons";
import Heading from "@/components/Heading";
import NotificationMessage from "./NotificationMessage";
import HistoryPayment from "./HistoryPayment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/hooks/paths";

const Notification = () => {
  const [tab, setTab] = useState<"Xabarlar tarixi" | "To‘lovlar tarixi">("Xabarlar tarixi");
  const navigate = useNavigate();

  return (
    <>
      <div className="containers !mt-[30px] !pb-[18px] border-b-[1px] border-[#ECECEC] !mb-[16px]">
        <div className="flex items-center justify-between">
          <Heading tag="h2" classList="!font-bold !text-[22px]">Hisobot</Heading>
          <button onClick={() => navigate(paths.samples)} title="Namunalar" className="p-2">
            <EditOutlined className="!text-[18px] cursor-pointer" />
          </button>
        </div>
      </div>

      <div className="containers">
        <Segmented
          value={tab}
          onChange={(e: any) => setTab(e)}
          className="!w-full !h-[44px]"
          size="large"
          options={["Xabarlar tarixi", "To‘lovlar tarixi"]}
        />
        <div className="mt-[16px]">
          {tab === "Xabarlar tarixi" ? <NotificationMessage /> : <HistoryPayment />}
        </div>
      </div>
    </>
  );
};
export default Notification;
