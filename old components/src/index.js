import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import RouteSwitch from "./RouteSwitch";
import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./formSlice";
import { formListeners, formDataChanged } from "./formSlice";
import { v4 as uuidv4 } from "uuid";

export const store = configureStore({
  reducer: {
    form: formReducer,
  },
  // Add the listener middleware to the store.
  // NOTE: Since this can receive actions with functions inside,
  // it should go before the serializability check middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(formListeners.middleware),
});

//After the store has been configured we can hydrate the form data from local storage
const hydrateFromLocalStorage = () => {
  let userId;
  if (localStorage.getItem("userId")) {
    userId = localStorage.getItem("userId");
  } else {
    userId = uuidv4();
    localStorage.setItem("userId", userId);
  }
  store.dispatch(formDataChanged({ userId }));
};
hydrateFromLocalStorage();

// Now, render the app with the Provider
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <RouteSwitch />
  </Provider>
);
