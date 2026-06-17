const { getData, saveData } = require('../config/jsonDb');

// 1. Fetch children profile information for the parent
exports.getChildProfiles = async (req, res) => {
  try {
    const parentId = req.user.id;
    const data = getData();
    
    // Get parent user
    const parentUser = data.users.find(u => u.id === parentId);
    if (!parentUser) {
      return res.status(404).json({ message: 'Parent user not found.' });
    }

    // Check status
    if (parentUser.status === 'pending') {
      return res.status(200).json([]);
    }

    // Find students linked with parent email (case insensitive)
    const parentEmail = parentUser.email.trim().toLowerCase();
    const children = data.students.filter(s => s.parentEmail.trim().toLowerCase() === parentEmail);

    const childrenWithTeachers = children.map(child => {
      // Find teacher assigned to this classroom
      const teacherRecs = data.teachers.filter(t => {
        const assigned = t.classroom ? t.classroom.split(',').map(c => c.trim()) : [];
        return assigned.includes(child.classroom);
      });
      let teacherName = 'Not Assigned';
      let teacherEmail = '';
      
      if (teacherRecs.length > 0) {
        const matchedTeachers = teacherRecs.map(tr => {
          const usrObj = data.users.find(u => u.id === tr.user_id);
          return usrObj ? usrObj : null;
        }).filter(Boolean);
        
        if (matchedTeachers.length > 0) {
          teacherName = matchedTeachers.map(t => t.name).join(', ');
          teacherEmail = matchedTeachers.map(t => t.email).join(', ');
        }
      }

      return {
        student_id: child.studentId,
        student_name: child.studentName,
        age: child.age,
        classroom_name: child.classroom,
        teacherName,
        teacherEmail
      };
    });

    res.status(200).json(childrenWithTeachers);
  } catch (error) {
    console.error('getChildProfiles error:', error);
    res.status(500).json({ message: 'Error fetching child profiles.' });
  }
};

// 2. Fetch secure photos gallery (Parent can ONLY see photos where their child is tagged & status is approved)
exports.getPrivatePhotos = async (req, res) => {
  try {
    const parentId = req.user.id;
    const data = getData();
    
    const parentUser = data.users.find(u => u.id === parentId);
    if (!parentUser) {
      return res.status(404).json({ message: 'Parent user not found.' });
    }

    if (parentUser.status === 'pending') {
      return res.status(200).json([]);
    }

    const parentEmail = parentUser.email.trim().toLowerCase();
    // Find students linked with parent email
    const studentIds = data.students
      .filter(s => s.parentEmail.trim().toLowerCase() === parentEmail)
      .map(s => s.studentId);

    if (studentIds.length === 0) {
      return res.status(200).json([]);
    }

    // Find photo_ids tagged with any of these studentIds
    const taggedPhotoIds = data.student_tags
      .filter(tag => studentIds.includes(tag.studentId))
      .map(tag => tag.photo_id);

    // Filter approved photos that have these photo_ids
    const privatePhotos = data.photos
      .filter(p => taggedPhotoIds.includes(p.id) && p.status === 'approved')
      .map(p => {
        // get activity and teacher name
        const act = data.activities.find(a => a.id === p.activity_id);
        const teacherUser = data.users.find(u => u.id === p.uploaded_by);

        // Get tags for each of these photos
        const tags = data.student_tags
          .filter(tag => tag.photo_id === p.id)
          .map(tag => {
            const stud = data.students.find(s => s.studentId === tag.studentId);
            return {
              student_id: tag.studentId,
              student_name: stud ? stud.studentName : 'Unknown Student'
            };
          });

        return {
          id: p.id,
          image_url: p.image_url,
          ai_caption: p.ai_caption,
          uploaded_at: p.uploaded_at,
          status: p.status,
          activity_id: p.activity_id,
          activity_title: act ? act.title : 'No Title',
          activity_description: act ? act.description : '',
          activity_category: act ? act.category : 'General',
          activity_date: act ? act.activity_date : '',
          activity_summary: act ? act.ai_summary : '',
          teacher_name: teacherUser ? teacherUser.name : 'Unknown Teacher',
          tags
        };
      })
      .sort((x, y) => new Date(y.uploaded_at) - new Date(x.uploaded_at));

    res.status(200).json(privatePhotos);
  } catch (error) {
    console.error('getPrivatePhotos error:', error);
    res.status(500).json({ message: 'Error retrieving photos.' });
  }
};

