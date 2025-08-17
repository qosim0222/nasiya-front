import type { FC } from "react";
import type { HeadingType } from "../@types/HeadingType";

const Heading: FC<HeadingType> = ({ tag, children, classList }) => {
  return (
    <>
      {tag == "h1" && (
        <h1 className={`font-bold text-[24px] ${classList}`}>{children}</h1>
      )}
      {tag == "h2" && (
        <h2 className={`font-semibold text-[16px] ${classList}`}>{children}</h2>
      )}
      {tag == "h3" && (
        <h3 className={`font-semibold text-[14px] ${classList}`}>{children}</h3>
      )}
    </>
  );
};

export default Heading;
