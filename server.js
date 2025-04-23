require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const dbURL = `${ process.env.MYSQL_URL }`

const db = mysql.createConnection(dbURL);

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to DB');
});

app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || !latitude || !longitude)
    return res.status(400).send("All fields are required");
  
  db.query('INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)', 
    [name, address, latitude, longitude], 
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send("School added");
    });
});

app.get('/listSchools', (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  db.query('SELECT * FROM schools', (err, results) => {
    if (err) return res.status(500).send(err);

    const withDistance = results.map(school => {
      const dist = Math.sqrt(
        Math.pow(userLat - school.latitude, 2) + 
        Math.pow(userLng - school.longitude, 2)
      );
      return { ...school, distance: dist };
    });

    withDistance.sort((a, b) => a.distance - b.distance);
    res.json(withDistance);
  });
});

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port ${port}`));
