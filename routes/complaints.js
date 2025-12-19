const express = require('express')
const Complaint = require('../models/Complaint')
const Student = require('../models/Student')
const Worker = require('../models/Worker')
const router = express.Router()

// CREATE COMPLAINT (STUDENT)
router.post('/', async (req, res) => {
  try {
    const student = await Student.findById(req.body.student_id)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    const complaint = new Complaint({
      description: req.body.description,
      image: req.body.image || '',
      category: req.body.category,
      student_id: req.body.student_id,
      student_name: student.name,
      room_number: student.room_number,
      status: 'pending' // ✅ EXPLICIT
    })

    await complaint.save()
    res.json({ ...complaint.toObject(), id: complaint._id })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET COMPLAINTS BY STUDENT
router.get('/student/:studentId', async (req, res) => {
  try {
    const complaints = await Complaint.find({
      student_id: req.params.studentId
    }).sort({ createdAt: -1 })

    res.json(complaints.map(c => ({ ...c.toObject(), id: c._id })))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET ALL COMPLAINTS (WARDEN / WORKER)
router.get('/all', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 })
    res.json(complaints.map(c => ({ ...c.toObject(), id: c._id })))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// UPDATE COMPLAINT (STUDENT EDIT)
router.put('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        description: req.body.description,
        category: req.body.category,
        image: req.body.image || ''
      },
      { new: true }
    )

    res.json({ ...complaint.toObject(), id: complaint._id })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE COMPLAINT
router.delete('/:id', async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id)
    res.json({ message: 'Complaint deleted' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// UPDATE STATUS (WARDEN + WORKER)
router.patch('/:id/status', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    const { status, assigned_worker_id, warden_comments } = req.body

    // ✅ WARDEN ACTION
    if (status === 'accepted' || status === 'rejected') {
      complaint.status = status
      complaint.warden_comments = warden_comments || ''
    }

    // ✅ WORKER TAKES JOB
    if (status === 'in-progress' && assigned_worker_id) {
      const worker = await Worker.findById(assigned_worker_id)
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' })
      }

      complaint.status = 'in-progress'
      complaint.assigned_worker_id = worker._id
      complaint.assigned_worker_name = worker.name
    }

    // ✅ WORKER COMPLETES JOB
    if (status === 'completed') {
      complaint.status = 'completed'
    }

    await complaint.save()
    res.json({ ...complaint.toObject(), id: complaint._id })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router
