const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Dashboard Stats
exports.getStats = async (req, res) => {
  try {
    const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) as totalStudents FROM students');
    const [[{ totalTeachers }]] = await db.query('SELECT COUNT(*) as totalTeachers FROM users WHERE role="teacher"');
    const [[{ totalParents }]] = await db.query('SELECT COUNT(*) as totalParents FROM users WHERE role="parent" AND status="approved"');
    const [[{ totalPhotos }]] = await db.query('SELECT COUNT(*) as totalPhotos FROM photos');
    const [[{ pendingPhotos }]] = await db.query('SELECT COUNT(*) as pendingPhotos FROM photos WHERE status="pending"');
    const [[{ pendingParentRequests }]] = await db.query('SELECT COUNT(*) as pendingParentRequests FROM users WHERE role="parent" AND status="pending"');

    const [recentActivities] = await db.query(`
      SELECT a.*, c.classroom_name as classroom, u.name as teacher_name 
      FROM activities a
      LEFT JOIN classrooms c ON a.classroom_id = c.id
      LEFT JOIN users u ON a.teacher_id = u.id
      ORDER BY a.created_at DESC LIMIT 5
    `);

    res.status(200).json({
      totalStudents, totalTeachers, totalParents, totalPhotos, pendingPhotos, pendingParentRequests, recentActivities
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: 'Error retrieving system stats.' });
  }
};

// 2. Classroom Management
exports.getClassrooms = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM classrooms');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classrooms.' });
  }
};

exports.createClassroom = async (req, res) => {
  const { classroom_name } = req.body;
  if (!classroom_name) return res.status(400).json({ message: 'Classroom name is required.' });
  try {
    const [result] = await db.execute('INSERT INTO classrooms (classroom_name) VALUES (?)', [classroom_name]);
    res.status(201).json({ id: result.insertId, classroom_name });
  } catch (error) {
    res.status(500).json({ message: 'Error creating classroom.' });
  }
};

// 3. Student Management
exports.getStudents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id as studentId, s.student_name, s.age, c.classroom_name as classroom, u.name as parent_name, u.email as parentEmail
      FROM students s
      LEFT JOIN classrooms c ON s.classroom_id = c.id
      LEFT JOIN users u ON s.parent_id = u.id
    `);
    const formatted = rows.map(r => ({
      id: r.studentId, student_name: r.student_name, age: r.age, classroom_name: r.classroom || 'Nursery A', parent_name: r.parent_name || 'Unlinked', parent_email: r.parentEmail || ''
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students.' });
  }
};

exports.addStudent = async (req, res) => {
  const { student_name, age, classroom_name, parent_email } = req.body;
  if (!student_name || !age) return res.status(400).json({ message: 'Student name and age are required.' });
  try {
    let classroom_id = null;
    if (classroom_name) {
      const [cRows] = await db.query('SELECT id FROM classrooms WHERE classroom_name = ?', [classroom_name]);
      if (cRows.length) classroom_id = cRows[0].id;
    }
    let parent_id = null;
    if (parent_email) {
      const [uRows] = await db.query('SELECT id FROM users WHERE email = ?', [parent_email.trim().toLowerCase()]);
      if (uRows.length) parent_id = uRows[0].id;
    }

    const [resDb] = await db.execute(
      'INSERT INTO students (student_name, age, classroom_id, parent_id) VALUES (?, ?, ?, ?)',
      [student_name, parseInt(age), classroom_id, parent_id]
    );
    res.status(201).json({
      studentId: resDb.insertId, studentName: student_name, age: parseInt(age), classroom: classroom_name || 'Nursery A', parentEmail: parent_email || ''
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding student.' });
  }
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { student_name, age, classroom_name, parent_email } = req.body;
  try {
    let classroom_id = null;
    if (classroom_name) {
      const [cRows] = await db.query('SELECT id FROM classrooms WHERE classroom_name = ?', [classroom_name]);
      if (cRows.length) classroom_id = cRows[0].id;
    }
    let parent_id = null;
    if (parent_email) {
      const [uRows] = await db.query('SELECT id FROM users WHERE email = ?', [parent_email.trim().toLowerCase()]);
      if (uRows.length) parent_id = uRows[0].id;
    }

    await db.execute(
      'UPDATE students SET student_name=?, age=?, classroom_id=?, parent_id=? WHERE id=?',
      [student_name, parseInt(age), classroom_id, parent_id, id]
    );
    res.status(200).json({ id, student_name, age, classroom_name, parent_email });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student.' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await db.execute('DELETE FROM students WHERE id=?', [req.params.id]);
    res.status(200).json({ message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student.' });
  }
};

// 4. Teacher Management
exports.getTeachers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id as teacher_id, u.id as user_id, u.name, u.email, c.classroom_name
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN classrooms c ON t.classroom_id = c.id
      WHERE u.role = 'teacher'
    `);
    const teachersList = rows.map(r => ({
      teacher_id: r.teacher_id, user_id: r.user_id, name: r.name, email: r.email, classroom_name: r.classroom_name || 'Nursery A'
    }));
    res.status(200).json(teachersList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers.' });
  }
};

