import React, { useEffect, useState, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import * as XLSX from 'xlsx';

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  // State variables
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 4;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch appointments when `aToken` changes
  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken, getAllAppointments]);

  // Pagination logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate Excel report for selected date range
  const generateReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both From Date and To Date.");
      return;
    }
  
    // Convert input dates to Date objects
    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);
    toDate.setHours(23, 59, 59, 999); // Ensure end date includes the full day
  
    const filteredAppointments = appointments.filter((appointment) => {
      // Split slotDate (Format: "14_2_2025") into parts
      const [day, month, year] = appointment.slotDate.split('_').map(Number);
      
      // Create Date object with correct month index
      const appointmentDate = new Date(year, month - 1, day); // Month -1 to fix indexing issue
  
      // Compare appointment date with the selected range
      return appointmentDate >= fromDate && appointmentDate <= toDate;
    });
  
    if (filteredAppointments.length === 0) {
      alert("No appointments found in the selected date range.");
      return;
    }

    const reportData = filteredAppointments.map((appointment, index) => ({
      "#": index + 1,
      "Patient Name": appointment.userData?.name || "N/A",
      "Age": calculateAge(appointment.userData?.dob) || "N/A",
      "Date & Time": `${slotDateFormat(appointment.slotDate)}, ${appointment.slotTime}`,
      "Doctor": appointment.docData?.name || "N/A",
      "Fees": `${currency}${appointment.amount}`,
      "Status": appointment.cancelled ? "Cancelled" : appointment.isCompleted ? "Completed" : "Scheduled",
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Appointments");

    XLSX.writeFile(workbook, `Appointments_Report_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium text-[#7E60BF]'>All Appointments</p>

      

      {/* Appointment List */}
      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b text-[#7E60BF]'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {currentAppointments.map((item, index) => (
          <div key={index} className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'>
            <p className='max-sm:hidden'>{index + 1 + (currentPage - 1) * appointmentsPerPage}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData?.image} className='w-8 rounded-full' alt='' />
              <p>{item.userData?.name}</p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData?.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <div className='flex items-center gap-2'>
              <img src={item.docData?.image} className='w-8 rounded-full bg-gray-200' alt='' />
              <p>{item.docData?.name}</p>
            </div>
            <p>{currency}{item.amount}</p>
            {item.cancelled ? (
              <p className='text-red-400 text-xs font-medium'>Cancelled</p>
            ) : item.isCompleted ? (
              <p className='text-green-500 text-xs font-medium'>Completed</p>
            ) : (
              <img
                onClick={() => cancelAppointment(item._id)}
                className='w-10 cursor-pointer'
                src={assets.cancel_icon}
                alt=''
              />
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className='flex justify-center mt-6 space-x-2'>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 text-white rounded ${currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)} className={`px-4 py-2 rounded ${currentPage === index + 1 ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-purple-500 hover:text-white'}`}>
            {index + 1}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 text-white rounded ${currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
          Next
        </button>
      </div>
      <br/>

      {/* Date Range Selection */}
      <div className='flex justify-center gap-4 mb-4'>
        <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} className='px-4 py-2 border rounded w-44' />
        <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} className='px-4 py-2 border rounded w-44' />
        <button onClick={generateReport} className='px-6 py-2 border rounded bg-[#7E60BF] text-white'>
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default AllAppointments;
