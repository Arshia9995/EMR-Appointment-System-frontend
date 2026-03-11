import React from 'react'
import { Route, Routes } from "react-router-dom";
import  { Toaster } from "react-hot-toast";
import "./index.css";
import './App.css'
import { ToastContainer } from "react-toastify";
import UserRoutes from './routes/UserRoutes';
import AdminRoutes from './routes/AdminRoutes';

const App: React.FC = () => {
  

  return (
    <div className="w-full min-h-screen">
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} /> 
      </Routes>
      <Toaster />
      <ToastContainer />
    </div>
  )
}

export default App
