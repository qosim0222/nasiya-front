import type { FC } from "react"
import type { TextType } from "../@types/TextType"

const Text:FC<TextType> = ({classList, children}) => {
  return (
    <p className={`${classList} font-medium text-[16px]`}>{children}</p>
  )
}

export default Text