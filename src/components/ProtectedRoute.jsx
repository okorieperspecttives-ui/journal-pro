import React from "react";
import useAuthContext from "../context/UseAuthContext";

const ProtectedRoute = () => {
  const { user } = useAuthContext();
  return <div>ProtectedRoute</div>;
};

export default ProtectedRoute;
