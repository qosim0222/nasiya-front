// src/router/home-routes.tsx (yoki sizdagi fayl)
import NotificationMessage from "@/pages/dashboard/report/Message";
import {
  Calendar,
  DebtCreate,
  DebtorCreate,
  Debtors,
  Home,
  Settings,
  SingleDebtor,
  DebtPayment,   
} from "../pages/dashboard";
import SingleDebt from "../pages/dashboard/SingleDebt";
import NotFoundPage from "../pages/NotFoundPage";
import Notification from "@/pages/dashboard/report/Notification";

export const paths = {
  login: "/",
  home: "/",
  debtors: "/clients",
  pay: "/payments",
  set: "/settings",
  calendar: "/debt/date",
  debtor_create: "/debtor/create",
  debtor_update: "/debtor/update/:id",
  debt_create: "/debt/create/:id",
  single_debtor: "/debtor/:id",
  single_debt: "/debt/:id",
  payment_create: "/payment/create/:id",   

   notifications: "/notifications",
  notification_detail: "/notifications/:debtorId",
};
export const HomeRoutes = [
  { id: 1,  path: paths.home,           element: <Home /> },
  { id: 2,  path: paths.debtors,        element: <Debtors /> },
  { id: 4,  path: paths.set,            element: <Settings /> },
  { id: 5,  path: paths.calendar,       element: <Calendar /> },
  { id: 6,  path: paths.debtor_create,  element: <DebtorCreate /> },
  { id: 7,  path: paths.single_debtor,  element: <SingleDebtor /> },
  { id: 8,  path: paths.debt_create,    element: <DebtCreate /> },

  { id: 12, path: paths.notifications,       element: <Notification /> },
  { id: 13, path: paths.notification_detail, element: <NotificationMessage /> },

  { id: 9,  path: "*",                  element: <NotFoundPage /> },
  { id: 10, path: paths.debtor_update,  element: <DebtorCreate /> },
  { id: 11, path: paths.single_debt,    element: <SingleDebt /> },
  { id: 14, path: paths.payment_create, element: <DebtPayment /> },
];

