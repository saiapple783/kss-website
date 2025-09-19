import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
app.use(express.json())

// CORS for local dev & production domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)), credentials: false }))

app.use(morgan('dev'))

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kss'
const PORT = process.env.PORT || 4000

mongoose.set('strictQuery', true)
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Mongo connected:', MONGODB_URI.replace(/:[^@]+@/, ':***@')))
  .catch((err) => { console.error('Mongo error', err); process.exit(1) })

// ----------------- Schemas -----------------
const ContactSchema = new mongoose.Schema(
  { name: String, email: String, message: String },
  { timestamps: true, collection: 'contactus' }
)
const ContactUS = mongoose.models.ContactUS || mongoose.model('ContactUS', ContactSchema)

const RegistrationSchema = new mongoose.Schema(
  {
    firstName: String, lastName: String, email: String, phoneUS: String,
    village: String, mandal: String, district: String,
  },
  { timestamps: true, collection: 'registration' }
)
const Registration = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema)

// 2025 Vanabhojanalu (with family counts)
const VanabhojanaluSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    phone:     { type: String, required: true, trim: true },
    type:      { type: String, enum: ['single', 'family'], required: true },
    adults:    { type: Number, default: 0, min: 0 }, // only relevant for family
    kids:      { type: Number, default: 0, min: 0 }, // only relevant for family
  },
  { timestamps: true, collection: '2025vanabhojanalu' }
)
const Vanabhojanalu =
  mongoose.models.Vanabhojanalu || mongoose.model('Vanabhojanalu', VanabhojanaluSchema)

// ----------------- Routes ------------------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongoReadyState: mongoose.connection?.readyState ?? 0 })
})

app.post('/api/contactus', async (req, res) => {
  try {
    const { name, email, message } = req.body || {}
    for (const [k, v] of Object.entries({ name, email, message })) {
      if (!v || String(v).trim() === '') return res.status(400).json({ message: `Missing field: ${k}` })
    }
    const doc = await ContactUS.create({ name, email, message })
    res.status(201).json({ id: doc._id, message: 'Saved' })
  } catch (e) {
    console.error('POST /api/contactus error', e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/registration', async (req, res) => {
  try {
    const payload = req.body || {}
    for (const f of ['firstName','lastName','email','phoneUS','village','mandal','district']) {
      if (!payload[f] || String(payload[f]).trim() === '') {
        return res.status(400).json({ message: `Missing field: ${f}` })
      }
    }
    const doc = await Registration.create(payload)
    res.status(201).json({ id: doc._id, message: 'Saved' })
  } catch (e) {
    console.error('POST /api/registration error', e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/vanabhojanalu', async (req, res) => {
  try {
    const { firstName, lastName, phone, type, adults, kids } = req.body || {}
    for (const [k, v] of Object.entries({ firstName, lastName, phone, type })) {
      if (!v || String(v).trim() === '') return res.status(400).json({ message: `Missing field: ${k}` })
    }
    if (!['single','family'].includes(type)) return res.status(400).json({ message: 'Invalid type' })

    let a = Number(adults ?? 0)
    let k = Number(kids ?? 0)
    if (Number.isNaN(a) || a < 0) a = 0
    if (Number.isNaN(k) || k < 0) k = 0
    if (type === 'family' && a + k <= 0) {
      return res.status(400).json({ message: 'Provide adults or kids for family' })
    }

    const doc = await Vanabhojanalu.create({ firstName, lastName, phone, type, adults: a, kids: k })
    res.status(201).json({ id: doc._id, message: 'Saved' })
  } catch (e) {
    console.error('POST /api/vanabhojanalu error', e)
    res.status(500).json({ message: 'Server error' })
  }
})

// ------------- Static React build ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, '../client/dist')))
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')))

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
