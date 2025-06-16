import { configureStore } from "@reduxjs/toolkit";
import realEstateReducer from "./real_estate/slice";

const store = configureStore({
  reducer: {
    realEstate: realEstateReducer,
  },
});

export default store;
