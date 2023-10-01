import { apiCheckToken, apiLogin } from '../../config/axios';
import Cookies from 'js-cookie';
import React from 'react';
import { api } from '../../config/axios';
import ModalBukti from '../PageAbsensi/ModalBukti';
import { HiOutlineEye } from 'react-icons/hi';
import DataTable from 'react-data-table-component';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function PageDashboard() {
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [imgCheckIn, setImgCheckIn] = useState(null);
  const [imgCheckOut, setImgCheckOut] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const modalBuktiRef = React.useRef();

  const columns = [
    {
      name: 'Nama',
      selector: (row) => row.name
    },
    {
      name: 'Waktu',
      selector: (row) => row.time
    },
    {
      name: 'Sif',
      selector: (row) => row.shift
    },
    {
      name: 'Kategori',
      selector: (row) => row.category
    },
    {
      name: 'Presensi',
      cell: (row) => (
        <div
          className={`w-3 rounded-full h-3   ${
            row.presence === 'red'
              ? 'bg-red-600'
              : row.presence === 'green'
              ? 'bg-green-600'
              : row.presence === 'yellow'
              ? 'bg-yellow-600'
              : row.presence === 'blue'
              ? 'bg-blue-600'
              : 'bg-transparent'
          }`}
        />
      )
    },
    {
      name: 'Bukti',
      cell: (row) => (
        <button
          type='button'
          onClick={() => {
            setImgCheckIn(row.selfieCheckIn);
            setImgCheckOut(row.selfieCheckOut);
            setSelectedData(row);
            modalBuktiRef.current.open();
          }}
          className='btn btn-sm bg-primary-2 text-white hover:bg-primary-3'>
          <HiOutlineEye />
        </button>
      )
    }
  ];

  const customStyles = {
    rows: {
      style: {
        minHeight: '72px' // override the row height
      }
    },
    headCells: {
      style: {
        paddingLeft: '24px', // override the cell padding for head cells
        paddingRight: '8px',
        fontWeight: 'bold'
      }
    },
    cells: {
      style: {
        paddingLeft: '24px', // override the cell padding for data cells
        paddingRight: '8px'
      }
    }
  };

  useEffect(() => {
    const fetchAbsences = async () => {
      // try {
      //   const response = await apiCheckToken.get('/ping');
      //   console.log(response.data);
      //   if (response.data) {
      try {
        const response = await api.get(
          '/api/v1/dev/attendances/all-with-schedule'
        );
        const data = response.data;

        const ExtractData = data.map((attendance) => {
          const shiftStartTime = attendance.shift.start_time;
          const shiftEndTime = attendance.shift.end_time;

          const clockIn = attendance.attendances[0]?.clockIn
            ? new Date(attendance.attendances[0].clockIn)
            : null;
          const clockOut = attendance.attendances[0]?.clockOut
            ? new Date(attendance.attendances[0].clockOut)
            : null;

          const selfieCheckIn = attendance.attendances[0]?.selfieCheckIn
            ? attendance.attendances[0].selfieCheckIn
            : null;

          const selfieCheckOut = attendance.attendances[0]?.selfieCheckOut
            ? attendance.attendances[0].selfieCheckOut
            : null;

          const formatWaktu = (waktu) => {
            const options = {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            };
            return waktu.toLocaleTimeString('en-US', options);
          };
          const clockInTime = clockIn ? formatWaktu(clockIn) : null;
          const clockOutTime = clockOut ? formatWaktu(clockOut) : null;

          let statusPenilaian = 'red'; // Default: Tidak ada data clock in atau clock out

          if (clockInTime && clockOutTime) {
            if (clockInTime <= shiftStartTime && clockOutTime >= shiftEndTime) {
              statusPenilaian = 'green'; // Clock in sebelum start_time dan clock out setelah end_time
            } else if (clockInTime > shiftStartTime) {
              statusPenilaian = 'yellow'; // Clock in setelah start_time
            }
          } else if (clockInTime) {
            if (clockInTime > shiftStartTime) {
              statusPenilaian = 'yellow'; // Clock in setelah start_time
            }
          }

          const employeeNamesString = attendance.attendances
            .map((attendance) => attendance.employee.name)
            .join(', ')
            .replace(
              /\w\S*/g,
              (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );

          return {
            clockInTime: clockInTime,
            clockOutTime: clockOutTime,
            shiftStartTime: shiftStartTime,
            shiftEndTime: shiftEndTime,
            presence: statusPenilaian,
            id: attendance.scheduleId,
            category: attendance.attendances.map(
              (attendance) => attendance.attendanceType
            ),
            name: employeeNamesString,
            time: attendance.scheduleDate,
            shift: attendance.shift.name,
            selfieCheckIn: selfieCheckIn,
            selfieCheckOut: selfieCheckOut
          };
        });
        console.log('----------------------', ExtractData);

        setAbsences(ExtractData);
        setFilteredAbsences(ExtractData);
      } catch (error) {
        console.log(error);
      }
    };
    //   } catch (error) {
    //     console.log(error);
    //     // dispatch(expiredToken());
    //   }
    // };

    fetchAbsences();
  }, []);

  const exampleNotification = [
    {
      name: 'Tiger Nixon',
      text: 'Hello, how are you ?',
      time: '26/08/2023'
    },
    {
      name: 'Garrett Winters',
      text: 'Hello, Buddy',
      time: '26/08/2023'
    },
    {
      name: 'Ashton Cox',
      text: 'Hello, how are you guys',
      time: '26/08/2023'
    },
    {
      name: 'Cedric Kelly',
      text: 'Submitt your report now',
      time: '26/08/2023'
    }
  ];

  const dataEmployee = {
    totalEmployee: 321,
    totalTHL: 143,
    registeredTHL: 130
  };

  const labelChart = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const dataChart = [
    {
      Pegawai: 4000,
      Jumlah_total: 2400
    },
    {
      Pegawai: 3000,
      Jumlah_total: 1398
    },
    {
      Pegawai: 2000,
      Jumlah_total: 9800
    },
    {
      Pegawai: 2780,
      Jumlah_total: 3908
    },
    {
      Pegawai: 1890,
      Jumlah_total: 4800
    },
    {
      Pegawai: 2390,
      Jumlah_total: 3800
    }
  ];

  const formattedData = dataChart.map((item, index) => {
    return {
      ...item,
      name: labelChart[index]
    };
  });

  useEffect(() => {
    setAbsences(absences);
    setFilteredAbsences(absences);
  }, []);

  console.log(filteredAbsences);
  console.log(absences);

  return (
    <div className='flex flex-col mt-5'>
      <ModalBukti
        ref={modalBuktiRef}
        imageCheckIn={imgCheckIn}
        imageCheckOut={imgCheckOut}
        selectedData={selectedData}
        onClose={() => modalBuktiRef.current.close()}
      />
      <div className='flex flex-1 flex-row gap-8'>
        <div className='flex flex-col gap-4' style={{ flexBasis: '70%' }}>
          <div className='flex text-xl font-bold'>Dasbor</div>
          <div className='bg-white rounded-xl shadow-lg'>
            <GraphicLine data={formattedData} />
          </div>
        </div>
        <div
          className='flex flex-row gap-8 items-end'
          style={{ flexBasis: '30%' }}>
          <div
            className='flex flex-col gap-4 items-end'
            style={{ flexBasis: '10%' }}>
            {dataEmployee && (
              <EmployeeCard
                totalEmployee={dataEmployee.totalEmployee}
                totalTHL={dataEmployee.totalTHL}
                registeredTHL={dataEmployee.registeredTHL}
              />
            )}
          </div>
          <div className='flex flex-col gap-4' style={{ flexBasis: '20%' }}>
            <div className='flex text-xl font-bold'>Pemberitahuan</div>
            {exampleNotification.slice(0, 3).map((item, index) => (
              <NotificationCard
                key={index}
                name={item.name}
                message={item.text}
                date={item.time}
              />
            ))}
          </div>
        </div>
      </div>
      <div className='flex-1 mt-8'>
        <div className='flex relative w-full font-bold'>
          <p>Riwayat kehadiran pegawai</p>
        </div>
        <div>
          <DataTable
            columns={columns}
            data={filteredAbsences}
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
  );
}

export const NotificationCard = ({ name, message, date }) => {
  return (
    <div
      className='flex flex-col bg-white rounded-xl p-3 shadow-lg'
      style={{ width: '256px', height: 'auto' }}>
      <div className='pb-2'>
        <p>{name}</p>
        <p>{message}</p>
      </div>
      <div className='flex flex-row items-center gap-2 justify-end'>
        <p>{date}</p>
        <div className='w-3 rounded-full h-3 bg-primary-2' />
      </div>
    </div>
  );
};

export const EmployeeCard = ({ totalEmployee, totalTHL, registeredTHL }) => {
  return (
    <>
      <div
        className='flex flex-col bg-primary-2 rounded-xl p-4 shadow-lg justify-center items-center gap-2 text-white'
        style={{ width: '164px', height: 'auto' }}>
        <div className='pb-2'>
          <p>Jumlah Pegawai</p>
        </div>
        <div className='text-3xl'>
          <p>{totalEmployee}</p>
        </div>
      </div>
      <div
        className='flex flex-col bg-white rounded-xl p-4 shadow-lg justify-center items-center gap-2'
        style={{ width: '164px', height: 'auto' }}>
        <div className='pb-2'>
          <p>Total THL</p>
        </div>
        <div className='text-3xl'>
          <p>{totalTHL}</p>
        </div>
      </div>
      <div
        className='flex flex-col bg-white rounded-xl p-4 shadow-lg justify-center items-center gap-2'
        style={{ width: '164px', height: 'auto' }}>
        <div className='pb-2'>
          <p>THL Terdaftar</p>
        </div>
        <div className='text-3xl'>
          <p>{registeredTHL}</p>
        </div>
      </div>
    </>
  );
};

export const GraphicLine = ({ data }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <ResponsiveContainer width='100%' height={350}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20
          }}>
          <CartesianGrid strokeDasharray='5 5' />
          <XAxis dataKey='name' tick={{ fontSize: 12 }} />
          <YAxis yAxisId='left' tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#f0f0f0', border: 'none' }}
          />
          <Legend verticalAlign='top' height={36} />
          <Line
            yAxisId='left'
            type='monotone'
            dataKey='Pegawai'
            stroke='#26A69A'
            strokeWidth={2}
            dot={{ r: 2, fill: '#26A69A' }}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId='left'
            type='monotone'
            dataKey='Jumlah_total'
            stroke='#2bd9c8'
            strokeWidth={2}
            dot={{ r: 2, fill: '#2bd9c8' }}
            activeDot={{ r: 4 }}
            strokeDasharray='5 5'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
