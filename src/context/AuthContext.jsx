// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [entries, setEntries] = useState([]);
  const [formModal, setFormModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [loadingEntry, setLoadingEntry] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingUser,
        selectedDate,
        setSelectedDate,
        entries,
        setEntries,
        formModal,
        setFormModal,
        selectedEntry,
        setSelectedEntry,
        selectedEntryId,
        setSelectedEntryId,
        loadingEntry,
        setLoadingEntry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
