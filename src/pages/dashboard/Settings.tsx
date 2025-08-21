// src/pages/settings/Settings.tsx
import { useCookies } from "react-cookie";
import { useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LogoutIcon } from "@/assets/images";
import instance from "@/hooks/instance";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import CustomModal from "@/components/CustomModal";
import { ArrowIcon } from "@/assets/icons";

const Settings = () => {
  const [, , removeCookie] = useCookies(["accessToken", "refreshToken"]);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const settingsList = [
    {
      id: 1,
      heading: "Asosiy",
      children: [
        { id: 2, title: "Shaxsiy ma’lumotlar" },
        { id: 3, title: "Xavfsizlik" },
      ],
    },
    {
      id: 4,
      heading: "Boshqa",
      children: [
        { id: 5, title: "Yordam" },
        { id: 6, title: "Taklif va shikoyatlar" },
        { id: 7, title: "Dastur haqida" },
        { id: 8, title: "Ommaviy oferta" },
        { id: 9, title: "Maxfiylik siyosati" },
      ],
    },
    { id: 10, heading: "Chiqish", children: [] },
  ];

  // <- logout (o'zingizning endpoint bilan qoldirdim)
  const { mutate: logOut, isPending } = useMutation({
    mutationFn: () => instance.post("/seller/logout"),
    onSuccess: () => {
      navigate("/");
      removeCookie("accessToken");
      removeCookie("refreshToken");
    },
  });

  // ✅ qaysi band bosilganiga qarab yo'naltirish
  function handleRowClick(title: string) {
    if (title === "Shaxsiy ma’lumotlar") {
      navigate("/settings/personal");          // <-- Personal sahifangiz
    } else if (title === "Xavfsizlik") {
      navigate("/settings/security");          // (ixtiyoriy)
    }
    // qolganlarini ham xohlasangiz shu yerda qo‘shib ketasiz
  }

  return (
    <>
      <div className="containers !mt-[30px]">
        <div className="pb-[16px] border-b-[1px] border-[#ECECEC]">
          <Heading tag="h2" classList="!font-semibold !text-[20px]">
            Sozlamalar
          </Heading>
        </div>

        <div>
          {settingsList.map((group) => (
            <div className="cursor-pointer" key={group.id}>
              <div onClick={() => group.heading === "Chiqish" && setOpenModal(true)}>
                <Heading
                  classList={`!font-medium !mt-[28px] !mb-[2px] !text-[16px] ${
                    group.heading === "Chiqish" ? "text-[#F94D4D]" : "!text-[#3478F7]"
                  }`}
                  tag="h3"
                >
                  {group.heading}
                </Heading>
              </div>

              <ul>
                {group.children.length > 0 &&
                  group.children.map((row) => (
                    <div
                      key={row.id}
                      onClick={() => handleRowClick(row.title)}  // <-- qo‘shildi
                      className="py-[18px] border-b-[1px] border-[#ECECEC] flex items-center justify-between"
                    >
                      <Text classList="!font-medium !text-[16px]">{row.title}</Text>
                      <ArrowIcon classList="rotate-[180deg] payment-debt" />
                    </div>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <CustomModal show={openModal} setShow={setOpenModal}>
        <div className="text-center w-full">
          <img className="mx-auto mb-[16px]" src={LogoutIcon} alt="LogOut Img" width={60} height={60} />
          <Heading classList="!font-bold !text-[18px]" tag="h2">
            Hisobdan chiqish
          </Heading>
          <Text classList="!font-normal !text-[14px] mb-[49px]">
            Siz haqiqatan hisobdan chiqmoqchimisiz?
          </Text>
          <div className="flex items-center justify-between">
            <Button
              loading={isPending}
              onClick={() => logOut()}
              type="default"
              size="large"
              className="!h-[42px] !text-[14px] !font-bold !text-[#3478F7] !w-[48%] flex items-center justify-center"
            >
              Ha, chiqish
            </Button>
            <Button
              onClick={() => setOpenModal(false)}
              type="primary"
              size="large"
              className="!h-[42px] !text-[14px] !font-bold !w-[48%] flex items-center !bg-[#F94D4D] justify-center"
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default Settings;
