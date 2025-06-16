import React from "react";
import css from "./UserPage.module.css";
import UserCharts from "../../components/UserCharts/UserCharts";
import {
  getSavedChartsFromLocal,
  removeChartFromLocal,
} from "/public/localStorageUtils.js";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";


const UserPage = () => {
  const [exportMode, setExportMode] = React.useState(false);
  const [selectedCharts, setSelectedCharts] = React.useState([]);
  const [exportFormat, setExportFormat] = React.useState("png");
  const [savedCharts, setSavedCharts] = React.useState([]);
  const [hoveredChart, setHoveredChart] = React.useState(null);
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });
  const hoverTimeout = React.useRef(null);
  
  
  React.useEffect(() => {
    setSavedCharts(getSavedChartsFromLocal());
  }, []);

  const handleRemove = (chartId) => {
    removeChartFromLocal(chartId);
    setSavedCharts(getSavedChartsFromLocal());
  };

  const toggleChartSelection = (id) => {
    setSelectedCharts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleMouseEnter = (chart) => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredChart(chart);
    }, 300); // затримка перед появою
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setHoveredChart(null);
  };

  const handleMouseMove = (e) => {
    setCursorPos({ x: e.clientX + 15, y: e.clientY + 15 });
  };
  

  const handleExport = async () => {
    const chartsToExport = savedCharts.filter((chart) =>
      selectedCharts.includes(chart.id)
    );

    if (exportFormat === "png" || exportFormat === "jpg") {
      chartsToExport.forEach((chart) => {
        const link = document.createElement("a");
        link.href = chart.image;
        link.download = `${chart.title}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else if (exportFormat === "pdf") {
      const pdf = new jsPDF();
      for (let i = 0; i < chartsToExport.length; i++) {
        const chart = chartsToExport[i];
        if (i !== 0) pdf.addPage();

        const imgProps = pdf.getImageProperties(chart.image);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(chart.image, "PNG", 0, 0, pdfWidth, pdfHeight);
      }
      pdf.save("charts.pdf");
    }

    setExportMode(false);
    setSelectedCharts([]);
  };

  return (
    <div className={css.UserPage}>
      <button onClick={() => setExportMode((prev) => !prev)}>
        {exportMode ? "Скасувати експорт" : "Експортувати"}
      </button>

      {exportMode && savedCharts.length > 0 && (
        <div>
          <h3 className={css.title}>Оберіть графіки для експорту:</h3>
          <ul className={css.list}>
            {savedCharts.map((chart) => (
              <li
                key={chart.id}
                className={css.listItem}
                onMouseEnter={() => handleMouseEnter(chart)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCharts.includes(chart.id)}
                    onChange={() => toggleChartSelection(chart.id)}
                    className={css.checkBox}
                  />
                  {chart.title}
                </label>
              </li>
            ))}
          </ul>
          <AnimatePresence>
            {hoveredChart && (
              <motion.div
                className={css.chartPreview}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "fixed",
                  top: cursorPos.y,
                  left: cursorPos.x,
                  pointerEvents: "none",
                  zIndex: 9999,
                  background: "#fff",
                  border: "1px solid #ccc",
                  padding: "5px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={hoveredChart.image}
                  alt="chart preview"
                  style={{ maxWidth: "500px", maxHeight: "350px" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label>
              Формат експорту:
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="pdf">PDF</option>
              </select>
            </label>
          </div>

          <button onClick={handleExport} disabled={selectedCharts.length === 0}>
            Зберегти обрані дані
          </button>
        </div>
      )}

      <UserCharts savedCharts={savedCharts} handleRemove={handleRemove} />
    </div>
  );
};

export default UserPage;
