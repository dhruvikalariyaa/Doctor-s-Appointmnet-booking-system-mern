import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }
        setLoading(true);
        axios.post('http://localhost:4000/api/forgot-password', { email })
            .then(res => {
                console.log(res.data);
                if (res.data.success) {
                    toast.success(res.data.message);
                    navigate("/login");
                } else {
                    toast.error(res.data.message);
                }
            })
            .catch(err => {
                console.error("Error: ", err);
                toast.error("There was an issue with the request");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <form onSubmit={handleSubmit} className="min-h-[80vh] flex items-center">
            <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
                <p className="text-2xl font-semibold">Forgot Password</p>
                <p>Enter your email to receive a reset password link</p>
                <div className="w-full ">
                    <p>Email</p>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className="border border-[#DADADA] rounded w-full p-2 mt-1"
                        type="email"
                        required
                    />
                </div>
                <button
                    className="bg-primary text-white w-full py-2 my-2 rounded-md text-base"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <Link to="/login" className="text-primary underline cursor-pointer">
                    Back to Login
                </Link>
            </div>
        </form>
    );
};

export default ForgotPassword;
