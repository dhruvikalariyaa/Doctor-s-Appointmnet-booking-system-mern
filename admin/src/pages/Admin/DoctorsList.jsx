import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
  const { doctors, changeAvailability, deleteDoctor, aToken, getAllDoctors } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium text-[#7E60BF]">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors.map((item, index) => (
          <div
            className="border border-[#7E60BF] rounded-xl max-w-56 overflow-hidden cursor-pointer group hover:translate-y-[-10px] transition-all duration-500"
            key={index}
          >
            <img className="bg-[#F5EFFF]" src={item.image} alt="" />
            <div className="p-4">
              <p className="text-[#7E60BF] text-lg font-medium">{item.name}</p>
              <p className="text-[#5C5C5C] text-sm">{item.speciality}</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <input
                  onChange={() => changeAvailability(item._id)}
                  type="checkbox"
                  checked={item.available}
                />
                <p>Available</p>
              </div>
              <button
                onClick={() => deleteDoctor(item._id)}
                className="mt-3 text-sm text-white bg-red-500 hover:bg-red-600 py-1 px-3 rounded-md"
              >
                Delete Doctor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
