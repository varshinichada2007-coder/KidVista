const { getData, saveData } = require('../config/jsonDb');

// 1. Dashboard Stats
exports.getStats = async (req, res) => {
  try {
    const data = getData();
    const totalStudents = data.students.length;
    const totalTeachers = data.users.filter(u => u.role === 'teacher').length;
    const totalParents = data.users.filter(u => u.role === 'parent' && u.status === 'approved').length;
    const totalPhotos = data.photos.length;
    const pendingPhotos = data.photos.filter(p => p.status === 'pending').length;
    const pendingParentRequests = data.users.filter(u => u.role === 'parent' && u.status === 'pending').length;

    const recentActivities = data.activities
      .map(a => {
        const u = data.users.find(usr => usr.id === a.teacher_id);
        return {
          ...a,
          classroom_name: a.classroom,
          teacher_name: u ? u.name : 'Unknown Teacher'
        };
      })
      .sort((x, y) => new Date(y.created_at) - new Date(x.created_at))
      .slice(0, 5);

    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalPhotos,
      pendingPhotos,
      pendingParentRequests,
      recentActivities
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: 'Error retrieving system stats.' });
  }
};

// 2. Classroom Management
exports.getClassrooms = async (req, res) => {
  try {
    const data = getData();
    res.status(200).json(data.classrooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classrooms.' });
  }
};

exports.createClassroom = async (req, res) => {
  const { classroom_name } = req.body;
  if (!classroom_name) return res.status(400).json({ message: 'Classroom name is required.' });
  try {
    const data = getData();
    const newClass = {
      id: data.classrooms.length > 0 ? Math.max(...data.classrooms.map(c => c.id)) + 1 : 1,
      classroom_name
    };
    data.classrooms.push(newClass);
    saveData(data);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Error creating classroom.' });
  }
};

// 3. Student Management
exports.getStudents = async (req, res) => {
  try {
    const data = getData();
    const studentsWithParent = data.students.map(s => {
      const parentUser = data.users.find(u => u.email.trim().toLowerCase() === s.parentEmail.trim().toLowerCase());
      return {
        id: s.studentId,
        student_name: s.studentName,
        age: s.age,
        classroom_name: s.classroom,
        parent_name: parentUser ? parentUser.name : 'Unlinked',
        parent_email: s.parentEmail
      };
    });
    res.status(200).json(studentsWithParent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students.' });
  }
};

exports.addStudent = async (req, res) => {
  const { student_name, age, classroom_name, parent_email } = req.body;
  if (!student_name || !age) {
    return res.status(400).json({ message: 'Student name and age are required.' });
  }
  try {
    const data = getData();
    const newStudent = {
      studentId: data.students.length > 0 ? Math.max(...data.students.map(s => s.studentId)) + 1 : 1,
      studentName: student_name,
      age: parseInt(age),
      classroom: classroom_name || 'Nursery A',
      parentEmail: parent_email || ''
    };
    data.students.push(newStudent);
    saveData(data);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error adding student.' });
  }
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { student_name, age, classroom_name, parent_email } = req.body;
  try {
    const data = getData();
    data.students = data.students.map(s => {
      if (s.studentId === parseInt(id)) {
        return {
          ...s,
          studentName: student_name,
          age: parseInt(age),
          classroom: classroom_name,
          parentEmail: parent_email
        };
      }
      return s;
    });
    saveData(data);
    res.status(200).json({ id, student_name, age, classroom_name, parent_email });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student.' });
  }
};

exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const data = getData();
    data.students = data.students.filter(s => s.studentId !== parseInt(id));
    saveData(data);
    res.status(200).json({ message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student.' });
  }
};

// 4. Teacher Management
exports.getTeachers = async (req, res) => {
  try {
    const data = getData();
    const teachersList = data.users
      .filter(u => u.role === 'teacher')
      .map(u => {
        const tr = data.teachers.find(t => t.user_id === u.id);
        return {
          teacher_id: tr ? tr.id : null,
          user_id: u.id,
          name: u.name,
          email: u.email,
          classroom_name: tr ? tr.classroom : 'Nursery A'
        };
      });
    res.status(200).json(teachersList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers.' });
  }
};

exports.addTeacher = async (req, res) => {
  const { name, email, classroom_name } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Teacher name and email are required.' });
  }
  try {
    const data = getData();
    const exists = data.users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    const newUser = {
      id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      name,
      email: email.trim().toLowerCase(),
      password: 'teacher123',
      role: 'teacher',
      status: 'approved'
    };
    data.users.push(newUser);

    let resolvedClassroomName = classroom_name;
    if (req.body.classroom_id) {
      const cls = data.classrooms.find(c => c.id === parseInt(req.body.classroom_id));
      if (cls) resolvedClassroomName = cls.classroom_name;
    }

    const newTeacher = {
      id: data.teachers.length > 0 ? Math.max(...data.teachers.map(t => t.id)) + 1 : 1,
      user_id: newUser.id,
      classroom: resolvedClassroomName || 'Nursery A'
    };
    data.teachers.push(newTeacher);

    saveData(data);
    res.status(201).json({ user_id: newUser.id, name, email, classroom_name: resolvedClassroomName });
  } catch (error) {
    res.status(500).json({ message: 'Error adding teacher.' });
  }
};

exports.updateTeacher = async (req, res) => {
  const { id } = req.params; // user_id
  const { name, email, classroom_name } = req.body;
  try {
    const data = getData();

    let resolvedClassroomName = classroom_name;
    if (req.body.classroom_id) {
      const cls = data.classrooms.find(c => c.id === parseInt(req.body.classroom_id));
      if (cls) resolvedClassroomName = cls.classroom_name;
    }

    data.users = data.users.map(u => {
      if (u.id === parseInt(id)) {
        return { ...u, name, email };
      }
      return u;
    });

    data.teachers = data.teachers.map(t => {
      if (t.user_id === parseInt(id)) {
        return { ...t, classroom: resolvedClassroomName };
      }
      return t;
    });

    saveData(data);
    res.status(200).json({ user_id: id, name, email, classroom_name: resolvedClassroomName });
  } catch (error) {
    res.status(500).json({ message: 'Error updating teacher.' });
  }
};

exports.deleteTeacher = async (req, res) => {
  const { id } = req.params; // user_id
  try {
    const data = getData();
    data.users = data.users.filter(u => u.id !== parseInt(id));
    data.teachers = data.teachers.filter(t => t.user_id !== parseInt(id));
    saveData(data);
    res.status(200).json({ message: 'Teacher deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher.' });
  }
};

// 5. Parent Management
exports.getParents = async (req, res) => {
  try {
    const data = getData();
    const parentsList = data.users
      .filter(u => u.role === 'parent' && u.status === 'approved')
      .map(u => {
        const children = data.students
          .filter(s => s.parentEmail.trim().toLowerCase() === u.email.trim().toLowerCase())
          .map(s => ({
            student_id: s.studentId,
            student_name: s.studentName,
            age: s.age,
            classroom_name: s.classroom
          }));
        return {
          user_id: u.id,
          name: u.name,
          email: u.email,
          children
        };
      });
    res.status(200).json(parentsList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parents.' });
  }
};

exports.addParent = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Parent name and email are required.' });
  }
  try {
    const data = getData();
    const exists = data.users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    const newUser = {
      id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      name,
      email: email.trim().toLowerCase(),
      password: 'parent123',
      role: 'parent',
      status: 'approved'
    };
    data.users.push(newUser);
    saveData(data);
    res.status(201).json({ user_id: newUser.id, name, email });
  } catch (error) {
    res.status(500).json({ message: 'Error adding parent.' });
  }
};

exports.updateParent = async (req, res) => {
  const { id } = req.params; // user_id
  const { name, email } = req.body;
  try {
    const data = getData();
    data.users = data.users.map(u => {
      if (u.id === parseInt(id)) {
        return { ...u, name, email };
      }
      return u;
    });
    saveData(data);
    res.status(200).json({ user_id: id, name, email });
  } catch (error) {
    res.status(500).json({ message: 'Error updating parent.' });
  }
};

exports.deleteParent = async (req, res) => {
  const { id } = req.params; // user_id
  try {
    const data = getData();
    data.users = data.users.filter(u => u.id !== parseInt(id));
    saveData(data);
    res.status(200).json({ message: 'Parent deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting parent.' });
  }
};

// 6. Photo Approval Management
exports.getPendingPhotos = async (req, res) => {
  try {
    const data = getData();
    const pendingPhotos = data.photos
      .filter(p => p.status === 'pending')
      .map(p => {
        const a = data.activities.find(act => act.id === p.activity_id);
        const u = data.users.find(usr => usr.id === p.uploaded_by);
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
          teacher_name: u ? u.name : 'Teacher',
          tags
        };
      });

    res.status(200).json(pendingPhotos);
  } catch (error) {
    console.error('getPendingPhotos error:', error);
    res.status(500).json({ message: 'Error fetching pending photos.' });
  }
};

