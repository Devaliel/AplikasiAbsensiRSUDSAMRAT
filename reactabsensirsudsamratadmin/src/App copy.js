import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  Navigate,
} from "react-router-dom";
import PageDashboard from "./pages/PageDashboard/PageDashboard";
import PageAbsensi from "./pages/PageAbsensi/PageAbsensi";
import logo from "./assets/admin-logo.png";
import headerBg from "./assets/header-bg.png";
import {
  HiOutlineHome,
  HiOutlineUserCircle,
  HiOutlineUser,
  HiOutlineInformationCircle,
  HiOutlineDocumentAdd,
  HiUser,
} from "react-icons/hi";
import PageAkun from "./pages/PageAkun/PageAkun";
import PagePengumuman from "./pages/PagePengumuman/PagePengumuman";
import LoginPage from "./pages/PageLogin/PageLogin";
import PageShift from "./pages/PageShift/PageShift";
import PageEmployeeSchedule from "./pages/PageShift/PageEmployeeSchedule";
import PageExampleClient from "./pages/PageExample/PageExample-Client";
import PageExample from "./pages/PageExample/PageExample";
import ViewAllSchedule from "./pages/PageShift/ViewAllSchedule";
import PrivateRoute from "./config/PrivateRoute";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

export default function App() {
  // make active link
  const [activeLink, setActiveLink] = React.useState("");
  const accessToken = Cookies.get("access_token");
  const tokenExpired = useSelector((state) => state.auth.tokenExpired);

  React.useEffect(() => {
    setActiveLink(window.location.pathname);
  }, [activeLink]);

  const logOut = () => {
    Cookies.remove("access_token");
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="flex flex-col items-stretch justify-start h-full overflow-hidden">
        <div className="relative flex flex-row items-start justify-start h-full overflow-hidden">
          {/* Left Side */}
          {activeLink === "/login" ? null : (
            <div className="flex flex-col justify-start items-stretch h-screen overflow-hidden p-6 w-[15%] shadow-xl fixed left-0">
              <img src={logo} alt="logo" className="mb-5" />
              <div className="flex flex-col gap-3 flex-2 text-slate-600">
                <Link
                  to="/"
                  onClick={() => setActiveLink("/")}
                  className={`flex items-center gap-3 text-lg ${
                    activeLink === "/" ? "text-primary-2" : ""
                  }`}
                >
                  <HiOutlineHome />
                  Dasbor
                </Link>
                <Link
                  to="/absensi"
                  onClick={() => setActiveLink("/absensi")}
                  className={`flex items-center gap-3 text-lg ${
                    activeLink === "/absensi" ? "text-primary-2" : ""
                  }`}
                >
                  <HiOutlineUserCircle />
                  Absensi
                </Link>
                <Link
                  to="/akun"
                  onClick={() => setActiveLink("/akun")}
                  className={`flex items-center gap-3 text-lg ${
                    activeLink === "/akun" ? "text-primary-2" : ""
                  }`}
                >
                  <HiOutlineUser />
                  Akun
                </Link>
                <Link
                  to="/pengumuman"
                  onClick={() => setActiveLink("/pengumuman")}
                  className={`flex items-center gap-3 text-lg ${
                    activeLink === "/pengumuman" ? "text-primary-2" : ""
                  }`}
                >
                  <HiOutlineInformationCircle />
                  Pengumuman
                </Link>
                <Link
                  to="/shift"
                  onClick={() => setActiveLink("/shift")}
                  className={`flex items-center gap-3 text-lg ${
                    activeLink === "/shift" ? "text-primary-2" : ""
                  }`}
                >
                  <HiOutlineDocumentAdd />
                  Buat sif THL
                </Link>
                {accessToken && (
                  <button
                    onClick={logOut}
                    className={`flex items-center gap-3 text-lg ${
                      activeLink === "/login" ? "text-primary-2" : ""
                    }`}
                  >
                    <HiUser />
                    LogOut
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Right Side */}
          <div
            className={`h-full overflow-auto ${
              activeLink === "/login" ? "w-full" : "w-[85%]"
            } fixed right-0`}
          >
            {activeLink === "/login" ? null : (
              <div className="flex bg-black relative h-[158px] p-4 items-center">
                <img
                  src={headerBg}
                  alt="header-bg"
                  className="absolute top-0 left-0 z-0 w-full h-full overflow-hidden bg-cover"
                />
                <div className="z-10 text-2xl text-white">
                  <p>Hello, John</p>
                  <p>Selasa, 1 Agustus 2023</p>
                </div>
              </div>
            )}
            <div className="p-3">
              <Routes>
                {tokenExpired && (
                  <>
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                      path="/"
                      element={<PrivateRoute element={<PageDashboard />} />}
                    />
                    <Route
                      path="/absensi"
                      element={<PrivateRoute element={<PageAbsensi />} />}
                    />
                    <Route
                      path="/akun"
                      element={<PrivateRoute element={<PageAkun />} />}
                    />
                    <Route
                      path="/pengumuman"
                      element={<PrivateRoute element={<PagePengumuman />} />}
                    />
                    <Route
                      path="/shift"
                      element={<PrivateRoute element={<PageShift />} />}
                    />
                    <Route
                      path="/shift/:scheduleId"
                      element={
                        <PrivateRoute element={<PageEmployeeSchedule />} />
                      }
                    />

                    <Route
                      path="/example"
                      element={<PrivateRoute element={<PageExample />} />}
                    />
                    <Route
                      path="/example-client"
                      element={<PrivateRoute element={<PageExampleClient />} />}
                    />
                    <Route
                      path="/shift/allschedule"
                      element={<PrivateRoute element={<ViewAllSchedule />} />}
                    />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}
