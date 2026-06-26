const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const IS_VERCEL = !!process.env.VERCEL;

const { 
  MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT,
  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT 
} = process.env;

// Use MYSQL* (Railway style) if present, fall back to DB_* style
const dbHost = MYSQLHOST || DB_HOST || 'localhost';
const dbUser = MYSQLUSER || DB_USER || 'root';
const dbPassword = MYSQLPASSWORD || DB_PASSWORD || '';
const dbName = MYSQLDATABASE || DB_NAME || 'kidvista_portal';
const dbPort = parseInt(MYSQLPORT || DB_PORT || '3306');
const DATA_STORE_PATH = path.join(__dirname, '../../data-store.json');


let pool = null;
let isFallback = false;

// Seed data template for JSON store if not exists
const defaultJSONData = {
  users: [
    { id: 1, name: 'Preschool Admin', email: 'admin@kidvista.com', password: '', role: 'admin' },
    { id: 2, name: 'Ms. Clara Jenkins', email: 'teacher@kidvista.com', password: '', role: 'teacher' },
    { id: 3, name: 'Mr. David Miller', email: 'teacher2@kidvista.com', password: '', role: 'teacher' },
    { id: 4, name: 'Rahul Patel (Parent of Aarav & Meera)', email: 'parent@kidvista.com', password: '', role: 'parent' },
    { id: 5, name: 'Priya Sharma (Parent of Diya & Rohan)', email: 'parent2@kidvista.com', password: '', role: 'parent' },
    { id: 6, name: 'Varshini Chada', email: 'varshinichada2007@gmail.com', password: '', role: 'parent' }
  ],
  classrooms: [
    { id: 1, classroom_name: 'Toddlers A' },
    { id: 2, classroom_name: 'Pre-K B' },
    { id: 3, classroom_name: 'Kindergarten C' }
  ],
  students: [
    { id: 1, student_name: 'Aarav Patel', age: 3, classroom_id: 1, parent_id: 4 },
    { id: 2, student_name: 'Diya Sharma', age: 3, classroom_id: 1, parent_id: 5 },
    { id: 3, student_name: 'Meera Patel', age: 4, classroom_id: 2, parent_id: 4 },
    { id: 4, student_name: 'Rohan Sharma', age: 4, classroom_id: 2, parent_id: 5 },
    { id: 5, student_name: 'Aarav Chada', age: 3, classroom_id: 1, parent_id: 6 }
  ],
  teachers: [
    { id: 1, user_id: 2, classroom_id: 1 },
    { id: 2, user_id: 3, classroom_id: 2 }
  ],
  activities: [
    {
      id: 1,
      title: 'Colorful Hand Painting',
      description: 'The children learned primary colors and made handprint art on paper canvases today.',
      category: 'Art & Craft',
      activity_date: '2026-06-11',
      classroom_id: 1,
      teacher_id: 2,
      ai_summary: 'Today, children participated in a creative hand painting session that helped improve imagination, sensory exploration, and fine motor skills.',
      created_at: new Date().toISOString()
    }
  ],
  photos: [
    {
      id: 1,
      activity_id: 1,
      image_url: '/uploads/sample-painting.jpg',
      ai_caption: 'Our little learners explored their creativity with colorful handprints today!',
      status: 'approved',
      uploaded_by: 2,
      uploaded_at: new Date().toISOString()
    }
  ],
  student_tags: [
    { id: 1, photo_id: 1, student_id: 1 },
    { id: 2, photo_id: 1, student_id: 5 }
  ],
  announcements: [
    { id: 1, title: 'Annual Sports Day 2026', message: 'KidVista Annual Sports Day is scheduled for next Saturday. Parents are cordially invited to cheer for our tiny champions!', created_at: new Date().toISOString() },
    { id: 2, title: 'Summer Vacation Holidays Notice', message: 'Dear Parents, please note that the school will remain closed for summer break from June 20th to July 10th. Have a wonderful summer!', created_at: new Date().toISOString() }
  ]
};

// Fill in default hashed passwords for JSON store if needed
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
const tHash = bcrypt.hashSync('teacher123', 10);
const pHash = bcrypt.hashSync('parent123', 10);
defaultJSONData.users[0].password = hash;
defaultJSONData.users[1].password = tHash;
defaultJSONData.users[2].password = tHash;
defaultJSONData.users[3].password = pHash;
defaultJSONData.users[4].password = pHash;
defaultJSONData.users[5].password = pHash;

// In-memory data store for Vercel (read-only filesystem)
let inMemoryData = null;

// Ensure all database tables exist in the JSON database
function ensureAllFields(dbData) {
  if (!dbData.users) dbData.users = [];
  if (!dbData.classrooms) dbData.classrooms = [];
  if (!dbData.students) dbData.students = [];
  if (!dbData.teachers) dbData.teachers = [];
  if (!dbData.activities) dbData.activities = [];
  if (!dbData.photos) dbData.photos = [];
  if (!dbData.student_tags) dbData.student_tags = [];
  if (!dbData.announcements) dbData.announcements = [];
  if (!dbData.notifications) dbData.notifications = [];
  if (!dbData.attendance) dbData.attendance = [];
  if (!dbData.meals) dbData.meals = [];
  if (!dbData.milestones) dbData.milestones = [];
  if (!dbData.feedback) dbData.feedback = [];
}

