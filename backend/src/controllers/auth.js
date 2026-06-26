const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const ADMIN_SECRET_CODE = 'Varshini@20';

const createToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'kidvista_secret_key',
    { expiresIn: '1d' }
  );
};

const removePassword = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

exports.login = async (req, res) => {
  try {
    const { email, password, adminSecret } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = rows[0];

    // Check password
    let passwordMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        passwordMatch = await bcrypt.compare(password, user.password);
    } else {
        passwordMatch = (user.password === password);
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Admin login checks
    if (user.role === 'admin') {
      if (!adminSecret || adminSecret !== ADMIN_SECRET_CODE) {
        return res.status(401).json({ message: 'Invalid admin secret code' });
      }
    }

    // Load parent's linked student if parent is approved
    let linkedStudent = null;
    if (user.role === 'parent' && user.status === 'approved') {
      const [sRows] = await db.query(`
        SELECT s.*, c.classroom_name 
        FROM students s 
        LEFT JOIN classrooms c ON s.classroom_id = c.id 
        WHERE s.parent_id = ?
      `, [user.id]);
      
      if (sRows.length > 0) {
          const s = sRows[0];
          linkedStudent = {
            studentId: s.id,
            studentName: s.student_name,
            age: s.age,
            classroom: s.classroom_name || 'Nursery A',
            parentEmail: user.email
          };
      }
    }

    // Create a login success notification for parent
    if (user.role === 'parent') {
      await db.execute(
        'INSERT INTO notifications (parent_email, message, type, read_status) VALUES (?, ?, ?, ?)',
        [user.email, 'You have successfully logged into your account.', 'login', 'unread']
      );
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        ...removePassword(user),
        linkedStudent
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, childName, childAge, requestedClassroom } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin signup is not allowed' });
    }

    if (role !== 'teacher' && role !== 'parent') {
      return res.status(400).json({ message: 'Only teacher and parent signup allowed' });
    }

    if (role === 'parent' && (!childName || !childAge || !requestedClassroom)) {
      return res.status(400).json({ message: 'Child Name, Age, and Requested Classroom are required for parent signup' });
    }

    const [existsRows] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existsRows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const status = role === 'parent' ? 'pending' : 'approved';

    await db.execute(
      `INSERT INTO users (name, email, password, role, status, child_name, child_age, requested_classroom) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        email.trim().toLowerCase(), 
        hashedPassword, 
        role, 
        status,
        role === 'parent' ? childName : null,
        role === 'parent' ? parseInt(childAge) : null,
        role === 'parent' ? requestedClassroom : null
      ]
    );

    res.status(201).json({
      message: role === 'parent' 
        ? 'Signup successful. Your account is pending admin approval.' 
        : 'Signup successful. Please login now.'
    });
  } catch (error) {
    console.error('signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];

    let linkedStudent = null;
    if (user.role === 'parent' && user.status === 'approved') {
      const [sRows] = await db.query(`
        SELECT s.*, c.classroom_name 
        FROM students s 
        LEFT JOIN classrooms c ON s.classroom_id = c.id 
        WHERE s.parent_id = ?
      `, [user.id]);
      
      if (sRows.length > 0) {
          const s = sRows[0];
          linkedStudent = {
            studentId: s.id,
            studentName: s.student_name,
            age: s.age,
            classroom: s.classroom_name || 'Nursery A',
            parentEmail: user.email
          };
      }
    }

    res.json({
      user: {
        ...removePassword(user),
        linkedStudent
      }
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetAdminPassword = async (req, res) => {
  try {
    const { email, adminSecret, newPassword } = req.body;

    if (!email || !adminSecret || !newPassword) {
      return res.status(400).json({ message: 'Email, secret code, and new password are required' });
    }

    if (email.trim().toLowerCase() !== 'akhilkumarchada86@gmail.com') {
      return res.status(403).json({ message: 'Password reset is only supported for the Admin account.' });
    }

    if (adminSecret !== ADMIN_SECRET_CODE) {
      return res.status(401).json({ message: 'Invalid admin secret code' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE role = "admin" AND email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, rows[0].id]);

    res.json({ message: 'Admin password updated successfully.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};