import React from "react";
import css from "./ChartSelector.module.css"

const ChartSelector = ({ selectedChart, onSelect }) => {
  return (
    <div className={css.ChartSelector}>
      <button
        onClick={() => onSelect("analytics")}
        className={css.btn}
        style={{
          fontWeight: selectedChart === "analytics" ? "bold" : "normal",
        }}
      >
        <img
          src="/public/graph_16235270.png"
          alt="Аналітика"
          width="100"
          height="100"
        />
        Стовпцева діаграма
      </button>

      <button
        onClick={() => onSelect("regionDetails")}
        className={css.btn}
        style={{
          fontWeight: selectedChart === "regionDetails" ? "bold" : "normal",
        }}
      >
        <img
          src="/public/area-chart_9129677.png"
          alt="Деталі регіону"
          width="100"
          height="100"
        />
        Областевий графік
      </button>

      <button
        className={css.btn}
        onClick={() => onSelect("geographicChart")}
        style={{
          fontWeight: selectedChart === "geographicChart" ? "bold" : "normal",
        }}
      >
        <img
          src="/public/map_14093240.png"
          alt="Географічна карта"
          width="100"
          height="100"
        />
        Географічна карта
      </button>
      <button
        onClick={() => onSelect("timeLineGraph")}
        className={css.btn}
        style={{
          fontWeight: selectedChart === "timeLineGraph" ? "bold" : "normal",
        }}
      >
        <img
          src="/public/chart_14195563.png"
          alt="Граф"
          width="100"
          height="100"
        />
        Лінійна діаграма
      </button>
      <button
        onClick={() => onSelect("usdCorrelationGraph")}
        className={css.btn}
        style={{
          fontWeight:
            selectedChart === "usdCorrelationGraph" ? "bold" : "normal",
        }}
      >
        <img
          src="/public/line-graphic_13340584.png"
          alt="Кореляція"
          width="100"
          height="100"
        />
        Кореляція з USD
      </button>
      <button
        onClick={() => onSelect("forecast")}
        className={css.btn}
        style={{
          fontWeight: selectedChart === "forecast" ? "bold" : "normal",
        }}
      >
        <img
          src="/public/cloud_16633805.png"
          alt="Прогноз"
          width="100"
          height="100"
        />
        Прогноз
      </button>
    </div>
  );
};

export default ChartSelector;
