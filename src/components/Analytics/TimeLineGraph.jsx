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
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalyticsByYearAndMonth,
  fetchYearsList,
  fetchAvailableMonths,
    fetchRegionsList,
  fetchCitiesList
} from "../../redux/real_estate/operators";
import RegionTranslations from "/public/regionTranslations.js";
import dayjs from "dayjs";

const SAVED_CHARTS_KEY = "savedCharts";

const saveChartToLocal = (chart) => {
  const existing = JSON.parse(localStorage.getItem(SAVED_CHARTS_KEY)) || [];
  localStorage.setItem(SAVED_CHARTS_KEY, JSON.stringify([...existing, chart]));
};

const purposes = [
  { value: "buy", label: "Продаж" },
  { value: "rent", label: "Оренда" },
];

const levels = [
  { value: "regions", label: "Регіони" },
  { value: "cities", label: "Міста" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        pointerEvents: "auto",
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "10px",
        maxWidth: "300px",
        maxHeight: "200px",
        overflowY: "auto",
        zIndex: 9999,
        position: "relative", // важливо, щоб не загубився у layout
        fontSize: "14px",
        lineHeight: "1.4",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      }}
    >
      <p style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
        Дата: {label}
      </p>
      <hr style={{ margin: "0.5rem 0" }} />
      {payload.map((entry, index) => {
        const name = RegionTranslations[entry.name] || entry.name;
        return (
          <div key={index} style={{ marginBottom: "4px" }}>
            <span style={{ color: entry.color, fontWeight: 600 }}>{name}:</span>{" "}
            {entry.value} грн
          </div>
        );
      })}
    </div>
  );
};



const Dropdown = ({ options, selected, onSelect, label, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
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
        onClick={() => !disabled && setOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "0.5rem 1rem",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        type="button"
        disabled={disabled}
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

const TimeLineGraph = () => {
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.realEstate.isLoggedIn);
  const [purpose, setPurpose] = useState("buy");
  const [level, setLevel] = useState("regions");
  const [startYear, setStartYear] = useState(null);
  const [startMonth, setStartMonth] = useState(null);
  const [endYear, setEndYear] = useState(null);
    const [endMonth, setEndMonth] = useState(null);
    const regions = useSelector((state) => state.realEstate.regionsList);
    const cities = useSelector((state) => state.realEstate.citiesList);

    const [selectedItem, setSelectedItem] = useState(null);


  const [data, setData] = useState([]);
    const years = useSelector((state) => state.realEstate.yearsList);
    const months = useSelector((state) => state.realEstate.months);

  const loading = useSelector((state) => state.realEstate.loading);

  // Завантажити роки
  useEffect(() => {
    dispatch(fetchYearsList());
  }, [dispatch]);

  // Завантажити місяці при зміні року, purpose або level
  useEffect(() => {
    if (startYear) {
      dispatch(fetchAvailableMonths({ purpose, level, year: startYear }));
    }
    if (endYear && endYear !== startYear) {
      dispatch(fetchAvailableMonths({ purpose, level, year: endYear }));
    }
  }, [dispatch, purpose, level, startYear, endYear]);

  // Завантаження аналітики
  useEffect(() => {
    const fetchData = async () => {
      if (!startYear || !startMonth || !endYear || !endMonth) return;

      const start = dayjs(`${startYear}-${startMonth}-01`);
      const end = dayjs(`${endYear}-${endMonth}-01`);

      const monthsToFetch = [];
      let current = start;

      while (current.isBefore(end) || current.isSame(end, "month")) {
        monthsToFetch.push({
          year: current.year(),
          month: current.month() + 1,
        });
        current = current.add(1, "month");
      }

      const allData = [];

      for (const { year, month } of monthsToFetch) {
        const res = await dispatch(
          fetchAnalyticsByYearAndMonth({ purpose, level, year, month })
        );
        if (res.payload && Array.isArray(res.payload)) {
          res.payload.forEach((entry) => {
            allData.push({
              ...entry,
              date: `${year}-${String(month).padStart(2, "0")}`,
            });
          });
        }
      }

      const grouped = {};

      for (const item of allData) {
        const key = item.location;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ date: item.date, avg_price: item.avg_price });

      }

      const result = [];

      Object.entries(grouped).forEach(([region, values]) => {
        values.forEach(({ date, avg_price }) => {
          const entry = result.find((r) => r.date === date);
          if (!entry) {
            result.push({ date, [region]: avg_price });
          } else {
            entry[region] = avg_price;
          }
        });
      });

      result.sort((a, b) => a.date.localeCompare(b.date));
      setData(result);
    };

    fetchData();
  }, [purpose, level, startYear, startMonth, endYear, endMonth, dispatch]);

  useEffect(() => {
    if (level === "regions") {
      dispatch(fetchRegionsList({ purpose }));
    } else {
      dispatch(fetchCitiesList({ purpose }));
    }
  }, [dispatch, level, purpose]);
  
    
  const translatedOptions = useMemo(
    () => (level === "regions" ? RegionTranslations : {}),
    [level]
    );
    const locationOptions = useMemo(() => {
      const source = level === "regions" ? regions : cities;
      return source.map((name) => ({
        value: name,
        label: RegionTranslations[name] || name,
      }));
    }, [level, regions, cities]);
    
  const chartContainerRef = useRef(null);
    
  const handleSaveChart = async () => {
    if (!chartContainerRef.current || data.length === 0) {
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
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <Dropdown
          options={purposes}
          selected={purpose}
          onSelect={setPurpose}
          label="тип операції"
        />
        <Dropdown
          options={levels}
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

        <Dropdown
          options={years.map((y) => ({ value: y, label: y }))}
          selected={startYear}
          onSelect={setStartYear}
          label="рік початку"
        />
        <Dropdown
          options={months.map((m) => ({ value: m.month, label: m.name }))}
          selected={startMonth}
          onSelect={setStartMonth}
          label="місяць початку"
          disabled={!startYear}
        />
        <Dropdown
          options={years.map((y) => ({ value: y, label: y }))}
          selected={endYear}
          onSelect={setEndYear}
          label="рік кінця"
        />
        <Dropdown
          options={months.map((m) => ({ value: m.month, label: m.name }))}
          selected={endMonth}
          onSelect={setEndMonth}
          label="місяць кінця"
          disabled={!endYear}
        />
        {isLoggedIn && (
          <button onClick={handleSaveChart} style={{ padding: "0.5rem 1rem" }}>
            Зберегти графік
          </button>
        )}
      </div>

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" interval={0} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              {data.length > 0 &&
                Object.keys(data[0])
                  .filter((key) => key !== "date")
                  .filter((key) => !selectedItem || key === selectedItem)
                  .map((key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={`hsl(${(idx * 137.5) % 360}, 70%, 50%)`}
                      name={translatedOptions[key] || key}
                      dot={false}
                    />
                  ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TimeLineGraph;