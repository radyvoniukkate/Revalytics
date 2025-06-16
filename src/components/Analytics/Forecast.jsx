import React, { useEffect, useState, useMemo, useRef } from "react";
import * as htmlToImage from "html-to-image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalyticsByYearAndMonth,
  fetchRegionsList,
  fetchCitiesList,
  fetchPriceForecast,
} from "../../redux/real_estate/operators";
import RegionTranslations from "/public/regionTranslations.js";

const SAVED_CHARTS_KEY = "savedCharts";

const saveChartToLocal = (chart) => {
  const existing = JSON.parse(localStorage.getItem(SAVED_CHARTS_KEY)) || [];
  localStorage.setItem(SAVED_CHARTS_KEY, JSON.stringify([...existing, chart]));
};

const PURPOSE_OPTIONS = [
  { value: "buy", label: "Продаж" },
  { value: "rent", label: "Оренда" },
];

const LEVEL_OPTIONS = [
  { value: "regions", label: "Регіони" },
  { value: "cities", label: "Міста" },
];

const Forecast = () => {
  const dispatch = useDispatch();
  const [purpose, setPurpose] = useState("buy");
  const [level, setLevel] = useState("regions");
  const [selectedItem, setSelectedItem] = useState(null);
  const [allData, setAllData] = useState([]);

  const regions = useSelector((state) => state.realEstate.regionsList);
  const cities = useSelector((state) => state.realEstate.citiesList);
  const forecastData = useSelector((state) => state.realEstate.priceForecast);
  const loading = useSelector((state) => state.realEstate.loading);

  useEffect(() => {
    if (level === "regions") dispatch(fetchRegionsList({ purpose }));
    else dispatch(fetchCitiesList({ purpose }));
  }, [dispatch, level, purpose]);

  useEffect(() => {
    if (typeof selectedItem !== "string" || selectedItem.trim() === "") return;
    async function fetchAllMonths() {
      let combinedData = [];
      for (let month = 1; month <= 5; month++) {
        const resultAction = await dispatch(
          fetchAnalyticsByYearAndMonth({
            purpose,
            level,
            year: 2025,
            month,
            location: selectedItem,
          })
        );
        if (fetchAnalyticsByYearAndMonth.fulfilled.match(resultAction)) {
          const dataWithMonth = resultAction.payload.map((item) => ({
            ...item,
            month,
          }));
          combinedData = combinedData.concat(dataWithMonth);
        }
      }
      setAllData(combinedData);
      dispatch(fetchPriceForecast({ purpose, level, name: selectedItem }));
    }
    fetchAllMonths();
  }, [dispatch, purpose, level, selectedItem]);

  const locationOptions = (level === "regions" ? regions : cities).map(
    (item) => ({
      value: item,
      label: RegionTranslations[item] || item,
    })
  );

  const chartData = useMemo(() => {
    if (!allData || !forecastData || !selectedItem) return [];
    const dataByLocation = allData.filter(
      (item) => item.location === selectedItem
    );
    const mergedMap = new Map();
    dataByLocation.forEach(({ month, avg_price }) => {
      const dateKey = `2025-${String(month).padStart(2, "0")}`;
      mergedMap.set(dateKey, { date: dateKey, actual: avg_price });
    });
    forecastData.forEach(({ ds, yhat }) => {
      const [year, month] = ds.split("-");
      const dateKey = `${year}-${month}`;
      if (mergedMap.has(dateKey))
        mergedMap.get(dateKey).forecast = Number(yhat.toFixed(2));
      else
        mergedMap.set(dateKey, {
          date: dateKey,
          forecast: Number(yhat.toFixed(2)),
        });
    });
    return Array.from(mergedMap.values());
  }, [allData, forecastData, selectedItem]);

  const chartContainerRef = useRef(null);

  const handleSaveChart = async () => {
    if (!chartContainerRef.current) {
      alert("Графік ще не готовий до збереження.");
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(chartContainerRef.current);

      const chartObject = {
        id: `${purpose}-${level}-${selectedItem}-${Date.now()}`,
        title: `Графік прогнозу: (${purpose === "buy" ? "Продаж" : "Оренда"}, ${
          level === "regions" ? "Регіон" : "Місто"
        }: ${RegionTranslations[selectedItem] || selectedItem})`,
        purpose,
        level,
        location: selectedItem,
        image: dataUrl,
        timestamp: new Date().toISOString(),
      };
      saveChartToLocal(chartObject);
      alert("Графік у вигляді зображення збережено!");
    } catch {
      alert("Не вдалося зберегти графік.");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          width: "1000px",
        }}
      >
        <Dropdown
          options={PURPOSE_OPTIONS}
          selected={purpose}
          onSelect={setPurpose}
          label="призначення"
        />
        <Dropdown
          options={LEVEL_OPTIONS}
          selected={level}
          onSelect={setLevel}
          label="рівень"
        />
        <Dropdown
          options={locationOptions}
          selected={selectedItem}
          onSelect={setSelectedItem}
          label={level === "regions" ? "регіон" : "місто"}
          disabled={locationOptions.length === 0}
        />
      </div>
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <>
          <div ref={chartContainerRef} style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const [year, month] = date.split("-");
                    return `${new Date(`${year}-${month}-01`).toLocaleString(
                      "uk-UA",
                      { month: "short" }
                    )} ${year}`;
                  }}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#0F3714"
                  name="Фактичні дані"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#3D86DB"
                  name="Прогнозовані дані"
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={handleSaveChart}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
          >
            Зберегти графік як зображення
          </button>
        </>
      )}
    </div>
  );
};

const Dropdown = ({ options, selected, onSelect, label, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label || `Оберіть ${label}`;
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        minWidth: 150,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "0.5rem 1rem",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {selectedLabel}
        <span style={{ float: "right" }}>▼</span>
      </button>
      {open && !disabled && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: 200,
            overflowY: "auto",
            margin: 0,
            padding: 0,
            listStyle: "none",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            zIndex: 10,
          }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                backgroundColor:
                  opt.value === selected ? "#ddd" : "transparent",
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default Forecast;
