const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parent');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all routes under parent role
router.use(authenticate, authorize(['parent']));

// Child profile info
router.get('/child', parentController.getChildProfiles);

// Photos containing tagged child
router.get('/photos', parentController.getPrivatePhotos);

// Activity timeline
router.get('/timeline', parentController.getTimeline);

// Announcements
router.get('/announcements', parentController.getAnnouncements);

// Stats
router.get('/stats', parentController.getStats);

// Notifications
router.get('/notifications', parentController.getNotifications);
router.put('/notifications/:id/read', parentController.markNotificationAsRead);

// Progress and Feedback
router.get('/progress', parentController.getChildProgress);
router.post('/feedback', parentController.submitFeedback);

module.exports = router;
