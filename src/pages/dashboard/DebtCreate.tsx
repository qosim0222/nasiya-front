import { BackIcon, CalendarIcon } from "../../assets/icons";
import { useNavigate, useParams } from "react-router-dom";
import Heading from "../../components/Heading";
import {
  Button,
  DatePicker,
  Divider,
  Input,
  Select,
  type DatePickerProps,
} from "antd";
import { useState, type FormEvent } from "react";
import dayjs from "dayjs";
import UploadImage from "../../components/UploadImage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../hooks/instance";

const DebtCreate = () => {
  const { id } = useParams(); // customerId
  const navigate = useNavigate();
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [productName, setProductName] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isToday, setIsToday] = useState(false);
  const [addNote, setAddNote] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const options = Array.from({ length: 24 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} oy`,
  }));

  const onChange: DatePickerProps["onChange"] = (value) => {
    setDate(value);
    setIsToday(value && dayjs().isSame(value, "day"));
  };

  const handleTodayCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsToday(checked);
    setDate(checked ? dayjs() : null);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => instance.post("/debt", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["single-debtor"] });
      navigate(-1);
    },
    onError: (err) => console.log(err),
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const monthly = term ? Math.floor(+amount / +term) : undefined;

    const data: any = {
      customerId: id, // majburiy
      productName,
      total_amount: +amount,
      monthly_amount: monthly,
      deadline_months: +term,
      startDate: date ? date.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") : undefined,
      note: note || undefined,
      images,
    };

    mutate(data);
  }

  return (
    <div className="containers !mt-[29px]">
      <div className="w-[50%] flex justify-between items-center">
        <button className="cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <Heading classList="!text-[18px]" tag="h2">
          Nasiya yaratish
        </Heading>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-[24px] flex flex-col gap-[24px]"
      >
        <label>
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">
            Mahsulot nomi *
          </Heading>
          <Input
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px]"
            placeholder="Ismini kiriting"
          />
        </label>

        <label>
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">
            Sana
          </Heading>
          <div className="flex items-center justify-between">
            <DatePicker
              suffixIcon={<CalendarIcon />}
              value={date}
              onChange={onChange}
              className="!h-[44px] !w-[66%] !bg-[#F6F6F6] !rounded-[8px]"
            />
            <div className="flex gap-[12px]">
              <input
                checked={isToday}
                className="!w-[20px] !h-[20px]"
                type="checkbox"
                onChange={handleTodayCheck}
              />
              <p className="font-medium text-[14px]">Bugun</p>
            </div>
          </div>
        </label>

        <label>
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">
            Muddat
          </Heading>
          <Select
            showSearch
            placeholder="Qarz muddatini tanlang"
            styles={{ popup: { root: { maxWidth: 172, maxHeight: 292 } } }}
            placement="bottomRight"
            className="!w-full !h-[44px] [&_.ant-select-selector]:!rounded-[8px] [&_.ant-select-selector]:!bg-[#F6F6F6]"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            value={term}
            onChange={(e) => setTerm(e)}
            options={options}
            popupRender={(menu) => (
              <>
                <div
                  style={{
                    padding: "8px 12px",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "#555",
                  }}
                >
                  Oyni tanlang
                </div>
                <Divider style={{ margin: 0 }} />
                {menu}
              </>
            )}
          />
        </label>

        <label>
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">
            Mahsulot narxi *
          </Heading>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            type="number"
            min={0}
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px]"
            placeholder="Narxini kiriting"
          />
        </label>

        <label>
          {addNote ? (
            <label>
              <Heading tag="h3" classList="!text-[13px]">
                Eslatma
              </Heading>
              <Input.TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                name="note"
                className="!rounded-[8px] !my-[8px] !bg-[#F6F6F6] !font-normal !text-[13px]"
                placeholder="Eslatma kiriting"
              />
            </label>
          ) : (
            <Button
              onClick={() => setAddNote(true)}
              className="!w-full !h-[42px] !rounded-[8px]"
            >
              Izoh qo‘shish
            </Button>
          )}
        </label>

        <div>
          <p className="text-[13px] font-normal mb-[8px]">Rasm biriktirish</p>
          <UploadImage images={images} setImages={setImages} />
        </div>

        <Button
          loading={isPending}
          disabled={!amount || !productName || !term}
          type="primary"
          className="!w-full !h-[49px] !rounded-[10px] mt-[50px]"
          htmlType="submit"
        >
          Saqlash
        </Button>
      </form>
    </div>
  );
};

export default DebtCreate;