// Read JSON DB
function readJSONDb() {
  // On Vercel, use in-memory store
  if (IS_VERCEL) {
    if (!inMemoryData) {
      // Try to load from bundled data-store.json first
      try {
        if (fs.existsSync(DATA_STORE_PATH)) {
          inMemoryData = JSON.parse(fs.readFileSync(DATA_STORE_PATH, 'utf8'));
        } else {
          inMemoryData = JSON.parse(JSON.stringify(defaultJSONData));
        }
      } catch (err) {
        inMemoryData = JSON.parse(JSON.stringify(defaultJSONData));
      }
    }
    ensureAllFields(inMemoryData);
    return inMemoryData;
  }

  // Local: read/write to filesystem
  if (!fs.existsSync(DATA_STORE_PATH)) {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(defaultJSONData, null, 2));
  }
  let localData = defaultJSONData;
  try {
    localData = JSON.parse(fs.readFileSync(DATA_STORE_PATH, 'utf8'));
  } catch (err) {
    localData = defaultJSONData;
  }
  ensureAllFields(localData);
  return localData;
}

// Write JSON DB
function writeJSONDb(data) {
  if (IS_VERCEL) {
    // On Vercel, persist in-memory only (serverless invocation lifetime)
    inMemoryData = data;
    return;
  }
  fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2));
}


// Attempt real MySQL Pool connection (skip on Vercel — no MySQL there)
if (IS_VERCEL) {
  console.log('🔌 Running on Vercel — skipping MySQL, using JSON fallback engine.');
  isFallback = true;
} else {
  console.log(`🔌 Connecting to MySQL at ${dbHost}:${dbPort} (db: ${dbName}, user: ${dbUser})`);
  try {
    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('✔ Real MySQL database pool configured.');
  } catch (err) {
    console.warn('⚠️ Real MySQL Pool configuration error:', err.message);
    isFallback = true;
  }
}


// Helper translation functions
function mapStudentToDb(s, data) {
  if (!s) return null;
  const c = data.classrooms.find(cl => cl.classroom_name === s.classroom);
  const u = data.users.find(usr => usr.email === s.parentEmail);
  return {
    id: s.studentId,
    student_id: s.studentId,
    student_name: s.studentName,
    age: s.age,
    classroom_id: c ? c.id : null,
    parent_id: u ? u.id : null,
    medical_notes: s.medicalNotes || null,
    allergies: s.allergies || null,
    classroom_notes: s.classroomNotes || null
  };
}

function mapTeacherToDb(t, data) {
  if (!t) return null;
  const c = data.classrooms.find(cl => cl.classroom_name === t.classroom);
  return {
    id: t.id,
    teacher_id: t.id,
    user_id: t.user_id,
    classroom_id: c ? c.id : null
  };
}

function mapNotificationToDb(n) {
  if (!n) return null;
  return {
    id: n.id,
    parent_email: n.parentEmail,
    parentEmail: n.parentEmail,
    message: n.message,
    type: n.type || 'tag',
    read_status: n.readStatus || 'unread',
    readStatus: n.readStatus || 'unread',
    created_at: n.createdAt || new Date().toISOString(),
    createdAt: n.createdAt || new Date().toISOString()
  };
}

// Create a Mock database pool that acts like mysql2
class MockDbPool {
  async query(sql, params = []) {
    return this.execute(sql, params);
  }

