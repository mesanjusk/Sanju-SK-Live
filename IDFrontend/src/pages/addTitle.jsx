import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import api from '../api'

export default function AddTitle() {
    const navigate = useNavigate();
    const location = useLocation();

    const [loggedInUser, setLoggedInUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');

    useEffect(() => {
        const userNameFromState = location.state?.id;
        const user = userNameFromState || localStorage.getItem('User_name');

        if (user) {
            setLoggedInUser(user);
            setIsLoading(false);
        } else {
            navigate("/login");  
        }
    }, [location.state, navigate]);

    async function submit(e) {
        e.preventDefault();
        try {
            const res = await api.post("/api/titles/add", { name });
            if (res.data === "exist") {
                alert("Title already exists");
            } else if (res.data === "notexist") {
                alert("Title added successfully");
                navigate("/admin");
            }
        } catch (e) {
            alert("Something went wrong");
            console.error(e);
        }
    }

    const closeModal = () => {
        navigate("/admin");
    };

    if (isLoading) {
        return <div className="p-6 text-center">Checking authentication...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-6">Add Title</h1>
            <form onSubmit={submit} className="bg-white p-4 rounded shadow max-w-md space-y-4">
                <input 
                    type="text" 
                    autoComplete="off" 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Title Name" 
                    className="w-full p-2 border rounded" 
                    required
                />
                <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Submit
                </button>
                <button 
                    type="button" 
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    onClick={closeModal}
                >
                    Close
                </button>
            </form>
        </div>
    );
}
