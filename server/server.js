import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kss'
const PORT = process.env.PORT || 4000

mongoose.set('strictQuery', true)
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Mongo connected:', MONGODB_URI))
  .catch((err) => { console.error('Mongo error', err); process.exit(1) })

// Schemas
const RegistrationSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  phoneUS:   { type: String, required: true, trim: true },
  village:   { type: String, required: true, trim: true },
  mandal:    { type: String, required: true, trim: true },
  district:  { type: String, required: true, trim: true },
}, { timestamps: true, collection: 'registration' })

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
}, { timestamps: true, collection: 'contactus' })

const Registration = mongoose.model('Registration', RegistrationSchema)
const ContactUS = mongoose.model('ContactUS', ContactSchema)

// Routes
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.post('/api/registration', async (req, res) => {
  try {
    const payload = req.body || {}
    for (const field of ['firstName','lastName','email','phoneUS','village','mandal','district']) {
      if (!payload[field] || String(payload[field]).trim() === '') {
        return res.status(400).json({ message: `Missing field: ${field}` })
      }
    }
    const doc = await Registration.create(payload)
    return res.status(201).json({ id: doc._id, message: 'Saved' })
  } catch (err) {
    console.error('POST /api/registration error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/contactus', async (req, res) => {
  try {
    const payload = req.body || {}
    for (const field of ['name','email','message']) {
      if (!payload[field] || String(payload[field]).trim() === '') {
        return res.status(400).json({ message: `Missing field: ${field}` })
      }
    }
    const doc = await ContactUS.create(payload)
    return res.status(201).json({ id: doc._id, message: 'Saved' })
  } catch (err) {
    console.error('POST /api/contactus error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/registration', async (_req, res) => {
  const list = await Registration.find().sort({ createdAt: -1 }).limit(100).lean()
  res.json(list)
})

app.get('/api/contactus', async (_req, res) => {
  const list = await ContactUS.find().sort({ createdAt: -1 }).limit(100).lean()
  res.json(list)
})

// --- serve React build (single deploy) ---
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});


app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
