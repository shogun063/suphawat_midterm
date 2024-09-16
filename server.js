const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'suphawat'
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ใช้ diskStorage เพื่อบันทึกไฟล์ลงในโฟลเดอร์ uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const profileName = "profile_";
    const ext = path.extname(file.originalname);
    cb(null, profileName + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

db.connect();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// เพิ่มข้อมูลบ้าน
app.post('/get/houses', upload.single('Image'), async (req, res) => {
  const { AreaSize, NumberOfRooms, NumberOfBathrooms, Price, Condition, HouseType, YearBuilt, ParkingSpaces, Address } = req.body;

  if (!req.file) {
    return res.json({ "message": "ต้องมีภาพประกอบ", "status": false });
  }

  // Validate input
  if (!AreaSize || !NumberOfRooms || !NumberOfBathrooms || !Price || !Condition || !HouseType || !YearBuilt || !ParkingSpaces || !Address) {
    return res.json({ "message": "ข้อมูลที่ส่งมาไม่ครบถ้วน", "status": false });
  }

  const ImageURL = `/uploads/${req.file.filename}`;

  const sql = "INSERT INTO Houses (AreaSize, NumberOfRooms, NumberOfBathrooms, Price, Conditionn, HouseType, YearBuilt, ParkingSpaces, Address, Image) VALUES (? ,? ,? ,? ,? ,? ,? ,? ,? ,?) ";
  db.query(sql, [AreaSize, NumberOfRooms, NumberOfBathrooms, Price, Condition, HouseType, YearBuilt, ParkingSpaces, Address ,ImageURL], (err) => {
    if (err) {
      console.error(err);
      return res.json({ "message": "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "status": false });
    }
    res.json({ 'message': 'บันทึกข้อมูลสำเร็จ', 'status': true });
  });
});

// ดึงข้อมูลบ้านตาม ID
app.get('/get/houses/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM Houses WHERE HouseID = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.send({ "message": "เกิดข้อผิดพลาดในการดึงข้อมูล", "status": false });
    }
    if (results.length === 0) {
      return res.send({ "message": "ไม่พบข้อมูลผลิตภัณฑ์", "status": false });
    }
    const home = results[0];

    home['message'] = "ทำรายการสำเร็จ"
    home['status'] = true
    res.send(home);
  });
});

app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
