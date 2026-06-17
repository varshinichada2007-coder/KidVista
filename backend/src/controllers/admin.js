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
