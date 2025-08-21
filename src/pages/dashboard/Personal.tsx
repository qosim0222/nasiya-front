// src/pages/settings/Personal.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, type UploadProps, Input } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import instance from "@/hooks/instance";
import Heading from "@/components/Heading";
import { BackIcon, EditIcon } from "@/assets/icons";
import { API } from "@/hooks/getEnv";
import toast from "react-hot-toast";
import { UserImg } from "@/assets/images";

type MyData = {
  fullName: string;
  imag?: string;
  phone: string;
  userName?: string; // <— qo‘shildi
};

const Personal = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useQuery<MyData>({
    queryKey: ["my_data"],
    queryFn: async () => {
      const r = await instance.get("/auth/my_data");
      return r.data?.data ?? r.data;
    },
  });

  const { mutate: saveImage } = useMutation({
    mutationFn: (img: string) => instance.patch("/auth/my_data", { img }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my_data"] });
      setIsLoading(false);
      toast.success("Rasm yangilandi");
    },
    onError: () => {
      setIsLoading(false);
      toast.error("Rasmni saqlashda xatolik");
    },
  });

  const handleChange: UploadProps["onChange"] = ({ file }) => {
    setIsLoading(true);
    if (file.status === "done") {
      const path = file.response?.path || file.response?.url;
      if (path) saveImage(path);
      else setIsLoading(false);
    }
    if (file.status === "error") {
      setIsLoading(false);
      toast.error("Yuklashda xatolik.");
    }
  };

  return (
    <div className="containers !mt-[30px]">
      <div className="w-[70%] flex justify-between items-center">
        <button className="cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <Heading classList="!text-[18px]" tag="h2">
          Shaxsiy ma’lumotlar
        </Heading>
      </div>

      <div className="flex items-center justify-center mt-[18px]">
        <label className="w-max relative cursor-pointer">
          <Upload
            action={`${API}/upload`}
            listType="picture-card"
            onChange={handleChange}
            showUploadList={false}
          />
          <img
            className="w-[96px] h-[96px] rounded-full bg-[#E7E7E7]"
            src={`${API}${data?.imag|| ""}`}
            alt="user"
            width={96}
            height={96}
            onError={(e) => {
              e.currentTarget.src = UserImg;
            }}
          />
          <button className="absolute bottom-0 right-[3.5px] cursor-pointer">
            <EditIcon />
          </button>
          <span
            className={`text-white absolute top-[calc(50%-28px)] left-[calc(50%-15px)] text-3xl ${
              !isLoading && "hidden"
            }`}
          >
            <LoadingOutlined />
          </span>
        </label>
      </div>

      <div className="space-y-[32px] mt-[32px]">
        <div className="space-y-[8px]">
          <p className="text-[13px] font-semibold">Ismi familiya</p>
          <Input
            disabled
            value={data?.fullName || ""}
            style={{ color: "#000", WebkitTextFillColor: "#000" }}
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px] !rounded-[8px]"
          />
        </div>

        <div className="space-y-[8px]">
          <p className="text-[13px] font-semibold">Telefon raqam</p>
          <Input
            disabled
            value={data?.phone || ""}
            style={{ color: "#000", WebkitTextFillColor: "#000" }}
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px] !rounded-[8px]"
          />
        </div>

        {/* Elektron pochta o‘rniga USERNAME */}
        <div className="space-y-[8px]">
          <p className="text-[13px] font-semibold">Username</p>
          <Input
            disabled
            value={data?.userName || ""} // backendda bo‘lmasa bo‘sh chiqadi
            style={{ color: "#000", WebkitTextFillColor: "#000" }}
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px] !rounded-[8px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Personal;
