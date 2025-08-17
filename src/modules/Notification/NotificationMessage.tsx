import instance from "@/hooks/instance";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Text from "@/components/Text";

type MessageListItem = {
  id: string;                       // debtorId yoki customerId sifatida ishlatiladi
  name?: string;
  Phone?: { phoneNumber?: string; phone?: string }[];
  phones?: { phone?: string }[];    // yangi backend bo’lishi mumkin
  lastMessageAt?: string;           // yangi backend
  Notification?: { createdAt: string }[]; // eski backend fallback
};

// ---- Helpers ----
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
  if (!digits) return "----";
  // +998 90 123 45 67 ko‘rinishiga yaqin format (umumiy)
  if (digits.length === 12) {
    return digits.replace(
      /^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/,
      "+$1 $2 $3 $4 $5"
    ) || raw;
  }
  if (digits.length === 9) {
    return digits.replace(/^(\d{2})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4") || raw;
  }
  return raw; // boshqa uzunliklarda boricha qaytaramiz
}
function firstPhone(item: MessageListItem) {
  return (
    item?.Phone?.[0]?.phoneNumber ||
    item?.Phone?.[0]?.phone ||
    item?.phones?.[0]?.phone ||
    "----"
  );
}
function lastDate(item: MessageListItem) {
  const d = item?.lastMessageAt || item?.Notification?.[0]?.createdAt || "";
  if (!d) return { day: "--", month: "--" };
  const [ , m, day] = (d.split("T")[0] || "").split("-");
  return {
    day: day || "--",
    month: m ? (FindMonth(Number(m)) ?? "--") : "--"
  };
}
// -----------------

// Oddiy local "not found" (xohlasangiz o‘rniga o‘zingizning komponentingizni import qiling)
const NotificationMessageNotfound = () => (
  <div className="flex items-center flex-col justify-center text-center mt-[100px]">
    <img
      className="mb-[28px]"
      src="/not-found.svg"
      alt="Not Found"
      width={160}
      height={160}
    />
    <Text classList="!text-[28px] !font-semibold">Ma’lumot yo‘q</Text>
  </div>
);

const NotificationMessage = () => {
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();

  const { data = [], isLoading } = useQuery<MessageListItem[]>({
    queryKey: ['messages'],
    // Yangi backend: /message?get=Sended  | Eski: /notification?get=Sended
    queryFn: async () => {
      try {
        const res = await instance.get("/message", {
          headers: { Authorization: `Bearer ${cookies.token}` },
          params: { get: "Sended" }
        });
        // { data: { notifications: [...] }} yoki { data: { data: [...] }} — ikkisiga ham moslashamiz
        return res.data?.data?.notifications ?? res.data?.data ?? res.data ?? [];
      } catch {
        const res2 = await instance.get("/notification", {
          headers: { Authorization: `Bearer ${cookies.token}` },
          params: { get: "Sended" }
        });
        return res2.data?.data?.notifications ?? res2.data?.data ?? res2.data ?? [];
      }
    }
  });

  return (
    <div>
      {isLoading ? "Loading..." : data.length > 0 ? data.map((item) => {
        const d = lastDate(item);

        return (
          <div
            onClick={() => navigate(`${item.id}`)} // /notifications ichida bo‘lsangiz, relative holda ishlaydi
            key={item.id}
            className="flex cursor-pointer items-center justify-between py-[16px] border-b-[1px] border-[#ECECEC]"
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
  );
};

export default NotificationMessage;
