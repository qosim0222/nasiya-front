import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { formatNumber } from "@/hooks/formatNum";
import instance from "@/hooks/instance";
import Text from "@/components/Text";
import NotificationMessageNotfound from "./NotificationMessageNotfound";

type AnyPayment = {
  id: string;
  amount: number;
  paidAt?: string;            // yangi backend
  createdAt?: string;         // eski backend fallback
  Debtor?: {                  // eski strukturaga fallback
    name?: string;
    Phone?: { phoneNumber?: string; phone?: string }[];
  };
  debt?: {                    // yangi backendda payment.include.debt.customer
    customer?: {
      fullname?: string;
      CustomerPhone?: { phone?: string }[];
      Phone?: { phoneNumber?: string; phone?: string }[];
    }
  };
};

function ymd(date?: string) {
  if (!date) return "";
  // date string -> YYYY-MM-DD
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    // backend YYYY-MM-DDTHH:mm:ss.sssZ bo'lsa split ishlaydi
    return date.split("T")[0] ?? date;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function onlyDay(date?: string) {
  const s = ymd(date);
  return s ? s.split("-")[2] : "";
}

function takePhone(p?: AnyPayment) {
  // Yangi: debt.customer.CustomerPhone[0].phone
  const p1 = p?.debt?.customer?.CustomerPhone?.[0]?.phone;
  // Yoki debt.customer.Phone[0].{phoneNumber|phone}
  const p2 = p?.debt?.customer?.Phone?.[0]?.phoneNumber || p?.debt?.customer?.Phone?.[0]?.phone;
  // Eski: Debtor.Phone[0].{phoneNumber|phone}
  const p3 = p?.Debtor?.Phone?.[0]?.phoneNumber || p?.Debtor?.Phone?.[0]?.phone;
  return p1 || p2 || p3 || "----";
}

function takeName(p?: AnyPayment) {
  return (
    p?.debt?.customer?.fullname ||
    p?.Debtor?.name ||
    "----"
  );
}

function takePaidAt(p: AnyPayment) {
  return p.paidAt || p.createdAt || "";
}

const HistoryPayment = () => {
  const [cookies] = useCookies(['token']);

  const { data = [], isLoading } = useQuery<AnyPayment[]>({
    queryKey: ['history-payment'],
    queryFn: async () => {
      try {
        // yangi backend
        const res = await instance.get("/payment/history", {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
        // { data: { data: Payment[] } } yoki { data: Payment[] }
        return res.data?.data ?? res.data ?? [];
      } catch {
        // eski endpoint fallback
        const res2 = await instance.get("/debt/paymant-history", {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
        return res2.data?.data ?? res2.data ?? [];
      }
    }
  });

  return (
    <div>
      {isLoading ? "Loading..." : data.length > 0 ? data.map((item, index) => {
        const curDate = ymd(takePaidAt(item));
        const prev = data[index - 1];
        const prevDate = prev ? ymd(takePaidAt(prev)) : "";

        const showHeader = index === 0 ? true : curDate !== prevDate;

          function PhoneFormat(arg0: string): import("react").ReactNode {
              throw new Error("Function not implemented.");
          }

        return (
          <div key={item.id} className="cursor-pointer">
            {showHeader && (
              <Text classList="!text-center !text-[12px] !text-[#3478F7] !mt-[24px] !font-semibold">
                {curDate || "---"}
              </Text>
            )}
            <div className="flex items-center justify-between py-[16px] border-b-[1px] border-[#ECECEC]">
              <div>
                <Text classList="!font-bold !text-[14px] !mb-[8px]">{takeName(item)}</Text>
                <Text classList="!font-semibold !text-[13px]">
                  {PhoneFormat(takePhone(item))}
                </Text>
              </div>
              <Text classList="!font-medium !text-[16px]">
                -{item.amount ? formatNumber(item.amount) : "----"}
              </Text>
            </div>
          </div>
        );
      }) : <NotificationMessageNotfound />}
    </div>
  );
};

export default HistoryPayment;
