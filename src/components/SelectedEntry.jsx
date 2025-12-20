import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { supabase } from "../config/supabaseClient";
import {
  CheckCheckIcon,
  Edit2Icon,
  LucideLoader,
  Save,
  SaveAllIcon,
  SquarePen,
  Trash2Icon,
  X,
} from "lucide-react";

const normalizeToArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val === null || val === undefined) return [];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val];
    }
  }
  return [val];
};

const prettify = (key) => key.replace(/_/g, " ");

const SelectedEntry = () => {
  const { user, selectedEntry, setSelectedEntry } = useAuthContext();
  const [editingColumn, setEditingColumn] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [loadingEntry, setLoadingEntry] = useState(true);

  // 🔎 On mount, fetch lastSelectedId from user preferences
  useEffect(() => {
    const fetchLastSelected = async () => {
      if (!user) {
        setLoadingEntry(false);
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("preferences")
        .eq("user_id", user.uid)
        .single();

      if (userError) {
        console.error("Error fetching user preferences:", userError.message);
        setLoadingEntry(false);
        return;
      }

      const lastId = userData?.preferences?.lastSelectedPairId;
      if (!lastId) return;

      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .select("*")
        .eq("id", lastId)
        .single();

      if (tradeError) {
        console.error("Error fetching trade:", tradeError.message);
        setLoadingEntry(false);
        return;
      }

      setSelectedEntry(trade);
      setLoadingEntry(false);
    };

    fetchLastSelected();
  }, [user, selectedEntry]);

  const handleSaveAll = async () => {
    if (!selectedEntry) return;

    // Confirmation inquiry
    const confirmed = window.confirm(
      "Are you sure you want to save this trade permanently? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("trades")
        .update({ saved: true }) // ✅ set saved column to true
        .eq("id", selectedEntry.id);

      if (error) {
        console.error("Error saving trade:", error.message);
      } else {
        console.log("Trade marked as saved permanently");
        // Update context so UI reflects immediately
        setSelectedEntry({ ...selectedEntry, saved: true });
      }
    } catch (err) {
      console.error("Unexpected error saving trade:", err.message);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;

    // Confirmation inquiry
    const confirmed = window.confirm(
      `Are you sure you want to delete the trade for ${selectedEntry.symbol}?`
    );
    if (!confirmed) return; // stop if user cancels

    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("id", selectedEntry.id);

      if (error) {
        console.error("Error deleting trade:", error.message);
      } else {
        console.log("Trade deleted successfully");
        setSelectedEntry(null); // clear context so UI resets
      }
    } catch (err) {
      console.error("Unexpected error deleting trade:", err.message);
    } finally {
      setLoadingEntry(false);
    }
  };

  const refetchSelected = async (id) => {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) setSelectedEntry(data);
  };

  const handleUpdate = async () => {
    const v = newValue.trim();
    if (!v || !editingColumn) return;

    const current = normalizeToArray(selectedEntry[editingColumn]);
    const updatedEntries = [...current, v];

    const { error } = await supabase
      .from("trades")
      .update({ [editingColumn]: updatedEntries })
      .eq("id", selectedEntry.id);

    if (error) {
      console.error("Error updating:", error.message);
    } else {
      setSelectedEntry({ ...selectedEntry, [editingColumn]: updatedEntries });
      await refetchSelected(selectedEntry.id);
    }

    setEditingColumn(null);
    setNewValue("");
  };

  const renderArray = (entries) => {
    const list = normalizeToArray(entries);
    return list.length > 0 ? (
      list.map((e, i) => (
        <li key={i} className="my-2">
          {String(e)}
        </li>
      ))
    ) : (
      <li className="text-gray-400">No entries yet</li>
    );
  };

  if (loadingEntry) {
    return (
      <p className="w-full h-full flex items-center justify-center">
        <LucideLoader className="animate-spin transition-all duration-500 ease-in-out" />
      </p>
    );
  }

  if (!selectedEntry) {
    return <p className="mt-4 text-gray-400">No trade selected yet</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Symbol */}
      <div className="p-3 bg-gray-800 rounded flex items-center justify-between text-white">
        <div>
          <h4 className="font-bold">Symbol</h4>
          <p className="text-sm">{selectedEntry.symbol}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedEntry.saved && (
            <button className="text-green-400">
              <CheckCheckIcon />
            </button>
          )}
          <button
            className={`text-3xl w-8 h-8 rounded-full p-1 hover:scale-110 duration-700 transition-all 
    ${
      selectedEntry.saved
        ? "bg-red-800 opacity-50 cursor-not-allowed"
        : "bg-red-800 cursor-pointer"
    }`}
            disabled={selectedEntry.saved}
            title={selectedEntry.saved ? "Can't edit this button anymore" : ""}
          >
            <Trash2Icon onClick={handleDeleteEntry} />
          </button>

          <button
            className={`text-3xl w-8 h-8 rounded-full p-1 hover:scale-110 duration-700 transition-all 
    ${
      selectedEntry.saved
        ? "bg-blue-500 opacity-50 cursor-not-allowed"
        : "bg-blue-500 cursor-pointer"
    }`}
            disabled={selectedEntry.saved}
            title={selectedEntry.saved ? "Can't edit this entry anymore" : ""}
            onClick={handleSaveAll}
          >
            <SaveAllIcon />
          </button>
        </div>
      </div>

      {/* Other columns */}
      {Object.keys(selectedEntry).map((col) => {
        if (["id", "created_at", "symbol", "saved"].includes(col)) return null;
        const entries = selectedEntry[col];

        return (
          <div key={col} className="p-3 bg-black/85 rounded text-white">
            <h4 className="font-bold capitalize">{prettify(col)}</h4>
            <ul className="list-disc ml-5 gap-2 text-sm">
              {renderArray(entries)}
            </ul>
            <button
              disabled={selectedEntry.saved}
              onClick={() => setEditingColumn(col)}
              title={selectedEntry.saved ? "Can't edit this entry anymore" : ""}
              className={`mt-2 p-1 rounded-full text-sm transition-all 
    ${
      selectedEntry.saved
        ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
        : "cursor-pointer hover:bg-blue-700 bg--600 text-white"
    }`}
            >
              <SquarePen />
            </button>
          </div>
        );
      })}

      {/* Modal */}
      {editingColumn && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-4 rounded shadow-lg w-[300px]">
            <h3 className="text-white mb-2">
              Add entry to{" "}
              <span className="font-bold">{prettify(editingColumn)}</span>
            </h3>
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white mb-3"
              placeholder="Type new entry"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingColumn(null);
                  setNewValue("");
                }}
                className="px-3 py-1 bg--600 rounded cursor-pointer hover:bg-gray-700 text-sm"
              >
                <X />
              </button>
              <button
                onClick={handleUpdate}
                className="px-3 py-1 bg--600 rounded cursor-pointer hover:bg-blue-700 text-sm"
              >
                <Save />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedEntry;
