import Heading from "@/components/Heading";
import { Button, Popover, Switch, message as antdMsg } from "antd";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "@/hooks/instance";
import { paths } from "@/hooks/paths";
import { BackIcon } from "@/assets/icons";

type Sample = { id: string; text: string; isActive?: boolean };

const Samples = () => {
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();
  const qc = useQueryClient();

  // GET /samples  -> har safar sahifa ochilganda qayta olib kelish
  const { data = [], isLoading } = useQuery<Sample[]>({
    queryKey: ["samples-all"],
    queryFn: async () => {
      const r = await instance.get("/samples", {
        headers: { Authorization: `Bearer ${cookies.token}` },
      });
      return r.data?.data ?? r.data ?? [];
    },
    // 🔄 back/forward yoki qaytishda ham yangilansin
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // PATCH/PUT /samples/:id (on/off)
  const { mutate: toggle } = useMutation({
    mutationFn: (s: Sample) =>
      instance
        .patch(`/samples/${s.id}`, { isActive: !s.isActive }, { headers: { Authorization: `Bearer ${cookies.token}` } })
        .catch(() =>
          instance.put(`/samples/${s.id}`, { isActive: !s.isActive }, { headers: { Authorization: `Bearer ${cookies.token}` } }),
        ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["samples-all"] }),
  });

  // DELETE /samples/:id
  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: (id: string) => instance.delete(`/samples/${id}`, { headers: { Authorization: `Bearer ${cookies.token}` } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["samples-all"] });
      antdMsg.success("O‘chirildi");
    },
  });

  return (
    <div className="containers">
      {/* Header */}
      <div className="flex items-center gap-2 py-4">
        <button onClick={() => navigate(-1)} className=" cursor-pointer">
          <BackIcon/>
        </button>
        <Heading tag="h2">Namunalar</Heading>
      </div>

      {/* List */}
      {isLoading ? (
        "Loading..."
      ) : data.length ? (
        data.map((s) => {
          const menu = (
            <div className="w-[120px]">
              <Button
                type="link"
                className="!block !w-full text-left"
                onClick={() => navigate(paths.sample_edit.replace(":id", String(s.id)))}
              >
                Tahrirlash
              </Button>
              <Button
                type="link"
                className="!block !w-full text-left !text-[#FF4D4F]"
                loading={deleting}
                onClick={() => del(String(s.id))}
              >
                O‘chirish
              </Button>
            </div>
          );

          return (
            <div key={s.id} className="p-3 mb-3 rounded-[12px] bg-[#F5F5F5]">
              <div className="flex items-center justify-between mb-2">
                <Switch
                size="small"
                 checked={!!s.isActive} onChange={() => toggle(s)} />
                <Popover content={menu} trigger="click">
                  <MoreOutlined className="text-[18px] cursor-pointer" />
                </Popover>
              </div>

              {/* matn — qatorma-qator, uzun so‘zlar ham o‘raladi */}
              <div className="whitespace-pre-wrap break-words leading-[20px] text-[14px]">{s.text}</div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-[#9AA6B2] mt-16">Mavjud namunalar yo‘q</div>
      )}

      {/* Floating add */}
      <Button
        type="primary"
        size="large"
        className="!fixed !left-1/2 !-translate-x-1/2 !bottom-[80px]"
        icon={<PlusOutlined />}
        onClick={() => navigate(paths.sample_create)}
      >
        Qo‘shish
      </Button>
    </div>
  );
};

export default Samples;
