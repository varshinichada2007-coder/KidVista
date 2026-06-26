const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { 
  MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT,
  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT 
} = process.env;

const dbHost = MYSQLHOST || DB_HOST || 'localhost';
const dbUser = MYSQLUSER || DB_USER || 'root';
const dbPassword = MYSQLPASSWORD || DB_PASSWORD || '';
const dbName = MYSQLDATABASE || DB_NAME || 'kidvista_portal';
const dbPort = parseInt(MYSQLPORT || DB_PORT || '3306');
const DATA_STORE_PATH = path.join(__dirname, 'data-store.json');

// Default Seed Data
const seedData = {
  users: [
    { id: 1, name: 'Akhil Kumar Chada', email: 'akhilkumarchada86@gmail.com', password: 'Akhil@0806', role: 'admin', status: 'approved' },
    { id: 2, name: 'Aadhya Mehta', email: 'Aadhya@Kidvista.com', password: 'Aadhya@789', role: 'teacher', status: 'approved' },
    { id: 3, name: 'Arjun Varma', email: 'Arjun@Kidvista.com', password: 'Arjun@789', role: 'teacher', status: 'approved' },
    { id: 4, name: 'Rajesh Sharma', email: 'Rajesh@KidVista.com', password: 'Rajesh@123', role: 'parent', status: 'approved' },
    { id: 5, name: 'Lakshmi Reddy', email: 'Lakshmi@KidVista.com', password: 'Lakshmi@123', role: 'parent', status: 'approved' },
    { id: 6, name: 'Kiran Patel', email: 'Kiran@KidVista.com', password: 'Kiran@123', role: 'parent', status: 'approved' },
    { id: 7, name: 'Neha Verma', email: 'Neha@KidVista.com', password: 'Neha@123', role: 'parent', status: 'approved' },
    { id: 8, name: 'Ravi Kumar', email: 'Ravi@KidVista.com', password: 'Ravi@123', role: 'parent', status: 'approved' },
    { id: 9, name: 'Priya Rao', email: 'Priya@KidVista.com', password: 'Priya@123', role: 'parent', status: 'approved' },
    { id: 10, name: 'Amit Singh', email: 'Amit@KidVista.com', password: 'Amit@123', role: 'parent', status: 'approved' },
    { id: 11, name: 'Deepa Nair', email: 'Deepa@KidVista.com', password: 'Deepa@123', role: 'parent', status: 'approved' },
    { id: 12, name: 'Rohit Gupta', email: 'Rohit@KidVista.com', password: 'Rohit@123', role: 'parent', status: 'approved' },
    { id: 13, name: 'Shweta Joshi', email: 'Shweta@KidVista.com', password: 'Shweta@123', role: 'parent', status: 'approved' },
    { id: 14, name: 'Avni Rao', email: 'Avni@Kidvista.com', password: 'Avni@789', role: 'teacher', status: 'approved' }
  ],
  classrooms: [
    { id: 1, classroom_name: 'Nursery' },
    { id: 2, classroom_name: 'LKG' },
    { id: 3, classroom_name: 'UKG' }
  ],
  students: [
    { id: 1, student_name: 'Aarav Sharma', age: 4, classroom_id: 1, parent_id: 4 },
    { id: 2, student_name: 'Anaya Reddy', age: 4, classroom_id: 1, parent_id: 5 },
    { id: 3, student_name: 'Vihaan Patel', age: 4, classroom_id: 2, parent_id: 6 },
    { id: 4, student_name: 'Diya Verma', age: 4, classroom_id: 2, parent_id: 7 },
    { id: 5, student_name: 'Arjun Kumar', age: 5, classroom_id: 3, parent_id: 8 },
    { id: 6, student_name: 'Saanvi Rao', age: 5, classroom_id: 3, parent_id: 9 },
    { id: 7, student_name: 'Reyansh Singh', age: 5, classroom_id: 1, parent_id: 10 },
    { id: 8, student_name: 'Aadhya Nair', age: 5, classroom_id: 2, parent_id: 11 },
    { id: 9, student_name: 'Vivaan Gupta', age: 6, classroom_id: 3, parent_id: 12 },
    { id: 10, student_name: 'Meera Joshi', age: 6, classroom_id: 3, parent_id: 13 }
  ],
  teachers: [
    { id: 1, user_id: 2, classroom_id: 1 },
    { id: 2, user_id: 3, classroom_id: 2 },
    { id: 3, user_id: 14, classroom_id: 3 }
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

async function init() {
  console.log('Starting Database Initialization...');
  
  // 1. Try to establish connection to MySQL
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });
    console.log('✔ Connected to MySQL server.');
  } catch (error) {
    console.warn('⚠️ Could not connect to MySQL server. Initializing fallback database engine.');
    console.log('👉 Creating seeded local "data-store.json" file...');
    
    // Copy the seedData exactly for local fallback (which uses plaintext comparison)
    const jsonStoreData = JSON.parse(JSON.stringify(seedData));
    // Adapt schema structure for JSON store: students list needs studentId/studentName keys and parentEmail
    jsonStoreData.students = seedData.students.map(s => {
      const parentUser = seedData.users.find(u => u.id === s.parent_id);
      return {
        studentId: s.id,
        studentName: s.student_name,
        age: s.age,
        classroom: seedData.classrooms.find(c => c.id === s.classroom_id)?.classroom_name || 'Nursery A',
        parentEmail: parentUser ? parentUser.email : ''
      };
    });
    // Adapt teachers list for JSON store
    jsonStoreData.teachers = [
      { id: 1, user_id: 2, classroom: "Nursery" },
      { id: 2, user_id: 3, classroom: "LKG" },
      { id: 3, user_id: 14, classroom: "UKG" }
    ];
    // Adapt student tags list for JSON store
    jsonStoreData.student_tags = seedData.student_tags.map(t => ({
      id: t.id,
      photo_id: t.photo_id,
      studentId: t.student_id
    }));

    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(jsonStoreData, null, 2));
    console.log('✔ Local data-store.json seeded successfully!');
    console.log('\n--- DEMO ACCOUNTS CREDENTIALS (JSON FALLBACK ACTIVE) ---');
    console.log('🔑 Admin: akhilkumarchada86@gmail.com / Akhil@0806');
    console.log('🔑 Teacher 1: Aadhya Mehta (Aadhya@Kidvista.com / Aadhya@789) [Nursery]');
    console.log('🔑 Teacher 2: Arjun Varma (Arjun@Kidvista.com / Arjun@789) [LKG]');
    console.log('🔑 Teacher 3: Avni Rao (Avni@Kidvista.com / Avni@789) [UKG]');
    console.log('-------------------------------------------------------\n');
    process.exit(0);
  }

  try {
    // 2. Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'kidvista_portal'}\`;`);
    console.log(`✔ Database "${DB_NAME || 'intellitots_portal'}" verified/created.`);
    
    // 3. Switch to the database
    await connection.changeUser({ database: DB_NAME || 'intellitots_portal' });
    
    // 4. Create Tables
    console.log('Creating tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    const tables = ['feedback', 'notifications', 'milestones', 'meals', 'attendance', 'student_tags', 'photos', 'activities', 'teachers', 'students', 'classrooms', 'users', 'announcements'];
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✔ Old tables cleared.');

    // Create USERS
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'teacher', 'parent') NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        child_name VARCHAR(255) NULL,
        child_age INT NULL,
        requested_classroom VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create CLASSROOMS
    await connection.query(`
      CREATE TABLE classrooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        classroom_name VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB;
    `);

    // Create STUDENTS
    await connection.query(`
      CREATE TABLE students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        classroom_id INT,
        parent_id INT,
        medical_notes TEXT,
        allergies TEXT,
        classroom_notes TEXT,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // Create TEACHERS
    await connection.query(`
      CREATE TABLE teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        classroom_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // Create ACTIVITIES
    await connection.query(`
      CREATE TABLE activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        activity_date DATE NOT NULL,
        classroom_id INT,
        teacher_id INT,
        ai_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // Create PHOTOS
    await connection.query(`
      CREATE TABLE photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT,
        image_url VARCHAR(500) NOT NULL,
        ai_caption TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        uploaded_by INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // Create STUDENT_TAGS
    await connection.query(`
      CREATE TABLE student_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        photo_id INT,
        student_id INT,
        FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(photo_id, student_id)
      ) ENGINE=InnoDB;
    `);

    // Create ANNOUNCEMENTS
    await connection.query(`
      CREATE TABLE announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create ATTENDANCE
    await connection.query(`
      CREATE TABLE attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        date DATE,
        status VARCHAR(50),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // Create MEALS
    await connection.query(`
      CREATE TABLE meals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        date DATE,
        breakfast VARCHAR(255),
        lunch VARCHAR(255),
        snack VARCHAR(255),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // Create MILESTONES
    await connection.query(`
      CREATE TABLE milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT UNIQUE,
        creativity INT DEFAULT 80,
        language INT DEFAULT 80,
        social_skills INT DEFAULT 80,
        emotional_growth INT DEFAULT 80,
        motor_skills INT DEFAULT 80,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // Create NOTIFICATIONS
    await connection.query(`
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_email VARCHAR(255),
        message TEXT,
        type VARCHAR(50),
        read_status ENUM('read', 'unread') DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create FEEDBACK
    await connection.query(`
      CREATE TABLE feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_email VARCHAR(255),
        feedback_text TEXT,
        survey_rating INT DEFAULT 5,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    console.log('✔ All tables created successfully.');

    // 5. Seed Data
    console.log('Seeding initial data into MySQL...');
    
    // Insert Users with hashed passwords
    for (const u of seedData.users) {
      const hashedPassword = bcrypt.hashSync(u.password, 10);
      await connection.execute(
        'INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.email, hashedPassword, u.role, u.status || 'approved']
      );
    }

    // Insert Classrooms
    for (const c of seedData.classrooms) {
      await connection.execute(
        'INSERT INTO classrooms (id, classroom_name) VALUES (?, ?)',
        [c.id, c.classroom_name]
      );
    }

    // Link Teachers to Classrooms
    for (const t of seedData.teachers) {
      await connection.execute(
        'INSERT INTO teachers (id, user_id, classroom_id) VALUES (?, ?, ?)',
        [t.id, t.user_id, t.classroom_id]
      );
    }

    // Insert Students
    for (const s of seedData.students) {
      await connection.execute(
        'INSERT INTO students (id, student_name, age, classroom_id, parent_id) VALUES (?, ?, ?, ?, ?)',
        [s.id, s.student_name, s.age, s.classroom_id, s.parent_id]
      );
    }

    // Insert Announcements
    for (const a of seedData.announcements) {
      await connection.execute(
        'INSERT INTO announcements (id, title, message) VALUES (?, ?, ?)',
        [a.id, a.title, a.message]
      );
    }

    // Insert a Sample Activity (linked to Nursery A)
    const [actRes] = await connection.execute(`
      INSERT INTO activities (id, title, description, category, activity_date, classroom_id, teacher_id, ai_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      seedData.activities[0].id,
      seedData.activities[0].title,
      seedData.activities[0].description,
      seedData.activities[0].category,
      seedData.activities[0].activity_date,
      seedData.activities[0].classroom_id,
      seedData.activities[0].teacher_id,
      seedData.activities[0].ai_summary
    ]);

    // Insert a Sample Photo (Approved)
    const [photoRes] = await connection.execute(`
      INSERT INTO photos (id, activity_id, image_url, ai_caption, status, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      seedData.photos[0].id,
      seedData.photos[0].activity_id,
      seedData.photos[0].image_url,
      seedData.photos[0].ai_caption,
      seedData.photos[0].status,
      seedData.photos[0].uploaded_by
    ]);

    // Tag Aarav Patel in the photo
    await connection.execute(`
      INSERT INTO student_tags (id, photo_id, student_id)
      VALUES (?, ?, ?)
    `, [
      seedData.student_tags[0].id,
      seedData.student_tags[0].photo_id,
      seedData.student_tags[0].student_id
    ]);

    console.log('✔ MySQL Seeding completed successfully.');
    console.log('\n--- DEMO ACCOUNTS CREDENTIALS ---');
    console.log('🔑 Admin: akhilkumarchada86@gmail.com / Akhil@0806');
    console.log('🔑 Teacher 1: Aadhya Mehta (Aadhya@Kidvista.com / Aadhya@789) [Nursery]');
    console.log('🔑 Teacher 2: Arjun Varma (Arjun@Kidvista.com / Arjun@789) [LKG]');
    console.log('🔑 Teacher 3: Avni Rao (Avni@Kidvista.com / Avni@789) [UKG]');
    console.log('---------------------------------\n');

  } catch (error) {
    console.error('❌ Error initializing MySQL database schema.');
    console.error(error);
  } finally {
    await connection.end();
  }
}

init();
