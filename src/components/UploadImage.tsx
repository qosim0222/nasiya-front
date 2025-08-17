import React, {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Image, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { API } from "../hooks/getEnv";
import { UploadIcon } from "../assets/icons";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UploadImage: React.FC<{
  images: Array<string>;
  setImages: Dispatch<SetStateAction<Array<string>>>;
}> = ({ images, setImages }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({
    fileList: newFileList,
    file,
  }) => {
    setFileList(newFileList);
    if (file.status == "done") {
      setImages([...images, file.response.path]);
    }
    if (file.status === "removed") {
      const pathToRemove = file.response?.path || file.url;
      setImages((prev) =>
        prev.filter(
          (img) =>
            img !==
            (pathToRemove.split(API).length == 2
              ? pathToRemove.split(API)[1]
              : pathToRemove)
        )
      );
    }
  };

  useEffect(() => {
    if (images.length) {
      setFileList(
        images.map((img, index) => ({
          uid: String(index),
          name: `image-${index}.jpg`,
          status: "done",
          url: `${API}${img}`,
        }))
      );
    }
  }, [images]);

  const uploadButton = (
    <button type="button" className="flex flex-col items-center !w-full">
      <UploadIcon />
      <div style={{ marginTop: 8 }}>Rasm qo‘shish</div>
    </button>
  );
  return (
    <>
      <Upload
        action={`${API}/upload`}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default UploadImage;
