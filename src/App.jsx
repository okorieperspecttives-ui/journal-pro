import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <>
      <div className=" bg-black transparent_bg">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
