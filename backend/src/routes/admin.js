const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all routes under admin role
router.use(authenticate, authorize(['admin']));

// Stats
router.get('/stats', adminController.getStats);

// Classrooms
router.get('/classrooms', adminController.getClassrooms);
router.post('/classrooms', adminController.createClassroom);

// Students
router.get('/students', adminController.getStudents);
router.post('/students', adminController.addStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Teachers
router.get('/teachers', adminController.getTeachers);
router.post('/teachers', adminController.addTeacher);
router.put('/teachers/:id', adminController.updateTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

// Parents
router.get('/parents', adminController.getParents);
router.post('/parents', adminController.addParent);
router.put('/parents/:id', adminController.updateParent);
router.delete('/parents/:id', adminController.deleteParent);

// Photos
router.get('/photos/pending', adminController.getPendingPhotos);
router.put('/photos/:id/status', adminController.updatePhotoStatus);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// Parent Approval Requests
router.get('/parent-requests', adminController.getParentRequests);
router.put('/parent-requests/:id/approve', adminController.approveParentRequest);
router.put('/parent-requests/:id/reject', adminController.rejectParentRequest);

module.exports = router;
