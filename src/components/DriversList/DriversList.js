import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DriversList.css';
import { DriversContext } from './../../contexts/DriversContext';
// import Loading from './../Loading/Loading';

function DriversList() {
  const { fetchDrivers, deleteDriver, loading, error, drivers } =
    useContext(DriversContext);

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <section className="drivers-list-section">
      <div className="container">
        <h1 className="section-heading">Drivers List</h1>
        {/* <Loading show={loading} /> */}
        {loading && <p>Loading ...</p>}
        {error && <p>{error}</p>}
        {drivers?.length ? (
          <ul className="drivers-list">
            {drivers.map(({ _id, firstname, lastname, age, email }) => (
              <li key={_id} className="drivers-list-item">
                <p>
                    {firstname} {lastname} (age: {age} email: {email})
                </p>
                <Link to={`/drivers/update/${_id}`} className="update-link">
                  Update
                </Link>
                <button
                  onClick={() => deleteDriver(_id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No drivers to display</p>
        )}
      </div>
    </section>
  );
}

export default DriversList;
