import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
// import { Heading, Text } from "@/components";
import { Button, Popover, Modal } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import instance from "@/hooks/instance";
import { BackIcon, CreateExampleIcon, SendMessageIcon } from "@/assets/icons";
import Heading from "@/components/Heading";
import Text from "@/components/Text";

// === Types shu faylda ===
export interface MessageType {
  id: string;
  message: string;
  createdAt: string;
  updatedAt: string;

  // yangi/legacy moslashuv (ixtiyoriy maydonlar)
  userId?: string;
  sellerId?: string;
  customerId?: string;  // yangi backend bo'lsa
  debtorId?: string;    // legacy bo'lsa
  isSended?: boolean;
  Debtor?: { name: string }; // legacy single-thread UI uchun
}

type ThreadResp = {
  messages: MessageType[];
  debtor?: { name?: string };
  customer?: { fullname?: string }; // yangi backend
};

type SampleItem = { id: string; text: string; isActive?: boolean };

// ---- Helpers (local, tip xavfsiz) ----
function FindMonth(num: number): string {
  const months = [
    "Yanvar","Fevral","Mart","Aprel","May","Iyun",
    "Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr"
  ];
  if (!Number.isFinite(num) || num < 1 || num > 12) return "--";
  return months[num - 1];
}
function monthDay(dateStr: string) {
  const [, m, d] = (dateStr?.split("T")[0] || "").split("-");
  return `${d || "--"} ${m ? FindMonth(Number(m)) : "--"}`;
}
function timeOnly(dateStr: string) {
  return (dateStr?.split("T")[1] || "").split(".")[0] || "";
}
// --------------------------------------

const NotificationMessage = () => {
  const { debtorId } = useParams(); // id => debtor/customer id
  const [cookies] = useCookies(['token']);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // THREAD: /message?debtorId=...  (fallback: /notification?debtorId=...)
  const { data, isLoading } = useQuery<ThreadResp>({
    queryKey: ['detor-notification', debtorId],
    queryFn: async () => {
      try {
        const res = await instance.get("/message", {
          headers: { Authorization: `Bearer ${cookies.token}` },
          params: { debtorId }
        });
        const raw = res.data?.data ?? res.data ?? {};
        return {
          messages: raw.messages ?? raw.notifications ?? [],
          debtor: raw.debtor,
          customer: raw.customer
        };
      } catch {
        const res2 = await instance.get("/notification", {
          headers: { Authorization: `Bearer ${cookies.token}` },
          params: { debtorId }
        });
        const raw = res2.data?.data ?? res2.data ?? {};
        return {
          messages: raw.messages ?? raw.notifications ?? [],
          debtor: raw.debtor,
          customer: raw.customer
        };
      }
    }
  });

  // CREATE message: POST /message  (fallback: /notification)
  const [message, setMessage] = useState<string>("");
  const { mutate: createMessage, isPending: creating } = useMutation({
    mutationFn: async (body: { message: string; debtorId?: string }) => {
      try {
        return await instance.post("/message", body, {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
      } catch {
        return await instance.post("/notification", body, {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detor-notification', debtorId] });
      setMessage("");
    }
  });

  function handleCreateMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim()) return;
    createMessage({ message, debtorId });
  }

  // BACK
  function handleBack() {
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    navigate(-1);
  }

  // DELETE thread: DELETE /message/:debtorId  (fallback: /notification/:debtorId)
  const { mutate: deleteThread, isPending: deleting } = useMutation({
    mutationFn: async () => {
      try {
        return await instance.delete(`/message/${debtorId}`, {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
      } catch {
        return await instance.delete(`/notification/${debtorId}`, {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      navigate(-1);
    }
  });

  const confirmContent = (
    <>
      <Heading classList="!mb-[10px]" tag="h2">O'chirmoqchimisiz?</Heading>
      <Button
        loading={deleting}
        onClick={() => deleteThread()}
        className="w-full"
        size="large"
        type="primary"
        htmlType="button"
      >
        O'chirish
      </Button>
    </>
  );

  // SAMPLE (namuna) modal
  const [openSample, setOpenSample] = useState(false);
  const { data: samples = [], isLoading: samplesLoading } = useQuery<SampleItem[]>({
    queryKey: ['samples'],
    queryFn: async () => {
      try {
        const res = await instance.get("/sample", {
          headers: { Authorization: `Bearer ${cookies.token}` },
          params: { active: true }
        });
        return res.data?.data ?? res.data ?? [];
      } catch {
        const res2 = await instance.get("/sample", {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
        return res2.data?.data ?? res2.data ?? [];
      }
    }
  });

  const titleName = data?.customer?.fullname || data?.debtor?.name || "---";

  return (
    <div className="containers">
      <div className="flex fixed z-50 top-0 pt-[30px] w-full bg-white max-w-[400px] items-center border-b-[1px] border-[#ECECEC] justify-between pb-[11px] mb-[28px]">
        <button className="cursor-pointer duration-300 hover:scale-[1.2]" onClick={handleBack}>
          <BackIcon />
        </button>
        <Heading tag="h2">{titleName}</Heading>
        <Popover className="debtor-single-popop" placement="bottomRight" content={confirmContent} trigger="click">
          <button>
            <MoreOutlined className="!text-[24px] cursor-pointer duration-300 hover:scale-[1.2]" />
          </button>
        </Popover>
      </div>

      <div className="mt-[80px] pb-[80px] space-y-[20px]">
        {isLoading ? "Loading..." : data?.messages?.map((item, index) => (
          <div key={item.id}>
            <Text classList="font-medium !text-[12px] !text-center">
              {index === 0
                ? monthDay(item.createdAt)
                : monthDay(item.createdAt) !== monthDay(data!.messages[index - 1].createdAt)
                  ? monthDay(item.createdAt)
                  : ""}
            </Text>
            <div className="p-4 ml-auto relative max-w-[300px] !mt-[20px] rounded-[16px] bg-[#F5F5F5]">
              <Text classList="font-normal !text-[13px]">{item.message}</Text>
              <span className="text-[10px] absolute bottom-[2px] right-[8px]">{timeOnly(item.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleCreateMessage}
        autoComplete="off"
        className="flex fixed w-full max-w-[400px] bg-white py-[8px] bottom-[60px] mx-auto justify-between items-center"
      >
        <button
          type="button"
          onClick={() => setOpenSample(true)}
          className="cursor-pointer hover:scale-[1.2] duration-300"
          title="Namuna tanlash"
        >
          <CreateExampleIcon />
        </button>

        <div className="w-[90%] flex items-center justify-between pr-[18px] bg-[#F5F5F5] rounded-[50px]">
          <input
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="w-[90%] py-[12px] outline-none pl-[16px]"
            type="text"
            placeholder="Xabar yuborish..."
          />
          <button type="submit" disabled={creating} className="cursor-pointer hover:scale-[1.2] duration-300">
            <SendMessageIcon />
          </button>
        </div>
      </form>

      <Modal open={openSample} onCancel={() => setOpenSample(false)} footer={null} title="Namuna xabarlari">
        <div className="max-h-[50vh] overflow-y-auto">
          {samplesLoading ? "Loading..." : samples.length > 0 ? (
            samples.map((s) => (
              <button
                key={s.id}
                onClick={() => { setMessage(s.text); setOpenSample(false); }}
                className="w-full text-left p-3 mb-2 rounded-lg hover:bg-slate-100"
              >
                {s.text}
              </button>
            ))
          ) : (
            <div>Namuna topilmadi</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NotificationMessage;
