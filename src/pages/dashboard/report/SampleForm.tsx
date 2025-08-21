import Heading from "@/components/Heading";
import { Button, Input, message as antdMsg } from "antd";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import instance from "@/hooks/instance";

const { TextArea } = Input;

const SampleForm = () => {
  const [cookies] = useCookies(["token"]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit: GET /samples/:id (fallback: /samples -> find)
  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const r = await instance.get(`/samples/${id}`, { headers: { Authorization: `Bearer ${cookies.token}` } });
        const cur = r.data?.data ?? r.data ?? null;
        if (cur?.text) setText(cur.text);
      } catch {
        try {
          const r2 = await instance.get(`/samples`, { headers: { Authorization: `Bearer ${cookies.token}` } });
          const list = r2.data?.data ?? r2.data ?? [];
          const cur = list.find((x: any) => String(x.id) === String(id));
          if (cur?.text) setText(cur.text);
        } catch {}
      }
    })();
  }, [id, cookies.token]);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      if (id) {
        await instance.patch(`/samples/${id}`, { text }, { headers: { Authorization: `Bearer ${cookies.token}` } })
          .catch(()=>instance.put(`/samples/${id}`, { text }, { headers: { Authorization: `Bearer ${cookies.token}` } }));
        antdMsg.success("Yangilandi");
      } else {
        await instance.post("/samples", { text, isActive: true }, { headers: { Authorization: `Bearer ${cookies.token}` } });
        antdMsg.success("Yaratildi");
      }
      navigate(-1);
    } finally { setLoading(false); }
  }

  return (
    <div className="containers">
      <div className="flex items-center gap-2 py-4">
        <button onClick={()=>navigate(-1)} className="text-[#637D92]">←</button>
        <Heading tag="h2">{id ? "Namuna tahrirlash" : "Namuna yaratish"}</Heading>
      </div>

      <div className="mt-2">
        <Heading tag="h3" classList="!text-[14px] !mb-2">Namuna</Heading>
        <TextArea
          placeholder="Matn yozish..."
          value={text}
          onChange={(e)=>setText(e.target.value)}
          rows={6}
        />
        <Button type="primary" size="large" className="!mt-4 !w-full" loading={loading} onClick={submit}>
          {id ? "Saqlash" : "Yaratish"}
        </Button>
      </div>
    </div>
  );
};

export default SampleForm;
