import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Feedback = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const feedbackPerPage = 4;

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/feedback');
            if (response.data.success) {
                setFeedbackList(response.data.data);
                toast.success("Feedback data fetched successfully.");
            } else {
                toast.error("Failed to fetch feedback data.");
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
            toast.error("Error fetching feedback: " + error.message);
        }
    };

    const handleExport = () => {
        const filteredFeedback = feedbackList.filter(feedback => {
            const feedbackDate = new Date(feedback.date);
            return feedbackDate >= new Date(fromDate) && feedbackDate <= new Date(toDate);
        });

        const worksheet = XLSX.utils.json_to_sheet(filteredFeedback);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback Report");

        XLSX.writeFile(workbook, `Feedback_Report_${fromDate}_to_${toDate}.xlsx`);
        toast.success("Report generated successfully.");
    };
    const indexOfLastFeedback = currentPage * feedbackPerPage;
    const indexOfFirstFeedback = indexOfLastFeedback - feedbackPerPage;
    const currentFeedback = feedbackList.slice(indexOfFirstFeedback, indexOfLastFeedback);
    const totalPages = Math.ceil(feedbackList.length / feedbackPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium text-[#7E60BF]'>Customer Feedback</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <table className='w-full border border-gray-200 rounded-lg shadow-md'>
                    <thead>
                        <tr className='bg-grey-500 text-[#7E60BF]'>
                            <th className='py-3 px-4 text-left'>Feedback Text</th>
                            <th className='py-3 px-4 text-left'>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentFeedback.map((feedback) => (
                            <tr key={feedback._id} className='border-b hover:bg-gray-100'>
                                <td className='py-3 px-4'>{feedback.text}</td>
                                <td className='py-3 px-4'>{new Date(feedback.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
               
            </div>

             <div className='flex justify-center mt-6 space-x-2'>
                    <button
                        className={`px-4 py-2 border rounded ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed text-white" : "bg-purple-600 hover:bg-purple-700"}`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            className={`px-4 py-2 border rounded ${currentPage === index + 1 ? "bg-purple-700 text-white " : "bg-gray-200 text-white-700 hover:bg-purple-500 hover:text-white"}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        className={`px-4 py-2 border rounded ${currentPage === totalPages ? "bg-gray-400 cursor-not-allowed text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>

            <div className="flex justify-center mt-6 space-x-4">
            <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="px-4 py-2 border rounded w-44"
            />
            <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="px-4 py-2 border rounded w-44"
            />
            <button 
                onClick={handleExport} 
                className="px-4 py-2 border rounded bg-[#7E60BF] text-white w-44"
            >
                Generate Report
            </button>
            </div>

        </div>
    );
};

export default Feedback;
