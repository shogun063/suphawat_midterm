const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// การตั้งค่าเชื่อมต่อฐานข้อมูล
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'suphawat'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Connected to the database.');
});

const app = express();
const port = 3000;

app.use(bodyParser.json()); // เพื่อให้ Express สามารถรับข้อมูล JSON ได้

// GET: ดึงข้อมูลบ้านทั้งหมด
app.get('/houses/:id', (req, res) => {
    const HouseID = req.params.id;
    const query = 'SELECT * FROM Houses WHERE HouseID = ?';
    connection.query(query,[HouseID], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
    });
});

// POST: เพิ่มข้อมูลบ้านใหม่
app.post('/get/houses', (req, res) => {
    const { AreaSize, NumberOfRooms, NumberOfBathrooms, Price, Conditionn, HouseType, YearBuilt, ParkingSpaces, Address } = req.body;

    // if (!AreaSize || !NumberOfRooms || !NumberOfBathrooms || !Price || !Conditionn || !HouseType || !YearBuilt || !ParkingSpaces || !Address) {
    //     return res.status(400).json({ error: 'All fields are required.' });
    // }
    
    const query = 'INSERT INTO Houses (AreaSize, NumberOfRooms, NumberOfBathrooms, Price, Conditionn, HouseType, YearBuilt, ParkingSpaces, Address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [AreaSize, NumberOfRooms, NumberOfBathrooms, Price, Conditionn, HouseType, YearBuilt, ParkingSpaces, Address];

    connection.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
