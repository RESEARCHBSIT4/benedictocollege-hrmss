require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();

// ─────────────────────────────────────
// CORS - Updated to allow your Cloudflare Pages domain
// ─────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve your HTML, CSS, JS, images, etc.
app.use(express.static(path.join(__dirname)));

// ─────────────────────────────────────
// MONGODB
// ─────────────────────────────────────
const DB_NAME = 'HR-Admin-Database';

console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing from your .env file.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
})
.then(() => {
  console.log(`✅ MongoDB Connected: ${DB_NAME}`);
})
.catch((error) => {
  console.error('❌ MongoDB Connection Error:', error.message);
});

// ─── Schemas ───
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['admin', 'employee']
  }
}));

const Employee = mongoose.model('Employee', new mongoose.Schema({
  id: String, first: String, middle: String, last: String,
  dob: String, gender: String, position: String, department: String,
  dateHired: String, salary: String, status: String, type: String,
  email: String, phone: String, regularization: String, yearsOfService: Number,
  resignDate: String,
  leaveBalance: { type: Number, default: 15 }
}));

const Separated = mongoose.model('Separated', new mongoose.Schema({
  id: String, first: String, middle: String, last: String,
  dob: String, gender: String, position: String, department: String,
  dateHired: String, salary: String, status: String, type: String,
  email: String, phone: String, regularization: String, yearsOfService: Number,
  resignDate: String, resignedBy: String
}));

const Department = mongoose.model('Department', new mongoose.Schema({
  name: String, count: Number, detail: String, status: String
}));

const LeaveRequest = mongoose.model('LeaveRequest', new mongoose.Schema({
  id: Number, name: String, email: String, dept: String, type: String, dates: String, reason: String, status: String,
  daysRequested: { type: Number, default: 1 }
}));

const Complaint = mongoose.model('Complaint', new mongoose.Schema({
  subject: String, date: String, priority: String, status: String, employee: String, reply: String
}));

const AttendanceLog = mongoose.model('AttendanceLog', new mongoose.Schema({
  employeeId: String, name: String, department: String,
  date: String, timeIn: String, timeOut: String, status: String
}));

const Announcement = mongoose.model('Announcement', new mongoose.Schema({
  title: String, meta: String, when: String, icon: String, color: String, bg: String
}));

const Activity = mongoose.model('Activity', new mongoose.Schema({
  icon: String, text: String, when: String
}));

const Report = mongoose.model('Report', new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  department: String,
  period: String,
  evaluationDate: String,
  overallRating: { type: Number, min: 1, max: 5 },
  categories: [{
    name: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }],
  strengths: String,
  improvements: String,
  goals: String,
  evaluator: String,
  status: { type: String, enum: ['Draft', 'Finalized'], default: 'Draft' }
}));

