// src/pages/dashboard/Debtors.tsx
import { Button, Input, Popover, Select, Skeleton } from "antd";
import {
  ActiveStarIcon,
  DebtorCreateIcon,
  MoreIcon,
  SearchIcon,
  StarIcon,
} from "../../assets/icons";
import Heading from "../../components/Heading";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../hooks/instance";
import type { DebtorAllType } from "../../@types/DebtorAllType";
import { formatNumber } from "../../hooks/formatNum";
import useDebounce from "../../hooks/useDebounce";
import { paths } from "../../hooks/paths";
import { useNavigate } from "react-router-dom";

const Debtors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const queryClient = useQueryClient();

  const [sortBy, setSortBy] = useState<"createdAt" | "fullname">("createdAt");
  const [open, setOpen] = useState(false);
  const [paramData, setParamData] = useState<{
    sortOrder: "asc" | "desc";
    sortBy: "createdAt" | "fullname";
  }>({ sortOrder: "asc", sortBy: "createdAt" });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const sortOrder = (form.hi as RadioNodeList).value as "asc" | "desc";
    setParamData({ sortBy, sortOrder });
    setOpen(false);
  }

  const debounced = useDebounce(search, 1000);

  const { mutate: starMutate } = useMutation({
    mutationFn: (id: string) => instance.patch(`/customer/star/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
    },
  });

  const handleOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const { data, isLoading } = useQuery<Array<DebtorAllType>>({
    queryKey: ["debtors", debounced, paramData],
    queryFn: () =>
      instance
        .get(`/customer`, {
          params: {
            search: debounced,
            sortBy: paramData.sortBy,
            sortOrder: paramData.sortOrder,
          },
        })
        .then((res) => res.data.data),
  });

  const items = (
    <div className="w-[180px]">
      <form onSubmit={handleSubmit} name="hi" className="p-[5px] font-semibold">
        <Select
          className="w-full !mb-[20px] !font-semibold"
          value={sortBy}
          onChange={(value) => setSortBy(value)}
          options={[
            { value: "createdAt", label: "Created at" },
            { value: "fullname", label: "Name" },
          ]}
        />
        <div className="flex w-[90%] mx-auto justify-between">
          <div className="flex items-center gap-2">
            <input type="radio" name="hi" value="asc" defaultChecked />
            <label>A-Z</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="radio" name="hi" value="desc" />
            <label>Z-A</label>
          </div>
        </div>
        <Button type="primary" className="w-full mt-[20px]" htmlType="submit">
          Filter
        </Button>
      </form>
    </div>
  );

  return (
    <div className="containers">
      <div className="sticky top-[0] !p-[14.5px] gap-[15px] flex bg-white">
        <Input
          className="!bg-[#F6F6F6] !py-[12px] !px-[16px] !rounded-[12px] !text-[16px] !font-medium"
          placeholder="Mijozlarni qidirish..."
          prefix={<SearchIcon />}
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Popover
          placement="bottomRight"
          content={items}
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}
        >
          <button className="cursor-pointer">
            <MoreIcon />
          </button>
        </Popover>
      </div>

      {isLoading ? (
        <div className="space-y-[16px] mt-[28px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton.Node
              key={i}
              active
              className="!w-full !h-[143px] !rounded-[16px]"
            />
          ))}
        </div>
      ) : (
        <div className="overflow-y-auto space-y-[16px] mt-[28px]">
          {data?.map((item) => {
            // ✅ QOLGAN QARZ: har bir Debt uchun (total_amount - paid_amount)
            const remainingDebt = (item.Debt ?? []).reduce((sum, d) => {
              const total = d.total_amount || 0;
              const paid = typeof d.paid_amount === "number" ? d.paid_amount : 0;
              return sum + Math.max(0, total - paid);
            }, 0);

            return (
              <div
                onClick={() => navigate(`/debtor/${item.id}`)}
                key={item.id}
                className="rounded-[16px] border-[1px] border-[#ECECEC] bg-[#F6F6F6] p-[16px] w-full h-[143px] flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-[4px]">
                    <Heading tag="h2">{item.fullname}</Heading>
                    <p className="font-medium text-[14px] text-[#1A1A1A]">
                      {item?.CustomerPhone?.[0]?.phone || "Unknown"}
                    </p>
                  </div>
                  <div
                    className="cursor-pointer hover:scale-[1.2] duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      starMutate(item.id);
                    }}
                  >
                    {item.star ? <ActiveStarIcon /> : <StarIcon />}
                  </div>
                </div>

                <div className="space-y-[4px]">
                  <p className="font-medium text-[12px] text-[#1A1A1A]">
                    Jami nasiya 
                  </p>
                  <Heading tag="h2" classList="text-[#F94D4D]">
                    {formatNumber(remainingDebt)} so‘m
                  </Heading>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-[80px] left-[calc(50%+45px)] z-50">
        <Button
          onClick={() => navigate(paths.debtor_create)}
          type="primary"
          className="!w-[140px] !h-[48px] !rounded-[10px] !text-[16px] !font-medium"
        >
          <DebtorCreateIcon /> Yaratish
        </Button>
      </div>
    </div>
  );
};

export default Debtors;
