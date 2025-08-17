import { useNavigate } from "react-router-dom";
import { BackIcon } from "../../assets/icons";
import Heading from "../../components/Heading";
import CustomCalendar from "../../components/CustomCalendar";
import { useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { getMonth } from "../../hooks/getMonth";
import { useQuery } from "@tanstack/react-query";
import instance from "../../hooks/instance";
import type { UnPaidType } from "../../@types/UnPaidType";
import { formatNumber } from "../../hooks/formatNum";

const Calendar = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<Dayjs>(dayjs());
  const { data } = useQuery({
    queryKey: ["calendar", current],
    queryFn: () =>
      instance
        .get("/debt/date", {
          params: {
            date: `${(current as any).$y}-${(current as any).$M + 1}-${
              (current as any).$D
            }`,
          },
        })
        .then((res) => res.data.data),
  });
  return (
    <>
      <div className="containers !pt-[34px]  !mb-[44px]">
        <div className="w-[50%] flex justify-between items-center mb-[36px]">
          <button className="cursor-pointer" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
          <Heading classList="!text-[18px]" tag="h2">
            Kalendar
          </Heading>
        </div>

        <CustomCalendar
          payment={data?.totalForMonth}
          current={current}
          setCurrent={setCurrent}
        />
      </div>
      <div className="bg-[#F6F6F6] w-full rounded-t-[16px] p-[16px]">
        <div className="containers">
          <Heading tag="h2" classList="mb-[8px]">
            {(current as any).$D} {getMonth((current as any).$M)} kuni{" "}
            {data?.unpaidForDay.length ? "to‘lov kutilmoqda" : "to‘lovlar yo'q"}
          </Heading>
          {data?.unpaidForDay?.map((item: UnPaidType) => (
            <div
              key={item.id}
              className="py-[14px] px-[16px] rounded-[16px] bg-white w-full !mt-[12px] space-y-[4px]"
            >
              <Heading tag="h3">{item.Debt.Debtor.name}</Heading>
              <p className="text-[14px] font-normal">
                UZS {formatNumber(item.amount || 0)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Calendar;
