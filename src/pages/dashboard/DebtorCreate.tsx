// src/pages/dashboard/DebtorCreate.tsx
import { BackIcon } from "../../assets/icons";
import { useNavigate, useParams } from "react-router-dom";
import Heading from "../../components/Heading";
import { Button, Input } from "antd";
import UploadImage from "../../components/UploadImage";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../hooks/instance";

type Phone = { phone: string };
type Img = { image: string };

type SingleDebtorType = {
  id: string;
  fullname: string;
  address: string;
  note?: string | null;
  CustomerPhone: Phone[];
  CustomerImage: Img[];
};

const DebtorCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState<Array<string>>([]);
  const [phones, setPhones] = useState<Array<string>>([""]);
  const [addNote, setAddNote] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
  const [createName, setCreateName] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const queryClient = useQueryClient();
  const { data: debtor } = useQuery<SingleDebtorType>({
    queryKey: ["debtor", id],
    queryFn: () => instance.get(`/customer/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (id && debtor) {
      setCreateName(debtor.fullname || "");
      setAddress(debtor.address || "");
      setPhones(debtor.CustomerPhone?.length ? debtor.CustomerPhone.map((i) => i.phone) : [""]);
      setImages(debtor.CustomerImage?.length ? debtor.CustomerImage.map((i) => i.image) : []);
      if (debtor.note) {
        setAddNote(true);
        setNote(debtor.note || "");
      }
    }
  }, [id, debtor]);

  const { mutate: saveMutate, isPending } = useMutation({
    mutationFn: (payload: { fullname: string; address: string; note?: string; phones: string[]; images: string[] }) => {
      if (id) return instance.patch(`/customer/${id}`, payload);
      return instance.post("/customer", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
      queryClient.invalidateQueries({ queryKey: ["single-debtor"] });
      queryClient.invalidateQueries({ queryKey: ["debtor", id] });
      navigate(-1);
    },
  });

  function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload: { fullname: string; address: string; note?: string; phones: string[]; images: string[] } = {
      fullname: createName.trim(),
      address: address.trim(),
      phones: phones.map((p) => p.trim()).filter(Boolean),
      images: images.filter(Boolean),
    };
    if (note?.trim()) payload.note = note.trim();
    saveMutate(payload);
  }

  return (
    <div className="containers !mt-[34px]">
      <div className="w-[50%] flex justify-between items-center">
        <button className="cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <Heading classList="!text-[18px]" tag="h2">
          Mijoz {id ? "tahrirlash" : "yaratish"}
        </Heading>
      </div>

      <form onSubmit={handleCreate} className="mt-[24px]">
        <label>
          <Heading tag="h3" classList="!text-[13px] mb-[8px]">Ismi *</Heading>
          <Input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
            name="createName"
            className="!h-[44px] !bg-[#F6F6F6] !font-normal !text-[13px]"
            placeholder="Ismini kiriting"
          />
        </label>

        <div className="mt-[24px]">
          <Heading tag="h3" classList="!text-[13px]">Telefon raqami *</Heading>
          {phones.map((item, index) => (
            <Input
              required
              value={item}
              key={index}
              onChange={(e) => {
                const newPhones = [...phones];
                newPhones[index] = e.target.value;
                setPhones(newPhones);
              }}
              className="!h-[44px] !rounded-[8px] !my-[8px] !bg-[#F6F6F6] !font-normal !text-[13px]"
              placeholder="Telefon raqami"
            />
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPhones([...phones, ""])}
              className="text-[#3478F7] text-[14px] font-medium cursor-pointer"
            >
              + Ko‘proq qo‘shish
            </button>
          </div>
        </div>

        <div className="my-[24px]">
          <label>
            <Heading tag="h3" classList="!text-[13px]">Yashash manzili</Heading>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              name="address"
              className="!h-[44px] !rounded-[8px] !my-[8px] !bg-[#F6F6F6] !font-normal !text-[13px]"
              placeholder="Yashash manzilini kiriting"
            />
          </label>
        </div>

        {addNote ? (
          <label>
            <Heading tag="h3" classList="!text-[13px]">Eslatma</Heading>
            <Input.TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              name="note"
              className="!rounded-[8px] !my-[8px] !bg-[#F6F6F6] !font-normal !text-[13px]"
              placeholder="Eslatma kiriting"
            />
          </label>
        ) : (
          <Button onClick={() => setAddNote(true)} className="!w-full !h-[42px] !rounded-[8px]">
            Eslatma qo‘shish
          </Button>
        )}

        <div className="mt-[24px]">
          <p className="text-[13px] font-normal mb-[8px]">Rasm biriktirish</p>
          {/* UploadImage sizga /upload dan qaytgan URL yoki /uploads/.. ni qo‘shadi deb faraz qildim */}
          <UploadImage images={images} setImages={setImages} />
        </div>

        <Button
          disabled={!createName.trim() || !address.trim()}
          loading={isPending}
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

export default DebtorCreate;
