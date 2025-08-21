// import DebtorCreate from "./DebtorCreate";
// import Settings from "./Settings";
// import { lazy } from "react";
// import Calendar from "./Calendar";
// import DebtCreate from "./DebtCreate";

// const Home = lazy(() => import("./Home"));
// const Debtors = lazy(() => import("./Debtors"));
// const SingleDebtor = lazy(() => import("./SingleDebtor"))
// const DebtPayment = lazy(() => import("./DebtPayment"));
// const Message = lazy(() => import("./report/Message"));
// const Notification = lazy(() => import("./report/Notification"));
// const HistoryPayment = lazy(() => import("./report/HistoryPayment"));
// const NotificationMessage = lazy(() => import("./report/NotificationMessage"));
// const NotificationMessageNotFound = lazy(() => import("./report/NotificationMessageNotfound"));
// export { Home, Debtors,  Settings, Calendar, DebtorCreate, SingleDebtor, DebtCreate, DebtPayment, Message, Notification, HistoryPayment, NotificationMessage, NotificationMessageNotFound };




import DebtorCreate from "./DebtorCreate";
import Settings from "./Settings";
import { lazy } from "react";
import Calendar from "./Calendar";
import DebtCreate from "./DebtCreate";

const Home = lazy(() => import("./Home"));
const Debtors = lazy(() => import("./Debtors"));
const SingleDebtor = lazy(() => import("./SingleDebtor"));
const DebtPayment = lazy(() => import("./DebtPayment"));
const Notification = lazy(() => import("./report/Notification"));
const NotificationMessage = lazy(() => import("./report/Message"));
const Samples = lazy(() => import("./report/Sample"));
const SampleForm = lazy(() => import("./report/SampleForm"));

export {
  Home, Debtors, Settings, Calendar, DebtorCreate, SingleDebtor, DebtCreate, DebtPayment,
  Notification, NotificationMessage, Samples, SampleForm
};
