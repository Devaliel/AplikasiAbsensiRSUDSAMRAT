import React, { useState, useEffect, useRef } from "react";
import { api, apiCheckToken } from "../../config/axios";
import "react-toastify/dist/ReactToastify.css";

import { toast } from "react-toastify";

import bgModal from "../../assets/modal-bg.png";
import { HiUpload, HiEye, HiEyeOff, HiX, HiChevronDown } from "react-icons/hi";
import axios from "axios";

const ModalAbsen = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  // const [data, setData] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [reloadApi, setReloadApi] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [dropdownEmpIsOpen, setDropdownEmpIsOpen] = useState(false);
  const [dropDownText, setDropDownText] = useState("");
  const [empId, setEmpId] = useState(null);
  const [schId, setSchId] = useState(null);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNames, setFilteredNames] = useState([]);
  const dropdownRef = useRef(null);

  const clockInSuccess = () =>
    toast("Clock-In Success", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      theme: "light",
      progressStyle: { background: "green" },
    });

  const clockInFailed = (e) =>
    toast(`${e.response.data}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      theme: "light",
      progressStyle: { background: "red" },
    });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const closeModal = () => {
    setReloadApi(!reloadApi);
    setDropDownText("");
    setSearchTerm("");
    setSelectedFile(null);
    setDropdownEmpIsOpen(false);
    onClose();
  };

  const handleTest = () => {
    const test3 = filteredSchedules;
    const test4 = schId;
    const test5 = empId;
    console.log(test3, test4, test5);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    console.log(selectedFile.name);
  };

  const handleClockInRequest = async () => {
    const now = new Date();

    const targetDate = new Date(); 


    const formattedAttendanceDate = `${targetDate.getFullYear()}-${(
      targetDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${targetDate.getDate().toString().padStart(2, "0")}`;

    const empData = employeeData.filter((emp) => emp.id === empId);

    // Format the clockIn time in "YYYY-MM-DDTHH:mm:ss" format
    let clockInTime = "";
    if (empData[0].shift === "Pagi" || empData[0].shift === "Management") {
      clockInTime = "08:01:00";
    } else if (empData[0].shift === "Sore") {
      clockInTime = "14:01:00";
    } else if (empData[0].shift === "Malam") {
      clockInTime = "20:01:00";
    }
    console.log("emp data", empData);
    const formattedClockIn = `${formattedAttendanceDate}T${clockInTime}`; // Using client local time

    const data = new FormData();
    data.append("scheduleId", schId);
    data.append("employeeId", empId);
    data.append("attendanceDate", formattedAttendanceDate);
    data.append("clockIn", formattedClockIn);
    data.append("clockOut", "");
    data.append("locationLatIn", "37.7749");
    data.append("locationLongIn", "-122.4194");
    data.append("status", "CheckIn");
    data.append("attendanceType", "WFO");
    data.append("selfieCheckInImage", selectedFile);
    console.log(data);
    api
      .post("/api/v1/dev/attendances/checkInMasuk", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        console.log(res);
        console.log(data);
        clockInSuccess();
      })
      .catch((error) => {
        clockInFailed(error);
        console.error("Error fetching data:", error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Request data:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message);
        }
      });
  };

  const handleOptionClick = (id, name) => {
    setDropDownText(name);
    setEmpId(id);
    setSearchTerm(name);
    const filteredSch = schedule.filter((schedule) =>
      schedule.employees.some((employee) => employee.name === name)
    );
    setFilteredSchedules(filteredSch);
    setSchId(filteredSch[0].scheduleId);
    toggleDropdownEmp();
  };

  const toggleDropdownEmp = () => {
    setDropdownEmpIsOpen(!dropdownEmpIsOpen);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDropdownEmpIsOpen(true);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownEmpIsOpen(false);
    }
  };

  useEffect(() => {
    // Attach the event listener on component mount
    document.addEventListener("mousedown", handleClickOutside);

    // Detach the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredNames(employeeData);

      return;
    }
    const results = employeeData.filter((e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNames(results);
  }, [searchTerm, employeeData]);

  useEffect(() => {
    // Fetch data from API
    api
      .get("/api/v1/dev/schedule")
      .then((res) => {
        const dataSchedule = res.data;

        const currentDate = new Date().toISOString().split("T")[0];

        const schData = dataSchedule.filter(
          (schedule) => schedule.scheduleDate === currentDate
        );

        // setSchedule(schData);

        const extractedEmployees = schData.reduce((employees, schedule) => {
          schedule.employees.forEach((employee) => {
            employees.push({
              id: employee.employeeId,
              name: employee.name,
              shift: schedule.shift.name,
            });
          });
          return employees;
        }, []);

        // Set the extracted employee data to the state
        setEmployeeData(extractedEmployees);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [isOpen]);

  return (
    <div>
      <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div
          className="absolute top-0 left-0 w-full h-full"
          onClick={closeModal}
        ></div>
        <div className="relative w-96 modal-box">
          <form method="dialog">
            <div className="flex justify-end">
              <HiX onClick={closeModal} className="cursor-pointer" />
            </div>
            <h3 className="mb-3 text-lg font-bold mr-auto ml-0">
              Employee Absence
            </h3>
            <div className="flex justify-between">
              <div className="grid gap-3">
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    className="w-64 p-2 border border-gray-300 rounded"
                    placeholder="Search names..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClick={toggleDropdownEmp}
                  />
                  <ul
                    className={`dropdown-content absolute z-10 ${
                      dropdownEmpIsOpen ? "block" : "hidden"
                    } w-full mt-1 p-2 bg-white border border-gray-300 rounded-md shadow-lg transition ease-in-out duration-200 transform ${
                      dropdownEmpIsOpen
                        ? "opacity-100 scale-y-100 max-h-40 overflow-y-auto"
                        : "opacity-0 scale-y-95"
                    }`}
                  >
                    {filteredNames.map((e) => (
                      <li
                        key={e.employeeId}
                        className="block px-4 py-2 text-sm text-gray-400 cursor-pointer hover:bg-primary-2 hover:text-white"
                        onClick={() => handleOptionClick(e.id, e.name)}
                      >
                        {`${e.name} (${e.shift})`}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    htmlFor="file_input"
                  >
                    Upload foto
                  </label>
                  <input
                    type="file"
                    className="block w-full text-sm border border-slate-500 text-gray-500 rounded-md
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                        file:bg-primary-2 file:text-white
                        hover:file:bg-primary-3"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              <div className="mt-1 mr-10"></div>
            </div>
            <div className="modal-action">
              <button
                className="btn bg-[#01A7A3] text-white"
                onClick={handleClockInRequest}
              >
                Clock In
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default ModalAbsen;
