// src/pages/dashboard/report/Message.tsx
import { useState, useMemo, useRef, type FormEvent } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Popover, message as antdMsg } from "antd";
import instance from "@/hooks/instance";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { BackIcon, CreateExampleIcon, SendMessageIcon } from "@/assets/icons";

// ------------ Types ------------
type Msg = {
  id: string;
  text: string;
  status?: "SENT" | "FAILED" | "PENDING";
  createdAt: string;
  updatedAt: string;
  customerId: string;
};
type ThreadResp = {
  data: (Msg & {
    customer?: { id: string; fullname?: string; CustomerPhone?: { phone: string }[] };
  })[];
  total?: number;
  currentPage?: number;
  totalPages?: number;
};
type Sample = { id: string; text: string; isActive?: boolean };
type Customer = { id: string; fullname?: string; name?: string; CustomerPhone?: { phone: string }[]; phones?: { phone: string }[] };

// ------------ Helpers ------------
function uzMonthShort(m: number) {
  const a = ["Yan","Fev","Mar","Apr","May","Iyn","Iyul","Avg","Sen","Okt","Noy","Dek"];
  return a[m - 1] || "--";
}
function dayLabel(iso: string) {
  const [y, m, d] = (iso.split("T")[0] || "").split("-");
  if (!y || !m || !d) return "-- --";
  return `${Number(d)} ${uzMonthShort(Number(m))}`;
}
function timeHM(iso: string) {
  const t = (iso.split("T")[1] || "").split(".")[0] || "";
  return t ? t.slice(0, 5) : "";
}
const isUnsent = (s?: Msg["status"]) => s && s !== "SENT";
const firstPhone = (c?: Customer) =>
  c?.CustomerPhone?.[0]?.phone || c?.phones?.[0]?.phone || "";

