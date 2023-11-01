import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import LoginPage from "./pages/PageLogin/PageLogin";
import PageDashboard from "./pages/PageDashboard/PageDashboard";
import { AuthLayout } from "./config/routes/AuthLayout";
import PageAbsensi from "./pages/PageAbsensi/PageAbsensi";
import PageAkun from "./pages/PageAkun/PageAkun";
import PagePengumuman from "./pages/PagePengumuman/PagePengumuman";
import PageShift from "./pages/PageShift/PageShift";
import PageEmployeeSchedule from "./pages/PageShift/PageEmployeeSchedule";
// import PageExampleClient from "./pages/PageExample/PageExample-Client";
import ViewAllSchedule from "./pages/PageShift/ViewAllSchedule";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LoginPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/dashboard" element={<PageDashboard />} />
        <Route path="/absensi" element={<PageAbsensi />} />
        <Route path="/akun" element={<PageAkun />} />
        <Route path="/pengumuman" element={<PagePengumuman />} />
        <Route path="/shift" element={<PageShift />} />
        <Route path="/shift/:scheduleId" element={<PageEmployeeSchedule />} />
        <Route path="/shift/allschedule" element={<ViewAllSchedule />} />
        {/* <Route path="/example" element={<PageExampleClient />} />
        <Route path="/example-client" element={<PageExampleClient />} /> */}
        <Route path="/shift/allschedule" element={<ViewAllSchedule />} />
      </Route>
    </>
  )
);
