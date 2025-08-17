import { BackIcon, CalendarIcon, EyeIcon, MenuIcon } from "../../assets/icons";
import { useNavigate, useParams } from "react-router-dom";
import { Button, DatePicker, Image, Input, Modal, Popover, Skeleton } from "antd";
import Heading from "../../components/Heading";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../hooks/instance";
import { useState } from "react";
import dayjs from "dayjs";
import { formatNumber } from "../../hooks/formatNum";
import { toImgUrl } from "../../utils/url";

type DebtImage = { image: string };
type DebtResponse = {
  id: string;
  startDate: string;           // ISO
  deadline_months: number;     // oy
  total_amount: number;        // summa
  note?: string | null;
  DebtImage: DebtImage[];      // rasmlar
};

const SingleDebt = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<DebtResponse>({
    queryKey: ["single-debt", id],
    queryFn: () => instance.get(`/debt/${id}`).then((res) => res.data.data),
  });

  const handleOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const { mutate: deleteMutate, isPending } = useMutation({
    mutationFn: () => instance.delete(`/debt/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
      queryClient.invalidateQueries({ queryKey: ["single-debtor"] });
      navigate(-1);
    },
    onError: (err) => console.log(err),
  });

  const items = (
    <div className="w-[150px] h-[90px] px-[10px] py-[10px] flex flex-col justify-between items-start">
      <button
        type="button"
        className="cursor-pointer text-[14px] font-medium"
        onClick={() => navigate(`/debt/update/${id}`)}
      >
        Tahrirlash
      </button>
      <div className="w-full h-[1px] bg-[#ECECEC]" />
      <button
        type="button"
        onClick={() => { setOpen(false); setIsOpenModal(true); }}
        className="cursor-pointer text-[14px] font-medium text-[#F94D4D]"
      >
        O‘chirish
      </button>
    </div>
  );

  const dateIso = data?.startDate || "";
  const dateObj = dateIso ? dayjs(dateIso) : null;
  const timeText =
    dateIso && dateIso.includes("T")
      ? (() => {
          const t = dateIso.split("T")[1] || "";
          const [hh, mm] = t.split(":");
          return hh && mm ? `${hh}:${mm}` : "-";
        })()
      : "-";

  return (
    <>
      <div className="containers !mt-[30px]">
        <div className="flex items-center justify-between">
          <button type="button" className="cursor-pointer" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>

          {isLoading ? (
            <Skeleton.Node active className="!w-[200px] !h-[20px] ml-[30px] !rounded-[5px]" />
          ) : (
            <Heading classList="!text-[18px]" tag="h2">Batafsil</Heading>
          )}

          {/* ✅ Tashqi button olib tashlandi; Popover ichida bitta tugma qoldi */}
          <Popover
            placement="bottomRight"
            content={items}
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
          >
            <button type="button" className="cursor-pointer">
              <MenuIcon />
            </button>
          </Popover>
        </div>

        <div className="flex gap-[12px] mt-[28px]">
          <div className="space-y-[8px] !w-full">
            <Heading classList="!text-[13px]" tag="h3">Sana</Heading>
            <DatePicker
              style={{ color: "#000", WebkitTextFillColor: "#000" }}
              suffixIcon={<CalendarIcon />}
              value={dateObj ?? undefined}
              disabled
              className="!h-[44px] !w-full !bg-[#F6F6F6] !rounded-[8px]"
            />
          </div>
          <div className="space-y-[8px] w-[89px]">
            <Heading classList="!text-[13px]" tag="h3">Vaqt</Heading>
            <Input
              style={{ color: "#000", WebkitTextFillColor: "#000" }}
              disabled
              value={timeText}
              className="!w-[89px] !h-[44px] !bg-[#F6F6F6] !rounded-[8px]"
            />
          </div>
        </div>

        <div className="mt-[24px]">
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">Muddat</Heading>
          <Input
            style={{ color: "#000", WebkitTextFillColor: "#000" }}
            disabled
            value={`${data?.deadline_months ?? "-"} oy`}
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px]"
          />
        </div>

        <div className="mt-[24px] relative">
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">Summa miqdori</Heading>
          <Input
            style={{ color: "#000", WebkitTextFillColor: "#000" }}
            disabled
            value={formatNumber(data?.total_amount ?? 0)}
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px]"
          />
          <Heading tag="h3" classList="absolute top-[40px] right-[16px]">so'm</Heading>
        </div>

        <div className="mt-[24px]">
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">Eslatma</Heading>
          <Input.TextArea
            style={{ color: "#000", WebkitTextFillColor: "#000" }}
            disabled
            value={data?.note ?? ""}
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px]"
          />
        </div>

        <div className="mt-[24px]">
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">Rasmlar</Heading>
          <div className="flex flex-wrap justify-between">
            {(data?.DebtImage ?? []).map((item, idx) => (
              <div key={idx} className="w-[48%] h-[112px] rounded-[16px] overflow-hidden">
                <Image
                  src={toImgUrl(item.image)}
                  className="!w-[100%] !h-[112px] object-cover"
                  preview={{ mask: <EyeIcon /> }}
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          type="primary"
          className="!w-full !h-[49px] !rounded-[10px] mt-[50px] text-[18px] font-medium"
          htmlType="button"
          onClick={() => navigate(`/payment/create/${id}`)}
        >
          Nasiyani so‘ndirish
        </Button>
      </div>

      <Modal
        className="!mt-[170px]"
        width={315}
        okButtonProps={{ loading: isPending }}
        onOk={() => deleteMutate()}
        title="Aniq o'chirmiqchimisiz?"
        okText="O‘chirish"
        cancelText="Bekor qilish"
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
      >
        Ochirilgandan so‘ng qayta tiklashning iloji yo‘q
      </Modal>
    </>
  );
};

export default SingleDebt;
