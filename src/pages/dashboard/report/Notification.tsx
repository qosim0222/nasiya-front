import { Button, Segmented } from "antd";
import { MessageIcon } from "@/assets/icons";
import { useState } from "react";
import { HistoryPayment, NotificationMessage as ListMessages } from "@/modules";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import instance from "@/hooks/instance";
import CustomModal from "@/components/CustomModal";
import Text from "@/components/Text";
import Heading from "@/components/Heading";
import NotificationMessageNotfound from "@/modules/Notification/NotificationMessageNotfound";

// ---- Helpers (local, tip xavfsiz) ----
function FindMonth(num: number): string {
  const months = [
    "Yanvar","Fevral","Mart","Aprel","May","Iyun",
    "Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr"
  ];
  if (!Number.isFinite(num) || num < 1 || num > 12) return "--";
  return months[num - 1];
}
function PhoneFormat(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length < 9) return raw || "----";
  // oddiy ko‘rinish
  return digits.replace(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/, '+$1 $2 $3 $4 $5') || raw;
}

type ListItem = {
  id: string;
  name?: string;
  Phone?: { phoneNumber?: string; phone?: string }[];
  phones?: { phone?: string }[];
  lastMessageAt?: string;
  Notification?: { createdAt: string }[];
};

function firstPhone(x: ListItem) {
  return (
    x?.Phone?.[0]?.phoneNumber ||
    x?.Phone?.[0]?.phone ||
    x?.phones?.[0]?.phone ||
    "----"
  );
}
function lastDate(x: ListItem) {
  const d = x?.lastMessageAt || x?.Notification?.[0]?.createdAt || "";
  if (!d) return { day: "--", month: "--" };
  const [ , m, day] = (d.split("T")[0] || "").split("-");
  return { day: day || "--", month: m ? FindMonth(Number(m)) : "--" };
}

const Notification = () => {
  const [showMessage, setShowMessage] = useState<"Xabarlar tarixi" | "To‘lovlar tarixi">("Xabarlar tarixi");
  const [showModalAddMessage, setShowModalAddMessage] = useState<boolean>(false);
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleSendMessage(id: string) {
    queryClient.invalidateQueries({ queryKey: ['detor-notification', id] });
    // relative navigation: /notifications ichida ekanmiz
    navigate(`${id}`);
  }

  const { data = [], isLoading } = useQuery<ListItem[]>({
    queryKey: ['add-message-debtor'],
    queryFn: async () => {
      try {
        const res = await instance.get("/message", {
          headers: { Authorization: `Bearer ${cookies.token}` },
          params: { get: "All" }
        });
        return res.data?.data?.notifications ?? res.data?.data ?? res.data ?? [];
      } catch {
        const res2 = await instance.get("/notification", {
          headers: { Authorization: `Bearer ${cookies.token}` },
          params: { get: "All" }
        });
        return res2.data?.data?.notifications ?? res2.data?.data ?? res2.data ?? [];
      }
    }
  });

  return (
    <>
      <div className="containers !mt-[30px] !pb-[18px] border-b-[1px] border-[#ECECEC] !mb-[16px]">
        <div className="flex items-center justify-between ">
          <Heading tag="h2" classList="!font-bold !text-[22px]">Hisobot</Heading>
        </div>
      </div>

      <div className="containers">
        <Segmented
          onChange={(e: "Xabarlar tarixi" | "To‘lovlar tarixi") => setShowMessage(e)}
          className="!w-full !h-[44px]"
          size="large"
          options={['Xabarlar tarixi', 'To‘lovlar tarixi']}
          value={showMessage}
        />
        <div className="mt-[16px]">
          {showMessage === "Xabarlar tarixi" ? <ListMessages /> : <HistoryPayment />}
        </div>
      </div>

      <Button
        onClick={() => setShowModalAddMessage(true)}
        className="!text-[16px] !fixed !rounded-full !right-[calc(50%-185px)] !bottom-[80px] !p-0 !font-medium !h-[58px] !w-[58px]"
        type="primary"
        size="large"
        icon={<MessageIcon />}
      />

      <CustomModal show={showModalAddMessage} setShow={setShowModalAddMessage}>
        <div className="h-[50vh] overflow-y-auto">
          {isLoading ? "Loading..." : data.length > 0 ? data.map((item) => {
            const d = lastDate(item);

            return (
              <div
                onClick={() => handleSendMessage(item.id)}
                key={item.id}
                className="flex hover:bg-slate-100 duration-300 cursor-pointer items-center justify-between py-[16px] border-b-[1px] border-[#ECECEC]"
              >
                <div>
                  <Text classList="!font-bold !text-[14px] !mb-[8px]">{item.name || "---"}</Text>
                  <Text classList="!font-semibold !text-[13px]">{PhoneFormat(firstPhone(item))}</Text>
                </div>
                <Text classList="!font-semibold !text-[12px]">
                  {d.day} {d.month}
                </Text>
              </div>
            );
          }) : <NotificationMessageNotfound />}
        </div>
      </CustomModal>
    </>
  );
};

export default Notification;
