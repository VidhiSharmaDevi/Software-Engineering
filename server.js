const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Change this to a secure key

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",  // Change this to your MariaDB username
    password: "batterground",  // Change this to your MariaDB password
    database: "game_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MariaDB");
});

// Register User
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err); // Log the error
            return res.status(500).json({ error: "Error hashing password" });
        }

        const sql = "INSERT INTO users (username, password, highest_score) VALUES (?, ?, ?)";
        console.log("Running SQL Query:", sql);

        // Log the values being inserted
        console.log("Inserting values:", [username, hash, 0]);

        db.query(sql, [username, hash, 0], (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err); // Log the error
                return res.status(500).json({ error: `Error registering user: ${err.message}` }); // Show detailed error
            }
            res.json({ success: true, message: "User registered successfully" });
        });
    });
});

// Profile Endpoint (Protected)
app.get("/profile", (req, res) => {
    // Get the token from the Authorization header
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract the token part (Bearer token)

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    // Verify the token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        // If the token is valid, return the user profile data (username in this case)
        res.json({
            success: true,
            message: "Profile fetched successfully",
            profile: {
                username: decoded.username
            }
        });
    });
});


app.post("/update-score", (req, res) => {
    const { username, awayScore } = req.body;

    if (!username || awayScore === undefined) {
        return res.status(400).json({ error: "Username and score are required" });
    }

    const sql = "SELECT highest_score FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Error fetching user score:", err);
            return res.status(500).json({ error: "Error fetching user score" });
        }

        const currentHighestScore = results[0]?.highest_score || 0;

        // Only update if the new score is higher than the current highest score
        if (awayScore > currentHighestScore) {
            const updateQuery = "UPDATE users SET highest_score = ? WHERE username = ?";
            db.query(updateQuery, [awayScore, username], (err) => {
                if (err) {
                    console.error("Error updating highest score:", err);
                    return res.status(500).json({ error: "Error updating highest score" });
                }
                return res.status(200).json({ success: true, message: "Highest score updated successfully" });
            });
        } else {
            return res.status(200).json({ success: true, message: "No update needed, score not higher" });
        }
    });
});

app.post("/update_highest_score", (req, res) => {
    const { username, highest_score } = req.body;

    if (!username || highest_score === undefined) {
        return res.status(400).json({ error: "Username and highest_score are required" });
    }

    const sql = "SELECT highest_score FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Error fetching user score:", err);
            return res.status(500).json({ error: "Error fetching user score" });
        }

        const currentHighestScore = results[0]?.highest_score || 0;

        // Update only if the new highest score is greater
        if (highest_score > currentHighestScore) {
            const updateQuery = "UPDATE users SET highest_score = ? WHERE username = ?";
            db.query(updateQuery, [highest_score, username], (err) => {
                if (err) {
                    console.error("Error updating highest score:", err);
                    return res.status(500).json({ error: "Error updating highest score" });
                }
                return res.status(200).json({ success: true, message: "Highest score updated successfully" });
            });
        } else {
            return res.status(200).json({ success: true, message: "No update needed, score not higher" });
        }
    });
});


// Login User
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, (err, match) => {
                if (err) return res.status(500).json({ error: "Error comparing passwords" });
                if (!match) return res.status(401).json({ error: "Incorrect password" });

                // Generate JWT Token
                const token = jwt.sign({ username: results[0].username }, SECRET_KEY, { expiresIn: "1h" });
                res.json({ success: true, message: "Login successful", token });
            });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});