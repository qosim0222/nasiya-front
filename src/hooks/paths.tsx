// // src/router/home-routes.tsx
// import {
//   Calendar,
//   DebtCreate,
//   DebtorCreate,
//   Debtors,
//   Home,
//   Settings,
//   SingleDebtor,
//   DebtPayment,
//   Notification,
//   NotificationMessage,
// } from "../pages/dashboard";
// import SingleDebt from "../pages/dashboard/SingleDebt";
// import NotFoundPage from "@/pages/NotFoundPage";
// import { Navigate } from "react-router-dom"; // ✅ redirect uchun

// export const paths = {
//   login: "/",
//   home: "/",
//   debtors: "/clients",
//   pay: "/payments",
//   set: "/settings",
//   calendar: "/debt/date",
//   debtor_create: "/debtor/create",
//   debtor_update: "/debtor/update/:id",
//   debt_create: "/debt/create/:id",
//   single_debtor: "/debtor/:id",
//   single_debt: "/debt/:id",
//   payment_create: "/payment/create/:id",

//   notifications: "/notifications",
//   notification_detail: "/notifications/:debtorId",
// };

// export const HomeRoutes = [
//   { id: 1,  path: paths.home,           element: <Home /> },
//   { id: 2,  path: paths.debtors,        element: <Debtors /> },
//   { id: 4,  path: paths.set,            element: <Settings /> },
//   { id: 5,  path: paths.calendar,       element: <Calendar /> },
//   { id: 6,  path: paths.debtor_create,  element: <DebtorCreate /> },
//   { id: 7,  path: paths.single_debtor,  element: <SingleDebtor /> },
//   { id: 8,  path: paths.debt_create,    element: <DebtCreate /> },

//   // ✅ /payments ni /notifications ga yo'naltiramiz
//   { id: 3,  path: paths.pay,            element: <Navigate to={paths.notifications} replace /> },

//   // Hisobot sahifalari
//   { id: 12, path: paths.notifications,       element: <Notification /> },
//   { id: 13, path: paths.notification_detail, element: <NotificationMessage /> },

//   { id: 9,  path: "*",                  element: <NotFoundPage /> },
//   { id: 10, path: paths.debtor_update,  element: <DebtorCreate /> },
//   { id: 11, path: paths.single_debt,    element: <SingleDebt /> },
//   { id: 14, path: paths.payment_create, element: <DebtPayment /> },
// ];




import Message from "@/pages/dashboard/report/Message";
import {
  Calendar,
  DebtCreate,
  DebtorCreate,
  Debtors,
  Home,
  Settings,
  SingleDebtor,
  DebtPayment,
  Notification,
  Samples,
  SampleForm,
} from "../pages/dashboard";
import SingleDebt from "../pages/dashboard/SingleDebt";
import NotFoundPage from "@/pages/NotFoundPage";
import { Navigate } from "react-router-dom";
import Personal from "@/pages/dashboard/Personal";

export const paths = {
  login: "/",
  home: "/",
  debtors: "/clients",
  pay: "/payments",
  set: "/settings",
   personal: "/settings/personal",
  calendar: "/debt/date",
  debtor_create: "/debtor/create",
  debtor_update: "/debtor/update/:id",
  debt_create: "/debt/create/:id",
  single_debtor: "/debtor/:id",
  single_debt: "/debt/:id",
  payment_create: "/payment/create/:id",

  notifications: "/notifications",

   message_detail: "/message/:id",              

  samples: "/samples",
  sample_create: "/samples/create",
  sample_edit: "/samples/edit/:id",
};

export const HomeRoutes = [
  { id: 1,  path: paths.home,           element: <Home /> },
  { id: 2,  path: paths.debtors,        element: <Debtors /> },
  { id: 3,  path: paths.pay,            element: <Navigate to={paths.notifications} replace /> },
  { id: 4,  path: paths.set,            element: <Settings /> },
  { id: 5,  path: paths.calendar,       element: <Calendar /> },
  { id: 6,  path: paths.debtor_create,  element: <DebtorCreate /> },
  { id: 7,  path: paths.single_debtor,  element: <SingleDebtor /> },
  { id: 8,  path: paths.debt_create,    element: <DebtCreate /> },

  
  { id: 9,  path: paths.notifications,       element: <Notification /> },
  { id: 10, path: paths.message_detail, element: <Message /> },

  
  { id: 11, path: paths.samples,       element: <Samples /> },
  { id: 12, path: paths.sample_create, element: <SampleForm /> },
  { id: 13, path: paths.sample_edit,   element: <SampleForm /> },

  { id: 14, path: paths.debtor_update,  element: <DebtorCreate /> },
  { id: 15, path: paths.single_debt,    element: <SingleDebt /> },
  { id: 16, path: paths.payment_create, element: <DebtPayment /> },

  { id: 20, path: paths.personal, element: <Personal /> },

  { id: 99, path: "*", element: <NotFoundPage /> },
];

