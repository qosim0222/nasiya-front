// src/components/AnyPaymentItem.tsx
import { Checkbox } from "antd";
import Text from "./Text";
import { useEffect, useState, type Dispatch, type FC, type SetStateAction } from "react";
import { formatNumber } from "../hooks/formatNum";

type PaymentItem = {
  id: string;
  month: number;
  amount: number;
  date: string;       // ISO
  isActive?: boolean; // ixtiyoriy
};

type Props = {
  setTotalPay: Dispatch<SetStateAction<number[]>>;
  payAll: boolean;
  payMonth: number[];
  item: PaymentItem;
  setPayMonth: Dispatch<SetStateAction<number[]>>;
};

const AnyPaymentItem: FC<Props> = ({ payAll, setPayMonth, item, setTotalPay }) => {
  const [check, setCheck] = useState<boolean>(false);

  function handleCheck() {
    setCheck((prev) => !prev);

    setPayMonth((prev) => {
      if (!check) return [...prev, item.month];
      return prev.filter((m) => m !== item.month);
    });

    setTotalPay((prev) => {
      if (!check) return [...prev, item.amount];
      const idx = prev.findIndex((v) => v === item.amount);
      if (idx > -1) {
        const clone = [...prev];
        clone.splice(idx, 1);
        return clone;
      }
      return prev;
    });
  }

  useEffect(() => {
    setCheck(payAll);
  }, [payAll]);

  return (
    <li
      onClick={handleCheck}
      className="py-[16px] cursor-pointer border-b-[1px] flex items-center justify-between border-[#ECECEC]"
    >
      <div>
        <Text classList="!font-medium !text-[12px]">{item.month}-oy</Text>
        <Text classList="!font-semibold !text-[14px]">{item.date?.split("T")[0]}</Text>
      </div>
      <div className="flex items-center gap-[12px]">
        <Text classList="!font-bold !text-[14px]">{formatNumber(item.amount)} so‘m</Text>
        <Checkbox checked={check} />
      </div>
    </li>
  );
};

export default AnyPaymentItem;