exports.addTeacher = async (req, res) => {
  const { name, email, classroom_name, classroom_id } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Teacher name and email are required.' });
  try {
    const [exists] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (exists.length) return res.status(400).json({ message: 'Email address is already registered.' });

    const hashedPassword = await bcrypt.hash('teacher123', 10);
    const [uRes] = await db.execute(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email.trim().toLowerCase(), hashedPassword, 'teacher', 'approved']
    );

    let resolvedClassroomId = classroom_id || null;
    let resolvedClassroomName = classroom_name;
    if (resolvedClassroomId) {
      const [cRows] = await db.query('SELECT classroom_name FROM classrooms WHERE id = ?', [resolvedClassroomId]);
      if (cRows.length) resolvedClassroomName = cRows[0].classroom_name;
    } else if (classroom_name) {
      const [cRows] = await db.query('SELECT id FROM classrooms WHERE classroom_name = ?', [classroom_name]);
      if (cRows.length) resolvedClassroomId = cRows[0].id;
    }

    await db.execute(
      'INSERT INTO teachers (user_id, classroom_id) VALUES (?, ?)',
      [uRes.insertId, resolvedClassroomId]
    );

    res.status(201).json({ user_id: uRes.insertId, name, email, classroom_name: resolvedClassroomName });
  } catch (error) {
    res.status(500).json({ message: 'Error adding teacher.' });
  }
};

exports.updateTeacher = async (req, res) => {
  const { id } = req.params; // user_id
  const { name, email, classroom_name, classroom_id } = req.body;
  try {
    await db.execute('UPDATE users SET name=?, email=? WHERE id=?', [name, email.trim().toLowerCase(), id]);

    let resolvedClassroomId = classroom_id || null;
    let resolvedClassroomName = classroom_name;
    if (resolvedClassroomId) {
      const [cRows] = await db.query('SELECT classroom_name FROM classrooms WHERE id = ?', [resolvedClassroomId]);
      if (cRows.length) resolvedClassroomName = cRows[0].classroom_name;
    } else if (classroom_name) {
      const [cRows] = await db.query('SELECT id FROM classrooms WHERE classroom_name = ?', [classroom_name]);
      if (cRows.length) resolvedClassroomId = cRows[0].id;
    }

    await db.execute('UPDATE teachers SET classroom_id=? WHERE user_id=?', [resolvedClassroomId, id]);

    res.status(200).json({ user_id: id, name, email, classroom_name: resolvedClassroomName });
  } catch (error) {
    res.status(500).json({ message: 'Error updating teacher.' });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id=?', [req.params.id]);
    res.status(200).json({ message: 'Teacher deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher.' });
  }
};

