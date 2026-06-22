const jwt = require('jsonwebtoken');
const { getData, saveData } = require('../config/jsonDb');

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

    const data = getData();
    const user = data.users.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Admin login checks
    if (user.role === 'admin') {
      if (!adminSecret || adminSecret !== ADMIN_SECRET_CODE) {
        return res.status(401).json({ message: 'Invalid admin secret code' });
      }
    }

    // Load parent's linked student if parent is approved
    const linkedStudent =
      user.role === 'parent' && user.status === 'approved'
        ? data.students.find((s) => s.parentEmail.trim().toLowerCase() === user.email.trim().toLowerCase())
        : null;

    // Create a login success notification for parent
    if (user.role === 'parent') {
      const newNotification = {
        id: data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
        parentEmail: user.email,
        message: 'You have successfully logged into your account.',
        readStatus: 'unread',
        createdAt: new Date().toISOString()
      };
      data.notifications.push(newNotification);
      saveData(data);
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

    // If Parent selected, require child fields
    if (role === 'parent' && (!childName || !childAge || !requestedClassroom)) {
      return res.status(400).json({ message: 'Child Name, Age, and Requested Classroom are required for parent signup' });
    }

    const data = getData();
    const exists = data.users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());

    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const newUser = {
      id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      name,
      email: email.trim().toLowerCase(),
      password,
      role,
      status: role === 'parent' ? 'pending' : 'approved',
      childName: role === 'parent' ? childName : null,
      childAge: role === 'parent' ? parseInt(childAge) : null,
      requestedClassroom: role === 'parent' ? requestedClassroom : null
    };

    data.users.push(newUser);
    saveData(data);

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
    const data = getData();
    const user = data.users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const linkedStudent =
      user.role === 'parent' && user.status === 'approved'
        ? data.students.find((s) => s.parentEmail.trim().toLowerCase() === user.email.trim().toLowerCase())
        : null;

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

    const data = getData();
    const adminUser = data.users.find(u => u.role === 'admin');
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    adminUser.password = newPassword;
    saveData(data);

    res.json({ message: 'Admin password updated successfully.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};