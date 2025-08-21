import { useState, useMemo } from "react";
import { Button, Modal } from "antd";
import instance from "@/hooks/instance";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Text from "@/components/Text";
import { MessageIcon } from "@/assets/icons";

function monthShort(n: number) {
  const m = ["Yan","Fev","Mar","Apr","May","Iyn","Iyul","Avg","Sen","Okt","Noy","Dek"];
  return n>=1 && n<=12 ? m[n-1] : "--";
}
function phoneFormat(raw: string) {
  const d = (raw||"").replace(/\D/g,"");
  if (d.length===12) return d.replace(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/,"+$1 $2 $3 $4 $5");
  if (d.length===9)  return d.replace(/^(\d{2})(\d{3})(\d{2})(\d{2})$/,"$1 $2 $3 $4");
  return raw || "----";
}
function unwrapList(res:any):any[] {
  return (
    res?.data?.data?.rows ??
    res?.data?.data?.notifications ??
    res?.data?.data ??
    res?.data?.rows ??
    res?.data?.notifications ??
    res?.data ?? []
  );
}

// --- helperlar
const getCustomerId   = (x:any) => x?.customer?.id ?? x?.customerId ?? x?.debtorId ?? x?.id;
const getFullname     = (x:any) => x?.customer?.fullname ?? x?.name ?? "---";
const getPhoneRaw     = (x:any) => x?.customer?.CustomerPhone?.[0]?.phone ?? x?.phones?.[0]?.phone ?? x?.Phone?.[0]?.phoneNumber ?? "";
const getCreatedAt    = (x:any) => x?.createdAt ?? x?.lastMessageAt ?? "";
const getIsSended     = (x:any) => {
  if (typeof x?.lastMessageIsSended === "boolean") return x.lastMessageIsSended;
  if (typeof x?.isSended === "boolean")          return x.isSended;
  const f = x?.Notification?.[0]?.isSended;
  return typeof f === "boolean" ? f : true;
};
function splitDayMon(iso?: string) {
  const s = (iso||"").split("T")[0] || "";
  const [,m,d] = s.split("-");
  return { day: d || "--", mon: m ? monthShort(Number(m)) : "--" };
}
// har bir mijozdan faqat eng so‘nggi yozuv
function latestPerCustomer(rows:any[]) {
  const sorted = [...rows].sort((a,b) =>
    new Date(getCreatedAt(b)).getTime() - new Date(getCreatedAt(a)).getTime()
  );
  const seen = new Set<string>(); const out:any[] = [];
  for (const r of sorted) {
    const cid = String(getCustomerId(r) ?? "");
    if (!cid || seen.has(cid)) continue;
    seen.add(cid); out.push(r);
  }
  return out;
}

const NotificationMessage = () => {
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();

  // --- Xabarlar ro‘yxati (mijoz bo‘yicha unique)
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ["messages", cookies.token],
    queryFn: async () => {
      const r = await instance.get("/message", {
        headers: { Authorization: `Bearer ${cookies.token}` },
        params: { get: "Sended" },
      });
      return unwrapList(r);
    },
    select: latestPerCustomer,
    staleTime: 60_000,
  });

  // --- Yangi xabar tugmasi (modal orqali mijoz tanlash)
  const [openNew, setOpenNew] = useState(false);
  const { data: customers = [], isLoading: loadingCustomers } = useQuery<any[]>({
    queryKey: ["customers-for-new-msg", cookies.token, openNew],
    enabled: openNew,
    queryFn: async () => {
      try {
        const r = await instance.get("/customers", { headers: { Authorization: `Bearer ${cookies.token}` } });
        return r.data?.data ?? r.data ?? [];
      } catch {
        for (const url of ["/customer", "/clients", "/debtors"]) {
          try {
            const r2 = await instance.get(url, { headers: { Authorization: `Bearer ${cookies.token}` } });
            return r2.data?.data ?? r2.data ?? [];
          } catch {}
        }
        return [];
      }
    },
  });
  const candidates = useMemo(() => customers, [customers]);
  const pickCustomerPhone = (c:any) => c?.CustomerPhone?.[0]?.phone ?? c?.phones?.[0]?.phone ?? "";
  const phoneFmt = (raw?:string) => phoneFormat(raw || "");
  const openThread = (c:any) => { const id = c?.id; if (!id) return; navigate(`/message/${id}`); setOpenNew(false); };

  return (
    <>
      <div>
        {isLoading ? "Loading..." : data.length ? data.map((it) => {
          const id    = getCustomerId(it);
          const name  = getFullname(it);
          const phone = phoneFormat(getPhoneRaw(it));
          const d     = splitDayMon(getCreatedAt(it));
          const sent  = getIsSended(it);

          return (
            <div
              key={String(id)}
              onClick={() => id && navigate(`/message/${id}`)}
              className="flex cursor-pointer items-center justify-between py-[16px] border-b-[1px] border-[#ECECEC]"
            >
              <div className="flex items-start gap-2">
                <div>
                  <Text classList="!font-bold !text-[14px] !mb-[6px]">{name}</Text>
                  <Text classList="!font-semibold !text-[13px]">{phone}</Text>
                </div>
                {!sent && <span className="mt-[2px] inline-block h-[8px] w-[8px] rounded-full bg-[#FF4D4F]" />}
              </div>
              <Text classList="!font-semibold !text-[12px]">{d.day} {d.mon}</Text>
            </div>
          );
        }) : <div className="text-center py-14 text-[#9AA6B2]">Ma’lumot yo‘q</div>}
      </div>

      {/* Figma’dagi 56x56 SMS tugma */}
     <Button
        onClick={()=> setOpenNew(true)}
        className="!text-[16px] !fixed !rounded-full !right-[calc(50%-185px)] !bottom-[80px] !p-0 !font-medium !h-[58px] !w-[58px]"
        type="primary"
        size="large"
        icon={
         
          typeof MessageIcon === "string"
            ? <img src={MessageIcon} alt="sms" />
            : <MessageIcon />
        }
        title="Yangi xabar"
      />

      <Modal title="Mijoz tanlang" open={openNew} onCancel={()=> setOpenNew(false)} footer={null}>
        <div className="max-h-[60vh] overflow-y-auto">
          {loadingCustomers ? "Loading..." : candidates.length ? candidates.map((c:any)=>(
            <button
              key={String(c.id)}
              onClick={()=> openThread(c)}
              className="w-full text-left py-[12px] border-b border-[#ECECEC] hover:bg-[#F5F5F5] rounded-[8px] px-2"
            >
              <div className="font-semibold text-[14px] mb-[4px]">{c.fullname || c.name || "---"}</div>
              <div className="text-[13px]">{phoneFmt(pickCustomerPhone(c))}</div>
            </button>
          )) : <div className="text-center py-6 text-[#9AA6B2]">Mijozlar topilmadi</div>}
        </div>
      </Modal>
    </>
  );
};

export default NotificationMessage;

