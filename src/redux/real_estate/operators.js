import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading, setError, setRegionDetails } from "./slice";

const BASE_URL = "https://revalytics-backend.onrender.com/";

// Отримати аналітику по регіонах за рік
export const fetchAnalyticsByRegion = createAsyncThunk(
  "realEstate/fetchAnalyticsByRegion",
  async (year, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/analytics/regions/${year}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Отримати новини
export const fetchNews = createAsyncThunk(
  "realEstate/fetchNews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/news`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchUsd = createAsyncThunk(
  "realEstate/fetchUsd",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/usd`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Дані по конкретному регіону
export const fetchRegionDetails =
  ({ purpose, level, regionName, years }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const results = [];

      for (const year of years) {
        const response = await axios.get(
          `${BASE_URL}/analytics/${purpose}/${level}/${regionName}/${year}/monthly`
        );
        console.log("Response data:", response.data);

        response.data.forEach((item) => (item.year = year));
        results.push(...response.data);
      }

      dispatch(setRegionDetails(results));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };


// Додавання нового запису
export const addNewItem = createAsyncThunk(
  "realEstate/addNewItem",
  async ({ item, year }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/items/${year}`, item);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Отримати список років
export const fetchYearsList = createAsyncThunk(
  "realEstate/fetchYearsList",
  async (_, { rejectWithValue }) => {
    try {
      // За замовчуванням отримуємо роки для "buy" і "regions"
      const purpose = "buy";
      const level = "regions";
      const res = await axios.get(`${BASE_URL}/years/${purpose}/${level}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Отримати список регіонів
export const fetchRegionsList = createAsyncThunk(
  "realEstate/fetchRegionsList",
  async (_, { rejectWithValue }) => {
    try {
      // За замовчуванням отримуємо регіони для "buy" і "regions"
      const purpose = "buy";
      const level = "regions";
      const res = await axios.get(`${BASE_URL}/locations/${purpose}/${level}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAvailableMonths = createAsyncThunk(
  "realEstate/fetchAvailableMonths",
  async ({ purpose, level, year }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/months/${purpose}/${level}`,
        { params: { year } }
      );
      return response.data; // очікуємо масив {month, name}
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCitiesList = createAsyncThunk(
  "realEstate/fetchCitiesList",
  async (_, { rejectWithValue }) => {
    try {
      // За замовчуванням отримуємо регіони для "buy" і "regions"
      const purpose = "buy";
      const level = "cities";
      const res = await axios.get(`${BASE_URL}/locations/${purpose}/${level}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAveragePriceByLocation = createAsyncThunk(
  "realEstate/fetchAveragePriceByLocation",
  async ({ purpose, level, year }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/analytics/${purpose}/${level}/${year}`
      );
      console.log("Дані з API fetchAveragePriceByLocation:", response.data);
      return response.data; // тут очікуємо масив об'єктів з { region, avg_price, count }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAvgPriceAndCountByLocation = createAsyncThunk(
  "realEstate/fetchAvgPriceAndCountByLocation",
  async ({ purpose, level, year }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/analytics/${purpose}/${level}/${year}`
      );
      return response.data; // масив { region, avg_price, count }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAnalyticsByYearAndMonth = createAsyncThunk(
  "realEstate/fetchAnalyticsByYearAndMonth",
  async ({ purpose, level, year, month, location }, thunkAPI) => {
    try {
      const url = `${BASE_URL}/location/${purpose}/${level}/${year}`;
      const params = {};

      if (month !== undefined && month !== null) {
        params.month = month;
      }

      if (location) {
        if (level === "cities") {
          params.region = location;
        } else if (level === "regions") {
          params.region = location;
        }
      }      

      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ||
          error.message ||
          "Помилка при отриманні аналітики"
      );
    }
  }
);


export const fetchPriceForecast = createAsyncThunk(
  "realEstate/fetchPriceForecast",
  async ({ purpose, level, name }, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          purpose,
          level,
          name,
        },
      });
      return response.data.forecast;

    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ username, password }, thunkAPI) => {
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Помилка реєстрації");
      return data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password }, thunkAPI) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Помилка входу");
      localStorage.setItem("token", data.token); // Збереження токену в localStorage
      return { token: data.token, message: data.message };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Користувач не авторизований");

      const res = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Помилка виходу");

      localStorage.removeItem("token");
      return data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const saveChart = createAsyncThunk(
  "analytics/saveChart",
  async (chartData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Користувач не авторизований");

      const res = await fetch(`${BASE_URL}/charts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(chartData),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Не вдалося зберегти графік");

      return data; // можна повернути saved chart або message
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);