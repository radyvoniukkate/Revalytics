import React, { useState } from "react";
import css from "./ChartSelector.module.css";

const chartDescriptions = {
  analytics:
    "Порівняльна діаграма цін і кількості об'єктів нерухомості за регіонами або містами.\nВідображає зміни за вибраний період.",
  regionDetails:
    "Областевий графік відображає кількість об'єктів нерухомості в обраному регіоні або місті по місяцях за один або кілька років.\nКожна залита область відповідає певному року, що дозволяє порівнювати сезонні коливання та зміни активності на ринку.\nГрафік допомагає виявити пікові періоди попиту.",
  geographicChart:
    "Географічна карта відображає середню ціну на нерухомість по регіонах України за вибраний рік і тип операції (купівля або оренда).\nКолір регіону змінюється залежно від рівня цін: від світло-зеленого (нижча ціна) до темно-зеленого (вища ціна).\nНаведіть курсор на регіон для перегляду детальної інформації.",
  timeLineGraph:
    "Лінійна діаграма показує зміну середньої ціни на нерухомість у регіонах або містах протягом вибраного періоду.\nКожна лінія відповідає окремому регіону чи місту.\nГрафік дозволяє порівнювати динаміку вартості між кількома локаціями або зосередитись на одній.",
  usdCorrelationGraph:
    "Лінійна діаграма показує залежність між ціною нерухомості та курсом долара США у вибраному місті або регіоні.\nДані відображаються за вказаний період часу та дають змогу виявити потенційну кореляцію між змінами курсу USD та вартістю житла.\nГрафік має дві осі: ціну в гривнях і курс долара.",
  forecast:
    "Лінійна діаграма відображає фактичні ціни на нерухомість за останні місяці та прогнозовані значення на майбутнє.\nСуцільна лінія показує реальні дані, пунктирна — очікуваний тренд.\nДоступно для регіонів або міст за вибраним типом операції.",
};

const ChartSelector = ({ selectedChart, onSelect }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });

  const handleMouseEnter = (e, key) => {
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY + 10,
      text: chartDescriptions[key],
    });
  };

  const handleMouseMove = (e) => {
    setTooltip((prev) => ({
      ...prev,
      x: e.clientX + 10,
      y: e.clientY + 10,
    }));
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, text: "" });
  };

  const renderButton = (key, imgSrc, label) => (
    <button
      key={key}
      onClick={() => onSelect(key)}
      onMouseEnter={(e) => handleMouseEnter(e, key)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={css.btn}
      style={{
        fontWeight: selectedChart === key ? "bold" : "normal",
      }}
    >
      <img src={imgSrc} alt={label} width="100" height="100" />
      {label}
    </button>
  );

  return (
    <div className={css.ChartSelector}>
      {renderButton("analytics", "/graph_16235270.png", "Стовпцева діаграма")}
      {renderButton(
        "regionDetails",
        "/area-chart_9129677.png",
        "Областевий графік"
      )}
      {renderButton(
        "geographicChart",
        "/map_14093240.png",
        "Географічна карта"
      )}
      {renderButton("timeLineGraph", "/chart_14195563.png", "Лінійна діаграма")}
      {renderButton(
        "usdCorrelationGraph",
        "/line-graphic_13340584.png",
        "Кореляція з USD"
      )}
      {renderButton("forecast", "/cloud_16633805.png", "Прогноз")}

      {tooltip.visible && (
        <div
          className={css.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            maxWidth: 300,
          }}
        >
          {tooltip.text.split("\n").map((line, idx) => (
            <p key={idx} style={{ margin: 0, paddingBottom: "6px" }}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartSelector;