// ------------ Component ------------
const Message = () => {
  const { id } = useParams(); // /message/:id -> customerId
  const customerId = id!;
  const [cookies] = useCookies(["token"]);
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Thread: GET /message?customerId=...
  const { data: thread, isLoading } = useQuery<ThreadResp>({
    queryKey: ["thread", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const r = await instance.get("/message", {
        headers: { Authorization: `Bearer ${cookies.token}` },
        params: { customerId, sortOrder: "asc", limit: 1000, page: 1 },
      });
      // Backend: { data, total, ... } yoki ba'zan to'g'ridan-to'g'ri massiv
      return r.data?.data ? r.data : r.data ?? { data: [] };
    },
    staleTime: 30_000,
  });

  const rows: Msg[] = useMemo(() => (thread?.data as Msg[]) || [], [thread]);

  // Agar thread bo'sh bo'lsa ham title ko'rinsin: mijozni alohida olib kelamiz
  const threadCustomer = (thread?.data?.[0] as any)?.customer as Customer | undefined;

  const { data: customerFallback } = useQuery<Customer | null>({
    queryKey: ["customer", customerId],
    enabled: !threadCustomer && !!customerId,
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${cookies.token}` };
      // bir nechta muqobil endpointlar
      for (const url of [`/customer/${customerId}`, `/customers/${customerId}`, `/debtors/${customerId}`]) {
        try {
          const r = await instance.get(url, { headers });
          const raw = r.data?.data ?? r.data ?? null;
          if (raw) return raw as Customer;
        } catch {/* continue */}
      }
      return null;
    },
  });

  const customer = threadCustomer || customerFallback || undefined;
  const title = customer?.fullname || customer?.name || "---";

  // Yuborish
  const [text, setText] = useState("");
  const { mutate: send, isPending: sending } = useMutation({
    mutationFn: async (body: { text: string }) =>
      instance.post(
        "/message",
        { ...body, customerId },
        { headers: { Authorization: `Bearer ${cookies.token}` } }
      ),
    onSuccess: () => {
      setText("");
      // textarea balandligini reset qilamiz
      if (taRef.current) {
        taRef.current.style.height = "40px";
      }
      qc.invalidateQueries({ queryKey: ["thread", customerId] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (e: any) => {
      antdMsg.error(e?.response?.data?.message || "Jo'natishda xatolik");
    }
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    send({ text });
  }

  // Namunalar (past panel)
  const [openSamples, setOpenSamples] = useState(false);
  const { data: samples = [], isLoading: samplesLoading } = useQuery<Sample[]>({
    queryKey: ["samples", "active"],
    enabled: openSamples,
    queryFn: async () => {
      try {
        const r = await instance.get("/samples", {
          headers: { Authorization: `Bearer ${cookies.token}` },
          params: { active: true },
        });
        return r.data?.data ?? r.data ?? [];
      } catch {
        const r2 = await instance.get("/samples", {
          headers: { Authorization: `Bearer ${cookies.token}` },
        });
        return r2.data?.data ?? r2.data ?? [];
      }
    },
  });

  // Suhbatni o'chirish (hamma xabarlarni ketma-ket o'chiramiz)
  const { mutate: deleteConversation, isPending: deleting } = useMutation({
    mutationFn: async () => {
      const ids = rows.map(r => r.id);
      for (const mid of ids) {
        try {
          await instance.delete(`/message/${mid}`, {
            headers: { Authorization: `Bearer ${cookies.token}` },
          });
        } catch {/* birini o'chira olmasa, qolganini davom ettiramiz */}
      }
    },
    onSuccess: () => {
      antdMsg.success("Suhbat o'chirildi");
      qc.invalidateQueries({ queryKey: ["thread", customerId] });
      qc.invalidateQueries({ queryKey: ["messages"] });
      navigate(-1);
    },
    onError: (e: any) => {
      antdMsg.error(e?.response?.data?.message || "O'chirishda xatolik");
    }
  });

  const confirmContent = (
    <div className="">
      <Heading tag="h3" classList="!text-[16px] !mb-[10px]">O'chirmoqchimisiz?</Heading>
      <Button
        loading={deleting}
        onClick={() => deleteConversation()}
        size="large"
        type="primary"
        danger
      >
         o‘chirish
      </Button>
    </div>
  );

  // -------- Textarea (auto-grow, Enter=send, Shift+Enter=new line) --------
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  function onEditorKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending && text.trim()) send({ text });
    }
  }
  function onEditorInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 120); // ~ 6 qator
    el.style.height = next + "px";
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header (mobil kenglikda markazda) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[400px] bg-white border-b border-[#ECECEC]">
        <div className="flex items-center justify-between px-4 pt-[26px] pb-[10px]">
          <button onClick={() => navigate(-1)} className="active:scale-95">
            {BackIcon ? <BackIcon /> : "←"}
          </button>
          <div className="flex flex-col items-center">
            <Heading tag="h2">{title}</Heading>
            {/* telefon ko‘rsatish ixtiyoriy */}
            {!!firstPhone(customer) && (
              <span className="text-[11px] text-[#8192A3]">{firstPhone(customer)}</span>
            )}
          </div>
          <Popover placement="bottomRight" content={confirmContent} trigger="click">
            <button className="text-[22px] px-1">⋮</button>
          </Popover>
        </div>
      </div>

      {/* Xabarlar ro‘yxati */}
      <div className="mx-auto max-w-[400px] px-4 pt-[78px] pb-[120px] space-y-3">
        {isLoading ? (
          "Loading..."
        ) : rows.length ? (
          rows.map((m, i) => {
            const showSep = i === 0 || dayLabel(m.createdAt) !== dayLabel(rows[i - 1]?.createdAt);
            return (
              <div key={m.id} className="px-1">
                {showSep && (
                  <div className="text-center my-2">
                    <span className="inline-block text-[12px] text-[#637D92] font-medium">
                      {dayLabel(m.createdAt)} <span className="mx-1">•</span> {timeHM(m.createdAt)}
                    </span>
                  </div>
                )}

                {/* outgoing bubble */}
                <div className="relative ml-auto w-fit max-w-[85%] rounded-2xl bg-[#F4F5F6] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  {isUnsent(m.status) && (
                    <span className="absolute -top-4 right-0 text-[11px] text-[#FF4D4F] flex items-center gap-1">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#FF4D4F]" />
                      Yuborilmadi
                    </span>
                  )}

                  {Text ? (
                    <Text classList="!text-[13px] !leading-5 break-words whitespace-pre-wrap pr-10">
                      {m.text}
                    </Text>
                  ) : (
                    <p className="text-[13px] leading-5 break-words whitespace-pre-wrap pr-10">
                      {m.text}
                    </p>
                  )}

                  <span className="absolute right-2 bottom-1 text-[10px] text-[#8C9AA6]">
                    {timeHM(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-[#9AA6B2] pt-16">Ma’lumot yo‘q</div>
        )}
      </div>

      {/* Input bar + Namunalar tugmasi */}
      <form
        onSubmit={onSubmit}
        autoComplete="off"
        className="fixed left-1/2 -translate-x-1/2 bottom-[60px] z-50 w-full max-w-[400px] bg-white border-t border-[#ECECEC]"
      >
        <div className="flex items-end gap-3 px-4 py-3.5">
          <button
            type="button"
            title="Namunalar"
            onClick={() => setOpenSamples((v) => !v)}
            className="active:scale-95 py-3 cursor-pointer"
          >
            {CreateExampleIcon ? <CreateExampleIcon  /> : "✎"}
          </button>

          <div className="flex-1 flex items-end justify-between bg-[#F5F5F5] rounded-[999px] pl-[14px] pr-[8px]">
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onInput={onEditorInput}
              onKeyDown={onEditorKeyDown}
              rows={1}
              placeholder="Xabar yuborish..."
              className="w-[90%] max-h-[120px] py-[10px] pr-2 outline-none bg-transparent text-[14px] leading-5 resize-none overflow-auto"
              style={{ height: "40px" }} // initial height
            />
            <button
              type="submit"
              disabled={sending}
              className="active:scale-95 h-10 w-10 grid place-items-center rounded-full cursor-pointer"
              title="Jo'natish"
            >
              {SendMessageIcon ? <SendMessageIcon /> : "➤"}
            </button>
          </div>
        </div>
      </form>
      

      {/* Namunalar paneli (pastdan) */}
      {openSamples && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[118px] w-full max-w-[400px] bg-white border-t border-[#ECECEC]">
          <div className="px-4 py-3">
            <Heading tag="h3" classList="!text-[16px] !mb-2">Namunalar</Heading>
            <div className="max-h-[38vh] overflow-y-auto">
              {samplesLoading ? (
                "Loading..."
              ) : samples.length ? (
                samples.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setText(s.text);
                      setOpenSamples(false);
                      
                      setTimeout(() => {
                        if (taRef.current) {
                          taRef.current.style.height = "auto";
                          const next = Math.min(taRef.current.scrollHeight, 120);
                          taRef.current.style.height = next + "px";
                        }
                      }, 0);
                    }}
                    className="w-full text-left p-3 mb-2 rounded-lg bg-[#F5F5F5] hover:bg-[#EFEFEF]"
                  >
                    {s.text}
                  </button>
                ))
              ) : (
                <div className="text-[#9AA6B2]">Sizda hali namunalar yo‘q</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
