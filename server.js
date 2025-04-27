const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = 8000;

// Serve static files from current directory
app.use(express.static('./'));

// Handle debug messages from client
app.post('/debug', express.json(), (req, res) => {
  const debugMsg = req.body;
  console.log('[Client Debug]:', debugMsg);
  res.sendStatus(200);
});

// MySQL connection configuration

const db = mysql.createConnection({
  host: 'localhost',
  user: 'ragnarok', 
  password: 'La_009296',
  database: 'ragnarok'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API endpoint to query MySQL
app.get('/query', (req, res) => {
  const sql ='SHOW TABLES';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({error: 'Database query failed'});
    }
    res.json(results);
  });
});

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
