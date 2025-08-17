import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ActiveStarIcon, BackIcon, MenuIcon, StarIcon } from "../../assets/icons";
import Heading from "../../components/Heading";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../hooks/instance";
import { formatNumber } from "../../hooks/formatNum";
import { Button, Modal, Popover, Skeleton } from "antd";
import { PlusOutlined } from "@ant-design/icons";

type Payment = { id: string; amount: number; isActive?: boolean };
type DebtType = {
  id: string;
  startDate?: string;
  total_amount: number;
  paid_amount?: number | null;
  monthly_amount?: number | null;
  Payment: Payment[];
  nextPayment?: { date: string; amount: number } | null;
};
type SingleDebtorType = {
  id: string;
  fullname: string;
  address?: string;
  star?: boolean;
  Debt: DebtType[];
};

const SingleDebtor = () => {
  const { id } = useParams();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { data: singleDebtor, isLoading, refetch } = useQuery<SingleDebtorType>({
    queryKey: ["single-debtor", id],
    queryFn: () => instance.get(`/customer/${id}`).then((res) => res.data.data),
    // 🔁 har safar sahifa ochilganda yangilansin
    staleTime: 0,
    refetchOnMount: "always",
  });

  // DebtPayment'dan {state:{refetch:true}} bilan qaytsak — majburan refetch
  useEffect(() => {
    if ((location.state as any)?.refetch) {
      refetch();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, refetch]);

  const { mutate: starMutate } = useMutation({
    mutationFn: (cid: string) => instance.patch(`/customer/star/${cid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["single-debtor"] });
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
    },
  });

  const { mutate: deleteMutate, isPending } = useMutation({
    mutationFn: () => instance.delete(`/customer/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
      navigate(-1);
    },
  });

  const handleOpenChange = (newOpen: boolean) => setOpen(newOpen);

  // Umumiy qolgan qarz
  const totalRemaining = (singleDebtor?.Debt ?? []).reduce((sum, d) => {
    const paidByField =
      typeof d.paid_amount === "number" ? d.paid_amount : undefined;
    const paidByPayments = (d.Payment ?? [])
      .filter((p) => p && p.isActive === false)
      .reduce((s, p) => s + (p.amount || 0), 0);
    const paid = paidByField ?? paidByPayments;
    const remaining = Math.max(0, (d.total_amount || 0) - paid);
    return sum + remaining;
  }, 0);

  return (
    <>
      <div className="containers !mt-[29px]">
        <div className="flex items-center justify-between">
          <div className="w-[50%] flex justify-between items-center">
            <button type="button" className="cursor-pointer" onClick={() => navigate(-1)}>
              <BackIcon />
            </button>
            {isLoading ? (
              <Skeleton.Node active className="!w-[200px] !h-[20px] ml-[30px] !rounded-[5px]" />
            ) : (
              <Heading classList="!text-[18px]" tag="h2">
                {singleDebtor?.fullname}
              </Heading>
            )}
          </div>
          <div className="flex gap-[14px]">
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => singleDebtor?.id && starMutate(singleDebtor.id)}
            >
              {singleDebtor?.star ? <ActiveStarIcon /> : <StarIcon />}
            </button>

            <Popover
              placement="bottomRight"
              content={
                <div className="w-[150px] h-[90px] px-[10px] py-[10px] flex flex-col justify-between items-start">
                  <button type="button" className="cursor-pointer text-[14px] font-medium" onClick={() => navigate(`/debtor/update/${id}`)}>
                    Tahrirlash
                  </button>
                  <div className="w-full h-[1px] bg-[#ECECEC]" />
                  <button type="button" onClick={() => { setOpen(false); setIsOpenModal(true); }} className="cursor-pointer text-[14px] font-medium text-[#F94D4D]">
                    O‘chirish
                  </button>
                </div>
              }
              trigger="click"
              open={open}
              onOpenChange={handleOpenChange}
            >
              <button type="button" className="cursor-pointer">
                <MenuIcon />
              </button>
            </Popover>
          </div>
        </div>

        {/* Umumiy qolgan qarz */}
        <div className="py-[18.5px] px-[16px] bg-[#BBD2FC] rounded-[20px] space-y-[4px] mt-[20px]">
          <p className="text-[12px] font-medium">Umumiy nasiya:</p>
          <Heading tag="h1" classList="!text-[22px] !font-extrabold">
            {formatNumber(totalRemaining)} <span className="!font-semibold">so'm</span>
          </Heading>
        </div>

        <div className="mt-[24px]">
          <Heading tag="h2" classList="!mb-[16px]">Faol nasiyalar</Heading>
          <div className="space-y-[16px]">
            {(singleDebtor?.Debt ?? []).map((item) => {
              const paidByField =
                typeof item.paid_amount === "number" ? item.paid_amount : undefined;
              const paidByPayments = (item.Payment ?? [])
                .filter((p) => p && p.isActive === false)
                .reduce((s, p) => s + (p.amount || 0), 0);
              const paid = paidByField ?? paidByPayments;
              const remaining = Math.max(0, (item.total_amount || 0) - paid);
              const percent = item.total_amount ? Math.min(100, (paid / item.total_amount) * 100) : 0;

              const startTxt = item.startDate
                ? new Date(item.startDate).toLocaleString("uz-UZ", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";

              const nextDate = item.nextPayment?.date?.split("T")[0] ?? "-";
              const nextAmt = item.nextPayment?.amount ?? item.monthly_amount ?? 0;

              return (
                <div key={item.id} onClick={() => navigate(`/debt/${item.id}`)} className="bg-[#F6F6F6] p-[16px] rounded-[16px] cursor-pointer">
                  <div className="flex items-center justify-between mb-[20px]">
                    <p className="font-medium text-[14px]">{startTxt}</p>
                    {/* Qolgan qarz */}
                    <p className="text-[#3478F7] font-semibold text-[14px]">
                      {formatNumber(remaining)} <span className="!font-medium">so'm</span>
                    </p>
                  </div>

                  <p className="font-normal text-[12px]">Keyingi to‘lov: {nextDate}</p>
                  <Heading tag="h2" classList="!font-extrabold text-[#735CD8]">
                    {formatNumber(nextAmt)}{" "}
                    <span className="!text-[12px] !font-normal !text-[#726C6C]">so'm</span>
                  </Heading>

                  <div className="my-[16px] h-[8px] bg-[#CCCCCC] rounded-[50px] overflow-hidden">
                    <div className="h-full bg-[#30AF49]" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="fixed bottom-[80px] left-[calc(50%+45px)] z-50">
          <Button
            onClick={() => navigate(`/debt/create/${singleDebtor?.id}`)}
            type="primary"
            className="!w-[140px] !h-[48px] !rounded-[10px] !text-[16px] !font-medium"
          >
            <PlusOutlined /> Qo‘shish
          </Button>
        </div>
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

export default SingleDebtor;