  async execute(sql, params = []) {
    const data = readJSONDb();
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    const norm = cleanSql.toLowerCase().replace(/"/g, "'");
    console.log(`[MOCK QUERY]: sql="${cleanSql}" | norm="${norm}"`);

    // SELECT statements
    if (norm.startsWith('select')) {
      // Count queries first
      if (norm.includes('count(')) {
        if (norm.includes('from students')) {
          return [[{ totalStudents: data.students.length }]];
        }
        if (norm.includes('from users')) {
          if (norm.includes("role='teacher'") || norm.includes('role = \'teacher\'')) {
            const count = data.users.filter(u => u.role === 'teacher').length;
            return [[{ totalTeachers: count }]];
          }
          if (norm.includes('pendingparentrequests') || (norm.includes("role='parent'") && norm.includes("status='pending'"))) {
            const count = data.users.filter(u => u.role === 'parent' && u.status === 'pending').length;
            return [[{ pendingParentRequests: count }]];
          }
          if (norm.includes("role='parent'") && norm.includes("status='approved'")) {
            const count = data.users.filter(u => u.role === 'parent' && u.status === 'approved').length;
            return [[{ totalParents: count }]];
          }
          if (norm.includes("role='parent'")) {
            const count = data.users.filter(u => u.role === 'parent').length;
            return [[{ totalParents: count }]];
          }
        }
        if (norm.includes('from photos')) {
          if (norm.includes('totalphotos')) {
            if (norm.includes('parent_id = ?') || norm.includes('parent_id=?')) {
              const pid = parseInt(params[0]);
              const parentUser = data.users.find(u => u.id === pid);
              if (!parentUser) return [[{ totalPhotos: 0 }]];
              const myStudentsIds = data.students.filter(s => s.parentEmail === parentUser.email).map(s => s.studentId);
              const matchingTags = data.student_tags.filter(t => myStudentsIds.includes(t.studentId));
              const myPhotoIds = [...new Set(matchingTags.map(t => t.photo_id))];
              const count = data.photos.filter(p => myPhotoIds.includes(p.id) && p.status === 'approved').length;
              return [[{ totalPhotos: count }]];
            }
            return [[{ totalPhotos: data.photos.length }]];
          }
          if (norm.includes('pendingphotos') || norm.includes("status='pending'")) {
            const count = data.photos.filter(p => p.status === 'pending').length;
            return [[{ pendingPhotos: count }]];
          }
          if (norm.includes('totaluploads')) {
            const uid = parseInt(params[0]);
            const count = data.photos.filter(p => p.uploaded_by === uid).length;
            return [[{ totalUploads: count }]];
          }
          if (norm.includes('approveduploads')) {
            const uid = parseInt(params[0]);
            const count = data.photos.filter(p => p.uploaded_by === uid && p.status === 'approved').length;
            return [[{ approveduploads: count }]];
          }
          if (norm.includes('pendinguploads')) {
            const uid = parseInt(params[0]);
            const count = data.photos.filter(p => p.uploaded_by === uid && p.status === 'pending').length;
            return [[{ pendinguploads: count }]];
          }
        }
        if (norm.includes('from announcements')) {
          return [[{ totalAnnouncements: data.announcements.length }]];
        }
        if (norm.includes('from activities')) {
          if (norm.includes('todayactivities')) {
            const tid = parseInt(params[0]);
            const date = params[1];
            const count = data.activities.filter(a => a.teacher_id === tid && a.activity_date === date).length;
            return [[{ todayactivities: count }]];
          }
        }
      }

      // 1. users
      if (norm.startsWith('select * from users where email = ?')) {
        const email = params[0].trim().toLowerCase();
        const match = data.users.filter(u => u.email.trim().toLowerCase() === email);
        return [match];
      }
      if (norm.startsWith('select * from users where id = ?') || norm.startsWith('select * from users where id=?')) {
        const id = parseInt(params[0]);
        const match = data.users.filter(u => u.id === id);
        return [match];
      }
      if (norm.startsWith('select id, name, email, role from users where id = ?') || norm.startsWith('select id, name, email, role from users where id=?')) {
        const id = parseInt(params[0]);
        const match = data.users.filter(u => u.id === id).map(({id, name, email, role}) => ({id, name, email, role}));
        return [match];
      }
      if (norm.startsWith('select status, email from users where id = ?') || norm.startsWith('select status, email from users where id=?') ||
          norm.startsWith('select status from users where id = ?') || norm.startsWith('select status from users where id=?') ||
          norm.startsWith('select email from users where id = ?') || norm.startsWith('select email from users where id=?')) {
        const id = parseInt(params[0]);
        const match = data.users.filter(u => u.id === id).map(({status, email}) => ({status, email}));
        return [match];
      }
      if (norm.includes('from users u') && norm.includes('teachers t') && norm.includes("role = 'teacher'")) {
        const list = data.users.filter(u => u.role === 'teacher').map(u => {
          const t = data.teachers.find(tr => tr.user_id === u.id);
          const c = t ? data.classrooms.find(cl => cl.classroom_name === t.classroom) : null;
          return {
            teacher_id: t ? t.id : null,
            user_id: u.id,
            name: u.name,
            email: u.email,
            classroom_id: c ? c.id : null,
            classroom_name: t ? t.classroom : null
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
        return [list];
      }
      if (norm.includes('role') && norm.includes('parent') && !norm.includes('from students')) {
        let filtered = data.users.filter(u => u.role === 'parent');
        if (norm.includes('approved')) {
          filtered = filtered.filter(u => u.status === 'approved');
        }
        if (norm.includes('pending')) {
          filtered = filtered.filter(u => u.status === 'pending');
        }
        return [filtered.map(u => ({
          user_id: u.id,
          id: u.id,
          name: u.name,
          email: u.email,
          status: u.status,
          childName: u.child_name,
          childAge: u.child_age,
          requestedClassroom: u.requested_classroom
        }))];
      }

      // 2. classrooms
      if (norm.startsWith('select * from classrooms order by classroom_name asc') || norm.startsWith('select * from classrooms')) {
        return [data.classrooms.sort((a,b) => a.classroom_name.localeCompare(b.classroom_name))];
      }
      if (norm.startsWith('select classroom_name from classrooms where id = ?') || norm.startsWith('select classroom_name from classrooms where id=?')) {
        const id = parseInt(params[0]);
        const match = data.classrooms.find(c => c.id === id);
        return [match ? [{ classroom_name: match.classroom_name }] : []];
      }
      if (norm.startsWith('select id from classrooms where classroom_name = ?') || norm.startsWith('select id from classrooms where classroom_name=?')) {
        const name = params[0];
        const match = data.classrooms.find(c => c.classroom_name.toLowerCase().trim() === name.toLowerCase().trim());
        return [match ? [{ id: match.id }] : []];
      }
      if (norm.startsWith('select id from classrooms limit 1')) {
        return [data.classrooms.length > 0 ? [{ id: data.classrooms[0].id }] : []];
      }

      // 3. students & student stats/timeline/attendance/meals/milestones
      if (norm.includes('from students s') && norm.includes('parent_id = ? limit 1')) {
        const pid = parseInt(params[0]);
        const parentUser = data.users.find(u => u.id === pid);
        if (!parentUser) return [[]];
        const child = data.students.find(s => s.parentEmail === parentUser.email);
        if (!child) return [[]];
        return [[{
          studentId: child.studentId,
          studentName: child.studentName,
          age: child.age,
          classroom: child.classroom,
          allergies: child.allergies || 'None',
          medicalNotes: child.medicalNotes || 'None'
        }]];
      }
      if (norm.includes('from students s') && norm.includes('u.email = ? limit 1')) {
        const email = params[0].toLowerCase().trim();
        const child = data.students.find(s => s.parentEmail.toLowerCase().trim() === email);
        if (!child) return [[]];
        return [[{
          studentId: child.studentId,
          studentName: child.studentName,
          age: child.age,
          classroom: child.classroom,
          allergies: child.allergies || 'None',
          medicalNotes: child.medicalNotes || 'None'
        }]];
      }
      if (norm.includes('from students') && norm.includes('parent_id = ?')) {
        const pid = parseInt(params[0]);
        const parentUser = data.users.find(u => u.id === pid);
        if (!parentUser) return [[]];
        const myStudents = data.students.filter(s => s.parentEmail === parentUser.email);
        const list = myStudents.map(s => {
          const mapped = mapStudentToDb(s, data);
          const classTeachers = data.teachers.filter(t => t.classroom === s.classroom);
          const teacherUsers = classTeachers.map(t => data.users.find(u => u.id === t.user_id)).filter(Boolean);
          return {
            id: mapped.id,
            student_id: mapped.id,
            studentId: mapped.id,
            student_name: mapped.student_name,
            studentName: mapped.student_name,
            age: mapped.age,
            classroom_id: mapped.classroom_id,
            classroom_name: s.classroom,
            classroom: s.classroom,
            parent_id: mapped.parent_id,
            parentEmail: parentUser.email,
            teacherName: teacherUsers.map(u => u.name).join(', ') || 'Not Assigned',
            teacherEmail: teacherUsers.map(u => u.email).join(', ') || ''
          };
        });
        return [list];
      }
      if (norm.includes('from students s') && norm.includes('parent_name')) {
        const list = data.students.map(s => {
          const mapped = mapStudentToDb(s, data);
          const parentUser = data.users.find(u => u.id === mapped.parent_id);
          return {
            ...mapped,
            classroom_name: s.classroom,
            parent_name: parentUser ? parentUser.name : null,
            parent_email: parentUser ? parentUser.email : null
          };
        }).sort((a, b) => a.student_name.localeCompare(b.student_name));
        return [list];
      }
      if (norm.startsWith('select id from students limit 1')) {
        return [data.students.length > 0 ? [{ id: data.students[0].studentId }] : []];
      }
      if (norm.startsWith('select id, student_name, age from students where classroom_id = ?') || norm.startsWith('select id, student_name, age from students where classroom_id=?')) {
        const cid = parseInt(params[0]);
        const c = data.classrooms.find(cl => cl.id === cid);
        const list = data.students
          .filter(s => s.classroom === (c ? c.classroom_name : ''))
          .map(s => mapStudentToDb(s, data))
          .sort((a,b) => a.student_name.localeCompare(b.student_name));
        return [list];
      }
      if (norm.includes('from students s') && norm.includes('order by s.student_name asc')) {
        const list = data.students.map(s => {
          const mapped = mapStudentToDb(s, data);
          return {
            ...mapped,
            classroom_name: s.classroom
          };
        }).sort((a, b) => a.student_name.localeCompare(b.student_name));
        return [list];
      }

      // 5. attendance, meals, milestones, notifications, feedback
      if (norm.startsWith('select id from attendance where student_id = ? and date = ?') || norm.startsWith('select id from attendance where student_id=? and date=?')) {
        const sid = parseInt(params[0]);
        const date = params[1];
        const match = data.attendance.find(a => a.studentId === sid && a.date === date);
        return [match ? [match] : []];
      }
      if (norm.includes('from attendance') && norm.includes('student_id = ?')) {
        const sid = parseInt(params[0]);
        const list = data.attendance.filter(a => a.studentId === sid).map(a => ({
          id: a.id,
          studentId: a.studentId,
          date: a.date,
          status: a.status
        }));
        return [list];
      }
      if (norm.startsWith('select id from meals where student_id = ? and date = ?') || norm.startsWith('select id from meals where student_id=? and date=?')) {
        const sid = parseInt(params[0]);
        const date = params[1];
        const match = data.meals.find(m => m.studentId === sid && m.date === date);
        return [match ? [match] : []];
      }
      if (norm.includes('from meals') && norm.includes('student_id = ?')) {
        const sid = parseInt(params[0]);
        const list = data.meals.filter(m => m.studentId === sid).map(m => ({
          id: m.id,
          studentId: m.studentId,
          date: m.date,
          breakfast: m.breakfast,
          lunch: m.lunch,
          snack: m.snack
        }));
        return [list];
      }
      if (norm.startsWith('select id from milestones where student_id = ?') || norm.startsWith('select id from milestones where student_id=?')) {
        const sid = parseInt(params[0]);
        const match = data.milestones.find(m => m.studentId === sid);
        return [match ? [match] : []];
      }
      if (norm.includes('from milestones') && norm.includes('student_id = ?')) {
        const sid = parseInt(params[0]);
        const list = data.milestones.filter(m => m.studentId === sid).map(m => ({
          id: m.id,
          studentId: m.studentId,
          creativity: m.creativity,
          language: m.language,
          socialSkills: m.socialSkills,
          emotionalGrowth: m.emotionalGrowth,
          motorSkills: m.motorSkills
        }));
        return [list];
      }
      if (norm.includes('from notifications') && norm.includes('parent_email')) {
        const email = params[0].toLowerCase().trim();
        const list = data.notifications
          .filter(n => n.parentEmail.toLowerCase().trim() === email)
          .map(mapNotificationToDb)
          .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
      }
      if (norm.startsWith('select * from notifications where id = ?') || norm.startsWith('select * from notifications where id=?')) {
        const id = parseInt(params[0]);
        const match = data.notifications.filter(n => n.id === id).map(mapNotificationToDb);
        return [match];
      }

      // 6. photos & activities & tags
      if (norm.startsWith('select * from photos where id = ?') || norm.startsWith('select * from photos where id=?')) {
        const id = parseInt(params[0]);
        const match = data.photos.filter(p => p.id === id);
        return [match];
      }
      if (norm.startsWith('select title from activities where id = ?') || norm.startsWith('select title from activities where id=?')) {
        const id = parseInt(params[0]);
        const match = data.activities.find(a => a.id === id);
        return [match ? [{ title: match.title }] : []];
      }
      if (norm.includes('from photos p') && norm.includes('parent_id = ?')) {
        const pid = parseInt(params[0]);
        const parentUser = data.users.find(u => u.id === pid);
        if (!parentUser) return [[]];
        const myStudentsIds = data.students.filter(s => s.parentEmail === parentUser.email).map(s => s.studentId);
        const matchingTags = data.student_tags.filter(t => myStudentsIds.includes(t.studentId));
        const myPhotoIds = [...new Set(matchingTags.map(t => t.photo_id))];
        
        const list = data.photos.filter(p => myPhotoIds.includes(p.id) && p.status === 'approved').map(p => {
          const a = data.activities.find(act => act.id === p.activity_id);
          const u = data.users.find(usr => usr.id === p.uploaded_by);
          return {
            id: p.id,
            image_url: p.image_url,
            ai_caption: p.ai_caption,
            uploaded_at: p.uploaded_at,
            status: p.status,
            activity_id: a ? a.id : null,
            activity_title: a ? a.title : '',
            activity_description: a ? a.description : '',
            activity_category: a ? a.category : '',
            activity_date: a ? a.activity_date : '',
            activity_summary: a ? a.ai_summary : '',
            teacher_name: u ? u.name : ''
          };
        }).sort((x, y) => new Date(y.uploaded_at) - new Date(x.uploaded_at));
        return [list];
      }
      if (norm.includes('from photos p') && norm.includes('status = \'pending\'')) {
        const list = data.photos.filter(p => p.status === 'pending').map(p => {
          const a = data.activities.find(act => act.id === p.activity_id);
          const u = data.users.find(usr => usr.id === p.uploaded_by);
          return {
            ...p,
            activity_title: a ? a.title : '',
            activity_date: a ? a.activity_date : '',
            activity_category: a ? a.category : '',
            teacher_name: u ? u.name : ''
          };
        }).sort((x, y) => new Date(y.uploaded_at) - new Date(x.uploaded_at));
        return [list];
      }
      if (norm.includes('from photos p') && norm.includes('uploaded_by = ?')) {
        const uid = parseInt(params[0]);
        const list = data.photos.filter(p => p.uploaded_by === uid).map(p => {
          const a = data.activities.find(act => act.id === p.activity_id);
          return {
            ...p,
            activity_title: a ? a.title : '',
            activity_date: a ? a.activity_date : '',
            activity_category: a ? a.category : ''
          };
        }).sort((x, y) => new Date(y.uploaded_at) - new Date(x.uploaded_at));
        return [list];
      }
      if (norm.includes('from student_tags') && norm.includes('photo_id = ?')) {
        const pid = parseInt(params[0]);
        const list = data.student_tags.filter(t => t.photo_id === pid).map(t => {
          const s = data.students.find(stud => stud.studentId === t.studentId);
          return {
            student_id: t.studentId,
            studentId: t.studentId,
            student_name: s ? s.studentName : ''
          };
        });
        return [list];
      }
      if (norm.startsWith('select s.student_name, u.email as parentemail from students s left join users u on s.parent_id = u.id where s.id = ?') || norm.startsWith('select s.student_name, u.email as parentemail from students s left join users u on s.parent_id = u.id where s.id=?')) {
        const sid = parseInt(params[0]);
        const s = data.students.find(stud => stud.studentId === sid);
        if (!s) return [[]];
        return [[{
          student_name: s.studentName,
          parentEmail: s.parentEmail
        }]];
      }
      if (norm.includes('from activities a') && norm.includes('parent_id = ?') && norm.includes('limit 1')) {
        const pid = parseInt(params[0]);
        const parentUser = data.users.find(u => u.id === pid);
        if (!parentUser) return [[]];
        const myStudentsIds = data.students.filter(s => s.parentEmail === parentUser.email).map(s => s.studentId);
        const matchingTags = data.student_tags.filter(t => myStudentsIds.includes(t.studentId));
        const myPhotoIds = [...new Set(matchingTags.map(t => t.photo_id))];
        const approvedPhotos = data.photos.filter(p => myPhotoIds.includes(p.id) && p.status === 'approved');
        const actIds = [...new Set(approvedPhotos.map(p => p.activity_id))];
        
        const list = data.activities.filter(a => actIds.includes(a.id)).map(a => ({
          title: a.title,
          activity_date: a.activity_date
        })).sort((x, y) => new Date(y.activity_date) - new Date(x.activity_date));
        return list.length > 0 ? [[list[0]]] : [[]];
      }
      if (norm.includes('from activities a') && norm.includes('parent_id = ?')) {
        const pid = parseInt(params[0]);
        const parentUser = data.users.find(u => u.id === pid);
        if (!parentUser) return [[]];
        const myStudentsIds = data.students.filter(s => s.parentEmail === parentUser.email).map(s => s.studentId);
        const matchingTags = data.student_tags.filter(t => myStudentsIds.includes(t.studentId));
        const myPhotoIds = [...new Set(matchingTags.map(t => t.photo_id))];
        const approvedPhotos = data.photos.filter(p => myPhotoIds.includes(p.id) && p.status === 'approved');
        const actIds = [...new Set(approvedPhotos.map(p => p.activity_id))];
        
        const list = data.activities.filter(a => actIds.includes(a.id)).map(a => {
          const c = data.classrooms.find(cl => cl.id === a.classroom_id);
          return {
            id: a.id,
            title: a.title,
            description: a.description,
            category: a.category,
            activity_date: a.activity_date,
            ai_summary: a.ai_summary,
            classroom_name: c ? c.classroom_name : ''
          };
        }).sort((x, y) => new Date(y.activity_date) - new Date(x.activity_date));
        return [list];
      }
      if (norm.includes('from activities a') && norm.includes('student_id = ?')) {
        const sid = parseInt(params[0]);
        const taggedPhotos = data.student_tags.filter(t => t.studentId === sid).map(t => t.photo_id);
        const approvedPhotos = data.photos.filter(p => taggedPhotos.includes(p.id) && p.status === 'approved');
        const actIds = approvedPhotos.map(p => p.activity_id);
        const list = data.activities.filter(a => actIds.includes(a.id)).map(a => ({
          id: a.id,
          title: a.title,
          description: a.description,
          category: a.category,
          activity_date: a.activity_date,
          ai_summary: a.ai_summary
        })).sort((x, y) => new Date(y.activity_date) - new Date(x.activity_date));
        return [list];
      }
      if (norm.includes('from activities a') && norm.includes('c.classroom_name')) {
        const list = data.activities.map(a => {
          const c = data.classrooms.find(cl => cl.id === a.classroom_id);
          const u = data.users.find(usr => usr.id === a.teacher_id);
          return {
            ...a,
            classroom_name: c ? c.classroom_name : '',
            teacher_name: u ? u.name : ''
          };
        }).sort((x, y) => new Date(y.created_at) - new Date(x.created_at));
        if (norm.includes('limit 5')) {
          return [list.slice(0, 5)];
        }
        return [list];
      }

      // 7. charts
      if (norm.includes('date(uploaded_at) as date')) {
        const start = new Date(params[0]);
        const counts = {};
        data.photos.filter(p => new Date(p.uploaded_at) >= start).forEach(p => {
          const dateStr = p.uploaded_at.split('T')[0];
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        });
        const list = Object.keys(counts).map(date => ({ date, count: counts[date] }));
        return [list];
      }
      if (norm.includes('date(created_at) as dt')) {
        const start = new Date(params[0]);
        const counts = {};
        data.notifications.filter(n => new Date(n.createdAt) >= start).forEach(n => {
          const dateStr = n.createdAt.split('T')[0];
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        });
        const list = Object.keys(counts).map(dt => ({ dt, count: counts[dt] }));
        return [list];
      }
    }

    // INSERT statements
    if (norm.startsWith('insert')) {
      // 1. users
      if (norm.includes('insert into users')) {
        const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
        let newUser;
        if (norm.includes('child_name')) {
          newUser = {
            id: newId,
            name: params[0],
            email: params[1].trim().toLowerCase(),
            password: params[2],
            role: params[3],
            status: params[4],
            child_name: params[5],
            child_age: params[6] ? parseInt(params[6]) : null,
            requested_classroom: params[7],
            created_at: new Date().toISOString()
          };
        } else if (norm.includes('status')) {
          newUser = {
            id: newId,
            name: params[0],
            email: params[1].trim().toLowerCase(),
            password: params[2],
            role: params[3],
            status: params[4],
            created_at: new Date().toISOString()
          };
        } else {
          newUser = {
            id: newId,
            name: params[0],
            email: params[1].trim().toLowerCase(),
            password: params[2],
            role: params[3],
            status: 'approved',
            created_at: new Date().toISOString()
          };
        }
        data.users.push(newUser);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 2. classrooms
      if (norm.includes('insert into classrooms')) {
        const newId = data.classrooms.length > 0 ? Math.max(...data.classrooms.map(c => c.id)) + 1 : 1;
        const newClass = { id: newId, classroom_name: params[0] };
        data.classrooms.push(newClass);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 3. students
      if (norm.includes('insert into students')) {
        const newId = data.students.length > 0 ? Math.max(...data.students.map(s => s.studentId)) + 1 : 1;
        const cid = params[2] ? parseInt(params[2]) : null;
        const pid = params[3] ? parseInt(params[3]) : null;
        const c = data.classrooms.find(cl => cl.id === cid);
        const u = data.users.find(usr => usr.id === pid);
        const newStudent = {
          studentId: newId,
          studentName: params[0],
          age: parseInt(params[1]),
          classroom: c ? c.classroom_name : null,
          parentEmail: u ? u.email : null
        };
        data.students.push(newStudent);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 4. teachers
      if (norm.includes('insert into teachers')) {
        const newId = data.teachers.length > 0 ? Math.max(...data.teachers.map(t => t.id)) + 1 : 1;
        const cid = params[1] ? parseInt(params[1]) : null;
        const c = data.classrooms.find(cl => cl.id === cid);
        const newTeacher = {
          id: newId,
          user_id: parseInt(params[0]),
          classroom: c ? c.classroom_name : null
        };
        data.teachers.push(newTeacher);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 5. activities
      if (norm.includes('insert into activities')) {
        const newId = data.activities.length > 0 ? Math.max(...data.activities.map(a => a.id)) + 1 : 1;
        const newAct = {
          id: newId,
          title: params[0],
          description: params[1],
          category: params[2],
          activity_date: params[3],
          classroom_id: params[4] ? parseInt(params[4]) : null,
          teacher_id: params[5] ? parseInt(params[5]) : null,
          ai_summary: params[6],
          created_at: new Date().toISOString()
        };
        data.activities.push(newAct);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 6. photos
      if (norm.includes('insert into photos')) {
        const newId = data.photos.length > 0 ? Math.max(...data.photos.map(p => p.id)) + 1 : 1;
        const newPhoto = {
          id: newId,
          activity_id: parseInt(params[0]),
          image_url: params[1],
          ai_caption: params[2] || '',
          status: params[3] || 'pending',
          uploaded_by: parseInt(params[4]),
          uploaded_at: new Date().toISOString()
        };
        data.photos.push(newPhoto);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 7. student_tags
      if (norm.includes('insert into student_tags') || norm.includes('insert ignore into student_tags')) {
        const newId = data.student_tags.length > 0 ? Math.max(...data.student_tags.map(t => t.id)) + 1 : 1;
        const photoId = parseInt(params[0]);
        const studentId = parseInt(params[1]);
        if (norm.includes('ignore')) {
          const exists = data.student_tags.some(t => t.photo_id === photoId && t.studentId === studentId);
          if (exists) return [{ affectedRows: 0 }];
        }
        const newTag = {
          id: newId,
          photo_id: photoId,
          studentId: studentId
        };
        data.student_tags.push(newTag);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 8. notifications
      if (norm.includes('insert into notifications')) {
        const newId = data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1;
        const newNotif = {
          id: newId,
          parentEmail: params[0],
          message: params[1],
          type: params[2],
          readStatus: params[3],
          createdAt: new Date().toISOString()
        };
        data.notifications.push(newNotif);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 9. announcements
      if (norm.includes('insert into announcements')) {
        const newId = data.announcements.length > 0 ? Math.max(...data.announcements.map(a => a.id)) + 1 : 1;
        const newAnn = {
          id: newId,
          title: params[0],
          message: params[1],
          created_at: new Date().toISOString()
        };
        data.announcements.push(newAnn);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 10. attendance
      if (norm.includes('insert into attendance')) {
        const newId = data.attendance.length > 0 ? Math.max(...data.attendance.map(a => a.id)) + 1 : 1;
        const newAtt = {
          id: newId,
          studentId: parseInt(params[0]),
          date: params[1],
          status: params[2]
        };
        data.attendance.push(newAtt);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 11. meals
      if (norm.includes('insert into meals')) {
        const newId = data.meals.length > 0 ? Math.max(...data.meals.map(m => m.id)) + 1 : 1;
        const newMeal = {
          id: newId,
          studentId: parseInt(params[0]),
          date: params[1],
          breakfast: params[2] || '',
          lunch: params[3] || '',
          snack: params[4] || ''
        };
        data.meals.push(newMeal);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 12. milestones
      if (norm.includes('insert into milestones')) {
        const newId = data.milestones.length > 0 ? Math.max(...data.milestones.map(m => m.id)) + 1 : 1;
        const newMs = {
          id: newId,
          studentId: parseInt(params[0]),
          creativity: parseInt(params[1] || 80),
          language: parseInt(params[2] || 80),
          socialSkills: parseInt(params[3] || 80),
          emotionalGrowth: parseInt(params[4] || 80),
          motorSkills: parseInt(params[5] || 80)
        };
        data.milestones.push(newMs);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }

      // 13. feedback
      if (norm.includes('insert into feedback')) {
        const newId = data.feedback.length > 0 ? Math.max(...data.feedback.map(f => f.id)) + 1 : 1;
        const newFb = {
          id: newId,
          parentEmail: params[0],
          feedbackText: params[1],
          surveyRating: parseInt(params[2] || 5)
        };
        data.feedback.push(newFb);
        writeJSONDb(data);
        return [{ insertId: newId }];
      }
    }

    // UPDATE statements
    if (norm.startsWith('update')) {
      // 1. users
      if (norm.includes('update users')) {
        if (norm.includes('status')) {
          const id = parseInt(params[1] || params[0]);
          data.users = data.users.map(u => u.id === id ? { ...u, status: 'approved' } : u);
          writeJSONDb(data);
          return [{ affectedRows: 1 }];
        }
        if (norm.includes('password')) {
          const id = parseInt(params[1]);
          data.users = data.users.map(u => u.id === id ? { ...u, password: params[0] } : u);
          writeJSONDb(data);
          return [{ affectedRows: 1 }];
        }
        const id = parseInt(params[2]);
        data.users = data.users.map(u => u.id === id ? { ...u, name: params[0], email: params[1].trim().toLowerCase() } : u);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 2. students
      if (norm.includes('update students')) {
        if (norm.includes('classroom_notes')) {
          const id = parseInt(params[1]);
          data.students = data.students.map(s => s.studentId === id ? { ...s, classroomNotes: params[0] } : s);
          writeJSONDb(data);
          return [{ affectedRows: 1 }];
        }
        if (norm.includes('parent_id')) {
          const pid = parseInt(params[0]);
          const sname = params[1];
          const u = data.users.find(usr => usr.id === pid);
          if (u) {
            data.students = data.students.map(s => s.studentName === sname ? { ...s, parentEmail: u.email } : s);
            writeJSONDb(data);
          }
          return [{ affectedRows: 1 }];
        }
        const id = parseInt(params[4]);
        const cid = params[2] ? parseInt(params[2]) : null;
        const pid = params[3] ? parseInt(params[3]) : null;
        const c = data.classrooms.find(cl => cl.id === cid);
        const u = data.users.find(usr => usr.id === pid);
        data.students = data.students.map(s => s.studentId === id ? {
          ...s,
          studentName: params[0],
          age: parseInt(params[1]),
          classroom: c ? c.classroom_name : null,
          parentEmail: u ? u.email : null
        } : s);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 3. teachers
      if (norm.includes('update teachers')) {
        const uid = parseInt(params[1]);
        const cid = params[0] ? parseInt(params[0]) : null;
        const c = data.classrooms.find(cl => cl.id === cid);
        data.teachers = data.teachers.map(t => t.user_id === uid ? { ...t, classroom: c ? c.classroom_name : null } : t);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 4. photos
      if (norm.includes('update photos')) {
        const id = parseInt(params[1]);
        data.photos = data.photos.map(p => p.id === id ? { ...p, status: params[0] } : p);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 5. notifications
      if (norm.includes('update notifications')) {
        const id = parseInt(params[0]);
        data.notifications = data.notifications.map(n => n.id === id ? { ...n, readStatus: 'read' } : n);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 6. attendance
      if (norm.includes('update attendance')) {
        const id = parseInt(params[1]);
        data.attendance = data.attendance.map(a => a.id === id ? { ...a, status: params[0] } : a);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 7. meals
      if (norm.includes('update meals')) {
        const id = parseInt(params[3]);
        data.meals = data.meals.map(m => {
          if (m.id === id) {
            return {
              ...m,
              breakfast: params[0] !== null && params[0] !== undefined ? params[0] : m.breakfast,
              lunch: params[1] !== null && params[1] !== undefined ? params[1] : m.lunch,
              snack: params[2] !== null && params[2] !== undefined ? params[2] : m.snack
            };
          }
          return m;
        });
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 8. milestones
      if (norm.includes('update milestones')) {
        const id = parseInt(params[5]);
        data.milestones = data.milestones.map(m => {
          if (m.id === id) {
            return {
              ...m,
              creativity: params[0] !== null && params[0] !== undefined ? parseInt(params[0]) : m.creativity,
              language: params[1] !== null && params[1] !== undefined ? parseInt(params[1]) : m.language,
              socialSkills: params[2] !== null && params[2] !== undefined ? parseInt(params[2]) : m.socialSkills,
              emotionalGrowth: params[3] !== null && params[3] !== undefined ? parseInt(params[3]) : m.emotionalGrowth,
              motorSkills: params[4] !== null && params[4] !== undefined ? parseInt(params[4]) : m.motorSkills
            };
          }
          return m;
        });
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }
    }

    // DELETE statements
    if (norm.startsWith('delete')) {
      // 1. students
      if (norm.includes('delete from students')) {
        const id = parseInt(params[0]);
        data.students = data.students.filter(s => s.studentId !== id);
        data.student_tags = data.student_tags.filter(t => t.studentId !== id);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 2. users
      if (norm.includes('delete from users')) {
        const id = parseInt(params[0]);
        const u = data.users.find(usr => usr.id === id);
        data.users = data.users.filter(usr => usr.id !== id);
        if (u) {
          if (u.role === 'teacher') {
            data.teachers = data.teachers.filter(t => t.user_id !== id);
          } else if (u.role === 'parent') {
            data.students = data.students.map(s => s.parentEmail === u.email ? { ...s, parentEmail: '' } : s);
          }
        }
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 3. announcements
      if (norm.includes('delete from announcements')) {
        const id = parseInt(params[0]);
        data.announcements = data.announcements.filter(a => a.id !== id);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }

      // 4. student_tags
      if (norm.includes('delete from student_tags')) {
        const id = parseInt(params[0]);
        data.student_tags = data.student_tags.filter(t => t.photo_id !== id);
        writeJSONDb(data);
        return [{ affectedRows: 1 }];
      }
    }

    console.warn(`⚠️ Unhandled mock query matching key: "${cleanSql.substring(0, 80)}"`);
    return [[]];
  }

  // Support for transactions
  async getConnection() {
    return {
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
      execute: async (sql, params) => this.execute(sql, params),
      query: async (sql, params) => this.query(sql, params)
    };
  }

  async end() {
    // No-op for JSON fallback
  }
}

// Intercept connection pool checks
let activePool = null;

if (isFallback) {
  console.log('✔ Running in Local JSON Database Fallback Engine.');
  activePool = new MockDbPool();
} else {
  // Test connection to ensure MySQL port is actually listening
  activePool = pool;
  pool.query('SELECT 1')
    .then(() => {
      console.log('✔ Connected successfully to MySQL database.');
    })
    .catch((err) => {
      console.warn('⚠️ Could not communicate with MySQL server:', err.message);
      console.warn(`   Host: ${dbHost}, Port: ${dbPort}, DB: ${dbName}`);
      console.log('👉 Falling back to local data-store.json database engine.');
      activePool = new MockDbPool();
      isFallback = true;
      // NOTE: Do NOT call pool.end() here — it drains the event loop and crashes the app
    });
}

// Export the active database wrapper pool
module.exports = {
  execute: async (sql, params) => activePool.execute(sql, params),
  query: async (sql, params) => activePool.query(sql, params),
  getConnection: async () => activePool.getConnection(),
  end: async () => activePool.end(),
  isFallback: () => isFallback
};
