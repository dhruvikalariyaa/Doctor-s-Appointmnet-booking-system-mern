import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import styles

const Footer = () => {
  const [feedback, setFeedback] = useState('');

  // Handle feedback submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error("Feedback cannot be empty!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/feedback', { text: feedback });
      
      if (response.data.success) {
        toast.success("Thank you for your feedback!");
        setFeedback(""); // Clear input field
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Error submitting feedback. Please check your connection.");
    }
  };

  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10  mt-40 text-sm text-[#7E60BF]'>
        <div>
          <img className='mb-5 w-40' src={assets.logo} alt="" />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>
            DocEase is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, DocEase is here to support you every step of the way.
          </p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <NavLink to='/'><li>Home</li></NavLink>
            <NavLink to='/about'><li>About us</li></NavLink>
            <NavLink to='/doctors'><li>All doctors</li></NavLink>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+1-212-456-7890</li>
            <li>docease@gmail.com</li>
          </ul>
        </div>

        {/* Feedback Form */}
        <div className="footer-feedback">
          <h2>Got a Minute? We Want Your Feedback!</h2>
          <form className="feedback-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your feedback here*"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>

      <div className='bg-[#7E60BF]'>
        <hr />
        <p className='py-5 text-sm text-center text-white'>Copyright 2024 @ DocEase.com - All Rights Reserved.</p>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Footer;
