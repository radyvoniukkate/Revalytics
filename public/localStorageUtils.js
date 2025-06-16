const SAVED_CHARTS_KEY = "savedCharts";

export const saveChartToLocal = (chart) => {
  const existing = JSON.parse(localStorage.getItem(SAVED_CHARTS_KEY)) || [];
  const updated = [...existing, chart];
  localStorage.setItem(SAVED_CHARTS_KEY, JSON.stringify(updated));
};

export const getSavedChartsFromLocal = () => {
  return JSON.parse(localStorage.getItem(SAVED_CHARTS_KEY)) || [];
};

export const removeChartFromLocal = (chartId) => {
  const existing = JSON.parse(localStorage.getItem(SAVED_CHARTS_KEY)) || [];
  const updated = existing.filter((chart) => chart.id !== chartId);
  localStorage.setItem(SAVED_CHARTS_KEY, JSON.stringify(updated));
};
