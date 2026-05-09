import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import api from '../api'

export default function AddSEOD() {
    const navigate = useNavigate();
const [loggedInUser, setLoggedInUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [name,setName]=useState('')


    useEffect(() => {
          setTimeout(() => {
            const userNameFromState = location.state?.id;
            const user = userNameFromState || localStorage.getItem('User_name');
            setLoggedInUser(user);
            if (user) {
             setLoggedInUser(user)
            } else {
              navigate("/login");
            }
          }, 2000);
          setTimeout(() => setIsLoading(false), 2000);
        }, [location.state, navigate]);

    async function submit(e){
        e.preventDefault();
        try{
            await api.post("/api/seods/add",{
                name
            })
            .then(res=>{
                if(res.data === "exist"){
                    alert("SEOD already exists")
                }
                else if(res.data === "notexist"){
                    alert("SEOD added successfully")
                    navigate("/admin")
                }
            })
            .catch(e=>{
                alert("wrong details")
                console.log(e);
            })
        }
        catch(e){
            console.log(e);

        }
    }
    const closeModal = () => {
        navigate("/admin");
     };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
           
            
            <h1 className="text-2xl font-bold mb-6">Add SEODes</h1>

            <form  onSubmit={submit} className="bg-white p-4 rounded shadow max-w-md space-y-4">
                
                <input type="name" autoComplete="off" onChange={(e) => { setName(e.target.value) }} placeholder="Title Name" className="w-full p-2 border rounded" />
                         
               
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"> Submit </button>
                <button 
                        type="button" 
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                        onClick={closeModal}
                    >
                        Close
                    </button>
            </form>
            
        </div>
    );
}

