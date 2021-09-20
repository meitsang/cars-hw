import React, { createContext, useState } from "react";
import { useToasts } from "react-toast-notifications";

export const DriversContext = createContext({
  fetchDrivers: () => [],
  addDriver: () => {},
  updateDriver: () => {},
  deleteDriver: () => {},
  loaded: false,
  loading: false,
  error: null,
  drivers: [],
});

export const DriversProvider = (props) => {
  const [drivers, setDrivers] = useState(() => {
    return JSON.parse(localStorage.getItem("drivers")) || [];
  });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  // const [search, setSearch] = useState("");
  const { addToast } = useToasts();

const DRIVERS_ENDPOINT = "https://carsapp2050.herokuapp.com/api/v1/drivers/";

const fetchDrivers = async () => {
  // console.log('loading', loading);
  // console.log('error', error);
  if (loading || loaded || error) {
    return;
  }
  setLoading(true);

  try {
    const response = await fetch(DRIVERS_ENDPOINT);
    if (response.status !== 200) {
      throw response;
    }
    const data = await response.json();
    localStorage.setItem("drivers", JSON.stringify(data));
    setDrivers(data);

  } catch (err) {
    setError(err.message || err.statusText);
  } finally {
    setLoaded(true);
    setLoading(false);
  }
};

const addDriver = async (formData) => {
  console.log("about to add", formData);
  try {
    const response = await fetch(DRIVERS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(formData),
    });
    if (response.status !== 201) {
      throw response;
    }
    const savedDriver = await response.json();
    console.log("got data", savedDriver);
    const newDrivers = [...drivers, savedDriver];
    localStorage.setItem("drivers", JSON.stringify(newDrivers));
    setDrivers(newDrivers);
    // addToast(`Saved ${savedCar.name}`, {
    //   appearance: "success",
    // });
  } catch (err) {
    console.log(err);
    addToast(`Error ${err.message || err.statusText}`, {
      appearance: "error",
    });
  }
};

const updateDriver = async (id, formData) => {
  console.log("updating", id, formData);
  let updatedDriver = null;
  // Get index
  const index = drivers.findIndex((driver) => driver._id === id);
  console.log(index);
  if (index === -1) throw new Error(`Driver with index ${id} not found`);
  // Get actual driver
  const oldDriver = drivers[index];
  console.log("oldDriver", oldDriver);

  // Send the differences, not the whole update
  const updates = {};

  for (const key of Object.keys(oldDriver)) {
    if (key === "_id") continue;
    if (oldDriver[key] !== formData[key]) {
      updates[key] = formData[key];
    }
  }

  try {
    const response = await fetch(`${DRIVERS_ENDPOINT}${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(updates),
    });

    if (response.status !== 200) {
      throw response;
    }

    // Merge with formData
    updatedDriver = {
      ...oldDriver,
      ...formData, // order here is important for the override!!
    };
    console.log("updatedDriver", updatedDriver);
    // recreate the cars array
    const updatedDrivers = [
      ...drivers.slice(0, index),
      updatedDriver,
      ...drivers.slice(index + 1),
    ];
    localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
    // addToast(`Updated ${updatedCar.name}`, {
    //   appearance: "success",
    // });
    setDrivers(updatedDrivers);
  } catch (err) {
    console.log(err);
    addToast(`Error: Failed to update ${oldDriver ? oldDriver?.name : id}`, {
      appearance: "error",
    });
  }
};

const deleteDriver = async (id) => {
  let deletedDriver = null;
  try {
    const response = await fetch(`${DRIVERS_ENDPOINT}${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (response.status !== 204) {
      throw response;
    }
    // Get index
    const index = drivers.findIndex((driver) => driver._id === id);
    deletedDriver = drivers[index];
    // recreate the drivers array without that driver
    const updatedDrivers = [...drivers.slice(0, index), ...drivers.slice(index + 1)];
    localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
    setDrivers(updatedDrivers);
    console.log(`Deleted ${deletedDriver.name}`);
    // addToast(`Deleted ${deletedCar.name}`, {
    //   appearance: "success",
    // });
  } catch (err) {
    console.log(err);
    addToast(`Error: Failed to update ${deletedDriver.name}`, {
      appearance: "error",
    });
  }
};

return (
  <DriversContext.Provider
    value={{
      drivers,
      loading,
      error,
      fetchDrivers,
      addDriver,
      updateDriver,
      deleteDriver,
    }}
  >
    {props.children}
  </DriversContext.Provider>
);
};