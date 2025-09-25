import 'dotenv/config'
import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import Stripe from 'stripe';
const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET);

// Remove or narrow any global bodyParser.text() if possible
 
app.post(
  '/api/stripe-webhook',
  bodyParser.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
 
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_KEY
      );
    } catch (err) {
      console.error('❌ Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
 
    // ✅ Match the event you actually triggered
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('✅ Payment success. Metadata received:', session.metadata);
      // Save to DB if needed
      Vanabhojanalu.create({
        firstName: s.metadata.firstName,
         lastName:  s.metadata.lastName,
         phone:     s.metadata.phone,
         type:      s.metadata.type,
         adults:    Number(s.metadata.adults || 0),
         kids:      Number(s.metadata.kids || 0),
         email: s.metadata.email,
         amount:   Number(s.metadata.amount || 0),
       }).catch(err => console.error('DB save error', err));

    }
 
    res.sendStatus(200);
  }
);

app.use(express.json())

app.post('/api/create-checkout-session', async (req, res) => {
  const { firstName, lastName, email, phone, type, adults, kids, amount } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        // 👇 Hard-code a single product/amount instead of using price IDs
        price_data: {
          currency: 'usd',
          product_data: { name: 'Donation' },
          unit_amount: amount, // amount in cents (e.g. 2000 = $20)
        },
        quantity: 1,
      }],
      success_url: `https://thekss.org/payment`,
      cancel_url: `https://thekss.org/`,
      metadata: { firstName, lastName, email, phone, type, adults, kids, amount }
    });
    res.json({ sessionUrl: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Stripe session error' });
  }
});





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
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    type: { type: String, enum: ['single', 'family'], required: true },
    adults: { type: Number, default: 0, min: 0 }, // only relevant for family
    kids: { type: Number, default: 0, min: 0 }, 
    amount: { type: Number, default: 0, min: 0 }, // in cents
    // only relevant for family
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
    for (const f of ['firstName', 'lastName', 'email', 'phoneUS', 'village', 'mandal', 'district']) {
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

// app.post('/api/vanabhojanalu', async (req, res) => {
//   try {
//     const { firstName, lastName, phone, type, adults, kids } = req.body || {}
//     for (const [k, v] of Object.entries({ firstName, lastName, phone, type })) {
//       if (!v || String(v).trim() === '') return res.status(400).json({ message: `Missing field: ${k}` })
//     }
//     if (!['single','family'].includes(type)) return res.status(400).json({ message: 'Invalid type' })

//     let a = Number(adults ?? 0)
//     let k = Number(kids ?? 0)
//     if (Number.isNaN(a) || a < 0) a = 0
//     if (Number.isNaN(k) || k < 0) k = 0
//     if (type === 'family' && a + k <= 0) {
//       return res.status(400).json({ message: 'Provide adults or kids for family' })
//     }

//     const doc = await Vanabhojanalu.create({ firstName, lastName, phone, type, adults: a, kids: k })
//     res.status(201).json({ id: doc._id, message: 'Saved' })
//   } catch (e) {
//     console.error('POST /api/vanabhojanalu error', e)
//     res.status(500).json({ message: 'Server error' })
//   }
// })

// ------------- Static React build ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, '../client/dist')))
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')))

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