// ─── Seed Data ───
async function seed() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        { name: 'HR Admin', email: 'admin@benedicto.edu', password: 'admin123', role: 'admin' },
        { name: 'Emma Santos', email: 'emma.santos@benedicto.edu', password: 'employee123', role: 'employee' }
      ]);
      console.log('✅ Default users created');
    }

    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      await Employee.insertMany([
        { id: 'BC-2023-001', first: 'Emma', middle: 'R', last: 'Santos', dob: '1992-03-11', gender: 'Female', position: 'Librarian', department: 'Library', dateHired: '2019-08-01', salary: 'SG-10', status: 'Active', type: 'Regular', email: 'emma.santos@benedicto.edu', phone: '0917-555-0101', leaveBalance: 15 },
        { id: 'BC-2023-002', first: 'Carlos', middle: 'D', last: 'Reyes', dob: '1988-11-22', gender: 'Male', position: 'Library Assistant', department: 'Library', dateHired: '2021-02-15', salary: 'SG-6', status: 'Active', type: 'Regular', email: 'carlos.reyes@benedicto.edu', phone: '0917-555-0102', leaveBalance: 10 },
        { id: 'BC-2023-003', first: 'Maria', middle: 'L', last: 'Cruz', dob: '1985-06-30', gender: 'Female', position: 'Registrar Officer', department: 'Registrar', dateHired: '2017-01-10', salary: 'SG-11', status: 'Active', type: 'Regular', email: 'maria.cruz@benedicto.edu', phone: '0917-555-0103', leaveBalance: 12 },
        { id: 'BC-2023-004', first: 'Jose', middle: 'P', last: 'Villanueva', dob: '1990-09-05', gender: 'Male', position: 'Accountant', department: 'Finance', dateHired: '2020-05-18', salary: 'SG-12', status: 'On Leave', type: 'Regular', email: 'jose.v@benedicto.edu', phone: '0917-555-0104', leaveBalance: 8 },
        { id: 'BC-2023-005', first: 'Wilma', middle: 'S', last: 'Mondragon', dob: '1990-05-15', gender: 'Female', position: 'Instructor', department: 'College of Business and Management', dateHired: '2020-04-12', salary: 'SG-12', status: 'Active', type: 'Regular', email: 'wilma.m@benedicto.edu', phone: '0917-123-4567', leaveBalance: 15 },
        { id: 'BC-2023-006', first: 'Anton', middle: 'F', last: 'Bautista', dob: '1993-01-19', gender: 'Male', position: 'IT Support', department: 'IT Services', dateHired: '2022-03-01', salary: 'SG-9', status: 'Active', type: 'Contractual', email: 'anton.b@benedicto.edu', phone: '0917-555-0106', leaveBalance: 5 },
        { id: 'BC-2023-007', first: 'Lorna', middle: 'T', last: 'Del Rosario', dob: '1989-04-12', gender: 'Female', position: 'Secretary', department: 'Human Resources', dateHired: '2018-03-15', salary: 'SG-8', status: 'Active', type: 'Regular', email: 'lorna.d@benedicto.edu', phone: '0917-555-0107', leaveBalance: 10 },
        { id: 'BC-2023-008', first: 'Ricardo', middle: 'L', last: 'Fernandez', dob: '1987-08-22', gender: 'Male', position: 'Engineering Instructor', department: 'College of Engineering', dateHired: '2019-06-10', salary: 'SG-13', status: 'Active', type: 'Regular', email: 'ricardo.f@benedicto.edu', phone: '0917-555-0108', leaveBalance: 14 },
        { id: 'BC-2023-009', first: 'Sarah', middle: 'J', last: 'Lim', dob: '1991-12-05', gender: 'Female', position: 'Nursing Instructor', department: 'College of Nursing', dateHired: '2021-01-20', salary: 'SG-13', status: 'Active', type: 'Regular', email: 'sarah.l@benedicto.edu', phone: '0917-555-0109', leaveBalance: 12 },
        { id: 'BC-2023-010', first: 'Mark', middle: 'A', last: 'Tan', dob: '1994-04-18', gender: 'Male', position: 'SHS Teacher', department: 'Senior High School', dateHired: '2022-06-01', salary: 'SG-9', status: 'Active', type: 'Regular', email: 'mark.t@benedicto.edu', phone: '0917-555-0110', leaveBalance: 10 }
      ]);
      console.log('✅ Employees seeded');
    }

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany([
        { name: 'College of Arts and Sciences', count: 0, detail: 'Liberal Arts, Natural Sciences, Communication, Psychology', status: 'Active' },
        { name: 'College of Business and Management', count: 0, detail: 'Business Administration, Accountancy, Marketing, HRM, Entrepreneurship', status: 'Active' },
        { name: 'College of Computer Studies', count: 0, detail: 'Information Technology, Computer Science, Animation, Multimedia', status: 'Active' },
        { name: 'College of Education', count: 0, detail: 'Elementary Education, Secondary Education, Early Childhood', status: 'Active' },
        { name: 'College of Engineering', count: 0, detail: 'Industrial, Mechanical, Civil, Electrical, Electronics Engineering', status: 'Active' },
        { name: 'College of Hospitality Management', count: 0, detail: 'Hotel & Restaurant Management, Tourism, Culinary Arts', status: 'Active' },
        { name: 'College of Nursing', count: 0, detail: 'Bachelor of Science in Nursing, Health Sciences', status: 'Active' },
        { name: 'College of Criminology', count: 0, detail: 'Criminology, Forensic Science, Correctional Administration', status: 'Active' },
        { name: 'Basic Education', count: 0, detail: 'Pre-school, Elementary, Junior High School (K-10)', status: 'Active' },
        { name: 'Senior High School', count: 0, detail: 'ABM, HUMSS, STEM, GAS, TVL Tracks', status: 'Active' },
        { name: 'Technical-Vocational', count: 0, detail: 'TESDA-accredited programs, Industrial Technology', status: 'Active' },
        { name: 'Registrar', count: 0, detail: 'Student records, enrollment, and academic services', status: 'Active' },
        { name: 'Finance', count: 0, detail: 'Accounting, budgeting, payroll, and financial services', status: 'Active' },
        { name: 'Library', count: 0, detail: 'Learning resources, research support, digital archives', status: 'Active' },
        { name: 'IT Services', count: 0, detail: 'Network, systems, technical support, and digital infrastructure', status: 'Active' },
        { name: 'Human Resources', count: 0, detail: 'HR, personnel management, faculty and staff services', status: 'Active' },
        { name: 'Guidance and Counseling', count: 0, detail: 'Student wellness, career guidance, and counseling services', status: 'Active' },
        { name: 'Student Affairs', count: 0, detail: 'Student organizations, discipline, and campus life', status: 'Active' }
      ]);
      console.log('✅ Departments seeded');
    }

    const leaveCount = await LeaveRequest.countDocuments();
    if (leaveCount === 0) {
      await LeaveRequest.insertMany([
        { id: 1, name: 'Emma Santos', email: 'emma.santos@benedicto.edu', dept: 'Library', type: 'Sick Leave', dates: 'June 5 - June 6, 2028', reason: 'Doctor\'s appointment', status: 'Pending', daysRequested: 2 },
        { id: 2, name: 'Jose Villanueva', email: 'jose.v@benedicto.edu', dept: 'Finance', type: 'Vacation Leave', dates: 'June 10 - June 14, 2028', reason: 'Family vacation', status: 'Pending', daysRequested: 5 },
        { id: 3, name: 'Wilma Mondragon', email: 'wilma.m@benedicto.edu', dept: 'College of Business and Management', type: 'Emergency Leave', dates: 'August 18 - August 19, 2028', reason: 'Family emergency', status: 'Pending', daysRequested: 2 }
      ]);
      console.log('✅ Leave requests seeded');
    }

    const sepCount = await Separated.countDocuments();
    if (sepCount === 0) {
      await Separated.insertMany([
        { id: 'BC-2023-007', first: 'Lorna', middle: 'T', last: 'Del Rosario', dob: '1989-04-12', gender: 'Female', position: 'Secretary', department: 'Registrar', dateHired: '2018-03-15', salary: 'SG-8', status: 'Inactive', type: 'Regular', email: 'lorna.d@benedicto.edu', phone: '0917-555-0107', regularization: '2019-03-15', yearsOfService: 6, resignDate: '2025-12-20', resignedBy: 'HR Admin' }
      ]);
      console.log('✅ Separated employees seeded');
    }

    const compCount = await Complaint.countDocuments();
    if (compCount === 0) {
      await Complaint.insertMany([
        { subject: 'Request for schedule adjustment', date: 'June 2, 2028', priority: 'Medium', status: 'Pending', employee: 'emma.santos@benedicto.edu' },
        { subject: 'Payslip discrepancy - May 2028', date: 'May 30, 2028', priority: 'High', status: 'Pending', employee: 'jose.v@benedicto.edu' },
        { subject: 'Update profile information', date: 'August 15, 2028', priority: 'Low', status: 'Pending', employee: 'wilma.m@benedicto.edu' }
      ]);
      console.log('✅ Complaints seeded');
    }

    const annCount = await Announcement.countDocuments();
    if (annCount === 0) {
      await Announcement.insertMany([
        { title: 'Faculty Meeting Schedule', meta: 'June 10, 2026 - 14:00 PM', when: '16 hours ago', icon: 'fa-bullhorn', color: '#2c4ba3', bg: '#e6ecfb' }
      ]);
      console.log('✅ Announcements seeded');
    }

    const actCount = await Activity.countDocuments();
    if (actCount === 0) {
      await Activity.insertMany([
        { icon: 'fa-user-clock', text: 'Attendance updated', when: '1 hour ago' }
      ]);
      console.log('✅ Activities seeded');
    }

    const reportCount = await Report.countDocuments();
    if (reportCount === 0) {
      await Report.insertMany([
        {
          employeeId: 'BC-2023-001', employeeName: 'Emma R. Santos', department: 'Library',
          period: 'Q2 2026', evaluationDate: '2026-06-30', overallRating: 4,
          categories: [
            { name: 'Job Knowledge', rating: 5, comment: 'Excellent knowledge of library systems and cataloging.' },
            { name: 'Punctuality', rating: 4, comment: 'Consistently on time, minor late arrival in May.' },
            { name: 'Professionalism', rating: 4, comment: 'Strong professional conduct with colleagues.' },
            { name: 'Collaboration', rating: 4, comment: 'Actively participates in faculty meetings.' }
          ],
          strengths: 'Attendance Rate: 96%. Present: 24 days, Late: 1 days, Absent: 0 days. Strong subject knowledge, excellent student rapport, innovative teaching methods.',
          improvements: 'Attendance consistency during peak traffic hours, earlier submission of grade sheets.',
          goals: 'Maintain or improve attendance rate above 100%. Complete advanced certification by Q4 2026.',
          evaluator: 'Dr. Maria Cruz', status: 'Finalized'
        },
        {
          employeeId: 'BC-2023-002', employeeName: 'Carlos D. Reyes', department: 'Library',
          period: 'Q2 2026', evaluationDate: '2026-06-30', overallRating: 3,
          categories: [
            { name: 'Job Knowledge', rating: 3, comment: 'Adequate knowledge of library systems.' },
            { name: 'Punctuality', rating: 3, comment: 'Occasional tardiness observed.' },
            { name: 'Professionalism', rating: 3, comment: 'Professional but room for growth.' },
            { name: 'Collaboration', rating: 3, comment: 'Works well when directed.' }
          ],
          strengths: 'Attendance Rate: 82%. Present: 20 days, Late: 3 days, Absent: 2 days. Reliable in daily operations, friendly with students.',
          improvements: 'Employee was late 3 time(s). Punctuality needs improvement. Need more initiative in organizing library events.',
          goals: 'Maintain or improve attendance rate above 87%. Complete library management training by Q3 2026.',
          evaluator: 'HR Admin', status: 'Finalized'
        }
      ]);
      console.log('✅ Reports seeded');
    }

    // Seed today's attendance
    const today = new Date().toISOString().slice(0, 10);
    const attCount = await AttendanceLog.countDocuments({ date: today });
    if (attCount === 0) {
      const emps = await Employee.find({ status: { $ne: 'On Leave' } });
      const logs = emps.map((e, i) => ({
        employeeId: e.id,
        name: `${e.first} ${e.last}`,
        department: e.department,
        date: today,
        timeIn: `0${7 + (i % 2)}:${String(45 + (i * 3) % 15).padStart(2, '0')} AM`,
        timeOut: `05:0${i % 9} PM`,
        status: i % 5 === 1 ? 'Late' : 'Present'
      }));
      await AttendanceLog.insertMany(logs);
      console.log('✅ Today\'s attendance seeded');
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
}
seed();

