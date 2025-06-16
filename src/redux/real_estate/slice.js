import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAnalyticsByRegion,
  fetchAveragePriceByLocation,
  fetchAvgPriceAndCountByLocation,
  fetchAnalyticsByYearAndMonth,
  fetchAvailableMonths,
  fetchYearsList,
  fetchRegionsList,
  fetchCitiesList,
  addNewItem,
  fetchNews,
  fetchUsd,
  fetchPriceForecast,
  loginUser,
  registerUser,
  logoutUser
} from "./operators";
  
const userFromStorage = localStorage.getItem("user");
const userInfoFromStorage = localStorage.getItem("userInfo");

const initialState = {
  analytics: [],
  months: [],
  regionDetails: [],
  loading: false,
  yearsList: [],
  regionsList: [],
  citiesList: [],
  selectedRegion: "Kyiv",
  selectedYear: 2024,
  error: null,
  successMessage: null,
  news: [],
  newsLoading: false,
  newsError: null,
  usdRates: [],
  usdLoading: false,
  usdError: null,
  priceForecast: [],
  forecastLoading: false,
  forecastError: null,
  status: "idle",
  token: localStorage.getItem("token") || null,
  user:
    userFromStorage && userFromStorage !== "undefined"
      ? JSON.parse(userFromStorage)
      : null,
  isLoggedIn: false,
  userInfo:
    userInfoFromStorage && userInfoFromStorage !== "undefined"
      ? JSON.parse(userInfoFromStorage)
      : null,
};


const realEstateSlice = createSlice({
  name: "realEstate",
  initialState,
  reducers: {
    clearMonths(state) {
      state.months = [];
      state.error = null;
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    clearMessage(state) {
      state.message = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },
    setRegionDetails: (state, action) => {
      state.regionDetails = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSelectedRegion: (state, action) => {
      state.selectedRegion = action.payload;
    },
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
    },
    logoutUser:(state)=> {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Аналітика по регіонах
      .addCase(fetchAnalyticsByRegion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsByRegion.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalyticsByRegion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvailableMonths.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableMonths.fulfilled, (state, action) => {
        state.loading = false;
        state.months = action.payload;
      })
      .addCase(fetchAvailableMonths.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Щось пішло не так";
      })
      // fetchYearsList
      .addCase(fetchYearsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchYearsList.fulfilled, (state, action) => {
        state.loading = false;
        state.yearsList = action.payload;
      })
      .addCase(fetchYearsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAveragePriceByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAveragePriceByLocation.fulfilled, (state, action) => {
        state.analytics = action.payload;
        state.loading = false;
      })
      .addCase(fetchAveragePriceByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAvgPriceAndCountByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvgPriceAndCountByLocation.fulfilled, (state, action) => {
        state.loading = false;
        const newData = action.payload;

        // Створюємо копію існуючого масиву
        const updatedAnalytics = [...state.analytics];

        newData.forEach((item) => {
          const key = item.region || item.location;
          const existingIndex = updatedAnalytics.findIndex(
            (entry) => (entry.region || entry.location) === key
          );

          if (existingIndex !== -1) {
            updatedAnalytics[existingIndex] = item; // замінити
          } else {
            updatedAnalytics.push(item); // додати
          }
        });

        state.analytics = updatedAnalytics;
      })

      .addCase(fetchAvgPriceAndCountByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // fetchRegionsList
      .addCase(fetchRegionsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegionsList.fulfilled, (state, action) => {
        state.loading = false;
        state.regionsList = action.payload;
      })
      .addCase(fetchRegionsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCitiesList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCitiesList.fulfilled, (state, action) => {
        state.loading = false;
        state.citiesList = action.payload;
      })
      .addCase(fetchCitiesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Додавання нового об'єкта
      .addCase(addNewItem.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addNewItem.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Обʼєкт додано успішно!";
      })
      .addCase(addNewItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAnalyticsByYearAndMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsByYearAndMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalyticsByYearAndMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsd.pending, (state) => {
        state.usdLoading = true;
        state.usdError = null;
      })
      .addCase(fetchUsd.fulfilled, (state, action) => {
        state.usdLoading = false;
        state.usdRates = action.payload;
      })
      .addCase(fetchUsd.rejected, (state, action) => {
        state.usdLoading = false;
        state.usdError = action.payload || "Не вдалося завантажити курс USD";
      })
      .addCase(fetchPriceForecast.pending, (state) => {
        state.forecastLoading = true;
        state.forecastError = null;
      })
      .addCase(fetchPriceForecast.fulfilled, (state, action) => {
        console.log("Reducer отримав forecast payload:", action.payload); // перевіримо
        state.forecastLoading = false;
        state.priceForecast = action.payload;
      })
      .addCase(fetchPriceForecast.rejected, (state, action) => {
        state.forecastLoading = false;
        state.forecastError = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        console.log("Login success payload:", action.payload); 

        state.user = action.payload.user;
        state.userInfo = action.payload.userInfo;
        state.message = action.payload.message;
        state.isLoggedIn = true; // <-- boolean!
        localStorage.setItem(
          "userInfo",
          JSON.stringify(action.payload.userInfo)
        );
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("isLoggedIn", "true"); // <-- записуємо
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.token = null;
        state.user = null;
        state.isLoggedIn = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        state.userInfo = null;
        localStorage.removeItem("userInfo");
      })      
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchNews.pending, (state) => {
        state.newsLoading = true;
        state.newsError = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.news = action.payload;
        state.newsLoading = false;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.newsError = action.payload;
        state.newsLoading = false;
      });
  },
});

export const {
  clearSuccessMessage,
  setError,
  setLoading,
  clearMessage,
  setAnalytics,
  setRegionDetails,
  setSelectedRegion,
  setSelectedYear,
} = realEstateSlice.actions;
export default realEstateSlice.reducer;
