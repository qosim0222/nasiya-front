import { Link } from "react-router-dom"
import Heading from "../../components/Heading"
import { Button, Input } from "antd"
import { KeyIcon, LoginIcon } from "../../assets/icons"
import { useState } from "react"
import { useFormik } from "formik"
import { LoginSchema } from "../../validation/Login"
import { logo } from "../../assets/images"
import Text from "../../components/Text"
import {LoginService} from "../../service/Login"
import { useCookies } from "react-cookie"
import { Toaster } from "react-hot-toast"



const Login = () => {
  const [isPenning, setPenning] = useState(false)
  const [_, setCookie] = useCookies(["accessToken"])
  const { values, errors, handleBlur, handleChange, handleSubmit, touched } = useFormik({
    initialValues: { login: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: (data) => {
      setPenning(true)
      LoginService(data, setCookie, setPenning)
    }
  })

  return (
    <>
    <Toaster position="top-center"/>
    <div className="containers relative !pt-[90px] h-[100vh]">
      <img className="logo-icon mb-[32px]" src={logo} alt="Logo" width={40} height={40} />
      <Heading tag="h1" classList="!mb-[12px]">Dasturga kirish</Heading>
      <Text>Iltimos, tizimga kirish uchun login va parolingizni kiriting.</Text>
      <form onSubmit={handleSubmit} className="mt-[38px]" autoComplete="off">
        <label>
          <Input className={`${errors.login && touched.login ? "!border-red-500" : ""}`} value={values.login} onChange={handleChange} onBlur={handleBlur} prefix={<span className={`${errors.login && touched.login ? "!text-red-500" : ""}`}><LoginIcon /></span>} allowClear name="login" type="text" size="large" placeholder="Login" />
          {errors.login && touched.login && <span className="text-[13px] text-red-500">{errors.login}</span>}
        </label>
        <label>
          <Input.Password className={`${errors.password && touched.password ? "!border-red-500" : ""} mt-[24px]`} value={values.password} onChange={handleChange} onBlur={handleBlur} prefix={<span className={`${errors.password && touched.password ? "!text-red-500" : ""}`}><KeyIcon /></span>} allowClear name="password" type="password" size="large" placeholder="Parol" />
          {errors.password && touched.password && <span className="text-[13px] text-red-500">{errors.password}</span>}
        </label>
        <Link className="text-[13px] mb-[46px] text-[#3478F7] border-b-[1px] border-[#3478F7] w-[130px] ml-auto block text-end mt-[10px]" to={'#'}>Parolni unutdingizmi?</Link>
        <Button loading={isPenning} htmlType="submit" className={`w-full !h-[45px] !text-[18px] !font-medium" size="large ${isPenning ? "cursor-not-allowed" : ""}`} type="primary">Kirish</Button>
      </form>
      <Text classList="bottom-text absolute bottom-0 !font-normal !pb-[10px]">Hisobingiz yo'q bo'lsa, tizimga kirish huquqini olish uchun <span className="text-[#3478F7]">do'kon administratori</span>  bilan bog'laning.</Text>
    </div>
    </>
  )
}

export default Login