// ─── Auth Routes ───
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    res.json({ user: { name: user.name, email: user.email, role: user.role }, token: 'demo-token-' + user._id });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Employee Routes ───
app.get('/api/employees', async (req, res) => {
  try {
    res.json(await Employee.find());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const emp = new Employee(req.body);
    await emp.save();
    await Department.updateOne({ name: emp.department }, { $inc: { count: 1 } });
    await Activity.create({ icon: 'fa-user-plus', text: `${emp.first} ${emp.last} added to ${emp.department}`, when: 'just now' });
    res.json(emp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const old = await Employee.findOne({ id: req.params.id });
    const updated = await Employee.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (old.department !== updated.department) {
      await Department.updateOne({ name: old.department }, { $inc: { count: -1 } });
      await Department.updateOne({ name: updated.department }, { $inc: { count: 1 } });
    }
    await Activity.create({ icon: 'fa-user-pen', text: `${updated.first} ${updated.last}'s record was updated`, when: 'just now' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Admin manually update leave balance
app.put('/api/employees/:id/leave-balance', async (req, res) => {
  try {
    const { leaveBalance } = req.body;
    const updated = await Employee.findOneAndUpdate(
      { id: req.params.id },
      { leaveBalance: parseInt(leaveBalance) || 0 },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    await Activity.create({ 
      icon: 'fa-calendar-check', 
      text: `${updated.first} ${updated.last}'s leave balance updated to ${updated.leaveBalance}`, 
      when: 'just now' 
    });
    res.json({ success: true, leaveBalance: updated.leaveBalance, employee: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leave balance' });
  }
});

// Resign employee — save full record to Separated collection
app.put('/api/employees/:id/resign', async (req, res) => {
  try {
    const { resignDate, resignedBy } = req.body;
    const emp = await Employee.findOne({ id: req.params.id });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const sepRecord = new Separated({
      id: emp.id, first: emp.first, middle: emp.middle, last: emp.last,
      dob: emp.dob, gender: emp.gender, position: emp.position,
      department: emp.department, dateHired: emp.dateHired,
      salary: emp.salary, status: 'Inactive', type: emp.type,
      email: emp.email, phone: emp.phone,
      regularization: emp.regularization, yearsOfService: emp.yearsOfService,
      resignDate: resignDate || new Date().toISOString().slice(0, 10),
      resignedBy: resignedBy || 'HR Admin'
    });
    await sepRecord.save();

    emp.status = 'Inactive';
    emp.resignDate = resignDate || new Date().toISOString().slice(0, 10);
    await emp.save();

    await Activity.create({ icon: 'fa-user-xmark', text: `${emp.first} ${emp.last} moved to Separated`, when: 'just now' });
    res.json({ success: true, message: 'Employee resigned and archived', data: sepRecord });
  } catch (error) {
    console.error('Resign error:', error);
    res.status(500).json({ error: 'Failed to resign employee: ' + error.message });
  }
});

// ─── Separated Routes ───
app.get('/api/separated', async (req, res) => {
  try {
    res.json(await Separated.find().sort({ resignDate: -1 }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch separated records' });
  }
});

// ─── Department Routes ───
app.get('/api/departments', async (req, res) => {
  try {
    res.json(await Department.find());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// ─── Leave Routes ───
// Get all leave requests
app.get('/api/leave-requests', async (req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ id: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Get leave requests for a specific employee
app.get('/api/leave-requests/employee/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const requests = await LeaveRequest.find({ email }).sort({ id: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee leave requests' });
  }
});

// Get a specific leave request by ID
app.get('/api/leave-requests/:id', async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Leave request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave request' });
  }
});

// Employee submits a new leave request (with balance check)
app.post('/api/leave-requests/submit', async (req, res) => {
  console.log('📝 Received leave request:', req.body);
  try {
    const { name, email, dept, type, dates, reason, startDate, endDate } = req.body;

    if (!name || !email || !dept || !type || !dates) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { name, email, dept, type, dates }
      });
    }

    // Calculate days requested
    let daysRequested = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Find employee and check balance
    const emp = await Employee.findOne({ email });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    if (emp.leaveBalance < daysRequested) {
      return res.status(400).json({ 
        error: `Insufficient leave balance. You have ${emp.leaveBalance} day(s) left, but requested ${daysRequested} day(s).` 
      });
    }

    // Deduct balance
    emp.leaveBalance -= daysRequested;
    await emp.save();

    // Generate new ID
    const lastRequest = await LeaveRequest.findOne().sort({ id: -1 });
    const newId = lastRequest ? lastRequest.id + 1 : 1;

    const leaveRequest = new LeaveRequest({
      id: newId,
      name,
      email,
      dept,
      type,
      dates,
      reason: reason || 'No reason provided',
      status: 'Pending',
      daysRequested
    });

    await leaveRequest.save();

    await Activity.create({ 
      icon: 'fa-file-lines', 
      text: `${name} submitted a ${type} leave request (${daysRequested} day(s))`, 
      when: 'just now' 
    });

    res.status(201).json({ 
      success: true, 
      message: 'Leave request submitted successfully',
      remainingBalance: emp.leaveBalance,
      data: leaveRequest 
    });
  } catch (error) {
    console.error('❌ Submit leave error:', error);
    res.status(500).json({ 
      error: 'Failed to submit leave request: ' + error.message,
      stack: error.stack 
    });
  }
});

// Admin updates leave request status (approve/reject)
app.put('/api/leave-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await LeaveRequest.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Leave request not found' });

    await Activity.create({ 
      icon: status === 'Approved' ? 'fa-check-circle' : 'fa-times-circle', 
      text: `${updated.name}'s leave request was ${status.toLowerCase()}`, 
      when: 'just now' 
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leave request' });
  }
});

// Admin creates a leave request (alternative method)
app.post('/api/leave-requests', async (req, res) => {
  try {
    const lr = new LeaveRequest(req.body);
    await lr.save();
    await Activity.create({ icon: 'fa-file-lines', text: `${lr.name} submitted a leave request`, when: 'just now' });
    res.status(201).json(lr);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// Delete a leave request
app.delete('/api/leave-requests/:id', async (req, res) => {
  try {
    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete leave request' });
  }
});

// ─── Complaint Routes ───
app.get('/api/complaints', async (req, res) => {
  try {
    res.json(await Complaint.find());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const comp = new Complaint(req.body);
    await comp.save();
    res.status(201).json(comp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

app.put('/api/complaints/:id', async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// ─── Attendance Routes ───
app.get('/api/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const query = date ? { date } : {};
    res.json(await AttendanceLog.find(query));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance statistics for an employee (for report generation)
app.get('/api/attendance/stats/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get all attendance logs for this employee
    const logs = await AttendanceLog.find({ employeeId }).sort({ date: -1 });

    const total = logs.length;
    const present = logs.filter(l => l.status === 'Present').length;
    const late = logs.filter(l => l.status === 'Late').length;
    const absent = logs.filter(l => l.status === 'Absent').length;

    // Calculate ratings based on attendance (1-5 scale)
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;
    const punctualityRate = total > 0 ? ((present + late) / total) * 100 : 0;

    // Map to 1-5 rating
    const rateToScore = (rate) => {
      if (rate >= 95) return 5;
      if (rate >= 85) return 4;
      if (rate >= 75) return 3;
      if (rate >= 60) return 2;
      return 1;
    };

    const stats = {
      totalDays: total,
      present,
      late,
      absent,
      attendanceRate: Math.round(attendanceRate),
      punctualityRate: Math.round(punctualityRate),
      suggestedRatings: {
        punctuality: rateToScore(100 - ((late / (total || 1)) * 100)),
        professionalism: rateToScore(attendanceRate),
        reliability: rateToScore(attendanceRate),
        collaboration: 3 // neutral default
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance stats' });
  }
});

app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    const date = new Date().toISOString().slice(0, 10);
    let log = await AttendanceLog.findOne({ employeeId, date });
    const now = new Date();
    const timeStr = formatTime(now);
    let action;
    if (!log) {
      log = new AttendanceLog({ employeeId, name: `${emp.first} ${emp.last}`, department: emp.department, date, timeIn: null, timeOut: null, status: 'Present' });
    }
    if (!log.timeIn) {
      log.timeIn = timeStr;
      const hourFloat = now.getHours() + now.getMinutes() / 60;
      log.status = hourFloat > 8.25 ? 'Late' : 'Present';
      action = 'Time In Recorded';
      await Activity.create({ icon: 'fa-fingerprint', text: `${log.name} clocked in (${log.status})`, when: 'just now' });
    } else if (!log.timeOut) {
      log.timeOut = timeStr;
      action = 'Time Out Recorded';
      await Activity.create({ icon: 'fa-fingerprint', text: `${log.name} clocked out`, when: 'just now' });
    } else {
      action = 'Already Completed Today';
    }
    await log.save();
    res.json({ action, name: log.name, time: timeStr, log });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process scan' });
  }
});

function formatTime(d) {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

// ─── Announcement Routes ───
app.get('/api/announcements', async (req, res) => {
  try {
    res.json(await Announcement.find().sort({ _id: -1 }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const ann = new Announcement(req.body);
    await ann.save();
    res.status(201).json(ann);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// ─── Activity Routes ───
app.get('/api/activities', async (req, res) => {
  try {
    res.json(await Activity.find().sort({ _id: -1 }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// ─── Report Routes ───
app.get('/api/reports', async (req, res) => {
  try {
    const { employeeId } = req.query;
    const query = employeeId ? { employeeId } : {};
    res.json(await Report.find(query).sort({ evaluationDate: -1 }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    await Activity.create({ icon: 'fa-file-lines', text: `Performance report created for ${report.employeeName}`, when: 'just now' });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
  }
});

app.put('/api/reports/:id', async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// ─── Test endpoint ───
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// ─── Start ───
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;

// Helper to show local IP for other devices
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n🌐 Access the app locally:    http://localhost:${PORT}`);
  console.log(`🌐 Access from other devices: http://${localIP}:${PORT}\n`);
  console.log('⚠️  IMPORTANT: Make sure your frontend uses RELATIVE paths like /api/auth/login');
  console.log('   (NOT http://localhost:3000/api/auth/login)\n');
});

