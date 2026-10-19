import { Routes } from "@angular/router";
import CalendarLayout from "./layout";

const routes: Routes = [
  // Calendar
  {
    path: "",
    component: CalendarLayout,
    children: [
      {
        path: "",
        loadComponent: () => import("./features/calendar/calendar"),
      },
    ],
  },
];

export default routes;
