import React from "react";
import css from "./UserCharts.module.css";

const UserCharts = ({ savedCharts, handleRemove }) => {
    return (
      <div className={css.ChartDiv}>
        <h2>Збережені графіки</h2>
        {savedCharts.length === 0 ? (
          <p>У вас поки немає збережених графіків.</p>
        ) : (
          <ul className={css.ChartList}>
            {savedCharts.map((chart) => (
              <li key={chart.id} className={css.ChartItem}>
                <p>{chart.title}</p>
                {chart.image && (
                  <img
                    src={chart.image}
                    alt={chart.title}
                    style={{
                      maxWidth: "800px",
                      height: "auto",
                      marginBottom: "8px",
                    }}
                  />
                )}
                <button onClick={() => handleRemove(chart.id)}>Видалити</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  export default UserCharts;