const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const teacherController = require('../controllers/teacher');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all routes under teacher role
router.use(authenticate, authorize(['teacher']));

// Multer Storage setup for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed.'));
  }
});

// Stats
router.get('/stats', teacherController.getStats);

// Students
router.get('/students', teacherController.getClassroomStudents);

// AI Caption & Summary Generator
router.post('/ai/generate', teacherController.generateAIContent);

// Create Activity
router.post('/activities', teacherController.createActivity);

// Multiple Photo Uploads
router.post('/photos/upload', (req, res) => {
  upload.array('photos', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }
    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ urls });
  });
});

// Submit Tagged Photos
router.post('/photos/submit', teacherController.submitPhotos);

// Update Student Tags for photo
router.post('/photos/:photoId/tags', teacherController.updatePhotoTags);

// History
router.get('/history', teacherController.getUploadHistory);

// Attendance
router.get('/attendance', teacherController.getAttendance);
router.post('/attendance', teacherController.markAttendance);

// Routines
router.post('/routines', teacherController.updateRoutines);

module.exports = router;
