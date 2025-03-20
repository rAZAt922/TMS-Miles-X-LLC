import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Loads from './Loads'; // Adjust path as needed

function ParentComponent() {
  const [loads, setLoads] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);

  useEffect(() => {
    const fetchLoads = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "Loads"));
      const initialLoads = [];
      querySnapshot.forEach((doc) => {
        initialLoads.push({ id: doc.id, ...doc.data() });
      });
      setLoads(initialLoads);
    };

    const fetchDrivers = async () => {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "Drivers"));
        const initialDrivers = [];
        querySnapshot.forEach((doc) => {
            initialDrivers.push({ id: doc.id, ...doc.data() });
        });
        setDrivers(initialDrivers);
    };

    const fetchDispatchers = async () => {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "Dispatchers"));
        const initialDispatchers = [];
        querySnapshot.forEach((doc) => {
            initialDispatchers.push({ id: doc.id, ...doc.data() });
        });
        setDispatchers(initialDispatchers);
    };

    fetchLoads();
    fetchDrivers();
    fetchDispatchers();
  }, []);

  const updateLoads = async () => {
    console.log("Update Loads called in parent");
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "Loads"));
    const initialLoads = [];
    querySnapshot.forEach((doc) => {
      initialLoads.push({ id: doc.id, ...doc.data() });
    });
    setLoads(initialLoads);
  };

  return (
    <div>
      <Loads loads={loads} drivers={drivers} dispatchers={dispatchers} updateLoads={updateLoads} />
    </div>
  );
}

export default ParentComponent;