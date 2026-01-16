// frontend/src/hooks/useAuth.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api'; // Your backend URL

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const fetchUserFromToken = useCallback(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
            setUser(userData);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUserFromToken();
    }, [fetchUserFromToken]);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
            setUser(userData);
            if (userData.role === 'Admin') {
                navigate('/admin/dashboard');
            }
            else if (userData.role === 'hrmanager') {
                navigate('/hrmanager/dashboard');
            }
            else if (userData.role === 'financialmanager') {
                navigate('/financialmanager/dashboard');
            }
            else if (userData.role === 'Supplier') {
                navigate('/supplier/dashboard');
            }
            else {
                navigate('/customer/dashboard');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

// const register = async (username, email, password, role) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/register`, {
//       username,
//       email,
//       password,
//       role,
//     });

//     const userData = response.data;

//     // if the currently logged in user is an Admin registering a Supplier
//     if (user?.role === 'Admin' && role === 'Supplier') {
//       // ✅ just show a message or toast
//       console.log('Supplier registered successfully!');
//       alert('Supplier account created successfully!');
//       // ❌ do NOT replace or change admin's login data
//       return;
//     }

//     // Normal user self-registration flow
//     localStorage.setItem('user', JSON.stringify(userData));
//     axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
//     setUser(userData);

//     // Redirect based on role
//     if (userData.role === 'Admin') {
//       navigate('/admin/dashboard');
//     } else if (userData.role === 'Supplier') {
//       navigate('/supplier/dashboard');
//     } else {
//       navigate('/customer/dashboard');
//     }

//   } catch (error) {
//     console.error('Registration failed:', error);
//     throw error;
//   }
// };

const register = async (
  username,
  email,
  password,
  role,
  clientDetails = {}
) => {
  try {
    // Merge the main data with any optional client details
    const payload = {
      username,
      email,
      password,
      role,
      ...clientDetails, // spread extra fields if they exist
    };

    const response = await axios.post(`${API_URL}/auth/register`, payload);
    const userData = response.data;

    // If the currently logged-in user is an Admin registering a Supplier
    if (user?.role === "Admin" && role === "Supplier") {
      console.log("Supplier registered successfully!");
      alert("Supplier account created successfully!");
      return; // Don't overwrite the admin's login session
    }

    // Normal user self-registration flow
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    setUser(userData);

    // Redirect based on role
    if (userData.role === "Admin") {
      navigate("/admin/dashboard");
    } else if (userData.role === "Supplier") {
      navigate("/supplier/dashboard");
    } else if (userData.role === "hrmanager") {
      navigate("/hrmanager/dashboard");
    } else if (userData.role === "financialmanager") {
      navigate("/financialmanager/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};



    const logout = () => {
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    };
    
    const value = { user, login, register, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