exports.updatePhotoStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
  }

  try {
    const data = getData();
    const photo = data.photos.find(p => p.id === parseInt(id));
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }
    photo.status = status;
    saveData(data);
    res.status(200).json({ message: `Photo status updated to ${status} successfully.`, id, status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating photo status.' });
  }
};

// 7. Announcement Management
exports.getAnnouncements = async (req, res) => {
  try {
    const data = getData();
    const sortedAnn = [...data.announcements].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    res.status(200).json(sortedAnn);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements.' });
  }
};

exports.createAnnouncement = async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required.' });
  }
  try {
    const data = getData();
    const newAnn = {
      id: data.announcements.length > 0 ? Math.max(...data.announcements.map(a => a.id)) + 1 : 1,
      title,
      message,
      created_at: new Date().toISOString()
    };
    data.announcements.push(newAnn);
    saveData(data);
    res.status(201).json(newAnn);
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement.' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    const data = getData();
    data.announcements = data.announcements.filter(a => a.id !== parseInt(id));
    saveData(data);
    res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement.' });
  }
};

// 8. Parent Approval Requests
exports.getParentRequests = async (req, res) => {
  try {
    const data = getData();
    const requests = data.users.filter(u => u.role === 'parent' && u.status === 'pending');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parent approval requests.' });
  }
};

