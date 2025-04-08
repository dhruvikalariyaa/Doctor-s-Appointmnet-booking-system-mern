import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf'; // Import jsPDF library
import 'jspdf-autotable'; // Import autotable plugin for tables in PDF
import logoImage from '../assets/logo.png'; // Import your logo file
import { assets } from '../assets/assets';

const MyAppointments = () => {
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [payment, setPayment] = useState('');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        if (!slotDate) return 'N/A';
        const dateArray = slotDate.split('_');
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
    };

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
            setAppointments(data.appointments.reverse());
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error(error.message || "Failed to fetch appointments.");
        }
    };

    // Generate PDF for an appointment
    const generateAppointmentPDF = (appointment) => {
        try {
            console.log("Generating PDF for appointment:", appointment); // Debugging log

            const doc = new jsPDF();

            // Add website logo and title side by side
            const logo = new Image();
            logo.src = logoImage; // Use the imported logo file
            if (logo.src) {
                try {
                    doc.addImage(logo, 'PNG', 10, 2, 40, 20); // x, y, width, height
                } catch (logoError) {
                    console.error("Failed to load logo:", logoError);
                    toast.error("Logo could not be added to the PDF.");
                }
            }

            // Add title next to the logo
            doc.setFontSize(20);
            doc.setTextColor('#7E60BF');
            doc.text('Appointment Summary', 72, 15);

            // Add a colored line below the logo and title
            doc.setLineWidth(1);
            doc.setDrawColor('#7E60BF'); // Same color as the title
            doc.line(15, 22, 195, 22); // Horizontal line separator

            // Add User Information Table
            const userTableData = [
                ['Name', appointment.userData?.name || 'N/A'],
                ['Email', appointment.userData?.email || 'N/A'],
                ['Phone', appointment.userData?.phone || 'N/A'],
                ['Address', `${appointment.userData?.address?.line1 || 'N/A'}, ${appointment.userData?.address?.line2 || 'N/A'}`],
            ];
            doc.setFontSize(14);
            doc.setTextColor('#7E60BF');
            doc.text('User Details', 15, 30); // Heading for User Information
            doc.autoTable({
                startY: 35,
                head: [['Details', 'Information']],
                body: userTableData,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: '#7E60BF', textColor: '#FFFFFF', fontSize: 10 },
                alternateRowStyles: { fillColor: '#F5F5F5' },
                columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 120 } },
            });

            // Add Doctor Information Table
            const doctorTableData = [
                ['Name', appointment.docData?.name || 'N/A'],
                ['Speciality', appointment.docData?.speciality || 'N/A'],
                ['Qualifications', appointment.docData?.qualifications || 'N/A'],
                ['Experience', `${appointment.docData?.experience || 'N/A'} years`],
                ['Contact', appointment.docData?.contact || 'N/A'],
                ['Clinic Address', `${appointment.docData?.address?.line1 || 'N/A'}, ${appointment.docData?.address?.line2 || 'N/A'}`],
            ];
            doc.setFontSize(14);
            doc.setTextColor('#7E60BF');
            doc.text('Doctor Details', 15, doc.previousAutoTable.finalY + 10); // Heading for Doctor Information
            doc.autoTable({
                startY: doc.previousAutoTable.finalY + 14,
                head: [['Details', 'Information']],
                body: doctorTableData,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: '#7E60BF', textColor: '#FFFFFF', fontSize: 10 },
                alternateRowStyles: { fillColor: '#F5F5F5' },
                columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 120 } },
            });

            // Add Appointment Details Table
            const appointmentTableData = [
                ['Date & Time', `${slotDateFormat(appointment.slotDate)} | ${appointment.slotTime || 'N/A'}`],
                ['Status', appointment.cancelled ? 'Cancelled' : appointment.isCompleted ? 'Completed' : 'Scheduled'],
            ];
            doc.setFontSize(14);
            doc.setTextColor('#7E60BF');
            doc.text('Appointment Details', 15, doc.previousAutoTable.finalY + 10); // Heading for Appointment Information
            doc.autoTable({
                startY: doc.previousAutoTable.finalY + 14,
                head: [['Details', 'Information']],
                body: appointmentTableData,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: '#7E60BF', textColor: '#FFFFFF', fontSize: 10 },
                alternateRowStyles: { fillColor: '#F5F5F5' },
                columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 120 } },
            });

            // Add Fees Section in a Table
            const feesTableData = [
                ['Fees', `${appointment.amount || 'N/A'}`], // Ensure Rupee symbol is displayed correctly
                ['Payment Status', appointment.payment ? 'Paid' : 'Unpaid'],
            ];
            doc.setFontSize(14);
            doc.setTextColor('#7E60BF');
            doc.text('Fees & Payment', 15, doc.previousAutoTable.finalY + 10); // Heading for Fees
            doc.autoTable({
                startY: doc.previousAutoTable.finalY + 14,
                head: [['Details', 'Information']],
                body: feesTableData,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: '#7E60BF', textColor: '#FFFFFF', fontSize: 10 },
                alternateRowStyles: { fillColor: '#F5F5F5' },
                columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 120 } },
            });

            // Add Computer-Generated Note at the Bottom
            doc.setFontSize(10);
            doc.setTextColor('#000000');
            doc.text('* This is a computer-generated document.', 15, doc.previousAutoTable.finalY + 10);

            // Save the PDF
            doc.save(`Appointment_${appointment._id || 'Unknown'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error); // Debugging log
            toast.error("Failed to generate PDF. Please try again.");
        }
    };

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/cancel-appointment',
                { appointmentId },
                { headers: { token } }
            );
            if (data.success) {
                toast.success(data.message);
                getUserAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            toast.error(error.message || "Failed to cancel appointment.");
        }
    };

    // Function to make payment using Stripe
    const appointmentStripe = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/payment-stripe',
                { appointmentId },
                { headers: { token } }
            );
            if (data.success) {
                const { session_url } = data;
                window.location.replace(session_url); // Redirect to Stripe payment page
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Stripe Payment Error:", error);
            toast.error(error.message || "Failed to initiate Stripe payment.");
        }
    };

    useEffect(() => {
        if (token) {
            getUserAppointments();
        }
    }, [token]);

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium border-b text-[#7E60BF]'>My appointments</p>
            <div className=''>
                {appointments.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img className='w-36 bg-[#F5EFFF]' src={item.docData.image} alt="" />
                        </div>
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold text-[#7E60BF]'>{item.docData.name}</p>
                            <p>{item.docData.speciality}</p>
                            <p className='text-[#464646] font-medium mt-1'>Address:</p>
                            <p className=''>{item.docData.address.line1}</p>
                            <p className=''>{item.docData.address.line2}</p>
                            <p className='mt-1'>
                                <span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
                            </p>
                        </div>
                        <div></div>
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                                <button
                                    onClick={() => setPayment(item._id)}
                                    className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
                                >
                                    Pay Online
                                </button>
                            )}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
                                <button
                                    onClick={() => appointmentStripe(item._id)}
                                    className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'
                                >
                                    <img className='max-w-20 max-h-5' src={assets.stripe_logo} alt="" />
                                </button>
                            )}
                            {!item.cancelled && item.payment && !item.isCompleted && (
                                <button className='sm:min-w-48 py-2 border rounded text-[#696969] bg-[#EAEFFF]'>Paid</button>
                            )}
                            {item.isCompleted && (
                                <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>
                            )}
                            {!item.cancelled && !item.isCompleted && (
                                <button
                                    onClick={() => cancelAppointment(item._id)}
                                    className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                                >
                                    Cancel appointment
                                </button>
                            )}
                            {item.cancelled && !item.isCompleted && (
                                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>
                            )}
                            {/* {/ Show PDF download button only if payment is completed /} */}
                            {item.payment && (
                                <button
                                    onClick={() => generateAppointmentPDF(item)}
                                    className='sm:min-w-48 py-2 border rounded text-[#696969] hover:bg-blue-600 hover:text-white transition-all duration-300'
                                >
                                    Download PDF
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyAppointments;