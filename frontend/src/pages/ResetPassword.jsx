import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id, token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setLoading(true);

        axios.post(`http://localhost:4000/api/reset-password/${id}/${token}`, { password })
            .then((res) => {
                if (res.data.success) {
                    toast.success("Password reset successfully! Redirecting to login...");
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                } else {
                    toast.error(res.data.message);
                }
            })
            .catch(() => {
                toast.error("Invalid or expired token. Please request a new reset link.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <form onSubmit={handleSubmit} className="min-h-[80vh] flex items-center">
            <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
                <h2 className="text-2xl font-semibold">Reset Password</h2>
                <p className="text-gray-600 mb-4">Enter a new password below</p>

                <label className="block mb-2 text-gray-700 font-medium">New Password</label>
                <input
                    type="password"
                    className="border border-[#DADADA] rounded w-full p-2 mt-1"
                    placeholder="Enter new password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <label className="block mt-3 mb-2 text-gray-700 font-medium">Confirm Password</label>
                <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Confirm new password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="bg-primary text-white w-full py-2 my-2 rounded-md text-base" 
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </div>
        </form>
    );
}

export default ResetPassword;
