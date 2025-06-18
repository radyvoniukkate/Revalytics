import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import html2canvas from "html2canvas";
import {
  fetchAnalyticsByYearAndMonth,
  fetchYearsList,
  fetchAvailableMonths,
} from "../../redux/real_estate/operators";
import {
  selectAnalytics,
  selectLoading,
  selectError,
  years as selectYearsList,
  selectAvailableMonths,
} from "../../redux/real_estate/selector";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import css from "./Analytics.module.css";
import RegionTranslations from "/public/regionTranslations.js";
import { saveChartToLocal } from "/public/localStorageUtils.js";

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
  const ref = useRef();

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

const Analytics = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const yearsRaw = useSelector(selectYearsList);
  const availableMonths = useSelector(selectAvailableMonths);
  const analytics = useSelector(selectAnalytics);
  const isLoggedIn = useSelector((state) => state.realEstate.isLoggedIn); // ⚠️ адаптуй до своєї auth-структури

  const chartRef = useRef();

  const translatedAnalytics = analytics?.map((item) => ({
    ...item,
    regionUA: RegionTranslations[item.location] || item.location,
  }));

  const tooltipLabelFormatter = (label) => RegionTranslations[label] || label;

  const years = yearsRaw
    ? yearsRaw.map((y) => ({ value: y, label: y.toString() }))
    : [];
  const months = availableMonths
    ? availableMonths.map((m) => ({ value: m.month, label: m.name }))
    : [];

  const [selectedPurpose, setSelectedPurpose] = useState("buy");
  const [selectedLevel, setSelectedLevel] = useState("regions");
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    dispatch(fetchYearsList());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPurpose && selectedLevel && selectedYear) {
      dispatch(
        fetchAvailableMonths({
          purpose: selectedPurpose,
          level: selectedLevel,
          year: selectedYear,
        })
      );
    }
  }, [dispatch, selectedPurpose, selectedLevel, selectedYear]);

  useEffect(() => {
    setSelectedMonth(null);
  }, [selectedYear]);

  useEffect(() => {
    if (selectedPurpose && selectedLevel && selectedYear) {
      const params = {
        purpose: selectedPurpose,
        level: selectedLevel,
        year: selectedYear,
      };
      if (selectedMonth) params.month = selectedMonth;
      dispatch(fetchAnalyticsByYearAndMonth(params));
    }
  }, [dispatch, selectedPurpose, selectedLevel, selectedYear, selectedMonth]);
  const handleSave = async () => {
    const chartContainer = chartRef.current;
    if (!chartContainer) {
      alert("Графік ще не готовий.");
      return;
    }

    const canvas = await html2canvas(chartContainer);
    const image = canvas.toDataURL("image/png");

    const chartObject = {
      id: `${selectedPurpose}-${selectedLevel}-${selectedYear}-${
        selectedMonth || "all"
      }-${Date.now()}`,
      title: `Стовпцева діаграма (${selectedPurpose}, ${selectedLevel}, ${selectedYear}${
        selectedMonth ? ", " + selectedMonth : ""
      })`,
      year: selectedYear,
      month: selectedMonth,
      level: selectedLevel,
      purpose: selectedPurpose,
      image,
      timestamp: new Date().toISOString(),
    };

    saveChartToLocal(chartObject);
    alert("Графік збережено у вигляді зображення!");
  };

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>Помилка: {error}</p>;

  return (
    <div className={css.MainBox}>
      <div
        style={{
          marginBottom: "1rem",
          maxWidth: 800,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Dropdown
          options={purposes}
          selected={selectedPurpose}
          onSelect={setSelectedPurpose}
          label="призначення"
        />
        <Dropdown
          options={levels}
          selected={selectedLevel}
          onSelect={setSelectedLevel}
          label="рівень"
        />
        <Dropdown
          options={years}
          selected={selectedYear}
          onSelect={setSelectedYear}
          label="рік"
        />
        <Dropdown
          options={months}
          selected={selectedMonth}
          onSelect={setSelectedMonth}
          label="місяць"
          disabled={!selectedYear || months.length === 0}
        />
      </div>

      {selectedPurpose && selectedYear && selectedLevel && (
        <>
          <div
            style={{
              position: "absolute",
              left: 60,
              top: "50%",
              transform: "translate(-100%, -50%) rotate(-90deg)",
              color: "#0F3714",
              fontWeight: "bold",
            }}
          >
            Середня ціна (грн)
          </div>
          <div
            style={{
              position: "absolute",
              left: 1350,
              top: "50%",
              transform: "translate(-100%, -50%) rotate(90deg)",
              color: "#3D86DB",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              width: "max-content",
            }}
          >
            Кількість об'єктів
          </div>
          <div ref={chartRef} style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer
              className={css.container}
            >
              <BarChart
                data={translatedAnalytics}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="regionUA" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip labelFormatter={tooltipLabelFormatter} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="avg_price"
                  fill="#0F3714"
                  name="Середня ціна"
                />
                <Bar
                  yAxisId="right"
                  dataKey="count"
                  fill="#3D86DB"
                  name="Кількість об'єктів"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {isLoggedIn && (
            <button onClick={handleSave} style={{ marginTop: "1rem" }}>
              Зберегти графік
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
