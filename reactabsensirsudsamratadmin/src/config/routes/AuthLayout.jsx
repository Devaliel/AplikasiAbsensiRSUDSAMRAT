import { Link, useOutlet } from 'react-router-dom';
import logo from '../../assets/admin-logo.png';
import headerBg from '../../assets/header-bg.png';
import {
  HiOutlineHome,
  HiOutlineUserCircle,
  HiOutlineUser,
  HiOutlineInformationCircle,
  HiOutlineDocumentAdd,
  HiUser,
  HiLogout
} from 'react-icons/hi';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

export const AuthLayout = () => {
  const outlet = useOutlet();
  const [activeLink, setActiveLink] = useState('');
  const accessToken = Cookies.get('access_token');
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const tokenExpired = useSelector((state) => state.auth.tokenExpired);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!accessToken) {
      Cookies.remove('access_token');
      window.location.href = '/';
    }
    setActiveLink(window.location.pathname);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); 

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = {
      weekday: 'long', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
    };
    return date.toLocaleString(undefined, options);
  };

  const logOut = () => {
    Cookies.remove('access_token');
    window.location.href = '/';
  };

  const DateNow = () => {

  }

  return (
    <div className='flex flex-col items-stretch justify-start h-full overflow-hidden'>
      <div className='relative flex flex-row items-start justify-start h-full overflow-hidden'>
        {/* Left Side */}

        <div className='flex flex-col justify-start items-stretch h-screen overflow-hidden p-6 w-[15%] shadow-xl fixed left-0'>
          <img src={logo} alt='logo' className='mb-5' />
          <div className='flex flex-col gap-3 flex-2 text-slate-600'>
            <Link
              to='/dashboard'
              onClick={() => setActiveLink('/dashboard')}
              className={`flex items-center gap-3 text-lg ${
                activeLink === '/dashboard' ? 'text-primary-2' : ''
              }`}>
              <HiOutlineHome />
              Dasbor
            </Link>
            <Link
              to='/absensi'
              onClick={() => setActiveLink('/absensi')}
              className={`flex items-center gap-3 text-lg ${
                activeLink === '/absensi' ? 'text-primary-2' : ''
              }`}>
              <HiOutlineUserCircle />
              Absensi
            </Link>
            <Link
              to='/akun'
              onClick={() => setActiveLink('/akun')}
              className={`flex items-center gap-3 text-lg ${
                activeLink === '/akun' ? 'text-primary-2' : ''
              }`}>
              <HiOutlineUser />
              Akun
            </Link>
            <Link
              to='/pengumuman'
              onClick={() => setActiveLink('/pengumuman')}
              className={`flex items-center gap-3 text-lg ${
                activeLink === '/pengumuman' ? 'text-primary-2' : ''
              }`}>
              <HiOutlineInformationCircle />
              Pengumuman
            </Link>
            <Link
              to='/shift'
              onClick={() => setActiveLink('/shift')}
              className={`flex items-center gap-3 text-lg ${
                activeLink === '/shift' ? 'text-primary-2' : ''
              }`}>
              <HiOutlineDocumentAdd />
              Buat sif THL
            </Link>
            {accessToken && (
              <button
                onClick={logOut}
                className={`mt-3 flex items-center gap-3 text-lg text-red-500`}>
                <HiLogout />
                Keluar
              </button>
            )}
          </div>
        </div>
        {/* Right Side */}
        <div
          className={`h-full overflow-auto ${
            activeLink === '/login' ? 'w-full' : 'w-[85%]'
          } fixed right-0`}>
          {activeLink === '/login' ? null : (
            <div className='flex bg-black relative h-[158px] p-4 items-center'>
              <img
                src={headerBg}
                alt='header-bg'
                className='absolute top-0 left-0 z-0 w-full h-full overflow-hidden bg-cover'
              />
              <div className='z-10 text-2xl text-white'>
                <p>Admin Panel SIMFONI RSUD DR. SAMRATULANGI TONDANO </p>
                <p>{formatDate(currentDate)}</p>
              </div>
            </div>
          )}
          <div className='p-3'>{outlet}</div>
        </div>
      </div>
    </div>
  );
};
