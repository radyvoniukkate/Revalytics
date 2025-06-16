import { useState } from "react";
import css from "./AnalyticPage.module.css";
import GeographicChart from "../../components/Analytics/GeographicChart";
import RegionDetails from "../../components/RegionDetails/RegionDetails";
import Analytics from "../../components/Analytics/Analytics";
import ChartSelector from "../../components/ChartSelector/ChartSelector"; 
import TimeLineGraph from "../../components/Analytics/TimeLineGraph";
import UsdCorrelationGraph from "../../components/Analytics/UsdCorrelationGraph";
import Forecast from "../../components/Analytics/Forecast";

function AnalyticPage() {
 

  const [selectedChart, setSelectedChart] = useState(null);

  return (
    <div className={css.AnalyticPage}>
      <ChartSelector
        selectedChart={selectedChart}
        onSelect={setSelectedChart}
      />

      {selectedChart === "analytics" && <Analytics />}
      {selectedChart === "regionDetails" && <RegionDetails />}
      {selectedChart === "geographicChart" && <GeographicChart />}
      {selectedChart === "timeLineGraph" && <TimeLineGraph />}
      {selectedChart === "usdCorrelationGraph" && <UsdCorrelationGraph />}
      {selectedChart === "forecast" && <Forecast />}
    </div>
  );
}

export default AnalyticPage;
