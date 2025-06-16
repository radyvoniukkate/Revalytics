import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRegionDetails,
  fetchRegionsList,
  fetchCitiesList,
  fetchYearsList,
} from "../../redux/real_estate/operators";
import {
  selectRegionDetails,
  selectLoading,
  selectError,
  years as selectYearsList,
  regions as selectRegionsList,
  cities as selectCitiesList, // додаємо селектор міст
} from "../../redux/real_estate/selector";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

import css from "./RegionDetails.module.css";
import RegionTranslations from "/public/regionTranslations.js";

const step = 100;
const monthNames = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];


const COLORS = [
  "#0F3714",
  "#3939F5",
  "#3D86DB",
  "#71830B",
  "#D84343",
  "#F5EF39",
  "#FF0D0D",
  "#B5C6E8",
  "#8a79af",
];

const purposes = [
  { value: "buy", label: "Продаж" },
  { value: "rent", label: "Оренда" },
];

const levels = [
  { value: "regions", label: "Регіони" },
  { value: "cities", label: "Міста" },
];

const RegionDetails = () => {
  const dispatch = useDispatch();

  const [selectedPurpose, setSelectedPurpose] = useState("buy");
  const [selectedLevel, setSelectedLevel] = useState("regions");
  const [selectedLocation, setSelectedLocation] = useState(""); // регіон або місто
  const [selectedYears, setSelectedYears] = useState([]);

  const details = useSelector(selectRegionDetails);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const yearsList = useSelector(selectYearsList);
  const regionsList = useSelector(selectRegionsList);
  const citiesList = useSelector(selectCitiesList);

  useEffect(() => {
    dispatch(fetchRegionsList());
    dispatch(fetchCitiesList());
    dispatch(fetchYearsList());
  }, [dispatch]);
  

  // Автоматично вибираємо перший рік, якщо немає вибраних
  useEffect(() => {
    if (yearsList.length > 0 && selectedYears.length === 0) {
      setSelectedYears([yearsList[0]]);
    }
  }, [yearsList, selectedYears]);

  // При зміні рівня або призначення скидаємо вибір локації
  useEffect(() => {
    setSelectedLocation("");
  }, [selectedLevel, selectedPurpose]);

  // Запит деталей при зміні локації, років, призначення, рівня
  useEffect(() => {
    if (selectedLocation && selectedYears.length > 0) {
      console.log("Dispatching fetchRegionDetails with:", {
        purpose: selectedPurpose,
        level: selectedLevel,
        locationName: selectedLocation,
        years: selectedYears,
      });
      dispatch(
        fetchRegionDetails({
          purpose: selectedPurpose,
          level: selectedLevel,
          regionName: selectedLocation,
          years: selectedYears,
        })
      );
    }
  }, [
    dispatch,
    selectedPurpose,
    selectedLevel,
    selectedLocation,
    selectedYears,
  ]);

  // Інтерполяція
  const interpolate = (priceList, yearData, target) => {
    const left = [...priceList]
      .reverse()
      .find((p) => p < target && yearData[p] !== undefined);
    const right = priceList.find(
      (p) => p > target && yearData[p] !== undefined
    );

    if (left !== undefined && right !== undefined) {
      const leftVal = yearData[left];
      const rightVal = yearData[right];
      const ratio = (target - left) / (right - left);
      return Math.round(leftVal + (rightVal - leftVal) * ratio);
    }
    return 0;
  };

  const chartData = useMemo(() => {
    if (!details.length) return [];

    // Створюємо масив місяців 1-12 для X-ось
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Групуємо дані по роках і місяцях: { [year]: { [month]: count } }
    const groupedByYear = {};
    selectedYears.forEach((year) => {
      groupedByYear[year] = {};
    });

    details.forEach(({ year, month, count }) => {
      if (!groupedByYear[year]) groupedByYear[year] = {};
      groupedByYear[year][month] = count;
    });

    // Формуємо масив для графіка: [{ month: 1, 2023: 500, 2024: 600 }, ...]
    return months.map((month) => {
      const point = { month };
      selectedYears.forEach((year) => {
        point[year] = groupedByYear[year]?.[month] ?? 0; // якщо немає — 0
      });
      return point;
    });
  }, [details, selectedYears]);
  

  // Керування роками (додавання/зміна)
  const addYear = () => {
    const availableYears = yearsList.filter((y) => !selectedYears.includes(y));
    if (availableYears.length > 0) {
      setSelectedYears([...selectedYears, availableYears[0]]);
    }
  };
  const onYearChange = (index, newYear) => {
    const newSelectedYears = [...selectedYears];
    newSelectedYears[index] = newYear;
    setSelectedYears(newSelectedYears);
  };
  
  // Визначаємо список для локації (регіони чи міста)
  const locationOptions =
    selectedLevel === "regions" ? regionsList : citiesList;
    console.log("chartData:", chartData);

  return (
    <div className={css.RegionDetails}>
      <div className={css.Filter}>
        <div className={css.FiltersRow}>
          {/* Dropdown Типу операції */}
          <label className={css.Selector}>
            Тип операції:&nbsp;
            <select
              className={css.Select}
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
            >
              {purposes.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {/* Dropdown Рівня */}
          <label className={css.Selector}>
            Рівень:&nbsp;
            <select
              className={css.Select}
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levels.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {/* Dropdown для вибору конкретного регіону чи міста */}
          <label className={css.Selector}>
            {selectedLevel === "regions" ? "Регіон:" : "Місто:"}&nbsp;
            <select
              className={css.Select}
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">
                Оберіть {selectedLevel === "regions" ? "регіон" : "місто"}
              </option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {RegionTranslations[loc] || loc}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Вибір років */}
        <div className={css.YearsBlock}>
          <label className={css.Label}>Оберіть роки:</label>
          <div className={css.SelectWrapper}>
            {selectedYears.map((year, idx) => (
              <div key={idx} className={css.YearSelectBlock}>
                <select
                  value={year}
                  onChange={(e) => onYearChange(idx, Number(e.target.value))}
                  className={css.Select}
                >
                  {yearsList
                    .filter((y) => !selectedYears.includes(y) || y === year)
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                </select>
                {selectedYears.length > 1 && (
                  <button
                    type="button"
                    className={css.RemoveButton}
                    onClick={() =>
                      setSelectedYears(
                        selectedYears.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedYears.length < yearsList.length && (
            <button type="button" onClick={addYear} className={css.AddButton}>
              Додати рік
            </button>
          )}
        </div>
      </div>

      <div className={css.Chart}>
        {selectedLocation && selectedYears.length > 0 && (
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <XAxis
                dataKey="month"
                tickFormatter={(tick) => monthNames[tick - 1] || ""}
              />
              <YAxis>
                <Label
                  value="Кількість об'єктів"
                  angle={-90}
                  position="insideLeft"
                  offset={5}
                />
              </YAxis>
              <Tooltip
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => monthNames[label - 1] || ""}
              />
              {selectedYears.map((year, idx) => {
                const color = COLORS[idx % COLORS.length];
                return (
                  <Area
                    key={year}
                    type="monotone"
                    dataKey={year}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {(loading || error) && (
          <p>{loading ? "Завантаження..." : `Помилка: ${error}`}</p>
        )}
      </div>
    </div>
  );
};

export default RegionDetails;
