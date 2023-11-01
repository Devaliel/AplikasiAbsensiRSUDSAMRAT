import React, { useRef, useState, useEffect } from 'react';
import {
  HiOutlinePlusSm,
  HiSearch,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi';
import ModalPengumuman from './ModalPengumuman';
import axios from 'axios';
import { apiCheckToken } from '../../config/axios';

export default function PagePengumuman() {
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const modalPengumumanRef = useRef(null);

  const getData = async () => {
    const result = await apiCheckToken.get('/notification');
    setData(result.data.data);
    setFilteredData(result.data.data);
  };

  const handleDelete = async (id) => {
    await apiCheckToken
      .delete(`/notification/${id}`)
      .then((res) => {
        console.log(res.data)
        setRefresh((prev) => !prev);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const openDeleteModal = (id) => {
    setDeleteItemId(id);
    setDeleteModalOpen(true);
  };

  useEffect(() => {
    getData();
  }, [refresh]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredData(data);
      return;
    }
    const results = data.filter((data) => {
      if (data.dataId === searchTerm) {
        return data;
      }
    });
    setFilteredData(results);
  }, [data, searchTerm]);

  useEffect(() => {
    if (startDate === null || endDate === null) {
      return;
    }

    const startDateFormatted = startDate.split('-').join('-');
    const endDateFormatted = endDate.split('-').join('-');

    if (startDate > endDate) {
      alert('Tanggal awal tidak boleh lebih besar dari tanggal akhir');
      return;
    }

    setFilteredData(
      data.filter((schedule) => {
        if (
          schedule.scheduleDate >= startDateFormatted &&
          schedule.scheduleDate <= endDateFormatted
        ) {
          return schedule;
        }
        return null;
      })
    );
  }, [startDate, endDate, data]);

  return (
    <>
      <ModalPengumuman ref={modalPengumumanRef} setRefresh={setRefresh} />
      <div>
        <h1 className="text-xl font-medium">Pengumuman</h1>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-end gap-3">
            <div className="flex justify-center items-center gap-3">
              <div className="w-fit">
                Tanggal:
                <div className="flex justify-center items-center gap-2">
                  {/* Aug 21, 2021 */}
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="input input-bordered"
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <span>Sampai</span>
              <div className="w-fit">
                Tanggal:
                <div className="flex justify-center items-center gap-2">
                  {/* Aug 21, 2021 */}
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="input input-bordered"
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white rounded-md bg-primary-2"
              onClick={() => modalPengumumanRef.current.open()}
            >
              <HiOutlinePlusSm />
              Buat Pengumuman
            </button>
          </div>
          <div className="relative flex items-center w-full">
            <HiSearch className="absolute left-4" />
            <input
              type="text"
              placeholder="Type here"
              className="w-full pl-10 input input-bordered"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500">{data.length} Pengumuman</p>
          {filteredData.map((row, index) => (
            <div
              key={index}
              className="flex p-4 border border-slate-300 rounded-xl"
            >
              <div className="flex flex-col flex-1 gap-2">
                <h1 className="font-bold">{row.title}</h1>
                <p>{row.desc}</p>
                <span className="text-xs text-slate-500">{row.date}</span>
              </div>
              <div className="flex">
                <button
                  type="button"
                  className="mr-2 text-white btn btn-sm bg-primary-2 hover:bg-primary-3"
                >
                  <HiOutlinePencil />
                </button>
                <button
                  type="button"
                  className="text-white bg-red-600 btn btn-sm hover:bg-red-700"
                  onClick={() => openDeleteModal(row._id)}
                >
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white py-6 px-12 rounded-md">
            <p>Are you sure you want to delete this item?</p>
            <div className="mt-8 flex justify-end">
              <button
                className="btn btn-sm bg-primary-2 hover:bg-primary-3 mr-2 text-white"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  handleDelete(deleteItemId);
                  setDeleteModalOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
