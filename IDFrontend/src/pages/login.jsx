import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../api'

export default function Login() {
    const navigate = useNavigate();
    const [User_name, setUser_Name] = useState('');
    const [Password, setPassword] = useState('');

    async function submit(e) {
        e.preventDefault();
    
        try {
            const response = await api.post("/api/users/login", {
                User_name,
                Password
            });
            const data = response.data;
    
            if (data.status === "notexist") {
                alert("User has not signed up");
                return;
            } else if (data.status === "invalid") {
                alert("Invalid credentials. Please check your username and password.");
                return;
            }
    
    
            localStorage.setItem('User_name', User_name);

          
                navigate("/admin", { state: { id: User_name } });

        } catch (e) {
            alert("An error occurred during login. Please try again.");
            console.log(e);
        }
    }
    
    return (
        <div className="min-h-screen bg-gray-50 p-6">
                <h1 className="text-2xl font-bold mb-6">Login</h1>
                <form  onSubmit={submit} className="bg-white p-4 rounded shadow max-w-md space-y-4">
                        <input
                            type="text"
                            autoComplete="off"
                            onChange={(e) => setUser_Name(e.target.value)}
                            placeholder="User Name"
                            className="w-full p-2 border rounded"
                            required
                        />
                    
                  
                        <input
                            type="password"
                            autoComplete="off"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-2 border rounded"
                            required
                        />
                    
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">Submit</button>
                </form>
        </div>
    );
}