exports.approveParentRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const data = getData();
    const user = data.users.find(u => u.id === parseInt(id));
    
    if (!user) {
      return res.status(404).json({ message: 'Parent request not found.' });
    }

    user.status = 'approved';

    // Create a student record using child details
    const newStudent = {
      studentId: data.students.length > 0 ? Math.max(...data.students.map(s => s.studentId)) + 1 : 1,
      studentName: user.childName,
      age: parseInt(user.childAge),
      classroom: user.requestedClassroom || 'Nursery A',
      parentEmail: user.email
    };
    data.students.push(newStudent);
    saveData(data);

    res.status(200).json({ message: 'Parent request approved successfully, child profile registered.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving parent request.' });
  }
};

exports.rejectParentRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const data = getData();
    data.users = data.users.filter(u => u.id !== parseInt(id));
    saveData(data);
    res.status(200).json({ message: 'Parent request rejected and account removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting parent request.' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const data = getData();
    const filter = req.query.filter || 'week';

    let start = new Date();
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (filter === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (filter === 'week') {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (filter === 'month') {
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
    } else if (filter === '6months') {
      start.setMonth(start.getMonth() - 6);
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    }

    const isWithinRange = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    // ─── 1. Daily Photo Uploads ───────────────────────────────────────────
    // Build a map of ALL dates in the range, defaulting to 0
    const dayMap = {};
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Pre-fill last 7 days (or range days up to 30)
    const rangeDays = Math.min(Math.round((end - start) / (1000 * 60 * 60 * 24)), 30);
    for (let i = rangeDays; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = 0;
    }
    (data.photos || []).forEach(p => {
      if (p.uploaded_at) {
        const key = new Date(p.uploaded_at).toISOString().split('T')[0];
        if (dayMap.hasOwnProperty(key)) {
          dayMap[key] = (dayMap[key] || 0) + 1;
        }
      }
    });
    const dailyUploads = Object.keys(dayMap).sort().map(date => ({
      date: DAY_NAMES[new Date(date + 'T12:00:00').getDay()],
      fullDate: date,
      count: dayMap[date]
    }));

    // ─── 2. Attendance Rate Trend (by classroom, last 4 weeks) ───────────
    // Build per-week attendance grouped by classroom from attendance records
    // Fallback: calculate from student counts if no attendance data
    const attendanceData = data.attendance || [];
    let attendanceTrend = [];

    if (attendanceData.length > 0) {
      // Real attendance records
      const weekMap = {};
      attendanceData.forEach(att => {
        if (!att.date) return;
        const d = new Date(att.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const wk = weekStart.toISOString().split('T')[0];
        if (!weekMap[wk]) weekMap[wk] = { nursery: { p: 0, t: 0 }, lkg: { p: 0, t: 0 }, ukg: { p: 0, t: 0 } };
        const cls = (att.classroom || '').toLowerCase();
        const key = cls.includes('nursery') ? 'nursery' : cls.includes('lkg') ? 'lkg' : cls.includes('ukg') ? 'ukg' : null;
        if (key) {
          weekMap[wk][key].t += 1;
          if (att.status === 'present') weekMap[wk][key].p += 1;
        }
      });
      attendanceTrend = Object.keys(weekMap).sort().slice(-4).map((wk, i) => ({
        week: `W${i + 1}`,
        nursery: weekMap[wk].nursery.t > 0 ? Math.round((weekMap[wk].nursery.p / weekMap[wk].nursery.t) * 100) : 0,
        lkg: weekMap[wk].lkg.t > 0 ? Math.round((weekMap[wk].lkg.p / weekMap[wk].lkg.t) * 100) : 0,
        ukg: weekMap[wk].ukg.t > 0 ? Math.round((weekMap[wk].ukg.p / weekMap[wk].ukg.t) * 100) : 0,
      }));
    }

    // If no attendance data, return empty — frontend handles this gracefully
    // No fake data!

    // ─── 3. Parent Engagement (photo views per day) ──────────────────────
    // Use photo approvals + notifications as proxy for engagement
    const engagementMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      engagementMap[key] = 0;
    }
    // Count approved photos as parent engagement events
    (data.photos || []).filter(p => p.status === 'approved').forEach(p => {
      if (p.uploaded_at) {
        const key = new Date(p.uploaded_at).toISOString().split('T')[0];
        if (engagementMap.hasOwnProperty(key)) {
          engagementMap[key] += (data.users || []).filter(u => u.role === 'parent' && u.status === 'approved').length;
        }
      }
    });
    (data.notifications || []).forEach(n => {
      if (n.createdAt) {
        const key = new Date(n.createdAt).toISOString().split('T')[0];
        if (engagementMap.hasOwnProperty(key)) engagementMap[key] += 1;
      }
    });
    const parentEngagement = Object.keys(engagementMap).sort().map(date => ({
      day: DAY_NAMES[new Date(date + 'T12:00:00').getDay()],
      views: engagementMap[date]
    }));

    // ─── 4. Activity Distribution (ALL activities, not date-limited) ─────
    const KNOWN_CATEGORIES = ['Art & Craft', 'Music', 'Story Time', 'Outdoor Play', 'Cognitive Activities'];
    const COLORS = ['#4F9CF9', '#F59E0B', '#22C55E', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];
    const catMap = {};

    // Count ALL activities — include any category found in data
    (data.activities || []).forEach(act => {
      if (act.category) {
        catMap[act.category] = (catMap[act.category] || 0) + 1;
      }
    });

    // Also count photo uploads as activities (each photo = at least 1 activity event)
    (data.photos || []).forEach(photo => {
      const cat = photo.activity_category || 'General';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    // Build distribution: use all found categories
    const allCats = [...new Set([...KNOWN_CATEGORIES.filter(c => catMap[c] > 0), ...Object.keys(catMap)])];
    const activityDistribution = allCats.map((cat, i) => ({
      category: cat,
      count: catMap[cat] || 0,
      color: COLORS[i % COLORS.length]
    })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

    // ─── 5. Teacher Performance ─────────────────────────────────────────
    const teachersList = (data.users || []).filter(u => u.role === 'teacher');
    const teacherPerformance = teachersList.map(teacher => {
      const tr = (data.teachers || []).find(t => t.user_id === teacher.id);
      const classroom = tr ? tr.classroom : 'Nursery';

      // ALL photos by this teacher (not date limited)
      const allPhotos = (data.photos || []).filter(p => p.uploaded_by === teacher.id);
      // Photos within range
      const rangePhotos = allPhotos.filter(p => isWithinRange(p.uploaded_at));
      // All activities
      const allActivities = (data.activities || []).filter(a => a.teacher_id === teacher.id);
      const rangeActivities = allActivities.filter(a => isWithinRange(a.activity_date));

      const photoIds = allPhotos.map(p => p.id);
      const tagCount = (data.student_tags || []).filter(t => photoIds.includes(t.photo_id)).length;

      return {
        teacherName: teacher.name,
        classroom,
        uploads: allPhotos.length,         // all-time uploads
        rangeUploads: rangePhotos.length,   // in range
        activitiesConducted: allActivities.length,
        rangeActivities: rangeActivities.length,
        parentEngagement: tagCount * 3 + allPhotos.length * 2
      };
    });

    // ─── 6. Student Distribution ─────────────────────────────────────────
    const classCounts = { 'Nursery': 0, 'LKG': 0, 'UKG': 0 };
    (data.students || []).forEach(s => {
      if (!s.classroom) return;
      const cls = s.classroom;
      if (cls.toLowerCase().startsWith('nursery')) classCounts['Nursery'] += 1;
      else if (cls.toLowerCase().startsWith('lkg')) classCounts['LKG'] += 1;
      else if (cls.toLowerCase().startsWith('ukg')) classCounts['UKG'] += 1;
    });
    const CLASS_COLORS = { 'Nursery': '#22C55E', 'LKG': '#4F9CF9', 'UKG': '#F59E0B' };
    const studentDistribution = Object.keys(classCounts).map(cls => ({
      className: cls,
      count: classCounts[cls],
      color: CLASS_COLORS[cls]
    }));

    // ─── 7. Summary stats ────────────────────────────────────────────────
    const totalPhotosUploaded = (data.photos || []).length;
    const photosThisWeek = (data.photos || []).filter(p => isWithinRange(p.uploaded_at)).length;

    res.status(200).json({
      dailyUploads,
      attendanceTrend,
      parentEngagement,
      activityDistribution,
      teacherPerformance,
      studentDistribution,
      summary: {
        totalPhotosUploaded,
        photosThisWeek,
        totalActivities: (data.activities || []).length,
        activitiesThisWeek: (data.activities || []).filter(a => isWithinRange(a.activity_date)).length,
      }
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: 'Error retrieving system analytics.' });
  }
};
