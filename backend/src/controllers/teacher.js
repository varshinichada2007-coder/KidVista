const db = require('../config/db');
const ai = require('../services/gemini');

// 1. Teacher Dashboard Statistics
exports.getStats = async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [tRows] = await db.query('SELECT c.classroom_name FROM teachers t LEFT JOIN classrooms c ON t.classroom_id = c.id WHERE t.user_id = ?', [teacherId]);
    const classroomName = tRows.length ? tRows[0].classroom_name : null;

    const todayStr = new Date().toISOString().split('T')[0];
    
    const [[{ todayActivities }]] = await db.query('SELECT COUNT(*) as todayActivities FROM activities WHERE teacher_id = ? AND activity_date = ?', [teacherId, todayStr]);
    const [[{ totalUploads }]] = await db.query('SELECT COUNT(*) as totalUploads FROM photos WHERE uploaded_by = ?', [teacherId]);
    const [[{ approvedUploads }]] = await db.query('SELECT COUNT(*) as approvedUploads FROM photos WHERE uploaded_by = ? AND status = "approved"', [teacherId]);
    const [[{ pendingUploads }]] = await db.query('SELECT COUNT(*) as pendingUploads FROM photos WHERE uploaded_by = ? AND status = "pending"', [teacherId]);

    res.status(200).json({
      classroom_name: classroomName,
      todayActivities,
      totalUploads,
      approvedUploads,
      pendingUploads
    });
  } catch (error) {
    console.error('teacher getStats error:', error);
    res.status(500).json({ message: 'Error retrieving teacher statistics.' });
  }
};

// 2. Fetch students belonging to the teacher's classroom
exports.getClassroomStudents = async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [tRows] = await db.query('SELECT c.classroom_name FROM teachers t LEFT JOIN classrooms c ON t.classroom_id = c.id WHERE t.user_id = ?', [teacherId]);
    if (tRows.length === 0 || !tRows[0].classroom_name) {
      return res.status(200).json({
        classroomId: null,
        classroomName: 'None Assigned',
        students: [],
        message: 'You are not assigned to any classroom yet.'
      });
    }

    const classroomName = tRows[0].classroom_name;

    const [sRows] = await db.query(`
      SELECT s.id, s.student_name, s.age, c.classroom_name 
      FROM students s
      LEFT JOIN classrooms c ON s.classroom_id = c.id
      ORDER BY s.student_name ASC
    `);

    const allStudents = sRows.map(s => ({
      id: s.id,
      student_name: `${s.student_name} (${s.classroom_name || 'Nursery A'})`,
      age: s.age
    }));

    res.status(200).json({
      classroomId: classroomName, 
      classroomName: classroomName,
      students: allStudents
    });
  } catch (error) {
    console.error('getClassroomStudents error:', error);
    res.status(500).json({ message: 'Error retrieving classroom students.' });
  }
};

// 3. AI Direct Generator endpoint (Captions and summaries)
exports.generateAIContent = async (req, res) => {
  const { type, title, description } = req.body;
  try {
    if (type === 'caption') {
      const caption = await ai.generateCaption(description);
      return res.status(200).json({ caption });
    } else if (type === 'summary') {
      const summary = await ai.generateSummary(title, description);
      return res.status(200).json({ summary });
    } else {
      return res.status(400).json({ message: 'Invalid AI request type. Must be caption or summary.' });
    }
  } catch (error) {
    console.error('generateAIContent error:', error);
    res.status(500).json({ message: 'Error invoking Gemini AI service.' });
  }
};

