const { getData, saveData } = require('../config/jsonDb');
const ai = require('../services/gemini');

// 1. Teacher Dashboard Statistics
exports.getStats = async (req, res) => {
  const teacherId = req.user.id;
  try {
    const data = getData();
    const tr = data.teachers.find(t => t.user_id === teacherId);
    const classroomName = tr ? tr.classroom : null;

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Total activities today
    const todayActivities = data.activities.filter(
      a => a.teacher_id === teacherId && a.activity_date === todayStr
    ).length;

    // Total uploads
    const totalUploads = data.photos.filter(p => p.uploaded_by === teacherId).length;
    
    // Approved count
    const approvedUploads = data.photos.filter(
      p => p.uploaded_by === teacherId && p.status === 'approved'
    ).length;

    // Pending count
    const pendingUploads = data.photos.filter(
      p => p.uploaded_by === teacherId && p.status === 'pending'
    ).length;

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
    const data = getData();
    const tr = data.teachers.find(t => t.user_id === teacherId);
    
    if (!tr || !tr.classroom) {
      return res.status(200).json({
        classroomId: null,
        classroomName: 'None Assigned',
        students: [],
        message: 'You are not assigned to any classroom yet.'
      });
    }

    const classroomName = tr.classroom;

    // Get all students in the database so the teacher can tag any student
    const allStudents = data.students
      .map(s => ({
        id: s.studentId,
        student_name: `${s.studentName} (${s.classroom})`, // Display name along with section for clear mapping
        age: s.age
      }))
      .sort((a, b) => a.student_name.localeCompare(b.student_name));

    res.status(200).json({
      classroomId: classroomName, // Use classroom name list as classroom ID in simple JSON DB
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

    const data = getData();
    const newAct = {
      id: data.activities.length > 0 ? Math.max(...data.activities.map(a => a.id)) + 1 : 1,
      title,
      description: description || '',
      category,
      activity_date,
      classroom: classroom_id, // in this JSON version, classroom_id represents classroomName
      teacher_id: teacherId,
      ai_summary: summary,
      created_at: new Date().toISOString()
    };
    
    data.activities.push(newAct);
    saveData(data);

    res.status(201).json({
      message: 'Activity created successfully.',
      activity: newAct
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
    const data = getData();
    const activity = data.activities.find(a => a.id === parseInt(activity_id));
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    for (const photoData of photos) {
      const { image_url, ai_caption, student_ids } = photoData;

      if (!image_url) {
        return res.status(400).json({ message: 'Image URL is missing for one of the submitted photos.' });
      }

      // 1. Insert photo record
      const newPhoto = {
        id: data.photos.length > 0 ? Math.max(...data.photos.map(p => p.id)) + 1 : 1,
        activity_id: parseInt(activity_id),
        image_url,
        ai_caption: ai_caption || '',
        status: 'pending',
        uploaded_by: teacherId,
        uploaded_at: new Date().toISOString()
      };
      data.photos.push(newPhoto);

      // 2. Insert tags & parent notifications
      if (student_ids && Array.isArray(student_ids)) {
        for (const studentId of student_ids) {
          const newTag = {
            id: data.student_tags.length > 0 ? Math.max(...data.student_tags.map(t => t.id)) + 1 : 1,
            photo_id: newPhoto.id,
            studentId: parseInt(studentId)
          };
          data.student_tags.push(newTag);

          // Find student and their parentEmail
          const studentObj = data.students.find(s => s.studentId === parseInt(studentId));
          if (studentObj && studentObj.parentEmail) {
            const parentEmail = studentObj.parentEmail.trim().toLowerCase();
            const notificationMsg = `Your child ${studentObj.studentName} was tagged in ${activity.title}.`;
            
            const notificationObj = {
              id: data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
              parentEmail,
              message: notificationMsg,
              type: 'tag',
              readStatus: 'unread',
              createdAt: new Date().toISOString()
            };
            data.notifications.push(notificationObj);
          }
        }
      }
    }

    saveData(data);
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
    const data = getData();
    const teacherPhotos = data.photos
      .filter(p => p.uploaded_by === teacherId)
      .map(p => {
        const a = data.activities.find(act => act.id === p.activity_id);
        const tags = data.student_tags
          .filter(t => t.photo_id === p.id)
          .map(t => {
            const s = data.students.find(stud => stud.studentId === t.studentId);
            return {
              student_id: t.studentId,
              student_name: s ? s.studentName : 'Unknown Student'
            };
          });

        return {
          ...p,
          activity_title: a ? a.title : 'No Title',
          activity_date: a ? a.activity_date : new Date(),
          activity_category: a ? a.category : 'General',
          tags
        };
      })
      .sort((x, y) => new Date(y.uploaded_at) - new Date(x.uploaded_at));

    res.status(200).json(teacherPhotos);
  } catch (error) {
    console.error('getUploadHistory error:', error);
    res.status(500).json({ message: 'Error retrieving upload history.' });
  }
};

// 7. Mark or update student attendance
exports.markAttendance = async (req, res) => {
  const { date, attendanceList } = req.body;
  if (!date || !attendanceList || !Array.isArray(attendanceList)) {
    return res.status(400).json({ message: 'Date and attendance list are required.' });
  }

  try {
    const data = getData();
    if (!data.attendance) {
      data.attendance = [];
    }

    attendanceList.forEach(item => {
      const idx = data.attendance.findIndex(a => a.studentId === parseInt(item.studentId) && a.date === date);
      if (idx !== -1) {
        data.attendance[idx].status = item.status;
      } else {
        const newRecord = {
          id: data.attendance.length > 0 ? Math.max(...data.attendance.map(a => a.id)) + 1 : 1,
          studentId: parseInt(item.studentId),
          date,
          status: item.status
        };
        data.attendance.push(newRecord);
      }
    });

    saveData(data);
    res.status(200).json({ message: 'Attendance records updated successfully.' });
  } catch (error) {
    console.error('markAttendance error:', error);
    res.status(500).json({ message: 'Error marking attendance.' });
  }
};

// 8. Update daycare routines, meals, milestones, and classroom notes
exports.updateRoutines = async (req, res) => {
  const { studentId, date, breakfast, lunch, snack, classroomNotes, creativity, language, socialSkills, emotionalGrowth, motorSkills } = req.body;
  if (!studentId || !date) {
    return res.status(400).json({ message: 'Student ID and date are required.' });
  }

  try {
    const data = getData();
    
    // 1. Meals Update
    if (breakfast !== undefined || lunch !== undefined || snack !== undefined) {
      if (!data.meals) data.meals = [];
      const mealIdx = data.meals.findIndex(m => m.studentId === parseInt(studentId) && m.date === date);
      if (mealIdx !== -1) {
        if (breakfast !== undefined) data.meals[mealIdx].breakfast = breakfast;
        if (lunch !== undefined) data.meals[mealIdx].lunch = lunch;
        if (snack !== undefined) data.meals[mealIdx].snack = snack;
      } else {
        data.meals.push({
          id: data.meals.length > 0 ? Math.max(...data.meals.map(m => m.id)) + 1 : 1,
          studentId: parseInt(studentId),
          date,
          breakfast: breakfast || '',
          lunch: lunch || '',
          snack: snack || ''
        });
      }
    }

    // 2. Classroom Notes Update
    if (classroomNotes !== undefined) {
      const student = data.students.find(s => s.studentId === parseInt(studentId));
      if (student) {
        student.classroomNotes = classroomNotes;
      }
    }

    // 3. Milestones Update
    if (creativity !== undefined || language !== undefined || socialSkills !== undefined || emotionalGrowth !== undefined || motorSkills !== undefined) {
      if (!data.milestones) data.milestones = [];
      const milestoneIdx = data.milestones.findIndex(m => m.studentId === parseInt(studentId));
      
      const creativeVal = creativity !== undefined ? parseInt(creativity) : 80;
      const langVal = language !== undefined ? parseInt(language) : 80;
      const socialVal = socialSkills !== undefined ? parseInt(socialSkills) : 80;
      const emotionalVal = emotionalGrowth !== undefined ? parseInt(emotionalGrowth) : 80;
      const motorVal = motorSkills !== undefined ? parseInt(motorSkills) : 80;

      if (milestoneIdx !== -1) {
        if (creativity !== undefined) data.milestones[milestoneIdx].creativity = creativeVal;
        if (language !== undefined) data.milestones[milestoneIdx].language = langVal;
        if (socialSkills !== undefined) data.milestones[milestoneIdx].socialSkills = socialVal;
        if (emotionalGrowth !== undefined) data.milestones[milestoneIdx].emotionalGrowth = emotionalVal;
        if (motorSkills !== undefined) data.milestones[milestoneIdx].motorSkills = motorVal;
        data.milestones[milestoneIdx].lastUpdated = new Date().toISOString();
      } else {
        data.milestones.push({
          id: data.milestones.length > 0 ? Math.max(...data.milestones.map(m => m.id)) + 1 : 1,
          studentId: parseInt(studentId),
          creativity: creativeVal,
          language: langVal,
          socialSkills: socialVal,
          emotionalGrowth: emotionalVal,
          motorSkills: motorVal,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    saveData(data);
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
  if (!Array.isArray(student_ids)) {
    return res.status(400).json({ message: 'student_ids must be an array.' });
  }

  try {
    const data = getData();
    const photo = data.photos.find(p => p.id === parseInt(photoId));
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }

    const activity = data.activities.find(a => a.id === photo.activity_id);
    const activityTitle = activity ? activity.title : 'an activity';

    // Clear old tags for this photo
    data.student_tags = data.student_tags.filter(t => t.photo_id !== parseInt(photoId));

    // Insert new tags & notify parents of tagged children
    for (const studentId of student_ids) {
      const newTag = {
        id: data.student_tags.length > 0 ? Math.max(...data.student_tags.map(t => t.id)) + 1 : 1,
        photo_id: parseInt(photoId),
        studentId: parseInt(studentId)
      };
      data.student_tags.push(newTag);

      // Notify parent
      const studentObj = data.students.find(s => s.studentId === parseInt(studentId));
      if (studentObj && studentObj.parentEmail) {
        const parentEmail = studentObj.parentEmail.trim().toLowerCase();
        const notificationMsg = `Your child ${studentObj.studentName} was tagged in ${activityTitle}.`;

        const notificationObj = {
          id: data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
          parentEmail,
          message: notificationMsg,
          type: 'tag',
          readStatus: 'unread',
          createdAt: new Date().toISOString()
        };
        data.notifications.push(notificationObj);
      }
    }

    saveData(data);
    res.status(200).json({ message: 'Student tags updated successfully.' });
  } catch (error) {
    console.error('updatePhotoTags error:', error);
    res.status(500).json({ message: 'Error updating student tags.' });
  }
};
