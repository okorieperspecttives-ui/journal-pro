import React, { useState } from "react";

const symbols = [
  // Major FX pairs
  "XAUUSD",
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "NZDUSD",
  "USDCAD",
  "USDCHF",
  // Crosses (a few popular ones)
  "EURGBP",
  "EURJPY",
  "GBPJPY",
  "AUDJPY",
  // Indices (US + global)
  "NAS100",
  "SPX500",
  "US30",
  "DAX40",
  "FTSE100",
  "JP225",
  // Crypto + Commodities
  "BTCUSD",
  "ETHUSD",
  "WTI",
  "Brent",
  "Silver",
].slice(0, 20); // keep it to ~20 options

// Reusable chip list component
const ChipList = ({ items, onRemove }) => (
  <div className="mt-2 flex flex-wrap gap-2">
    {items.map((item, idx) => (
      <span
        key={`${item}-${idx}`}
        className="inline-flex items-center gap-2 px-2 py-1 rounded bg-blue-600 text-white text-sm"
      >
        {item}
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="rounded bg-blue-700 px-1 text-xs hover:bg-blue-800"
          aria-label={`Remove ${item}`}
        >
          ×
        </button>
      </span>
    ))}
    {items.length === 0 && (
      <span className="text-xs text-gray-400">No items added yet</span>
    )}
  </div>
);

// Reusable add-input block
const AddInput = ({ label, placeholder, tempValue, setTempValue, onAdd }) => (
  <div>
    <label className="block mb-1 font-semibold">{label}</label>
    <div className="flex gap-2">
      <input
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        className="flex-1 p-2 rounded bg-gray-700 text-gray-100"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => onAdd(tempValue)}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add
      </button>
    </div>
  </div>
);

const EntryForm = ({ onSubmit }) => {
  // Scalar
  const [symbol, setSymbol] = useState("");

  // Arrays
  const [confluences, setConfluences] = useState([]);
  const [entryModels, setEntryModels] = useState([]);
  const [moods, setMoods] = useState([]);
  const [observations, setObservations] = useState([]);
  const [newsEvents, setNewsEvents] = useState([]);
  const [buysideLiquidity, setBuysideLiquidity] = useState([]);
  const [sellsideLiquidity, setSellsideLiquidity] = useState([]);

  // Temps
  const [tempConfluence, setTempConfluence] = useState("");
  const [tempEntryModel, setTempEntryModel] = useState("");
  const [tempMood, setTempMood] = useState("");
  const [tempObservation, setTempObservation] = useState("");
  const [tempNewsEvent, setTempNewsEvent] = useState("");
  const [tempBuyside, setTempBuyside] = useState("");
  const [tempSellside, setTempSellside] = useState("");

  // Helpers
  const addItem = (value, setter, reset) => {
    const v = (value || "").trim();
    if (!v) return;
    setter((prev) => [...prev, v]);
    reset("");
  };
  const removeItem = (idx, setter) => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      symbol,
      confluences,
      entry_models: entryModels,
      moods,
      observations,
      news_events: newsEvents,
      buyside_liquidity: buysideLiquidity,
      sellside_liquidity: sellsideLiquidity,
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      console.log("EntryForm payload:", payload);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-800 text-gray-100 rounded-md space-y-6 scrollbar-hide w-[90%] h-[90%] overflow-y-scroll"
    >
      {/* Symbol */}
      <div>
        <label className="block mb-1 font-semibold">Symbol</label>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-gray-100"
        >
          <option value="">Select a symbol</option>
          {symbols.map((sym) => (
            <option key={sym} value={sym}>
              {sym}
            </option>
          ))}
        </select>
      </div>

      {/* Confluences */}
      <AddInput
        label="Confluences"
        placeholder="Type a confluence"
        tempValue={tempConfluence}
        setTempValue={setTempConfluence}
        onAdd={(v) => addItem(v, setConfluences, setTempConfluence)}
      />
      <ChipList
        items={confluences}
        onRemove={(idx) => removeItem(idx, setConfluences)}
      />

      {/* Entry model */}
      <AddInput
        label="Entry model"
        placeholder="Type an entry model"
        tempValue={tempEntryModel}
        setTempValue={setTempEntryModel}
        onAdd={(v) => addItem(v, setEntryModels, setTempEntryModel)}
      />
      <ChipList
        items={entryModels}
        onRemove={(idx) => removeItem(idx, setEntryModels)}
      />

      {/* Mood */}
      <AddInput
        label="Mood"
        placeholder="Type a mood"
        tempValue={tempMood}
        setTempValue={setTempMood}
        onAdd={(v) => addItem(v, setMoods, setTempMood)}
      />
      <ChipList items={moods} onRemove={(idx) => removeItem(idx, setMoods)} />

      {/* Observations */}
      <AddInput
        label="Observations"
        placeholder="Type an observation"
        tempValue={tempObservation}
        setTempValue={setTempObservation}
        onAdd={(v) => addItem(v, setObservations, setTempObservation)}
      />
      <ChipList
        items={observations}
        onRemove={(idx) => removeItem(idx, setObservations)}
      />

      {/* News events */}
      <AddInput
        label="News events"
        placeholder="Type a news event"
        tempValue={tempNewsEvent}
        setTempValue={setTempNewsEvent}
        onAdd={(v) => addItem(v, setNewsEvents, setTempNewsEvent)}
      />
      <ChipList
        items={newsEvents}
        onRemove={(idx) => removeItem(idx, setNewsEvents)}
      />

      {/* Buyside liquidity */}
      <AddInput
        label="Buyside liquidity"
        placeholder="Type a buyside liquidity note"
        tempValue={tempBuyside}
        setTempValue={setTempBuyside}
        onAdd={(v) => addItem(v, setBuysideLiquidity, setTempBuyside)}
      />
      <ChipList
        items={buysideLiquidity}
        onRemove={(idx) => removeItem(idx, setBuysideLiquidity)}
      />

      {/* Sellside liquidity */}
      <AddInput
        label="Sellside liquidity"
        placeholder="Type a sellside liquidity note"
        tempValue={tempSellside}
        setTempValue={setTempSellside}
        onAdd={(v) => addItem(v, setSellsideLiquidity, setTempSellside)}
      />
      <ChipList
        items={sellsideLiquidity}
        onRemove={(idx) => removeItem(idx, setSellsideLiquidity)}
      />

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Save entry
        </button>
      </div>
    </form>
  );
};

export default EntryForm;
