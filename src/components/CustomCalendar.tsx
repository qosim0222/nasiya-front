import {  type Dispatch, type SetStateAction } from "react";
import  { Dayjs } from "dayjs";
import "dayjs/locale/uz-latn";
import { Button, Calendar } from "antd";
import { ArrowIcon } from "../assets/icons";
import Heading from "./Heading";
import { formatNumber } from "../hooks/formatNum";
import { getMonth } from "../hooks/getMonth";

const CustomCalendar = ({ payment, current, setCurrent }: { payment?: number,  current:Dayjs , setCurrent: Dispatch<SetStateAction<Dayjs>> }) => {

  const headerRender = () => {
    const year = current.year();
    return (
      <>
        <div className="flex justify-between items-center">
          <Heading tag="h2">
            {getMonth((current as any).$M)}, {year}
          </Heading>
          <div className="flex gap-[10px] mb-[16px]">
            <Button
              className="!w-[40px] !h-[40px] !p-0 !bg-[#F5F5F5] !rounded-[12px]"
              onClick={() => setCurrent(current.subtract(1, "month"))}
            >
              <ArrowIcon />
            </Button>
            <Button
              className="!w-[40px] !h-[40px] !p-0 !bg-[#F5F5F5] !rounded-[12px]"
              onClick={() => setCurrent(current.add(1, "month"))}
            >
              <ArrowIcon right />
            </Button>
          </div>
        </div>
        <div className="mb-[20px] flex justify-between items-center">
          <Heading tag="h3">Oylik jami:</Heading>
          <Heading tag="h2" classList="text-[18px] font-extraBold">{formatNumber(payment || 0)} <span className="text-[14px] font-semibold">so‘m</span></Heading>
        </div>
      </>
    );
  };

  return (
    <div className="w-full">
      {headerRender()}
      <Calendar
        fullscreen={false}
        value={current}
        onSelect={(val) => setCurrent(val)}
        headerRender={() => null}
      />
    </div>
  );
};

export default CustomCalendar;
