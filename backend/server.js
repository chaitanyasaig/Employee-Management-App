const authorizeRole = require("./authorizeRole");
const authenticateToken = require("./middleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "employee_db",
  password: "globant123",
  port: 5432,
});
const JWT_SECRET = "mysecretkey";
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Get Employees
app.get("/employees", async (req, res) => {
  const result = await pool.query("SELECT * FROM employees");
  res.json(result.rows);
});

// Add Employee
app.post("/employees", async (req, res) => {
  const { name, department } = req.body;

  const result = await pool.query(
    "INSERT INTO employees (name, department) VALUES ($1, $2) RETURNING *",
    [name, department]
  );

  res.json(result.rows[0]);
});

// Delete Employee
app.delete(
  "/employees/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM employees WHERE id = $1", [id]);

  res.json({ message: "Employee deleted" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role",
      [name, email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Compare password
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Login failed",
    });
  }
});