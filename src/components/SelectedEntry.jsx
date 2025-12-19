import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { supabase } from "../config/supabaseClient";

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

  if (loadingEntry) {
    return (
      <p className="w-full h-full flex items-center justify-center">
        loading...
      </p>
    );
  }

  if (!selectedEntry) {
    return <p className="mt-4 text-gray-400">No trade selected yet</p>;
  }

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

  if (!loadingEntry && selectedEntry) {
    return (
      <div className="mt-6 space-y-4">
        {/* Symbol */}
        <div className="p-3 bg-gray-800 rounded text-white">
          <h4 className="font-bold">Symbol</h4>
          <p className="text-sm">{selectedEntry.symbol}</p>
        </div>

        {/* Other columns */}
        {Object.keys(selectedEntry).map((col) => {
          if (["id", "created_at", "symbol"].includes(col)) return null;
          const entries = selectedEntry[col];

          return (
            <div key={col} className="p-3 bg-black/85 rounded text-white">
              <h4 className="font-bold capitalize">{prettify(col)}</h4>
              <ul className="list-disc ml-5 gap-2 text-sm">
                {renderArray(entries)}
              </ul>
              <button
                onClick={() => setEditingColumn(col)}
                className="mt-2 px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
              >
                Edit
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
                  className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default SelectedEntry;
