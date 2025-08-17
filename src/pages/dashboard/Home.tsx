import { Button, Skeleton } from "antd";
import Heading from "../../components/Heading";
import { EyeIcon, KolendarIcon, PlusIcon, WalletIcon } from "../../assets/icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import instance from "../../hooks/instance";
import { API } from "../../hooks/getEnv";
import { formatNumber } from "../../hooks/formatNum";
import { useNavigate } from "react-router-dom";
import { avatar } from "../../assets/images";

type MeData = {
  fullName: string;
  img: string;
  totalDebt: number;
  overdueDebts: number;
  debtors: number;
  wallet: number;
};

type MeResponse = {
  data: MeData;
};

const Home = () => {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await instance.get("/auth/my_data");
      return res.data as MeResponse;
    },
  });

  const me: MeData = {
    fullName: data?.data.fullName ?? "—",
    img: data?.data.img ?? "",
    totalDebt: data?.data.totalDebt ?? 0,
    overdueDebts: data?.data.overdueDebts ?? 0,
    debtors: data?.data.debtors ?? 0,
    wallet: data?.data.wallet ?? 0,
  };

  const imgSrc =
    me.img ? (me.img.startsWith("http") ? me.img : `${API}${me.img}`) :undefined;

  return (
    <div className="containers !pt-[29px]">
      <div className="flex items-center justify-between">
        {isLoading ? (
          <>
            <Skeleton.Avatar size={"large"} className="!mr-[20px]" />
            <Skeleton paragraph={{ rows: 0, className: "!mt-[0px]" }} />
          </>
        ) : (
          <div className="flex items-center gap-[15px]">
            {imgSrc ? (
              <img
                className="rounded-full"
                src={avatar}
                alt="seller img"
                width={40}
                height={40}
              />
            ) : (
              <div className="rounded-full bg-gray-200 w-10 h-10" />
            )}
            <Heading tag="h2">{me.fullName}</Heading>
          </div>
        )}

        <Button
          onClick={() => navigate("/debt/date")}
          className="!bg-[#EDEDED] !py-[11px] !px-[5px] hover:scale-[1.2]"
        >
          <KolendarIcon />
        </Button>
      </div>

      <div className="bg-[#30AF49] text-white rounded-[20px] flex flex-col items-center justify-between py-[18px] relative mt-[38px]">
        <Heading classList="!text-[20px]" tag="h1">
          {show ? `${formatNumber(me.totalDebt)} so‘m` : "****"}
        </Heading>
        <Heading tag="h3" classList="!text-[#F6F6F6B2]">Umumiy nasiya:</Heading>
        <button
          className="absolute right-[20px] top-[37px] cursor-pointer"
          onClick={() => setShow((s) => !s)}
        >
          <EyeIcon />
        </button>
      </div>

      <div className="flex gap-[8px] mt-[31px]">
        <div className="p-[16px] rounded-[16px] border-[1px] border-[#ECECEC] w-full h-[127px] pr-[30px] flex flex-col justify-between">
          <Heading tag="h3">Kechiktirilgan to‘lovlar</Heading>
          <Heading tag="h2" classList="!text-[18px] !text-[#F94D4D]">
            {me.overdueDebts}
          </Heading>
        </div>
        <div className="p-[16px] rounded-[16px] border-[1px] border-[#ECECEC] w-full h-[127px] pr-[30px] flex flex-col justify-between">
          <Heading tag="h3">
            Mijozlar <br /> soni
          </Heading>
          <Heading tag="h2" classList="!text-[18px] !text-[#30AF49]">
            {me.debtors}
          </Heading>
        </div>
      </div>

      <div className="mt-[40px]">
        <Heading tag="h3" classList="!text-[18px] mb-[26px]">Hamyoningiz</Heading>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <div className="w-[48px] h-[48px] flex bg-[#735CD81A] rounded-full justify-center items-center">
              <WalletIcon />
            </div>
            <div className="space-y-[4px]">
              <p className="text-[13px] font-medium">Hisobingizda</p>
              <Heading tag="h1" classList="!text-[18px]">
                {formatNumber(me.wallet)} so‘m
              </Heading>
            </div>
          </div>
          <Button type="primary" className="!px-[5px] !rounded-full">
            <PlusIcon />
          </Button>
        </div>

        <div className="flex justify-between mt-[28px]">
          <p className="text-[14px] font-medium">Bu oy uchun to‘lov:</p>
          <p className="text-[14px] font-semibold text-[#30AF49]">To‘lov qilingan</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
