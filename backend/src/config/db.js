const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
    { id: 5, name: 'Priya Sharma (Parent of Diya & Rohan)', email: 'parent2@kidvista.com', password: '', role: 'parent' }
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
    { id: 4, student_name: 'Rohan Sharma', age: 4, classroom_id: 2, parent_id: 5 }
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
    { id: 1, photo_id: 1, student_id: 1 }
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

// Read JSON DB
function readJSONDb() {
  if (!fs.existsSync(DATA_STORE_PATH)) {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(defaultJSONData, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_STORE_PATH, 'utf8'));
  } catch (err) {
    return defaultJSONData;
  }
}

// Write JSON DB
function writeJSONDb(data) {
  fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2));
}

// Attempt real MySQL Pool connection
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
  console.warn('⚠️ Real MySQL Pool configuration error. Switching to fallback engine.');
  isFallback = true;
}

// Create a Mock database pool that acts like mysql2
class MockDbPool {
  async query(sql, params = []) {
    return this.execute(sql, params);
  }

  async execute(sql, params = []) {
    const data = readJSONDb();
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    
    // Auth login query: SELECT * FROM users WHERE email = ?
    if (cleanSql.startsWith('SELECT * FROM users WHERE email = ?')) {
      const email = params[0];
      const match = data.users.filter(u => u.email === email);
      return [match];
    }

    // Auth me query: SELECT id, name, email, role FROM users WHERE id = ?
    if (cleanSql.startsWith('SELECT id, name, email, role FROM users WHERE id = ?')) {
      const id = parseInt(params[0]);
      const match = data.users.filter(u => u.id === id).map(({id, name, email, role}) => ({id, name, email, role}));
      return [match];
    }

    // Stats queries
    if (cleanSql === 'SELECT COUNT(*) as totalStudents FROM students') {
      return [[{ totalStudents: data.students.length }]];
    }
    if (cleanSql === 'SELECT COUNT(*) as totalTeachers FROM users WHERE role = "teacher"') {
      const count = data.users.filter(u => u.role === 'teacher').length;
      return [[{ totalTeachers: count }]];
    }
    if (cleanSql === 'SELECT COUNT(*) as totalParents FROM users WHERE role = "parent"') {
      const count = data.users.filter(u => u.role === 'parent').length;
      return [[{ totalParents: count }]];
    }
    if (cleanSql === 'SELECT COUNT(*) as totalPhotos FROM photos') {
      return [[{ totalPhotos: data.photos.length }]];
    }
    if (cleanSql === 'SELECT COUNT(*) as pendingPhotos FROM photos WHERE status = "pending"') {
      const count = data.photos.filter(p => p.status === 'pending').length;
      return [[{ pendingPhotos: count }]];
    }
    if (cleanSql.includes('SELECT a.*, c.classroom_name, u.name as teacher_name FROM activities a')) {
      const list = data.activities.map(a => {
        const c = data.classrooms.find(cl => cl.id === a.classroom_id);
        const u = data.users.find(usr => usr.id === a.teacher_id);
        return {
          ...a,
          classroom_name: c ? c.classroom_name : '',
          teacher_name: u ? u.name : ''
        };
      }).sort((x, y) => new Date(y.created_at) - new Date(x.created_at));
      if (cleanSql.includes('LIMIT 5')) {
        return [list.slice(0, 5)];
      }
      return [list];
    }

    // Classroom queries
    if (cleanSql.startsWith('SELECT * FROM classrooms ORDER BY classroom_name ASC')) {
      return [data.classrooms.sort((a,b) => a.classroom_name.localeCompare(b.classroom_name))];
    }
    if (cleanSql.startsWith('INSERT INTO classrooms (classroom_name) VALUES (?)')) {
      const newClass = { id: data.classrooms.length + 1, classroom_name: params[0] };
      data.classrooms.push(newClass);
      writeJSONDb(data);
      return [{ insertId: newClass.id }];
    }

    // Student queries
    if (cleanSql.startsWith('SELECT s.*, c.classroom_name, u.name as parent_name, u.email as parent_email')) {
      const list = data.students.map(s => {
        const c = data.classrooms.find(cl => cl.id === s.classroom_id);
        const u = data.users.find(usr => usr.id === s.parent_id);
        return {
          ...s,
          classroom_name: c ? c.classroom_name : null,
          parent_name: u ? u.name : null,
          parent_email: u ? u.email : null
        };
      }).sort((a, b) => a.student_name.localeCompare(b.student_name));
      return [list];
    }
    if (cleanSql.startsWith('INSERT INTO students (student_name, age, classroom_id, parent_id) VALUES (?, ?, ?, ?)')) {
      const newStud = {
        id: data.students.length > 0 ? Math.max(...data.students.map(s => s.id)) + 1 : 1,
        student_name: params[0],
        age: parseInt(params[1]),
        classroom_id: params[2] ? parseInt(params[2]) : null,
        parent_id: params[3] ? parseInt(params[3]) : null
      };
      data.students.push(newStud);
      writeJSONDb(data);
      return [{ insertId: newStud.id }];
    }
    if (cleanSql.startsWith('UPDATE students SET student_name = ?, age = ?, classroom_id = ?, parent_id = ? WHERE id = ?')) {
      const id = parseInt(params[4]);
      data.students = data.students.map(s => s.id === id ? {
        id,
        student_name: params[0],
        age: parseInt(params[1]),
        classroom_id: params[2] ? parseInt(params[2]) : null,
        parent_id: params[3] ? parseInt(params[3]) : null
      } : s);
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }
    if (cleanSql.startsWith('DELETE FROM students WHERE id = ?')) {
      const id = parseInt(params[0]);
      data.students = data.students.filter(s => s.id !== id);
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }

    // Teacher queries
    if (cleanSql.includes('FROM users u LEFT JOIN teachers t ON u.id = t.user_id') && cleanSql.includes("WHERE u.role = 'teacher'")) {
      const list = data.users.filter(u => u.role === 'teacher').map(u => {
        const t = data.teachers.find(tr => tr.user_id === u.id);
        const c = t ? data.classrooms.find(cl => cl.id === t.classroom_id) : null;
        return {
          teacher_id: t ? t.id : null,
          user_id: u.id,
          name: u.name,
          email: u.email,
          classroom_id: t ? t.classroom_id : null,
          classroom_name: c ? c.classroom_name : null
        };
      });
      return [list];
    }
    if (cleanSql.startsWith('SELECT classroom_id FROM teachers WHERE user_id = ?')) {
      const userId = parseInt(params[0]);
      const record = data.teachers.find(t => t.user_id === userId);
      return [record ? [record] : []];
    }
    if (cleanSql.startsWith('SELECT id, student_name, age FROM students WHERE classroom_id = ?')) {
      const cid = parseInt(params[0]);
      const list = data.students.filter(s => s.classroom_id === cid).sort((a,b) => a.student_name.localeCompare(b.student_name));
      return [list];
    }

    // Parent queries
    if (cleanSql.startsWith('SELECT u.id as user_id, u.name, u.email FROM users u WHERE u.role = \'parent\'')) {
      const list = data.users.filter(u => u.role === 'parent').map(u => ({ user_id: u.id, name: u.name, email: u.email }));
      return [list];
    }
    if (cleanSql.startsWith('SELECT s.id as student_id, s.student_name, s.age, c.classroom_name FROM students s')) {
      const pid = parseInt(params[0]);
      const list = data.students.filter(s => s.parent_id === pid).map(s => {
        const c = data.classrooms.find(cl => cl.id === s.classroom_id);
        return {
          student_id: s.id,
          student_name: s.student_name,
          age: s.age,
          classroom_name: c ? c.classroom_name : null
        };
      });
      return [list];
    }
    if (cleanSql.startsWith('SELECT s.id as student_id, s.student_name, s.age, s.classroom_id, c.classroom_name FROM students s')) {
      const pid = parseInt(params[0]);
      const list = data.students.filter(s => s.parent_id === pid).map(s => {
        const c = data.classrooms.find(cl => cl.id === s.classroom_id);
        return {
          student_id: s.id,
          student_name: s.student_name,
          age: s.age,
          classroom_id: s.classroom_id,
          classroom_name: c ? c.classroom_name : null
        };
      });
      return [list];
    }
    if (cleanSql.startsWith('SELECT u.name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.classroom_id = ?')) {
      const cid = parseInt(params[0]);
      const t = data.teachers.find(tr => tr.classroom_id === cid);
      if (t) {
        const u = data.users.find(usr => usr.id === t.user_id);
        return [u ? [{ name: u.name, email: u.email }] : []];
      }
      return [[]];
    }

    // User management inserts/updates
    if (cleanSql.startsWith('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "teacher")')) {
      const newUser = {
        id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
        name: params[0],
        email: params[1],
        password: params[2],
        role: 'teacher'
      };
      data.users.push(newUser);
      writeJSONDb(data);
      return [{ insertId: newUser.id }];
    }
    if (cleanSql.startsWith('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "parent")')) {
      const newUser = {
        id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
        name: params[0],
        email: params[1],
        password: params[2],
        role: 'parent'
      };
      data.users.push(newUser);
      writeJSONDb(data);
      return [{ insertId: newUser.id }];
    }
    if (cleanSql.startsWith('INSERT INTO teachers (user_id, classroom_id) VALUES (?, ?)')) {
      const newTeacher = {
        id: data.teachers.length > 0 ? Math.max(...data.teachers.map(t => t.id)) + 1 : 1,
        user_id: parseInt(params[0]),
        classroom_id: params[1] ? parseInt(params[1]) : null
      };
      data.teachers.push(newTeacher);
      writeJSONDb(data);
      return [{ insertId: newTeacher.id }];
    }
    if (cleanSql.startsWith('UPDATE users SET name = ?, email = ? WHERE id = ? AND role = "teacher"')) {
      const id = parseInt(params[2]);
      data.users = data.users.map(u => u.id === id ? { ...u, name: params[0], email: params[1] } : u);
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }
    if (cleanSql.startsWith('UPDATE users SET name = ?, email = ? WHERE id = ? AND role = "parent"')) {
      const id = parseInt(params[2]);
      data.users = data.users.map(u => u.id === id ? { ...u, name: params[0], email: params[1] } : u);
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }
    if (cleanSql.startsWith('SELECT * FROM teachers WHERE user_id = ?')) {
      const uid = parseInt(params[0]);
      const t = data.teachers.filter(tr => tr.user_id === uid);
      return [t];
    }
    if (cleanSql.startsWith('UPDATE teachers SET classroom_id = ? WHERE user_id = ?')) {
      const uid = parseInt(params[1]);
      data.teachers = data.teachers.map(t => t.user_id === uid ? { ...t, classroom_id: params[0] ? parseInt(params[0]) : null } : t);
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }
    if (cleanSql.startsWith('DELETE FROM users WHERE id = ? AND role = "teacher"')) {
      const id = parseInt(params[0]);
      data.users = data.users.filter(u => u.id !== id);
      data.teachers = data.teachers.filter(t => t.user_id !== id);
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }
    if (cleanSql.startsWith('DELETE FROM users WHERE id = ? AND role = "parent"')) {
      const id = parseInt(params[0]);
      data.users = data.users.filter(u => u.id !== id);
      // Null out parent_id on students
      data.students = data.students.map(s => s.parent_id === id ? { ...s, parent_id: null } : s);
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }

    // Photo approvals pending
    if (cleanSql.includes('FROM photos p LEFT JOIN activities a ON p.activity_id = a.id LEFT JOIN users u ON p.uploaded_by = u.id WHERE p.status = \'pending\'')) {
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
      });
      return [list];
    }
    if (cleanSql.startsWith('SELECT s.id as student_id, s.student_name FROM student_tags t JOIN students s ON t.student_id = s.id WHERE t.photo_id = ?')) {
      const pid = parseInt(params[0]);
      const list = data.student_tags.filter(t => t.photo_id === pid).map(t => {
        const s = data.students.find(stud => stud.id === t.student_id);
        return {
          student_id: t.student_id,
          student_name: s ? s.student_name : ''
        };
      });
      return [list];
    }
    if (cleanSql.startsWith('UPDATE photos SET status = ? WHERE id = ?')) {
      const pid = parseInt(params[1]);
      const record = data.photos.find(p => p.id === pid);
      if (!record) return [{ affectedRows: 0 }];
      record.status = params[0];
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }

    // Announcements queries
    if (cleanSql === 'SELECT * FROM announcements ORDER BY created_at DESC') {
      return [data.announcements.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))];
    }
    if (cleanSql === 'SELECT COUNT(*) as totalAnnouncements FROM announcements') {
      return [[{ totalAnnouncements: data.announcements.length }]];
    }
    if (cleanSql.startsWith('INSERT INTO announcements (title, message) VALUES (?, ?)')) {
      const newAnn = {
        id: data.announcements.length > 0 ? Math.max(...data.announcements.map(a => a.id)) + 1 : 1,
        title: params[0],
        message: params[1],
        created_at: new Date().toISOString()
      };
      data.announcements.push(newAnn);
      writeJSONDb(data);
      return [{ insertId: newAnn.id }];
    }
    if (cleanSql.startsWith('DELETE FROM announcements WHERE id = ?')) {
      const id = parseInt(params[0]);
      data.announcements = data.announcements.filter(a => a.id !== id);
      writeJSONDb(data);
      return [{ affectedRows: 1 }];
    }

    // Teacher dashboard stats details
    if (cleanSql === 'SELECT COUNT(*) as todayActivities FROM activities WHERE teacher_id = ? AND activity_date = ?') {
      const tid = parseInt(params[0]);
      const date = params[1];
      const count = data.activities.filter(a => a.teacher_id === tid && a.activity_date === date).length;
      return [[{ todayActivities: count }]];
    }
    if (cleanSql === 'SELECT COUNT(*) as totalUploads FROM photos WHERE uploaded_by = ?') {
      const uid = parseInt(params[0]);
      const count = data.photos.filter(p => p.uploaded_by === uid).length;
      return [[{ totalUploads: count }]];
    }
    if (cleanSql === 'SELECT COUNT(*) as approvedUploads FROM photos WHERE uploaded_by = ? AND status = "approved"') {
      const uid = parseInt(params[0]);
      const count = data.photos.filter(p => p.uploaded_by === uid && p.status === 'approved').length;
      return [[{ approvedUploads: count }]];
    }
    if (cleanSql === 'SELECT COUNT(*) as pendingUploads FROM photos WHERE uploaded_by = ? AND status = "pending"') {
      const uid = parseInt(params[0]);
      const count = data.photos.filter(p => p.uploaded_by === uid && p.status === 'pending').length;
      return [[{ pendingUploads: count }]];
    }

    // Teacher submit photos / activity setup
    if (cleanSql.startsWith('INSERT INTO activities (title, description, category, activity_date, classroom_id, teacher_id, ai_summary)')) {
      const newAct = {
        id: data.activities.length > 0 ? Math.max(...data.activities.map(a => a.id)) + 1 : 1,
        title: params[0],
        description: params[1],
        category: params[2],
        activity_date: params[3],
        classroom_id: parseInt(params[4]),
        teacher_id: parseInt(params[5]),
        ai_summary: params[6],
        created_at: new Date().toISOString()
      };
      data.activities.push(newAct);
      writeJSONDb(data);
      return [{ insertId: newAct.id }];
    }
    if (cleanSql.startsWith('INSERT INTO photos (activity_id, image_url, ai_caption, status, uploaded_by)')) {
      const newPhoto = {
        id: data.photos.length > 0 ? Math.max(...data.photos.map(p => p.id)) + 1 : 1,
        activity_id: parseInt(params[0]),
        image_url: params[1],
        ai_caption: params[2] || '',
        status: 'pending',
        uploaded_by: parseInt(params[3]),
        uploaded_at: new Date().toISOString()
      };
      data.photos.push(newPhoto);
      writeJSONDb(data);
      return [{ insertId: newPhoto.id }];
    }
    if (cleanSql.startsWith('INSERT INTO student_tags (photo_id, student_id) VALUES (?, ?)')) {
      const newTag = {
        id: data.student_tags.length > 0 ? Math.max(...data.student_tags.map(t => t.id)) + 1 : 1,
        photo_id: parseInt(params[0]),
        student_id: parseInt(params[1])
      };
      data.student_tags.push(newTag);
      writeJSONDb(data);
      return [{ insertId: newTag.id }];
    }

    // Teacher upload and tagging history
    if (cleanSql.startsWith('SELECT p.*, a.title as activity_title, a.activity_date, a.category as activity_category FROM photos p JOIN activities a ON p.activity_id = a.id WHERE p.uploaded_by = ?')) {
      const uid = parseInt(params[0]);
      const list = data.photos.filter(p => p.uploaded_by === uid).map(p => {
        const a = data.activities.find(act => act.id === p.activity_id);
        return {
          ...p,
          activity_title: a ? a.title : '',
          activity_date: a ? a.activity_date : '',
          activity_category: a ? a.category : ''
        };
      }).sort((x,y) => new Date(y.uploaded_at) - new Date(x.uploaded_at));
      return [list];
    }

    // Parent secure photo query
    if (cleanSql.includes('WHERE s.parent_id = ? AND p.status = \'approved\'')) {
      const pid = parseInt(params[0]);
      // Find parent students
      const myStudentsIds = data.students.filter(s => s.parent_id === pid).map(s => s.id);
      // Find distinct photo ids tagged with my children
      const matchingTags = data.student_tags.filter(t => myStudentsIds.includes(t.student_id));
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
      }).sort((x, y) => new Date(y.activity_date) - new Date(x.activity_date));
      return [list];
    }

    // Parent child timeline query
    if (cleanSql.includes('WHERE s.parent_id = ? AND p.status = \'approved\'') && cleanSql.includes('activities a')) {
      const pid = parseInt(params[0]);
      const myStudentsIds = data.students.filter(s => s.parent_id === pid).map(s => s.id);
      const matchingTags = data.student_tags.filter(t => myStudentsIds.includes(t.student_id));
      const myPhotoIds = [...new Set(matchingTags.map(t => t.photo_id))];
      
      // Get approved photos
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
      }).sort((x,y) => new Date(y.activity_date) - new Date(x.activity_date));
      return [list];
    }

    // Parent dashboard stats
    if (cleanSql.includes('SELECT COUNT(DISTINCT p.id) as totalPhotos')) {
      const pid = parseInt(params[0]);
      const myStudentsIds = data.students.filter(s => s.parent_id === pid).map(s => s.id);
      const matchingTags = data.student_tags.filter(t => myStudentsIds.includes(t.student_id));
      const myPhotoIds = [...new Set(matchingTags.map(t => t.photo_id))];
      const count = data.photos.filter(p => myPhotoIds.includes(p.id) && p.status === 'approved').length;
      return [[{ totalPhotos: count }]];
    }
    if (cleanSql.includes('SELECT DISTINCT a.title, a.activity_date') && cleanSql.includes('ORDER BY a.activity_date DESC LIMIT 1')) {
      const pid = parseInt(params[0]);
      const myStudentsIds = data.students.filter(s => s.parent_id === pid).map(s => s.id);
      const matchingTags = data.student_tags.filter(t => myStudentsIds.includes(t.student_id));
      const myPhotoIds = [...new Set(matchingTags.map(t => t.photo_id))];
      const approvedPhotos = data.photos.filter(p => myPhotoIds.includes(p.id) && p.status === 'approved');
      const actIds = [...new Set(approvedPhotos.map(p => p.activity_id))];
      const acts = data.activities.filter(a => actIds.includes(a.id)).sort((x,y) => new Date(y.activity_date) - new Date(x.activity_date));
      return acts.length > 0 ? [[acts[0]]] : [[]];
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
      console.log('✔ Connected successfully to local MySQL database.');
    })
    .catch((err) => {
      console.warn('⚠️ Could not communicate with local MySQL server (ECONNREFUSED or credentials error).');
      console.log('👉 Falling back to local data-store.json database engine.');
      activePool = new MockDbPool();
      isFallback = true;
      // Close the real pool so that Node can terminate cleanly without hanging sockets
      pool.end().catch(() => {});
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
