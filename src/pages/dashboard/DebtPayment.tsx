// src/pages/dashboard/DebtPayment.tsx
import { useNavigate, useParams } from "react-router-dom";
import { ArrowIcon, BackIcon } from "../../assets/icons";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../hooks/instance";
import { getMonth } from "../../hooks/getMonth";
import { Button, Input, message } from "antd";
import SuccessModal from "../../components/SuccessModal";
import AnyPaymentItem from "../../components/AnyPaymentItem";
import { formatNumber } from "../../hooks/formatNum";
import Heading from "../../components/Heading";
import Text from "../../components/Text";
import CustomModal from "../../components/CustomModal";
import dayjs from "dayjs";

type PaymentItem = {
  id: string;
  monthNumber: number | null; // backend: monthNumber
  amount: number;
  createdAt: string;          // backend: createdAt
};

type DebtType = {
  id: string;
  startDate: string; 
  customerId:string;         // boshlanish sanasi (ISO)
  deadline_months: number;    // jami oylar
  monthly_amount: number;     // oylik to'lov
  Payment: PaymentItem[];     // to'langan oylar ro'yxati
};

const DebtPayment = () => {
  const { id } = useParams();        // /payment/create/:id => debtId
  const debtId = id;
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const [showForMonthPayment, setShowForMonthPayment] = useState<boolean>(false);
  const [showAnyPayment, setShowAnyPayment] = useState<boolean>(false);
  const [showChooseDatePayment, setShowChooseDatePayment] = useState<boolean>(false);

  const { data: debtData } = useQuery<DebtType>({
    queryKey: ["single-debt", debtId],
    queryFn: () => instance.get(`/debt/${debtId}`).then((res) => res.data.data),
    enabled: !!debtId,
  });

  // ⚙️ Helperlar: to‘lanmagan oylar va ularning “muddati”
  const paidMonths = (debtData?.Payment ?? [])
    .map((p) => p.monthNumber)
    .filter((m): m is number => m != null);

  const allMonths =
    debtData?.deadline_months
      ? Array.from({ length: debtData.deadline_months }, (_, i) => i + 1)
      : [];

  const unpaidMonths = allMonths.filter((m) => !paidMonths.includes(m));
  const nextUnpaid = unpaidMonths[0];

  const dueDateOf = (monthNo: number) => {
    // 1-oy = startDate; 2-oy = startDate + 1 oy; ...
    const base = debtData?.startDate ? dayjs(debtData.startDate) : dayjs();
    return base.add(monthNo - 1, "month").format("YYYY-MM-DD");
  };

  // 1 oyga to'lash (BACKEND: POST /payment/one-month  { debtId })
  const { mutate: oneMonthMutate, isPending: oneMonthPenning } = useMutation({
    mutationFn: () => instance.post("/payment/one-month", { debtId }),
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["single-debt", debtId] });
      queryClient.invalidateQueries({ queryKey: ["single-debtor"] });
      queryClient.invalidateQueries({ queryKey: ["history-payment"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Xatolik");
    },
  });
  function handleShowSuccess() {
    oneMonthMutate();
  }

  // Istalgan miqdor (BACKEND: POST /payment/any-amount { debtId, amount })
  const { mutate: oneAnyPayment, isPending: anyPaymenPenning } = useMutation({
    mutationFn: (data: { debtId: string | undefined; amount: number }) =>
      instance.post("/payment/any-amount", data),
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["single-debt", debtId] });
      queryClient.invalidateQueries({ queryKey: ["single-debtor"] });
      queryClient.invalidateQueries({ queryKey: ["history-payment"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Xatolik");
    },
  });
  function handleSubmitAnyPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement & { amount: { value: string } };
    const amt = Number(form.amount.value || 0);
    if (!amt || amt <= 0) return message.warning("To‘lov summasini kiriting");
    oneAnyPayment({ debtId, amount: amt });
  }

  // Bir nechta oy tanlab to'lash (BACKEND: POST /payment/pay-by-months { debtId, months: number[] })
  const [totolPay, setTotalPay] = useState<number[]>([]);
  const [payAll, setPayAll] = useState(false);
  const [payMonth, setPayMonth] = useState<number[]>([]);

  const { mutate: oneManyPayment, isPending: manyPaymenPenning } = useMutation({
    mutationFn: (data: { debtId: string | undefined; months: number[] }) =>
      instance.post("/payment/pay-by-months", data),
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["single-debt", debtId] });
      queryClient.invalidateQueries({ queryKey: ["single-debtor"] });
      queryClient.invalidateQueries({ queryKey: ["history-payment"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Xatolik");
    },
  });

  function handleManyMonthClick() {
    if (!payMonth.length) return message.warning("Oy(lar)ni tanlang");
    oneManyPayment({ debtId, months: payMonth });
  }

  function handlePayAll() {
    setPayAll((prev) => {
      if (!prev) {
        // ✅ faqat to‘lanmagan oylar
        const months = unpaidMonths;
        const sums = months.map(() => debtData?.monthly_amount ?? 0);
        setPayMonth(months);
        setTotalPay(sums);
        return true;
      } else {
        setPayMonth([]);
        setTotalPay([]);
        return false;
      }
    });
  }

  function addAmount(arr: number[]) {
    if (!arr.length) return 0;
    const total = arr.reduce((acc, n) => acc + n, 0);
    return formatNumber(total);
  }

  return (
    <>
      <div className="containers !mt-[30px]">
        <div className="flex items-center justify-between mb-[27px] w-[50%] gap-[12px]">
          <button className="cursor-pointer" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
          <Heading tag="h2">Nasiyani so‘ndirish</Heading>
        </div>

        <Heading classList="!text-[18px] !mb-[20px]" tag="h2">
          To‘lov
        </Heading>

        <ul>
          <li
            onClick={() => setShowForMonthPayment(true)}
            className="flex items-center justify-between cursor-pointer py-[16px] border-b-[1px] border-[#EEEEEE]"
          >
            <Text classList="!text-[14px] font-normal">1 oyga so‘ndirish</Text>
            <button className="rotate-[180deg]">
              <ArrowIcon className="payment-debt" />
            </button>
          </li>

          <li
            onClick={() => setShowAnyPayment(true)}
            className="flex items-center justify-between cursor-pointer py-[16px] border-b-[1px] border-[#EEEEEE]"
          >
            <Text classList="!text-[14px] font-normal">Har qanday miqdorda so‘ndirish</Text>
            <button className="rotate-[180deg]">
              <ArrowIcon className="payment-debt" />
            </button>
          </li>

          <li
            onClick={() => setShowChooseDatePayment(true)}
            className="flex items-center justify-between cursor-pointer py-[16px] border-b-[1px] border-[#EEEEEE]"
          >
            <Text classList="!text-[14px] font-normal">To‘lov muddatini tanlash</Text>
            <button className="rotate-[180deg]">
              <ArrowIcon className="payment-debt" />
            </button>
          </li>
        </ul>
      </div>

      {/* 1 oy */}
      <CustomModal show={showForMonthPayment} setShow={setShowForMonthPayment}>
        <Heading classList="!font-bold !text-[20px]" tag="h2">
          1 oy uchun so‘ndirish
        </Heading>

        <div className="p-4 rounded-[16px] bg-[#DDE9FE] mt-[32px] mb-[200px]">
          <Heading classList="!font-bold !text-[16px] !mb-[4px] text-[#3478F7]" tag="h3">
            {formatNumber(debtData?.monthly_amount || 0)} so‘m
          </Heading>
          <Text>
            {typeof nextUnpaid === "number"
              ? `${getMonth(dayjs(dueDateOf(nextUnpaid)).month())} oyi uchun so‘ndiriladi`
              : "Barcha oylar to‘langan"}
          </Text>
        </div>

        <Button
          loading={oneMonthPenning}
          onClick={handleShowSuccess}
          className="!h-[42px] !font-medium !text-[14px] w-full"
          size="large"
          htmlType="button"
          type="primary"
          disabled={!nextUnpaid}
        >
          1 oylik uchun so‘ndirish
        </Button>
      </CustomModal>

      {/* Istalgan miqdor */}
      <CustomModal show={showAnyPayment} setShow={setShowAnyPayment}>
        <form onSubmit={handleSubmitAnyPayment} autoComplete="off">
          <Heading classList="!font-bold !text-[20px] !mb-[32px]" tag="h2">
            Har qanday miqdorda so‘ndirish
          </Heading>

          <label className="!mb-[215px] block">
            <span className="text-[13px] font-semibold mb-[8px]">Miqdorni kiriting *</span>
            <Input
              type="number"
              allowClear
              className="!bg-[#F6F6F6] !h-[44px]"
              size="large"
              name="amount"
              placeholder="To‘lov miqdori"
            />
          </label>

          <Button
            loading={anyPaymenPenning}
            className="!h-[42px] !font-medium !text-[14px] w-full"
            size="large"
            htmlType="submit"
            type="primary"
          >
            So‘ndirish
          </Button>
        </form>
      </CustomModal>

      {/* Bir nechta oyni tanlab to'lash */}
      <CustomModal show={showChooseDatePayment} setShow={setShowChooseDatePayment}>
        <Heading classList="!font-bold !text-[20px]" tag="h2">
          To‘lov muddatini tanlang
        </Heading>

        <div className="flex items-center justify-between mt-[22px] pb-[22px] border-b-[1px] border-[#ECECEC]">
          <div>
            <Text classList="!text-[14px] !font-medium">So‘ndirish:</Text>
            <Text classList="!text-[16px] !font-bold text-[#3478F7]">
              {addAmount(totolPay) || 0} so‘m
            </Text>
          </div>
          <button
            onClick={handlePayAll}
            className="text-[14px] font-bold text-[#3478F7] cursor-pointer hover:scale-[1.1] duration-300"
          >
            Hammasini tanlang
          </button>
        </div>

        <ul>
          {/* ✅ faqat to‘lanmagan oylar ro‘yxati ko‘rsatiladi */}
          {unpaidMonths.map((m) => (
            <AnyPaymentItem
              key={m}
              setTotalPay={setTotalPay}
              payAll={payAll}
              item={{
                id: String(m),
                month: m,
                amount: debtData?.monthly_amount ?? 0,
                date: dueDateOf(m),
              }}
              setPayMonth={setPayMonth}
              payMonth={payMonth}
            />
          ))}
        </ul>

        <Button
          loading={manyPaymenPenning}
          onClick={handleManyMonthClick}
          className="!h-[42px] !mt-[16px] !font-medium !text-[14px] w-full"
          size="large"
          htmlType="button"
          type="primary"
          disabled={!unpaidMonths.length}
        >
          So'ndirish
        </Button>
      </CustomModal>

     {showSuccess && <SuccessModal customerId={debtData?.customerId} />}

    </>
  );
};

export default DebtPayment;
