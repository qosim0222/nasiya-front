import type { ReactNode } from "react";

export interface HeadingType {
    classList?:string,
    tag:"h1" | "h2" | "h3",
    children:ReactNode
}