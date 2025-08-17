import { Route, Routes } from "react-router-dom"
import { paths } from "../../hooks/paths"
import Login from "../../pages/auth/Login"
import NotFoundPage from "../../pages/NotFoundPage"

const AuthRoutes = () => {
  return (
    <Routes><Route path={paths.login} element={<Login/>}/><Route path={'*'} element={<NotFoundPage/>}/></Routes>
  )
}

export default AuthRoutes