// 3. Fetch activity timeline of the child
exports.getTimeline = async (req, res) => {
  try {
    const parentId = req.user.id;
    const data = getData();
    
    const parentUser = data.users.find(u => u.id === parentId);
    if (!parentUser) {
      return res.status(404).json({ message: 'Parent user not found.' });
    }

    if (parentUser.status === 'pending') {
      return res.status(200).json([]);
    }

    const parentEmail = parentUser.email.trim().toLowerCase();
    const studentIds = data.students
      .filter(s => s.parentEmail.trim().toLowerCase() === parentEmail)
      .map(s => s.studentId);

    if (studentIds.length === 0) {
      return res.status(200).json([]);
    }

    // Find photo_ids tagged with these studentIds
    const taggedPhotoIds = data.student_tags
      .filter(tag => studentIds.includes(tag.studentId))
      .map(tag => tag.photo_id);

    // Find approved photos tagged with these child profiles
    const approvedPhotos = data.photos.filter(p => taggedPhotoIds.includes(p.id) && p.status === 'approved');
    
    // Distinct activity_ids from these photos
    const activityIds = [...new Set(approvedPhotos.map(p => p.activity_id))];

    // Get activities
    const activities = data.activities
      .filter(a => activityIds.includes(a.id))
      .map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        activity_date: a.activity_date,
        ai_summary: a.ai_summary,
        classroom_name: a.classroom
      }))
      .sort((x, y) => new Date(y.activity_date) - new Date(x.activity_date));

    res.status(200).json(activities);
  } catch (error) {
    console.error('getTimeline error:', error);
    res.status(500).json({ message: 'Error fetching student activity timeline.' });
  }
};

// 4. Get Parent Announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const data = getData();
    const sortedAnn = [...data.announcements].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.status(200).json(sortedAnn);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving announcements.' });
  }
};

// 5. Parent Dashboard Statistics
exports.getStats = async (req, res) => {
  try {
    const parentId = req.user.id;
    const data = getData();

    const parentUser = data.users.find(u => u.id === parentId);
    if (!parentUser) {
      return res.status(404).json({ message: 'Parent user not found.' });
    }

    if (parentUser.status === 'pending') {
      return res.status(200).json({
        totalPhotos: 0,
        latestActivity: 'No activities yet',
        totalAnnouncements: data.announcements.length
      });
    }

    const parentEmail = parentUser.email.trim().toLowerCase();
    const studentIds = data.students
      .filter(s => s.parentEmail.trim().toLowerCase() === parentEmail)
      .map(s => s.studentId);

    if (studentIds.length === 0) {
      return res.status(200).json({
        totalPhotos: 0,
        latestActivity: 'No activities yet',
        totalAnnouncements: data.announcements.length
      });
    }

    const taggedPhotoIds = data.student_tags
      .filter(tag => studentIds.includes(tag.studentId))
      .map(tag => tag.photo_id);

    const totalPhotos = data.photos.filter(p => taggedPhotoIds.includes(p.id) && p.status === 'approved').length;

    // Latest activity
    const approvedPhotos = data.photos.filter(p => taggedPhotoIds.includes(p.id) && p.status === 'approved');
    const activityIds = approvedPhotos.map(p => p.activity_id);
    
    const latestActivityObj = data.activities
      .filter(a => activityIds.includes(a.id))
      .sort((x, y) => new Date(y.activity_date) - new Date(x.activity_date))[0];

    res.status(200).json({
      totalPhotos,
      latestActivity: latestActivityObj 
        ? `${latestActivityObj.title} (${new Date(latestActivityObj.activity_date).toLocaleDateString()})` 
        : 'No activities yet',
      totalAnnouncements: data.announcements.length
    });
  } catch (error) {
    console.error('parent getStats error:', error);
    res.status(500).json({ message: 'Error retrieving parent dashboard statistics.' });
  }
};

// 6. Fetch Parent Notifications
exports.getNotifications = async (req, res) => {
  try {
    const parentId = req.user.id;
    const data = getData();
    const parentUser = data.users.find(u => u.id === parentId);
    if (!parentUser) {
      return res.status(404).json({ message: 'Parent user not found.' });
    }

    const parentEmail = parentUser.email.trim().toLowerCase();
    // Show notifications related only to that parent (matched by parentEmail)
    const parentNotifications = data.notifications
      .filter(n => n.parentEmail.trim().toLowerCase() === parentEmail)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(parentNotifications);
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ message: 'Error retrieving notifications.' });
  }
};

// 7. Mark Parent Notification as Read
exports.markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const data = getData();
    const notification = data.notifications.find(n => n.id === parseInt(id));
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    // Check if notification belongs to the logged-in parent
    const parentId = req.user.id;
    const parentUser = data.users.find(u => u.id === parentId);
    if (!parentUser || parentUser.email.trim().toLowerCase() !== notification.parentEmail.trim().toLowerCase()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    notification.readStatus = 'read';
    saveData(data);

    res.status(200).json({ message: 'Notification marked as read successfully.', id });
  } catch (error) {
    console.error('markNotificationAsRead error:', error);
    res.status(500).json({ message: 'Error updating notification status.' });
  }
};