// 5. Parent Management
exports.getParents = async (req, res) => {
  try {
    const [parents] = await db.query('SELECT id, name, email FROM users WHERE role="parent" AND status="approved"');
    const parentsList = [];
    for (const u of parents) {
      const [children] = await db.query(`
        SELECT s.id as student_id, s.student_name, s.age, c.classroom_name 
        FROM students s 
        LEFT JOIN classrooms c ON s.classroom_id = c.id 
        WHERE s.parent_id = ?
      `, [u.id]);
      parentsList.push({
        user_id: u.id, name: u.name, email: u.email, children
      });
    }
    res.status(200).json(parentsList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parents.' });
  }
};

exports.addParent = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Parent name and email are required.' });
  try {
    const [exists] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (exists.length) return res.status(400).json({ message: 'Email address is already registered.' });

    const hashedPassword = await bcrypt.hash('parent123', 10);
    const [uRes] = await db.execute(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email.trim().toLowerCase(), hashedPassword, 'parent', 'approved']
    );

    res.status(201).json({ user_id: uRes.insertId, name, email });
  } catch (error) {
    res.status(500).json({ message: 'Error adding parent.' });
  }
};

exports.updateParent = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    await db.execute('UPDATE users SET name=?, email=? WHERE id=?', [name, email.trim().toLowerCase(), id]);
    res.status(200).json({ user_id: id, name, email });
  } catch (error) {
    res.status(500).json({ message: 'Error updating parent.' });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id=?', [req.params.id]);
    res.status(200).json({ message: 'Parent deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting parent.' });
  }
};

// 6. Photo Approval
exports.getPendingPhotos = async (req, res) => {
  try {
    const [photos] = await db.query(`
      SELECT p.*, a.title as activity_title, a.activity_date, a.category as activity_category, u.name as teacher_name 
      FROM photos p
      LEFT JOIN activities a ON p.activity_id = a.id
      LEFT JOIN users u ON p.uploaded_by = u.id
      WHERE p.status = "pending"
    `);
    
    for (const p of photos) {
      const [tags] = await db.query(`
        SELECT st.student_id, s.student_name 
        FROM student_tags st 
        LEFT JOIN students s ON st.student_id = s.id 
        WHERE st.photo_id = ?
      `, [p.id]);
      p.tags = tags;
    }
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending photos.' });
  }
};

exports.updatePhotoStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  try {
    await db.execute('UPDATE photos SET status=? WHERE id=?', [status, id]);
    res.status(200).json({ message: 'Updated', id, status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status.' });
  }
};

// 7. Announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements.' });
  }
};

exports.createAnnouncement = async (req, res) => {
  const { title, message } = req.body;
  try {
    const [resDb] = await db.execute('INSERT INTO announcements (title, message) VALUES (?, ?)', [title, message]);
    res.status(201).json({ id: resDb.insertId, title, message, created_at: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement.' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await db.execute('DELETE FROM announcements WHERE id=?', [req.params.id]);
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement.' });
  }
};

// 8. Parent Requests
exports.getParentRequests = async (req, res) => {
  try {
    const [requests] = await db.query('SELECT id, name, email, child_name as childName, child_age as childAge, requested_classroom as requestedClassroom FROM users WHERE role="parent" AND status="pending"');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parent approval requests.' });
  }
};

exports.approveParentRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const [uRows] = await db.query('SELECT * FROM users WHERE id=?', [id]);
    if (uRows.length === 0) return res.status(404).json({ message: 'Not found.' });
    const user = uRows[0];

    await db.execute('UPDATE users SET status="approved" WHERE id=?', [id]);
    
    let classroom_id = null;
    if (user.requested_classroom) {
      const [cRows] = await db.query('SELECT id FROM classrooms WHERE classroom_name = ?', [user.requested_classroom]);
      if (cRows.length) classroom_id = cRows[0].id;
    }

    await db.execute(
      'INSERT INTO students (student_name, age, classroom_id, parent_id) VALUES (?, ?, ?, ?)',
      [user.child_name, user.child_age, classroom_id, user.id]
    );

    res.status(200).json({ message: 'Approved' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request.' });
  }
};

exports.rejectParentRequest = async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id=?', [req.params.id]);
    res.status(200).json({ message: 'Rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request.' });
  }
};

