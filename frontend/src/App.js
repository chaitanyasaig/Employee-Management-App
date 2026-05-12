import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

import { useAuth0 } from "@auth0/auth0-react";

function App() {
  // Auth0
const {
  loginWithRedirect,
  logout,
  user,
  isAuthenticated,
  isLoading,
  getAccessTokenSilently,
  getAccessTokenWithPopup,
} = useAuth0();

  // Employee State
  const [employees, setEmployees] = useState([]);

  // Add Employee Form
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  // Fetch Employees
const fetchEmployees = async () => {
  try {
  const token =
      await getAccessTokenSilently();

    console.log("Access Token:", token);

    const res = await axios.get(
      "http://localhost:5000/employees",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setEmployees(res.data);
  } catch (err) {
    console.log(err);
  }
};

  // Add Employee
  const addEmployee = async () => {
    if (!name || !department) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/employees",
        {
          name,
          department,
        }
      );

      setName("");
      setDepartment("");

      fetchEmployees();
    } catch (err) {
      console.log(err);
      alert("Failed to add employee");
    }
  };

  // Delete Employee
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/employees/${id}`
      );

      fetchEmployees();
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  // Load Employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Loading State
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="header">
          <h1>Employee Management System</h1>
          <p>Enterprise Login using Auth0</p>
        </div>

        <div className="form-section">
          <h2>Authentication</h2>

          <button
            onClick={() => loginWithRedirect()}
          >
            Login with Auth0
          </button>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="container">
      <div className="header">
        <h1>Employee Management Dashboard</h1>

        <div>
          <img
            src={user.picture}
            alt="profile"
            style={{
              width: "70px",
              borderRadius: "50%",
              marginBottom: "10px",
            }}
          />

          <p>
            Welcome {user.name}
          </p>

          <p>{user.email}</p>

          <button
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo:
                    window.location.origin,
                },
              })
            }
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="card">
          <h2>{employees.length}</h2>
          <p>Total Employees</p>
        </div>

        <div className="card">
          <h2>5</h2>
          <p>Departments</p>
        </div>

        <div className="card">
          <h2>Active</h2>
          <p>System Status</p>
        </div>
      </div>

      {/* Add Employee */}
      <div className="form-section">
        <h2>Add Employee</h2>

        <input
          type="text"
          placeholder="Employee Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
        />

        <button onClick={addEmployee}>
          Add Employee
        </button>
      </div>

      {/* Employee List */}
      <div className="employee-list">
        <h2>Employees</h2>

        {employees.map((emp) => (
          <div
            className="employee-card"
            key={emp.id}
          >
            <div>
              <h3>{emp.name}</h3>
              <p>{emp.department}</p>
            </div>

            <button
              onClick={() =>
                deleteEmployee(emp.id)
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;