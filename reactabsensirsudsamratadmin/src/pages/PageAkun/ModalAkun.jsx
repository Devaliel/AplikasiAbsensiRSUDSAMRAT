import React, { useState, forwardRef, useEffect, useRef } from "react";
import Popup from "reactjs-popup";
import modalBg from "../../assets/modal-bg.png";
import profilePicture from "../../assets/profile-picture.png";
import {
  HiUpload,
  HiEye,
  HiEyeOff,
  HiOutlineX,
  HiPencil,
  HiChevronDown,
} from "react-icons/hi";
import { api } from "../../config/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ModalAkun = forwardRef(({ data, type, onClose }, ref) => {
  const [akunData, setAkunData] = useState(data);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [nik, setNik] = useState("");
  const [jabatan, setJabatan] = useState(data?.role);
  const [name, setName] = useState(data?.name);
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  const [placementID, setPlacementId] = useState(null);
  const [placementName, setPlacementName] = useState(data?.placement?.name);
  const [placementIdDropdown, setPlacementIdDropdown] = useState([]);
  const [reloadApi, setReloadApi] = useState(false);

  const allFieldsFilled = () => {
    return jabatan && name;
  };

  const editSuccess = () =>
    toast("Akun berhasil di edit", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      theme: "light",
      progressStyle: { background: "green" },
    });

  const createSuccess = () =>
    toast("Akun berhasil dibuat", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      theme: "light",
      progressStyle: { background: "green" },
    });

  const editFailed = () =>
    toast("Eror, Akun tidak berhasil di edit", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      theme: "light",
      progressStyle: { background: "red" },
    });

  const createFailed = () =>
    toast("Eror, Akun tidak berhasil dibuat", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      theme: "light",
      progressStyle: { background: "red" },
    });

  const handlePasswordLogo = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (type === "edit") {
      setName(data?.name);
      setJabatan(data?.role);
      setPlacementName(data?.placement?.name);
      setAkunData(data);
    }
  }, [data, type]);

  useEffect(() => {
    // Fetch data from API
    api
      .get("/api/v1/dev/placements")
      .then((res) => {
        setPlacementIdDropdown(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [reloadApi]);

  const handleCloseModal = () => {
    setJabatan("");
    setName("");
    setPlacementId(null);
    onClose();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleNikChange = (e) => {
    setNik(e.target.value);
  };
  const handleJabatanChange = (e) => {
    setJabatan(e.target.value);
    console.log(jabatan);
  };
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

<<<<<<< HEAD
  const handleOptionClick = (option, name) => {
    setPlacementId(option);
    setJabatan(name)
=======
  const handleOptionClick = (id, name) => {
    setPlacementId(id);
    setPlacementName(name);
>>>>>>> cbabdb6c016eed8d574e1a718dfe36d71db23a5b
    toggleDropdown();
  };

  const toggleDropdown = () => {
    setDropdownIsOpen(!dropdownIsOpen);
  };

  const postAkunData = () => {
    const data = {
      name: name,
      role: jabatan,
      password: password,
      nik: nik,
      placementId: placementID,
    };
    const dataEdit = {
      name: name,
      role: jabatan,
      placementId: placementID,
    };
    if (type === "create") {
      api
        .post("/api/v1/dev/employees", data)
        .then((res) => {
          console.log(res);
          createSuccess();
        })
        .catch((err) => {
          console.log(err);

          createFailed();
        });
    } else if (type === "edit") {
      api
        .put(`/api/v1/dev/employees/${akunData.employeeId}`, dataEdit)
        .then((res) => {
          console.log(res);
          editSuccess();
        })
        .catch((err) => {
          console.log(err);
          editFailed();
        });
    }
  };

  return (
    <Popup
      ref={ref}
      modal
      onClose={handleCloseModal}
      contentStyle={{
        borderRadius: "12px",
        padding: "0",
        minHeight: "35rem",
        width: "25rem",
      }}
    >
      {(close) => (
        <div className="p-6 overflow-hidden h-full">
          {/* <img
            src={modalBg}
            alt="modal-background"
            className="absolute bottom-0 -translate-x-1/2 -z-10 left-1/2"
            width="70%"
          /> */}
          <button
            className="absolute block cursor-pointer top-1 right-1"
            onClick={handleCloseModal}
          >
            <HiOutlineX className="text-2xl text-gray-500" />
          </button>
          <h3 className="mb-3 text-lg font-bold">
            {type === "create" ? "Buat Akun" : "Edit Akun"}
          </h3>
          <div className="flex gap-2 mb-2">
            <div className="flex flex-col justify-between flex-1">
              <div className="flex flex-col items-center justify-center flex-1 gap-3">
                <div className="relative">
                  <img
                    src={profilePicture}
                    className="w-24 h-24 rounded-full"
                    alt="Profile"
                  />
                  <button
                    type="button"
                    className="absolute p-1 text-2xl text-white rounded-full bg-primary-2 bottom-1 right-1"
                  >
                    <HiPencil />
                  </button>
                </div>
              </div>
              <div className="flex flex-col justify-start gap-1">
                <h3>Placement ID</h3>
                <div className="relative inline-block text-left w-full h-56 ">
                  <button
                    type="button"
                    className="dropdown-button btn h-12 justify-between w-full  bg-white border  rounded-md shadow-sm border-gray-300  "
                    onClick={toggleDropdown}
                  >
                    {placementName}
                    <HiChevronDown />
                  </button>
                  {/*dropdown*/}

                  <ul
                    className={`dropdown-content absolute z-10 ${
                      dropdownIsOpen ? "block" : "hidden"
                    } w-full mt-1 p-2 border bg-white border-gray-300 rounded-md shadow-lg transition ease-in-out duration-200 transform ${
                      dropdownIsOpen
<<<<<<< HEAD
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-95" 
=======
                        ? "opacity-100 scale-y-100 max-h-40 overflow-y-auto"
                        : "opacity-0 scale-y-95"
>>>>>>> cbabdb6c016eed8d574e1a718dfe36d71db23a5b
                    }`}
                  >
                    {placementIdDropdown.map((e) => (
                      <li
                        key={e.placement_id}
<<<<<<< HEAD
                        className="block px-4 py-2 text-sm  text-gray-400 cursor-pointer hover:bg-primary-2 hover:text-white"
                        onClick={() => handleOptionClick(e.placement_id, e.name)}
=======
                        className="block px-4 py-2 text-sm text-gray-400 cursor-pointer hover:bg-primary-2 hover:text-white"
                        onClick={() =>
                          handleOptionClick(e.placement_id, e.name)
                        }
>>>>>>> cbabdb6c016eed8d574e1a718dfe36d71db23a5b
                      >
                        {e.name}
                      </li>
                    ))}
                  </ul>

                  {/*dropdown*/}
                </div>
              </div>
              <div className="grid flex-1 w-full gap-2">
                <div className="flex flex-col justify-start gap-1">
                  <h3>Nama</h3>
                  <input
                    type="text"
                    name="name"
                    placeholder="Username"
                    className="w-full input input-bordered"
                    defaultValue={name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="flex flex-col justify-start gap-1">
                  <h3>NIK</h3>
                  <input
                    type="number"
                    name="nik"
                    placeholder="NIK"
                    className="w-full input input-bordered"
                    defaultValue={akunData?.nik}
                    onChange={handleNikChange}
                  />
                </div>
                <div className="flex flex-col justify-start gap-1">
                  <h3>Bidang/Jabatan</h3>
                  <input
                    type="text"
                    name="role"
                    placeholder="Bidang / Jabatan"
                    className="w-full input input-bordered"
                    defaultValue={jabatan}
                    onChange={handleJabatanChange}
                  />
                </div>
                <div className="flex flex-col justify-start gap-1">
                  <h3>Password</h3>
                  <div className="relative flex flex-col gap-5">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full input input-bordered"
                      defaultValue={akunData?.password}
                      onChange={handlePasswordChange}
                    />
                    <button
                      onClick={handlePasswordLogo}
                      className="absolute -translate-y-1/2 right-4 top-1/2"
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={() => {
                      if (type === "create") {
                        setAkunData({ ...akunData });
                      }
                      postAkunData();
                      onClose();
                      setReloadApi(!reloadApi);
                    }}
                    // disabled={!allFieldsFilled()}
                    className="text-white btn bg-primary-2 hover:bg-primary-3 w-full"
                  >
                    {type === "create" ? "Buat" : "Edit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
});

export default ModalAkun;
