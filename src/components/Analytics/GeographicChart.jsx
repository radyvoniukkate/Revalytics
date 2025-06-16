import React, { useEffect, useState, useRef } from "react";
import { Chart } from "react-google-charts";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvgPriceAndCountByLocation,
  fetchYearsList,
} from "../../redux/real_estate/operators";
import {
  selectAnalytics,
  selectLoading,
  selectError,
  years as selectYearsList,
} from "../../redux/real_estate/selector";
import REGION_TRANSLATIONS from "/public/regionTranslations";
import { saveChartToLocal } from "/public/localStorageUtils.js";

const regionCodes = {
  Kyivska: "UA-32",
  Vinnytska: "UA-05",
  Volynska: "UA-07",
  Dnipropetrovska: "UA-12",
  Donetska: "UA-14",
  Zhytomyrska: "UA-18",
  Zakarpatska: "UA-21",
  Zaporizka: "UA-23",
  "Ivano-Frankivska": "UA-26",
  Kyiv: "UA-30",
  Kirovohradska: "UA-35",
  Luhanska: "UA-09",
  Lvivska: "UA-46",
  Mykolaivska: "UA-48",
  Odeska: "UA-51",
  Poltavska: "UA-53",
  Rivnenska: "UA-56",
  Sumska: "UA-59",
  Ternopilska: "UA-61",
  Kharkivska: "UA-63",
  Khersonska: "UA-65",
  Khmelnytska: "UA-68",
  Cherkaska: "UA-71",
  Chernivetska: "UA-77",
  Chernihivska: "UA-74",
};

const Dropdown = ({ options, selected, onSelect, label }) => {
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

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 150 }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "200px",
          padding: "0.5rem 1rem",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        {selected || `Оберіть ${label}`}
        <span style={{ float: "right" }}>▼</span>
      </button>
      {open && (
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
              key={opt}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                backgroundColor: opt === selected ? "#ddd" : "transparent",
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const GeographicChart = () => {
  const dispatch = useDispatch();
  const analytics = useSelector(selectAnalytics);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const years = useSelector(selectYearsList);
  const chartRef = useRef(null);
  const isLoggedIn = useSelector((state) => state.realEstate.isLoggedIn);

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);

  const operationTypes = [
    { label: "Купівля", value: "buy" },
    { label: "Оренда", value: "rent" },
  ];

  useEffect(() => {
    dispatch(fetchYearsList());
  }, [dispatch]);

  useEffect(() => {
    if (selectedYear && selectedOperation) {
      dispatch(
        fetchAvgPriceAndCountByLocation({
          purpose: selectedOperation,
          level: "regions",
          year: selectedYear,
        })
      );
    }
  }, [dispatch, selectedYear, selectedOperation]);

  const chartData = [
    [
      "Region",
      "Average Price",
      { role: "tooltip", type: "string", p: { html: true } },
    ],
    ...analytics
      .filter((item) => regionCodes[item.region] || item.location === "Kyiv")
      .map((item) => {
        const isKyivCity = item.location === "Kyiv";
        const code = isKyivCity ? "UA-30" : regionCodes[item.region];
        const translated = isKyivCity
          ? "м. Київ"
          : REGION_TRANSLATIONS[item.region] || item.region;

        return [
          code,
          item.avg_price,
          `<div style="padding: 5px;">
            <strong>${translated}</strong><br/>
            Середня ціна: ${item.avg_price.toLocaleString()} грн
          </div>`,
        ];
      }),
  ];

  const options = {
    region: "UA",
    displayMode: "regions",
    resolution: "provinces",
    colorAxis: { colors: ["#A2E75A", "#0F3714"] },
    tooltip: { isHtml: true },
    backgroundColor: "transparent",
    datalessRegionColor: "#e0e0e0",
  };

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>Помилка: {error}</p>;

  return (
    <div>
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Dropdown
          options={years || []}
          selected={selectedYear}
          onSelect={setSelectedYear}
          label="рік"
        />
        <Dropdown
          options={operationTypes.map((o) => o.label)}
          selected={
            selectedOperation
              ? operationTypes.find((o) => o.value === selectedOperation)?.label
              : null
          }
          onSelect={(label) =>
            setSelectedOperation(
              operationTypes.find((o) => o.label === label)?.value || null
            )
          }
          label="операцію"
        />
        {isLoggedIn && (
          <button
            onClick={() => {
              if (!chartRef.current) {
                alert("Графік ще не готовий до збереження.");
                return;
              }

              const imageUri = chartRef.current.getImageURI();

              const chartObject = {
                id: `${selectedYear}-${selectedOperation}-${Date.now()}`,
                title: `Географічний графік (${selectedYear}, ${
                  selectedOperation === "buy" ? "купівля" : "оренда"
                })`,
                year: selectedYear,
                operation: selectedOperation,
                image: imageUri,
                timestamp: new Date().toISOString(),
              };

              saveChartToLocal(chartObject);
              alert("Графік у вигляді зображення збережено!");
            }}
          >
            Зберегти графік
          </button>
        )}
      </div>

      {selectedYear && selectedOperation && (
        <>
          <Chart
            chartType="GeoChart"
            width="1200px"
            height="400px"
            data={chartData}
            options={options}
            chartEvents={[
              {
                eventName: "ready",
                callback: ({ chartWrapper }) => {
                  chartRef.current = chartWrapper.getChart();
                },
              },
              {
                eventName: "select",
                callback: ({ chartWrapper }) => {
                  const chart = chartWrapper.getChart();
                  const selection = chart.getSelection();
                  if (selection.length === 0) return;
                  const code = chartData[selection[0].row + 1][0];
                  const value = chartData[selection[0].row + 1][1];
                  console.log(
                    `Обрана область: ${code}, середня ціна: ${value}`
                  );
                },
              },
            ]}
          />
        </>
      )}
    </div>
  );
};

export default GeographicChart;
