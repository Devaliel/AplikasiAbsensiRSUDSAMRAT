import React, { useState, useRef, useEffect } from "react";
import ModalAbsen from "./ModalAbsen";
import jsPDF from "jspdf";
import { HiViewList } from "react-icons/hi";

const DropdownButton = (props) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownVisible(false);
    }
  };

  const generatePDF = () => {
    let data = props.filteredAbsences.map((abs) => {
      return {
        name: abs?.name,
        waktu: abs?.time,
        sif: abs?.shift,
        kategori: abs?.category,
        presensi: abs?.presence,
      };
    });
    const doc = new jsPDF();
    doc.text("Absences", 20, 10);
    doc.autoTable({
      theme: "grid",
      columns: pdfcolumns.map((col) => ({ ...col, dataKey: col.field })),
      body: data,
    });
    doc.save("table.pdf");
    console.log(data);
  };

  const pdfcolumns = [
    { title: "Name", field: "name" },
    { title: "Waktu", field: "waktu" },
    { title: "Sif", field: "sif" },
    { title: "Kategori", field: "kategori" },
    { title: "Presensi", field: "presensi" },
  ];

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    setButtonWidth(buttonRef.current.clientWidth); // Set button width when component mounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    if (isDropdownVisible === true) {
      setIsDropdownVisible(false);
    } else {
      setIsDropdownVisible(true);
    }
  };

  const handleDropdownButtonClick = (action) => {
    if (action === "Absen") {
      setIsModalOpen(true);
    } else if (action === "Print PDF") {
      generatePDF();
    }
    setIsDropdownVisible(false);
  };

  return (
    <div className="relative inline-block" ref={buttonRef}>
      <button
        type="button"
        className="px-16 py-3 font-semibold text-white rounded-md bg-primary-2"
        onClick={handleButtonClick}
        style={{ zIndex: 1 }} // Set z-index to 1 to ensure the button is above other elements
      >
        <HiViewList />
      </button>

      {isDropdownVisible && (
        <div
          ref={dropdownRef}
          className="absolute top-10 left-0 mt-2 bg-white border rounded-md"
          style={{ zIndex: 2, width: buttonWidth }} // Set z-index to 2 to ensure the dropdown is above the button
        >
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
            onClick={() => handleDropdownButtonClick("Print PDF")}
          >
            Print PDF
          </button>
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
            onClick={() => handleDropdownButtonClick("Absen")}
          >
            Absen
          </button>
        </div>
      )}

      <ModalAbsen isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DropdownButton;
