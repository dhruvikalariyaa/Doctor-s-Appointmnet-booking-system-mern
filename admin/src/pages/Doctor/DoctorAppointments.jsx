import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import * as XLSX from 'xlsx'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const [currentPage, setCurrentPage] = useState(1)
  const appointmentsPerPage = 4
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  const indexOfLastAppointment = currentPage * appointmentsPerPage
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment)
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Filter appointments by the selected date range
  const filterAppointmentsByDate = () => {
    return appointments.filter((item) => {
      const appointmentDate = new Date(item.slotDate)
      const start = new Date(startDate)
      const end = new Date(endDate)

      return appointmentDate >= start && appointmentDate <= end
    })
  }

  const generateReport = () => {
    const filteredAppointments = filterAppointmentsByDate()
    if (filteredAppointments.length === 0) {
      alert("No appointments found for the selected date range!")
      return
    }
    const data = filteredAppointments.map(item => ({
      Patient: item.userData.name,
      Age: calculateAge(item.userData.dob),
      'Date & Time': `${slotDateFormat(item.slotDate)}, ${item.slotTime}`,
      Fees: `${currency}${item.amount}`,
      Status: item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments Report')
    XLSX.writeFile(wb, 'Appointments_Report.xlsx')
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium text-[#7E60BF]'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b text-[#7E60BF]'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {currentAppointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index + 1 + (currentPage - 1) * appointmentsPerPage}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" />
              <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.payment ? 'Online' : 'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>
            {item.cancelled ? (
              <p className='text-red-400 text-xs font-medium'>Cancelled</p>
            ) : item.isCompleted ? (
              <p className='text-green-500 text-xs font-medium'>Completed</p>
            ) : (
              <div className='flex'>
                <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-white rounded ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded ${currentPage === index + 1 ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-purple-500 hover:text-white"}`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-white rounded ${currentPage === totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          Next
        </button>
      </div>

      {/* Centered Generate Report Button */}
      <div className="flex justify-center mt-6 space-x-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 border rounded w-44"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 border rounded w-44"
        />
        <button
          onClick={generateReport}
          className="px-4 py-2 border rounded bg-[#7E60BF] text-white w-44"
        >
          Generate Report
        </button>
      </div>
    </div>
  )
}

export default DoctorAppointments
