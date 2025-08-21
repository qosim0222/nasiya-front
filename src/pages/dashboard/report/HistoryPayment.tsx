// src/pages/dashboard/report/HistoryPayment.tsx
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import instance from "@/hooks/instance";
import Text from "@/components/Text";

// --------- helpers ----------
const money = (n?: number) =>
  typeof n === "number" ? n.toLocaleString("uz-UZ") : "----";

function ddmmyyyy(iso?: string) {
  const d = (iso || "").split("T")[0] || "";
  const [y, m, day] = d.split("-");
  return y && m && day ? `${day}.${m}.${y}` : "--.--.----";
}
function ymd(iso?: string) {
  return (iso || "").split("T")[0] || "";
}
function phoneFormat(raw?: string) {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length === 12) return d.replace(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/, "+$1 $2 $3 $4 $5");
  if (d.length === 9)  return d.replace(/^(\d{2})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
  return raw || "----";
}
function unwrapList(res: any): any[] {
  return (
    res?.data?.data?.rows ??
    res?.data?.data ??
    res?.data?.rows ??
    res?.data ??
    []
  );
}

type AnyPayment = any;

const pickDateISO = (p: AnyPayment) =>
  p?.paidAt ?? p?.createdAt ?? p?.date ?? p?.paymentDate ?? "";

const pickAmount = (p: AnyPayment): number | undefined =>
  typeof p?.amount === "number" ? p.amount
  : typeof p?.summa === "number" ? p.summa
  : undefined;

const pickName = (p: AnyPayment) =>
  p?.debt?.customer?.fullname ??
  p?.customer?.fullname ??
  p?.Debtor?.name ??
  p?.debtor?.name ??
  "---";

const pickPhone = (p: AnyPayment) =>
  p?.debt?.customer?.CustomerPhone?.[0]?.phone ??
  p?.debt?.customer?.phones?.[0]?.phone ??
  p?.customer?.CustomerPhone?.[0]?.phone ??
  p?.Debtor?.Phone?.[0]?.phoneNumber ??
  p?.debtor?.Phone?.[0]?.phoneNumber ??
  "";

// --------- component ----------
const HistoryPayment = () => {
  const [cookies] = useCookies(["token"]);

  const { data = [], isLoading } = useQuery<AnyPayment[]>({
    queryKey: ["history-payment"],
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${cookies.token}` };

      // 1) Yangi endpointlar
      for (const url of ["/payment", "/payments"]) {
        try {
          const r = await instance.get(url, { headers, params: { order: "desc" } });
          const arr = unwrapList(r);
          if (Array.isArray(arr) && arr.length) return arr;
        } catch {}
      }

      // 2) Tarix endpointi yoki eski fallback
      for (const url of ["/payment/history", "/debt/paymant-history"]) {
        try {
          const r = await instance.get(url, { headers });
          const arr = unwrapList(r);
          if (Array.isArray(arr)) return arr;
        } catch {}
      }

      return [];
    },
    staleTime: 60_000,
  });

  // Sanaga ko‘ra guruhlash (desc)
  const grouped: Record<string, AnyPayment[]> = {};
  for (const it of data) {
    const key = ymd(pickDateISO(it)) || "----";
    (grouped[key] ||= []).push(it);
  }
  const dates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : dates.length ? (
        dates.map((date) => (
          <div key={date}>
            <Text classList="!text-center !text-[12px] !text-[#3478F7] !mt-[24px] !font-semibold">
              {ddmmyyyy(date)}
            </Text>

            {grouped[date].map((it: AnyPayment, idx: number) => {
              const name = pickName(it);
              const phone = phoneFormat(pickPhone(it));
              const amount = pickAmount(it);
              return (
                <div
                  key={(it?.id ?? `${date}-${idx}`) as string}
                  className="flex items-center justify-between py-[16px] border-b-[1px] border-[#ECECEC]"
                >
                  <div>
                    <Text classList="!font-bold !text-[14px] !mb-[8px]">{name}</Text>
                    <Text classList="!font-semibold !text-[13px]">
                      {phone}
                    </Text>
                  </div>
                  <Text classList="!font-medium !text-[16px]">
                    -{money(amount)}
                  </Text>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <div className="text-center py-14 text-[#9AA6B2]">Ma’lumot yo‘q</div>
      )}
    </div>
  );
};

export default HistoryPayment;