// 9. Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const filter = req.query.filter || 'week';
    let start = new Date();
    let end = new Date();
    end.setHours(23, 59, 59, 999);
    
    if (filter === 'today') start.setHours(0, 0, 0, 0);
    else if (filter === 'week') start.setDate(start.getDate() - 7);
    else if (filter === 'month') start.setMonth(start.getMonth() - 1);
    else if (filter === '6months') start.setMonth(start.getMonth() - 6);
    else start.setDate(start.getDate() - 7);

    // Simplified Analytics using SQL
    // 1. Daily Photos
    const [photoStats] = await db.query('SELECT DATE(uploaded_at) as date, COUNT(*) as count FROM photos WHERE uploaded_at >= ? GROUP BY DATE(uploaded_at)', [start]);
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyUploads = photoStats.map(p => ({
      date: DAY_NAMES[new Date(p.date + 'T12:00:00').getDay()],
      fullDate: p.date,
      count: p.count
    }));

    // 2. Attendance Trend - Mocked or simplified
    const attendanceTrend = [];
    
    // 3. Parent Engagement (approvals + notifications)
    const [engagementStats] = await db.query('SELECT DATE(created_at) as dt, COUNT(*) as count FROM notifications WHERE created_at >= ? GROUP BY DATE(created_at)', [start]);
    const parentEngagement = engagementStats.map(e => ({
      day: DAY_NAMES[new Date(e.dt + 'T12:00:00').getDay()],
      views: e.count
    }));

    // 4. Activity Distribution
    const [catStats] = await db.query('SELECT category, COUNT(*) as count FROM activities GROUP BY category');
    const COLORS = ['#4F9CF9', '#F59E0B', '#22C55E', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];
    const activityDistribution = catStats.map((c, i) => ({
      category: c.category, count: c.count, color: COLORS[i % COLORS.length]
    }));

    // 5. Teacher Performance
    const [teacherStats] = await db.query(`
      SELECT t.user_id, u.name, c.classroom_name, 
        (SELECT COUNT(*) FROM photos WHERE uploaded_by = u.id) as uploads,
        (SELECT COUNT(*) FROM photos WHERE uploaded_by = u.id AND uploaded_at >= ?) as rangeUploads,
        (SELECT COUNT(*) FROM activities WHERE teacher_id = u.id) as activitiesConducted,
        (SELECT COUNT(*) FROM activities WHERE teacher_id = u.id AND activity_date >= ?) as rangeActivities
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN classrooms c ON t.classroom_id = c.id
    `, [start, start]);

    const teacherPerformance = teacherStats.map(t => ({
      teacherName: t.name, classroom: t.classroom_name, uploads: t.uploads, rangeUploads: t.rangeUploads, activitiesConducted: t.activitiesConducted, rangeActivities: t.rangeActivities, parentEngagement: t.uploads * 2
    }));

    // 6. Student Distribution
    const [studStats] = await db.query('SELECT c.classroom_name, COUNT(*) as count FROM students s LEFT JOIN classrooms c ON s.classroom_id = c.id GROUP BY c.classroom_name');
    const CLASS_COLORS = { 'Nursery': '#22C55E', 'LKG': '#4F9CF9', 'UKG': '#F59E0B' };
    const studentDistribution = studStats.map(s => {
       const cls = s.classroom_name || 'Nursery';
       let matchedKey = 'Nursery';
       if (cls.toLowerCase().includes('lkg')) matchedKey = 'LKG';
       if (cls.toLowerCase().includes('ukg')) matchedKey = 'UKG';
       return { className: matchedKey, count: s.count, color: CLASS_COLORS[matchedKey] || '#22C55E' }
    });

    // 7. Summary Stats
    const [[{ totalPhotosUploaded }]] = await db.query('SELECT COUNT(*) as totalPhotosUploaded FROM photos');
    const [[{ photosThisWeek }]] = await db.query('SELECT COUNT(*) as photosThisWeek FROM photos WHERE uploaded_at >= ?', [start]);
    const [[{ totalActivities }]] = await db.query('SELECT COUNT(*) as totalActivities FROM activities');
    const [[{ activitiesThisWeek }]] = await db.query('SELECT COUNT(*) as activitiesThisWeek FROM activities WHERE activity_date >= ?', [start]);

    res.status(200).json({
      dailyUploads, attendanceTrend, parentEngagement, activityDistribution, teacherPerformance, studentDistribution,
      summary: { totalPhotosUploaded, photosThisWeek, totalActivities, activitiesThisWeek }
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: 'Error retrieving system analytics.' });
  }
};
