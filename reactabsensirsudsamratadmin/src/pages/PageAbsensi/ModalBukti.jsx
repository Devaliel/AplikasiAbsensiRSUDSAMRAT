import React, { useState, forwardRef, useEffect } from 'react';
import Popup from 'reactjs-popup';
import api from '../../config/axios';
import { HiOutlineX } from 'react-icons/hi';

const ModalBukti = forwardRef((props, ref) => {
  const { imageCheckIn, imageCheckOut, selectedData } = props;
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  console.log('selectedData', selectedData);

  console.log(imageCheckIn, imageCheckOut);

  const toggleCheckIn = () => {
    setIsCheckedIn(!isCheckedIn);
  };

  const closeModal = () => {
    ref.current.close();
  };

  const getImageToDisplay = () => {
    if (isCheckedIn) {
      return imageCheckIn;
    } else {
      return imageCheckOut;
    }
  };

  const imageToDisplay = getImageToDisplay();

  // convert "2023-09-24" to "Selasa, 1 Agustus 2023"
  const convertDate = (date) => {
    const dateArray = date.split('-');
    const year = dateArray[0];
    const month = dateArray[1];
    const day = dateArray[2];

    const monthName = getMonthName(month);
    const dayName = getDayName(year, month, day);

    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  const getMonthName = (month) => {
    const monthName = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Augustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ];

    return monthName[month - 1];
  };

  const getDayName = (year, month, day) => {
    const dayName = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu'
    ];

    const date = new Date(year, month - 1, day);
    const dayNumber = date.getDay();

    return dayName[dayNumber];
  };

  return (
    <Popup
      ref={ref}
      modal
      onClose={closeModal}
      contentStyle={{ borderRadius: '12px', padding: '0', width: '28rem' }}>
      {(close) => (
        <div className='relative p-6 overflow-hidden'>
          <div className='flex flex-col items-center gap-4 mt-4 mb-2'>
            <button
              className='absolute block cursor-pointer top-1 right-1'
              onClick={close}>
              <HiOutlineX className='text-2xl text-gray-500' />
            </button>
            <div className='flex gap-2 text-xl font-semibold'>
              <button
                className={`${isCheckedIn ? 'text-primary-2' : ''}`}
                onClick={toggleCheckIn}>
                Check in
              </button>
              <button
                className={` ${!isCheckedIn ? ' text-primary-2' : ''}`}
                onClick={toggleCheckIn}>
                Check out
              </button>
            </div>
            <div className='flex flex-col items-center'>
              <span>{selectedData && convertDate(selectedData.time)}</span>
              <span>{selectedData && selectedData.clockInTime}</span>
            </div>
            <span className='text-xl font-bold'>
              {selectedData && selectedData.name}
            </span>
            <div className='p-3 border-4 rounded-xl border-primary-2'>
              <img
                src={`data:image/png;base64,${imageToDisplay}`}
                alt='bukti'
                className='object-cover w-[314px] h-[489px] rounded-lg'
              />
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
});

export default ModalBukti;
