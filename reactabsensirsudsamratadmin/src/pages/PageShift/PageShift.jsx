import React, { useState, useRef, useEffect } from "react";
import {
  HiSearch,
  HiOutlineTrash,
  HiChevronDown,
  HiOutlinePencil,
} from "react-icons/hi";
import DataTable from "react-data-table-component";
import ModalShift from "./ModalShift";
import { api } from "../../config/axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Popup from "reactjs-popup";
import { toast } from "react-toastify";

export default function PageShift() {
  const [reloadApi, setReloadApi] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [scheduleTime, setscheduleTime] = useState("Shift");
  const [isOpen, setIsOpen] = useState(false);
  const modalShiftRef = useRef(null);
  const modalLocRef = useRef(null);
  const [schedule, setSchedule] = useState([]);
  const [filteredSchedule, setFilteredSchedule] = useState([]);
  const [modalType, setModalType] = useState("location");
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(0);
  const dummyString = "null";
  const modalDelete = useRef(null);

  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    setscheduleTime(option);
    toggleDropdown();
  };

  const deleteSuccess = () =>
    toast("Schedule berhasil di hapus", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      theme: "light",
      progressStyle: { background: "green" },
    });

  const deleteFailed = () =>
    toast("Eror, schedule tidak berhasil dihapus", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      theme: "light",
      progressStyle: { background: "red" },
    });

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const columns = [
    {
      name: "ID",
      selector: (row) => row.scheduleId,
      width: "100px",
    },
    {
      name: "Date",
      selector: (row) => row.scheduleDate,
    },
    {
      name: "Shift",
      cell: (row) => row.shift.name,
    },
    {
      name: "Time",
      cell: (row) => `${row.shift.start_time} - ${row.shift.end_time}`,
    },
    // {
    //   name: "Location",
    //   cell: (row) => row.location ?? dummyString,
    // },
    {
      name: "Action",
      cell: (row) => (
        <div>
          <button
            type="button"
            className="mr-2 text-white btn btn-sm bg-primary-2 hover:bg-primary-3"
            onClick={() => {
              handleEdit(row);
            }}
          >
            <HiOutlinePencil />
          </button>
          <button
            type="button"
            className="text-white bg-red-600 btn btn-sm hover:bg-red-700"
            onClick={() => {
              setDeleteId(row.scheduleId);
              modalDelete.current.open();
            }}
          >
            <HiOutlineTrash />
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (schedule) => {
    setModalType("Edit");
    setSelectedSchedule(schedule);
    modalShiftRef.current.open();
  };

  const handleDelete = (id) => {
    api
      .delete(`/api/v1/dev/schedule/${id}`)
      .then((res) => {
        console.log(res.data);
        deleteSuccess();
        fetchData();
      })
      .catch((err) => {
        console.log(err);
        deleteFailed();
      });
    modalDelete.current.close();
  };

  const customStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
      },
    },
  };

  const fetchData = () => {
    api
      .get("/api/v1/dev/schedule")
      .then((res) => {
        setSchedule(res.data);
        setFilteredSchedule(res.data.reverse());
        console.log(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false)
      });
  };

  useEffect(() => {
    // Fetch data from API
    // api
    //   .get("/api/v1/dev/schedule")
    //   .then((res) => {
    //     setSchedule(res.data);
    //     setFilteredSchedule(res.data.reverse());
    //     console.log(res.data);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    fetchData();
  }, []);

  useEffect(() => {
    if (scheduleTime === "Shift") {
      setFilteredSchedule(schedule);
      return;
    }

    const results = schedule.filter((schedule) => {
      const startTime = schedule.shift.start_time;
      let shiftLabel = "";

      if (startTime === "08:00:00") {
        shiftLabel = "Pagi";
      } else if (startTime === "14:00:00") {
        shiftLabel = "Sore";
      } else if (startTime === "20:00:00") {
        shiftLabel = "Malam";
      }
      if (shiftLabel === scheduleTime) {
        return schedule;
      }
      return null;
    });
    setFilteredSchedule(results);
  }, [schedule, scheduleTime]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredSchedule(schedule);

      return;
    }
    const results = schedule.filter((schedule) => {
      if (schedule.scheduleId.toString() === searchTerm) {
        return schedule;
      }
    });
    setFilteredSchedule(results);
  }, [schedule, searchTerm]);

  useEffect(() => {
    if (startDate === null || endDate === null) {
      return;
    }

    const startDateFormatted = startDate.split("-").join("-");
    const endDateFormatted = endDate.split("-").join("-");

    console.log(startDateFormatted, endDateFormatted);

    if (startDateFormatted > endDateFormatted) {
      alert("Tanggal awal tidak boleh lebih besar dari tanggal akhir");
      return;
    }

    setFilteredSchedule(
      schedule.filter((schedule) => {
        if (
          schedule.scheduleDate >= startDateFormatted &&
          schedule.scheduleDate <= endDateFormatted
        ) {
          return schedule;
        }
        return null;
      })
    );
  }, [startDate, endDate, schedule]);

  return (
    <>
    {isLoading ? (
      <div className='flex justify-center items-center h-56'>
      <span className="loading loading-dots loading-lg"></span>
      </div>
    ) : (
      <div>
      <ModalShift
        ref={modalShiftRef}
        onClose={fetchData}
        schedule={schedule}
        type={modalType}
        data={selectedSchedule}
      />
      <Popup
        ref={modalDelete}
        modal
        contentStyle={{
          borderRadius: "12px",
          padding: "2rem",
          width: "25rem",
          height: "10rem",
        }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <h1>apakah anda yakin ingin menghapus schedule ini?</h1>
          <div className="flex gap-4">
            <button
              className=" btn bg-primary-2 w-28"
              onClick={() => {
                handleDelete(deleteId);
                fetchData();
              }}
            >
              Ya
            </button>
            <button
              className="bg-red-500 btn w-28"
              onClick={() => {
                modalDelete.current.close();
                // setDeleteId(null);
              }}
            >
              Tidak
            </button>
          </div>
        </div>
      </Popup>
      <h1 className="text-xl font-medium">Schedule</h1>
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div className="w-fit">
            Tanggal:
            <div className="flex items-center justify-center gap-2">
              <input
                type="date"
                className="input input-bordered"
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p>Sampai</p>
              <input
                type="date"
                className="input input-bordered"
                onChange={(e) => setEndDate(e.target.value)}
              />
              <div className="relative inline-block w-48 text-left">
                <button
                  type="button"
                  className="justify-between w-full h-12 bg-white border rounded-md shadow-sm dropdown-button btn text-primary-2 border-primary-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-2"
                  onClick={toggleDropdown}
                >
                  {scheduleTime}
                  <HiChevronDown />
                </button>
                {/*dropdown*/}

                <ul
                  className={`dropdown-content absolute z-10 ${
                    isOpen ? "block" : "hidden"
                  } w-full mt-1 p-2 bg-white border border-gray-300 rounded-md shadow-lg transition ease-in-out duration-200 transform ${
                    isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95"
                  }`}
                >
                  <li
                    className="block px-4 py-2 text-sm text-gray-700 rounded-md cursor-pointer hover:bg-slate-200"
                    onClick={() => handleOptionClick("Pagi")}
                  >
                    Pagi / Management
                  </li>
                  <li
                    className="block px-4 py-2 text-sm text-gray-700 rounded-md cursor-pointer hover:bg-slate-200"
                    onClick={() => handleOptionClick("Sore")}
                  >
                    Sore
                  </li>
                  <li
                    className="block px-4 py-2 text-sm text-gray-700 rounded-md cursor-pointer hover:bg-slate-200"
                    onClick={() => handleOptionClick("Malam")}
                  >
                    Malam
                  </li>
                </ul>
                {/*dropdown*/}
              </div>
            </div>
          </div>
          <details className="relative dropdown dropdown-bottom dropdown-end">
            <summary className="py-3 font-semibold text-white rounded-md btn bg-primary-2">
              Buat sif
              <HiChevronDown className="inline-block ml-2" />
            </summary>
            <ul className="absolute z-10 w-full gap-2 p-2 bg-white border rounded-md shadow-xl dropdown-content menu">
              <li>
                <button
                  onClick={() => {
                    modalShiftRef.current.open();
                    setModalType("Create");
                  }}
                >
                  Buat jadwal
                </button>
              </li>
              <li>
                <button onClick={() => navigate(`/shift/allschedule/`)}>
                  View All Employee Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    modalShiftRef.current.open();
                    setModalType("location");
                  }}
                >
                  Buat Lokasi
                </button>
              </li>
            </ul>
          </details>
        </div>
        {/* Search Bar */}
        <div className="relative flex items-center w-full">
          <HiSearch className="absolute left-4" />
          <input
            type="text"
            placeholder="Cari..."
            className="w-full pl-10 input input-bordered"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-500">{filteredSchedule.length} sif</p>
        <div className=" overflow-auto max-h-[60vh]">
          <DataTable
            columns={columns}
            data={filteredSchedule}
            highlightOnHover
            customStyles={customStyles}
            onRowClicked={(row) => navigate(`/shift/${row.scheduleId}`)}
          />
        </div>
      </div>
    </div>
    )}
  </>
  );
}
