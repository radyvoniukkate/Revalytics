import React, { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalyticsByYearAndMonth,
  fetchYearsList,
  fetchAvailableMonths,
  fetchRegionsList,
  fetchCitiesList,
  fetchUsd,
} from "../../redux/real_estate/operators";
import RegionTranslations from "/public/regionTranslations.js";
import dayjs from "dayjs";

const purposes = [
  { value: "buy", label: "Продаж" },
  { value: "rent", label: "Оренда" },
];

const levels = [
  { value: "regions", label: "Регіони" },
  { value: "cities", label: "Міста" },
];

const Dropdown = ({ options, selected, onSelect, label, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef();

  useEffect(() => {
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

const UsdCorrelationGraph = () => {
  const dispatch = useDispatch();
  const [purpose, setPurpose] = useState("buy");
  const [level, setLevel] = useState("regions");
  const [selectedItem, setSelectedItem] = useState(null);
  const [startYear, setStartYear] = useState(null);
  const [startMonth, setStartMonth] = useState(null);
  const [endYear, setEndYear] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [data, setData] = useState([]);

  const years = useSelector((state) => state.realEstate.yearsList);
  const months = useSelector((state) => state.realEstate.months);
  const regions = useSelector((state) => state.realEstate.regionsList);
  const cities = useSelector((state) => state.realEstate.citiesList);
  const loading = useSelector((state) => state.realEstate.loading);

  useEffect(() => {
    dispatch(fetchYearsList());
  }, [dispatch]);

  useEffect(() => {
    if (startYear)
      dispatch(fetchAvailableMonths({ purpose, level, year: startYear }));
    if (endYear && endYear !== startYear)
      dispatch(fetchAvailableMonths({ purpose, level, year: endYear }));
  }, [dispatch, purpose, level, startYear, endYear]);

  useEffect(() => {
    if (level === "regions") {
      dispatch(fetchRegionsList({ purpose }));
    } else {
      dispatch(fetchCitiesList({ purpose }));
    }
  }, [dispatch, level, purpose]);

  useEffect(() => {
    const fetchData = async () => {
      if (!startYear || !startMonth || !endYear || !endMonth || !selectedItem)
        return;

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

      const combinedData = [];

      for (const { year, month } of monthsToFetch) {
        const analyticsRes = await dispatch(
          fetchAnalyticsByYearAndMonth({ purpose, level, year, month })
        );
        const usdRes = await dispatch(fetchUsd({ year, month }));

        const date = `${year}-${String(month).padStart(2, "0")}`;
        const usdEntry = Array.isArray(usdRes.payload)
          ? usdRes.payload.find(
              (entry) => entry.year === year && entry.month === month
            )
          : null;

          const usd = usdEntry?.usd ?? null;

        console.log("Found USD entry:", usdEntry, "for", year, month);


        if (Array.isArray(analyticsRes.payload)) {
          const item = analyticsRes.payload.find(
            (entry) => entry.location === selectedItem
          );
          
          console.log("Selected item:", selectedItem);
          console.log(
            "Looking in entries:",
            analyticsRes.payload.map((e) =>
              level === "regions" ? e.region : e.city
            )
          );
          console.log("Один із записів:", analyticsRes.payload[0]);

          console.log("analyticsRes:", analyticsRes.payload);
          console.log("usdRes:", usdRes.payload);
          console.log("Parsed USD rate:", usd);

          if (item) {
            combinedData.push({ date, usd, price: item.avg_price });
          }
        }
      }
      setData(combinedData.sort((a, b) => a.date.localeCompare(b.date)));
      console.log("combinedData:", combinedData);

    };

    fetchData();
  }, [
    dispatch,
    purpose,
    level,
    selectedItem,
    startYear,
    startMonth,
    endYear,
    endMonth,
  ]);

  const locationOptions = useMemo(() => {
    const source = level === "regions" ? regions : cities;
    return source.map((name) => ({
      value: name,
      label: RegionTranslations[name] || name,
    }));
  }, [level, regions, cities]);
  
  {
    console.log("RENDERED DATA:", data);
  }

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
      </div>
      
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <div style={{ width: "100%", height: "400px" }}>
  <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 60, left: 60, bottom: 40 }} // ← Додано відступи
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="category"
              label={{
                value: "Дата",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              yAxisId="left"
              dataKey="price"
              orientation="left"
              tickFormatter={(v) => `${v.toLocaleString()}₴`}
            />
            <YAxis
              yAxisId="right"
              dataKey="usd"
              orientation="right"
              tickFormatter={(v) => `${v.toFixed(2)}$`}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "usd"
                  ? [`${value.toFixed(2)}$`, "Курс USD"]
                  : [`${value.toLocaleString()}₴`, "Ціна житла"]
              }
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#0F3714"
              dot={false}
              name="Ціна житла"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="usd"
              stroke="#3D86DB"
              dot={false}
              name="Курс USD"
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default UsdCorrelationGraph;