// 4. Create a classroom activity
exports.createActivity = async (req, res) => {
  const { title, description, category, activity_date, classroom_id, ai_summary } = req.body;
  const teacherId = req.user.id;

  if (!title || !category || !activity_date || !classroom_id) {
    return res.status(400).json({ message: 'Title, category, date, and classroom are required.' });
  }

  try {
    let summary = ai_summary;
    if (!summary) {
      summary = await ai.generateSummary(title, description);
    }

    let resolvedClassroomId = null;
    const [cRows] = await db.query('SELECT id FROM classrooms WHERE classroom_name = ?', [classroom_id]);
    if (cRows.length) resolvedClassroomId = cRows[0].id;

    const [resDb] = await db.execute(
      'INSERT INTO activities (title, description, category, activity_date, classroom_id, teacher_id, ai_summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', category, activity_date, resolvedClassroomId, teacherId, summary]
    );

    res.status(201).json({
      message: 'Activity created successfully.',
      activity: {
        id: resDb.insertId, title, description, category, activity_date, classroom: classroom_id, teacher_id: teacherId, ai_summary: summary, created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('createActivity error:', error);
    res.status(500).json({ message: 'Error creating classroom activity.' });
  }
};

// 5. Submit photos, attach captions, and tag students
exports.submitPhotos = async (req, res) => {
  const { activity_id, photos } = req.body;
  const teacherId = req.user.id;

  if (!activity_id || !photos || !Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({ message: 'Activity ID and at least one photo with tag specifications are required.' });
  }

  try {
    const [aRows] = await db.query('SELECT * FROM activities WHERE id = ?', [activity_id]);
    if (aRows.length === 0) return res.status(404).json({ message: 'Activity not found' });
    const activity = aRows[0];

    for (const photoData of photos) {
      const { image_url, ai_caption, student_ids } = photoData;
      if (!image_url) return res.status(400).json({ message: 'Image URL is missing for one of the submitted photos.' });

      const [pRes] = await db.execute(
        'INSERT INTO photos (activity_id, image_url, ai_caption, status, uploaded_by) VALUES (?, ?, ?, ?, ?)',
        [activity_id, image_url, ai_caption || '', 'pending', teacherId]
      );
      const photoId = pRes.insertId;

      if (student_ids && Array.isArray(student_ids)) {
        for (const studentId of student_ids) {
          await db.execute('INSERT INTO student_tags (photo_id, student_id) VALUES (?, ?)', [photoId, studentId]);

          const [sRows] = await db.query('SELECT s.student_name, u.email as parentEmail FROM students s LEFT JOIN users u ON s.parent_id = u.id WHERE s.id = ?', [studentId]);
          if (sRows.length > 0 && sRows[0].parentEmail) {
            const msg = `Your child ${sRows[0].student_name} was tagged in ${activity.title}.`;
            await db.execute(
              'INSERT INTO notifications (parent_email, message, type, read_status) VALUES (?, ?, ?, ?)',
              [sRows[0].parentEmail.trim().toLowerCase(), msg, 'tag', 'unread']
            );
          }
        }
      }
    }

    res.status(200).json({ message: 'Photos and student tags submitted for admin approval.' });
  } catch (error) {
    console.error('submitPhotos error:', error);
    res.status(500).json({ message: 'Error saving photo tags.' });
  }
};

// 6. View upload & tagging history
exports.getUploadHistory = async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [photos] = await db.query(`
      SELECT p.*, a.title as activity_title, a.activity_date, a.category as activity_category
      FROM photos p
      LEFT JOIN activities a ON p.activity_id = a.id
      WHERE p.uploaded_by = ?
      ORDER BY p.uploaded_at DESC
    `, [teacherId]);

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
    console.error('getUploadHistory error:', error);
    res.status(500).json({ message: 'Error retrieving upload history.' });
  }
};

// 7. Get attendance by date for teacher
exports.getAttendance = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Date is required.' });
  try {
    const [rows] = await db.query('SELECT student_id, status FROM attendance WHERE date = ?', [date]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('getAttendance error:', error);
    res.status(500).json({ message: 'Error retrieving attendance.' });
  }
};

// 7.1. Mark or update student attendance
exports.markAttendance = async (req, res) => {
  const { date, attendanceList } = req.body;
  if (!date || !attendanceList || !Array.isArray(attendanceList)) {
    return res.status(400).json({ message: 'Date and attendance list are required.' });
  }

  try {
    for (const item of attendanceList) {
      const [existing] = await db.query('SELECT id FROM attendance WHERE student_id = ? AND date = ?', [item.studentId, date]);
      if (existing.length > 0) {
        await db.execute('UPDATE attendance SET status = ? WHERE id = ?', [item.status, existing[0].id]);
      } else {
        await db.execute('INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)', [item.studentId, date, item.status]);
      }

      // If marked Absent, send a parent notification
      if (item.status && item.status.toLowerCase() === 'absent') {
        const [studentInfo] = await db.query(
          'SELECT s.student_name, u.email as parentEmail FROM students s LEFT JOIN users u ON s.parent_id = u.id WHERE s.id = ?',
          [item.studentId]
        );
        if (studentInfo.length > 0 && studentInfo[0].parentEmail) {
          const parentEmail = studentInfo[0].parentEmail.trim().toLowerCase();
          const studentName = studentInfo[0].student_name;
          const msg = `Dear parent, your child ${studentName} was marked absent today (${date}).`;

          // Check if notification already exists to prevent duplicate spam
          const [notifExists] = await db.query(
            'SELECT id FROM notifications WHERE parent_email = ? AND message = ?',
            [parentEmail, msg]
          );
          if (notifExists.length === 0) {
            await db.execute(
              'INSERT INTO notifications (parent_email, message, type, read_status) VALUES (?, ?, ?, ?)',
              [parentEmail, msg, 'attendance', 'unread']
            );
          }
        }
      }
    }
    res.status(200).json({ message: 'Attendance records updated successfully.' });
  } catch (error) {
    console.error('markAttendance error:', error);
    res.status(500).json({ message: 'Error marking attendance.' });
  }
};

