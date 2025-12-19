import React, { useState } from "react";
import { useAuthContext } from "../context/UseAuthContext";
import { supabase } from "../config/supabaseClient";

const normalizeToArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val === null || val === undefined) return [];
  // If it's a JSON string, try parsing
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val]; // plain string -> wrap
    }
  }
  // Any other type -> wrap
  return [val];
};

const prettify = (key) => key.replace(/_/g, " ");

const SelectedEntry = () => {
  const { selectedEntry, setSelectedEntry } = useAuthContext();
  const [editingColumn, setEditingColumn] = useState(null);
  const [newValue, setNewValue] = useState("");

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

    // Write an array to the DB (JSONB or text[])
    const { error } = await supabase
      .from("trades")
      .update({ [editingColumn]: updatedEntries })
      .eq("id", selectedEntry.id);

    if (error) {
      console.error("Error updating:", error.message);
    } else {
      // Option A: optimistic local update
      setSelectedEntry({ ...selectedEntry, [editingColumn]: updatedEntries });
      // Option B: refetch to keep types consistent
      await refetchSelected(selectedEntry.id);
    }

    setEditingColumn(null);
    setNewValue("");
  };

  const renderArray = (entries) => {
    const list = normalizeToArray(entries);
    return list.length > 0 ? (
      list.map((e, i) => <li key={i}>{String(e)}</li>)
    ) : (
      <li className="text-gray-400">No entries yet</li>
    );
  };

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
          <div key={col} className="p-3 bg-gray-800 rounded text-white">
            <h4 className="font-bold capitalize">{prettify(col)}</h4>
            <ul className="list-disc ml-5 text-sm">{renderArray(entries)}</ul>
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
};

export default SelectedEntry;
