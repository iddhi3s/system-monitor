import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const onSubmit = (e) => {
        e.preventDefault();
        navigate("/home");
    };
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="min-h-screen flex">
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                                    <img src="/logo.png" />
                                </div>
                            </div>

                            <form onSubmit={onSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            x-model="email"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                                            placeholder="you@example.com"
                                        />
                                        <i className="fas fa-envelope absolute right-2 top-4 w-6 h-6 text-gray-400"></i>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-600 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sign In
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div
                    className="hidden lg:block lg:w-1/2 bg-center relative"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80')",
                    }}
                >
                    <div className="h-full bg-black/50 flex items-center justify-center z-30">
                        <div className="text-center text-white px-12">
                            <h2 className="text-4xl font-bold mb-6">
                                Your Title
                            </h2>
                            <p className="text-xl">
                                Lorem ipsum dolor sit amet consectetur
                                adipisicing elit. Facilis, expedita.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
