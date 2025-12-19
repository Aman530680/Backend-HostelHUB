require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const authRoutes = require('./routes/auth')
const studentRoutes = require('./routes/students')
const wardenRoutes = require('./routes/wardens')
const workerRoutes = require('./routes/workers')
const complaintRoutes = require('./routes/complaints')

const app = express()

// ✅ CORS (FIXED FOR VERCEL → RENDER)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// ✅ JSON body parsing (body-parser not needed)
app.use(express.json())

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// ✅ API ROUTES (IMPORTANT: /api PREFIX)
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/warden', wardenRoutes)
app.use('/api/workers', workerRoutes)
app.use('/api/complaints', complaintRoutes)

// ✅ Health check (VERY USEFUL)
app.get('/', (req, res) => {
  res.send('HostelHub Backend is running')
})

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log('Server running on', PORT))