// 8. Update daycare routines, meals, milestones, and classroom notes
exports.updateRoutines = async (req, res) => {
  const { studentId, date, breakfast, lunch, snack, classroomNotes, creativity, language, socialSkills, emotionalGrowth, motorSkills } = req.body;
  if (!studentId || !date) return res.status(400).json({ message: 'Student ID and date are required.' });

  try {
    // 1. Meals
    if (breakfast !== undefined || lunch !== undefined || snack !== undefined) {
      const [existingMeals] = await db.query('SELECT id FROM meals WHERE student_id = ? AND date = ?', [studentId, date]);
      if (existingMeals.length > 0) {
        await db.execute('UPDATE meals SET breakfast = COALESCE(?, breakfast), lunch = COALESCE(?, lunch), snack = COALESCE(?, snack) WHERE id = ?', [breakfast, lunch, snack, existingMeals[0].id]);
      } else {
        await db.execute('INSERT INTO meals (student_id, date, breakfast, lunch, snack) VALUES (?, ?, ?, ?, ?)', [studentId, date, breakfast || '', lunch || '', snack || '']);
      }
    }

    // 2. Classroom Notes
    if (classroomNotes !== undefined) {
      await db.execute('UPDATE students SET classroom_notes = ? WHERE id = ?', [classroomNotes, studentId]);
    }

    // 3. Milestones
    if (creativity !== undefined || language !== undefined || socialSkills !== undefined || emotionalGrowth !== undefined || motorSkills !== undefined) {
      const [existingMs] = await db.query('SELECT id FROM milestones WHERE student_id = ?', [studentId]);
      if (existingMs.length > 0) {
        await db.execute(`
          UPDATE milestones SET 
            creativity = COALESCE(?, creativity), 
            language = COALESCE(?, language), 
            social_skills = COALESCE(?, social_skills), 
            emotional_growth = COALESCE(?, emotional_growth), 
            motor_skills = COALESCE(?, motor_skills) 
          WHERE id = ?`, 
          [creativity, language, socialSkills, emotionalGrowth, motorSkills, existingMs[0].id]
        );
      } else {
        await db.execute(
          'INSERT INTO milestones (student_id, creativity, language, social_skills, emotional_growth, motor_skills) VALUES (?, ?, ?, ?, ?, ?)', 
          [studentId, creativity || 80, language || 80, socialSkills || 80, emotionalGrowth || 80, motorSkills || 80]
        );
      }
    }

    res.status(200).json({ message: 'Daycare routines updated successfully.' });
  } catch (error) {
    console.error('updateRoutines error:', error);
    res.status(500).json({ message: 'Error updating daycare routines.' });
  }
};

// 9. Update photo student tags & notify parents
exports.updatePhotoTags = async (req, res) => {
  const { photoId } = req.params;
  const { student_ids } = req.body;
  if (!Array.isArray(student_ids)) return res.status(400).json({ message: 'student_ids must be an array.' });

  try {
    const [pRows] = await db.query('SELECT * FROM photos WHERE id = ?', [photoId]);
    if (pRows.length === 0) return res.status(404).json({ message: 'Photo not found.' });
    
    const [aRows] = await db.query('SELECT title FROM activities WHERE id = ?', [pRows[0].activity_id]);
    const activityTitle = aRows.length ? aRows[0].title : 'an activity';

    await db.execute('DELETE FROM student_tags WHERE photo_id = ?', [photoId]);

    for (const studentId of student_ids) {
      await db.execute('INSERT INTO student_tags (photo_id, student_id) VALUES (?, ?)', [photoId, studentId]);

      const [sRows] = await db.query('SELECT s.student_name, u.email as parentEmail FROM students s LEFT JOIN users u ON s.parent_id = u.id WHERE s.id = ?', [studentId]);
      if (sRows.length > 0 && sRows[0].parentEmail) {
        const msg = `Your child ${sRows[0].student_name} was tagged in ${activityTitle}.`;
        await db.execute(
          'INSERT INTO notifications (parent_email, message, type, read_status) VALUES (?, ?, ?, ?)',
          [sRows[0].parentEmail.trim().toLowerCase(), msg, 'tag', 'unread']
        );
      }
    }

    res.status(200).json({ message: 'Student tags updated successfully.' });
  } catch (error) {
    console.error('updatePhotoTags error:', error);
    res.status(500).json({ message: 'Error updating student tags.' });
  }
};
