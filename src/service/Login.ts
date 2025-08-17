import toast from "react-hot-toast";
import instance from "../hooks/instance";
import type { Dispatch, SetStateAction } from "react";

export const LoginService = (
  data: { login: string; password: string },
  setCookies: any,
  setPenning: Dispatch<SetStateAction<boolean>>
) => {
  instance.post("/auth/login", { userName: data.login, password: data.password }).then((res) => {
    setCookies("accessToken", res.data?.accessToken || res.data?.data?.accessToken);
    setCookies("refreshToken", res.data?.refreshToken || res.data?.data?.refreshToken);
    location.pathname ="/"
  }).catch(err => {
    if(err.status == 400){
      toast.error("wrong login or password")
    }else{
      toast.error("something went wrong")
      
    }
  }).finally(() => {
    setPenning(false)
  })
};
