import DebtorCreate from "./DebtorCreate";
import Settings from "./Settings";
import { lazy } from "react";
import Calendar from "./Calendar";
import DebtCreate from "./DebtCreate";

const Home = lazy(() => import("./Home"));
const Debtors = lazy(() => import("./Debtors"));
const SingleDebtor = lazy(() => import("./SingleDebtor"))
const DebtPayment = lazy(() => import("./DebtPayment"));
const Message = lazy(() => import("./report/Message"));
const Notification = lazy(() => import("./report/Notification"));

export { Home, Debtors,  Settings, Calendar, DebtorCreate, SingleDebtor, DebtCreate, DebtPayment, Message, Notification };
