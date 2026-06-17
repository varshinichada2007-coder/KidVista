const fs = require('fs');
const path = require('path');

const DATA_STORE_PATH = path.join(__dirname, '../../data-store.json');

const defaultJSONData = {
  users: [
    { id: 1, name: 'Akhil Kumar Chada', email: 'akhilkumarchada86@gmail.com', password: 'Akhil@0806', role: 'admin', status: 'approved' },
    { id: 2, name: 'Aadhya Mehta', email: 'Aadhya@firstcry.com', password: 'Aadhya@789', role: 'teacher', status: 'approved' },
    { id: 3, name: 'Avni Rao', email: 'Avni@firstcry.com', password: 'Avni@789', role: 'teacher', status: 'approved' },
    { id: 4, name: 'Rajesh Sharma', email: 'Rajesh@firstcry.com', password: 'Rajesh@123', role: 'parent', status: 'approved' },
    { id: 5, name: 'Lakshmi Reddy', email: 'Lakshmi@firstcry.com', password: 'Lakshmi@123', role: 'parent', status: 'approved' },
    { id: 6, name: 'Kiran Patel', email: 'Kiran@firstcry.com', password: 'Kiran@123', role: 'parent', status: 'approved' },
    { id: 7, name: 'Neha Verma', email: 'Neha@firstcry.com', password: 'Neha@123', role: 'parent', status: 'approved' },
    { id: 8, name: 'Ravi Kumar', email: 'Ravi@firstcry.com', password: 'Ravi@123', role: 'parent', status: 'approved' },
    { id: 9, name: 'Priya Rao', email: 'Priya@firstcry.com', password: 'Priya@123', role: 'parent', status: 'approved' },
    { id: 10, name: 'Amit Singh', email: 'Amit@firstcry.com', password: 'Amit@123', role: 'parent', status: 'approved' },
    { id: 11, name: 'Deepa Nair', email: 'Deepa@firstcry.com', password: 'Deepa@123', role: 'parent', status: 'approved' },
    { id: 12, name: 'Rohit Gupta', email: 'Rohit@firstcry.com', password: 'Rohit@123', role: 'parent', status: 'approved' },
    { id: 13, name: 'Shweta Joshi', email: 'Shweta@firstcry.com', password: 'Shweta@123', role: 'parent', status: 'approved' },
    { id: 14, name: 'Rahul Chandra', email: 'Rahul@firstcry.com', password: 'Rahul@789', role: 'teacher', status: 'approved' }
  ],
  classrooms: [
    { id: 1, classroom_name: 'Nursery A' },
    { id: 2, classroom_name: 'Nursery B' },
    { id: 3, classroom_name: 'LKG A' },
    { id: 4, classroom_name: 'LKG B' },
    { id: 5, classroom_name: 'UKG A' }
  ],
  students: [
    { studentId: 1, studentName: 'Aarav Sharma', age: 4, classroom: 'Nursery A', parentEmail: 'Rajesh@firstcry.com' },
    { studentId: 2, studentName: 'Anaya Reddy', age: 4, classroom: 'Nursery A', parentEmail: 'Lakshmi@firstcry.com' },
    { studentId: 3, studentName: 'Vihaan Patel', age: 4, classroom: 'Nursery B', parentEmail: 'Kiran@firstcry.com' },
    { studentId: 4, studentName: 'Diya Verma', age: 4, classroom: 'Nursery B', parentEmail: 'Neha@firstcry.com' },
    { studentId: 5, studentName: 'Arjun Kumar', age: 5, classroom: 'LKG A', parentEmail: 'Ravi@firstcry.com' },
    { studentId: 6, studentName: 'Saanvi Rao', age: 5, classroom: 'LKG A', parentEmail: 'Priya@firstcry.com' },
    { studentId: 7, studentName: 'Reyansh Singh', age: 5, classroom: 'LKG B', parentEmail: 'Amit@firstcry.com' },
    { studentId: 8, studentName: 'Aadhya Nair', age: 5, classroom: 'LKG B', parentEmail: 'Deepa@firstcry.com' },
    { studentId: 9, studentName: 'Vivaan Gupta', age: 6, classroom: 'UKG A', parentEmail: 'Rohit@firstcry.com' },
    { studentId: 10, studentName: 'Meera Joshi', age: 6, classroom: 'UKG A', parentEmail: 'Shweta@firstcry.com' }
  ],
  teachers: [
    { id: 1, user_id: 2, classroom: 'Nursery A, Nursery B' },
    { id: 2, user_id: 3, classroom: 'LKG A, LKG B' },
    { id: 3, user_id: 14, classroom: 'UKG A' }
  ],
  activities: [
    {
      id: 1,
      title: 'Colorful Hand Painting',
      description: 'The children learned primary colors and made handprint art on paper canvases today.',
      category: 'Art & Craft',
      activity_date: '2026-06-11',
      classroom: 'Nursery A, Nursery B',
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
    { id: 1, photo_id: 1, studentId: 1 }
  ],
  announcements: [
    { id: 1, title: 'Annual Sports Day 2026', message: 'FirstCry Intellitots Annual Sports Day is scheduled for next Saturday. Parents are cordially invited to cheer for our tiny champions!', created_at: new Date().toISOString() },
    { id: 2, title: 'Summer Vacation Holidays Notice', message: 'Dear Parents, please note that the school will remain closed for summer break from June 20th to July 10th. Have a wonderful summer!', created_at: new Date().toISOString() }
  ],
  notifications: []
};

// Reads data from data-store.json
function getData() {
  if (!fs.existsSync(DATA_STORE_PATH)) {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(defaultJSONData, null, 2));
    return defaultJSONData;
  }
  try {
    const fileContent = fs.readFileSync(DATA_STORE_PATH, 'utf8');
    const parsedData = JSON.parse(fileContent);
    
    // Ensure notifications array exists
    if (!parsedData.notifications) {
      parsedData.notifications = [];
    }
    
    return parsedData;
  } catch (err) {
    console.error('Error reading JSON DB, using default:', err);
    return defaultJSONData;
  }
}

// Writes data to data-store.json
function saveData(data) {
  try {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to JSON DB:', err);
  }
}

module.exports = {
  getData,
  saveData
};
