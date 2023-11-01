import React from "react";
import { HiSearch, HiOutlineEye } from "react-icons/hi";
import DataTable from "react-data-table-component";
import ModalBukti from "./ModalBukti";
import { useState, useEffect } from "react";
import {
  api,
  // apiCheckToken
} from "../../config/axios";
import jsPDF from "jspdf";
// import { useDispatch } from 'react-redux';
// import { expiredToken } from '../../config/authState/authSlice';
import DropdownButton from "./DropdownAbsensi";

export default function PageAbsensi() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress]  = useState(0);
  // const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const modalBuktiRef = React.useRef();
  const [imgCheckIn, setImgCheckIn] = useState(null);
  const [imgCheckOut, setImgCheckOut] = useState(null);
  const [clockCheckIn, setClockCheckIn] = useState(null);
  const [clockCheckOut, setClockCheckOut] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  const columns = [
    // {
    //   name: 'No.',
    //   selector: (row) => row.employeeId,
    //   sortable: true,
    //   width: '75px'
    // },
    {
      name: "Nama",
      selector: (row) => row.name,
    },
    {
      name: "Waktu",
      selector: (row) => row.time,
    },
    {
      name: "Sif",
      selector: (row) => row.shift,
    },
    {
      name: "Kategori",
      selector: (row) => row.category,
    },
    {
      name: 'Waktu Datang - Waktu Pulang',
      selector: (row) => {
        if (row.clockInTime === null && row.clockOutTime === null) {
          return 'BELUM ABSEN';
        } else if (row.clockInTime === null && row.clockOutTime) {
          return `?? Absen Datang ??`
        } else if (row.clockInTime && row.clockOutTime === null) {
          return `${row.clockInTime} - Belum Absen Pulang`;
        } else {
          return `${row.clockInTime} - ${row.clockOutTime}`;
        }
      }
    },
    // {
    //   name: 'Waktu Datang - Waktu Pulang',
    //   selector: (row) => `${row.clockInTime}-${row.clockOutTime}`
    // },
    {
      name: 'Presensi',
      cell: (row) => (
        <div
          className={`w-3 rounded-full h-3   ${
            row.presence === 'Alpha'
              ? 'bg-red-600'
              : row.presence === 'OnTime'
              ? 'bg-green-600'
              : row.presence === 'Late'
              ? 'bg-[#ECE028]'
              : row.presence === 'blue'
              ? 'bg-blue-600'
              : 'bg-transparent'
          }`}
        />
      ),
    },
    {
      name: "Bukti",
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            setImgCheckIn(row.selfieCheckIn);
            setImgCheckOut(row.selfieCheckOut);
            setClockCheckIn(row.clockInTime);
            setClockCheckOut(row.clockOutTime);
            setSelectedData(row);
            modalBuktiRef.current.open();
            // setImage(row.selfieCheckIn);
          }}
          className="text-white btn btn-sm bg-primary-2 hover:bg-primary-3"
        >
          <HiOutlineEye />
        </button>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
      },
    },
  };

  const generatePDF = () => {
    let data = filteredAbsences.map((abs) => {
      return {
        name: abs?.name,
        waktu: abs?.time,
        sif: abs?.shift,
        kategori: abs?.category,
        presensi: abs?.presence,
      };
    });
    const doc = new jsPDF();
    doc.text('Jadwal Pegawai', 20, 10);
    doc.autoTable({
      theme: "grid",
      columns: pdfcolumns.map((col) => ({ ...col, dataKey: col.field })),
      body: data,
    });
    doc.save('table.pdf');
    console.log('Print',data);
  };

  const pdfcolumns = [
    { title: "Name", field: "name" },
    { title: "Waktu", field: "waktu" },
    { title: "Sif", field: "sif" },
    { title: "Kategori", field: "kategori" },
    { title: "Presensi", field: "presensi" },
  ];

  useEffect(() => {
    const fetchAbsences = async () => {
      // try {
      //   const response = await apiCheckToken.get('/ping');
      //   console.log(response.data);
      //   if (response.data) {
      setIsLoading(true)
      try {
        const response = await api.get(
          "/api/v1/dev/attendances/all-with-schedule"
        );
        const data = response.data;

        console.log("data", data);

        const ExtractData = data.map((attendance, index) => {
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
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            };
            return waktu.toLocaleTimeString("en-US", options);
          };
          const clockInTime = clockIn ? formatWaktu(clockIn) : null;
          const clockOutTime = clockOut ? formatWaktu(clockOut) : null;

          let statusPenilaian = 'Alpha'; // Default: Tidak ada data clock in atau clock out

          if (clockInTime && clockOutTime) {
            if (clockInTime <= shiftStartTime && clockOutTime >= shiftEndTime) {
              statusPenilaian = 'OnTime'; // Clock in sebelum start_time dan clock out setelah end_time
            } else if (clockInTime > shiftStartTime) {
              statusPenilaian = 'Late'; // Clock in setelah start_time
            }
          } else if (clockInTime) {
            if (clockInTime > shiftStartTime) {
              statusPenilaian = 'Late'; // Clock in setelah start_time
            }
          }

          const employeeNamesString = attendance.attendances
            .map((attendance) => attendance.employee.name)
            .join(", ")
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
            employeeId: attendance.attendances.map(
              (attendance) => attendance.employee.employeeId
            ),
            id: index,
            category: attendance.attendances.map(
              (attendance) => attendance.attendanceType
            ),
            name: employeeNamesString,
            time: attendance.scheduleDate,
            shift: attendance.shift.name,
            selfieCheckIn: selfieCheckIn,
            selfieCheckOut: selfieCheckOut,
          };
        });
        console.log("----------------------", ExtractData);

        setAbsences(ExtractData);
        setIsLoading(false)
        // Get the current date in 'yyyy-mm-dd' format
        const today = new Date().toISOString().slice(0, 10);

        // Filter ExtractData to include only absences with scheduleDate matching today
        const filteredExtractData = ExtractData.filter((attendance) => {
          return attendance.time === today;
        });

        setFilteredAbsences(filteredExtractData);
      } catch (error) {
        setIsLoading(false)
        console.log(error);
      }
      // try {
      //   const response = await apiCheckToken.get('/ping');
      //   console.log(response.data);
      //   if (response.data) {
      //   }
      // } catch (error) {
      //   console.log(error);
      //   dispatch(expiredToken());
      // }
    };
    //   } catch (error) {
    //     console.log(error);
    //     // dispatch(expiredToken());
    //   }
    // };

    fetchAbsences();
  }, []);

  useEffect(() => {
    if (searchTerm === "" && (startDate === "" || endDate === "")) {
      const results = absences.filter((abs) => {
        if (searchTerm === "") {
          return true;
        }
        return null;
      });
      setFilteredAbsences(results);
    } else if (searchTerm !== "") {
      const results = absences.filter((abs) => {
        console.log(abs, searchTerm);
        if (
          abs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          abs.employeeId.toString() === searchTerm
        ) {
          return abs;
        }
        return null;
      });
      setFilteredAbsences(results);
    } else if (searchTerm === "" && (startDate !== "" || endDate !== "")) {
      if (startDate > endDate) {
        alert("Tanggal awal tidak boleh lebih besar dari tanggal akhir");
        return;
      }
      const startDateFormatted = startDate.split("-").join("-");
      const endDateFormatted = endDate.split("-").join("-");

      console.log(startDateFormatted, endDateFormatted);

      if (startDateFormatted > endDateFormatted) {
        alert("Tanggal awal tidak boleh lebih besar dari tanggal akhir");
        return;
      }

      setFilteredAbsences(
        absences.filter((schedule) => {
          if (
            schedule.time >= startDateFormatted &&
            schedule.time <= endDateFormatted
          ) {
            return schedule;
          }
          return null;
        })
      );
    }
    if (searchTerm !== "" && (startDate !== "" || endDate !== "")) {
      console.log("filteredAbsences", filteredAbsences);
      if (startDate > endDate) {
        alert("Tanggal awal tidak boleh lebih besar dari tanggal akhir");
        return;
      }
      const startDateFormatted = startDate.split("-").join("-");
      const endDateFormatted = endDate.split("-").join("-");

      console.log(startDateFormatted, endDateFormatted);

      if (startDateFormatted > endDateFormatted) {
        alert("Tanggal awal tidak boleh lebih besar dari tanggal akhir");
        return;
      }

      setFilteredAbsences(
        absences.filter((schedule) => {
          if (
            schedule.time >= startDateFormatted &&
            schedule.time <= endDateFormatted &&
            schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return schedule;
          }
          return null;
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, startDate, endDate]);

  return (
    <div>
    {isLoading ? (
      <div className='flex justify-center items-center h-56'>
        <span className="loading loading-dots loading-lg"></span>
      </div>
    ) : (
      <div>
      <ModalBukti
        ref={modalBuktiRef}
        imageCheckIn={imgCheckIn}
        imageCheckOut={imgCheckOut}
        clockInTime={clockCheckIn}
        clockOutTime={clockCheckOut}
        selectedData={selectedData}
        onClose={() => modalBuktiRef.current.close()}
      />

      <h1 className="text-xl font-medium">Absensi</h1>
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-end gap-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-fit">
              Tanggal:
              <div className="flex items-center justify-center gap-2">
                {/* Aug 21, 2021 */}
                <input
                  type="date"
                  className="input input-bordered"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <span className=" mt-5">Sampai</span>
            <div className="w-fit">
              Tanggal:
              <div className="flex items-center justify-center gap-2">
                {/* Aug 21, 2021 */}
                <input
                  type="date"
                  className="input input-bordered"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DropdownButton filteredAbsences={filteredAbsences} />
        </div>
        {/* Search Bar */}
        <div className="relative flex items-center w-full">
          <HiSearch className="absolute left-0" />
          <input
            type="text"
            placeholder="Cari..."
            className="w-full pl-10 input input-bordered"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-500">
          {filteredAbsences.length} Absen
        </p>
        <div className="overflow-auto max-h-[60vh]">
          <DataTable
            columns={columns}
            data={filteredAbsences}
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
    )}
    </div>
  )
}
