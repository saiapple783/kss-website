import React, { useState } from "react";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_dRm7sL2CD0Jj8as2eugbm00";
const NAV_ITEMS = [
  { key: "home", label: "Home" },
  { key: "about", label: "About US" },
  // { key: "register", label: "Register" },
  { key: "donate", label: "Donate" },
  { key: "contact", label: "Contact" },
  { key: "event", label: "Event" },
  { key: "gallery", label: "Gallery" },
];

export default function KammaSevaSamithiSite() {
  const [active, setActive] = useState("home");

  return (
    <div className="kss-app">
      <style>{globalCSS}</style>

      <aside className="kss-sidebar">
        <div className="kss-brand">
          <img className="kss-logo" src="/images/kss-logo.png" alt="Kamma Seva Samithi Logo" />
          <div className="kss-title">KAMMA SEVA SAMITHI</div>
        </div>
        <nav className="kss-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={"kss-nav-item " + (active === item.key ? "active" : "")}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="kss-main">
        {active === "home" && <Home onNav={setActive} />}
        {active === "about" && <About />}
        {/* {active === "register" && <Register />} */}
        {active === "donate" && <Donate />}
        {active === "contact" && <Contact />}
        {active === "event" && <Event />}
        {active === "gallery" && <Placeholder title="Gallery" />}
      </main>
    </div>
  );
}

function Home({ onNav }) {
  return (
    <div className="kss-home">
      <div className="kss-hero">
        <div className="kss-hero-imgwrap">
          <img className="kss-hero-badge" src="/images/kss-logo.png" alt="KSS Badge" />
          <img className="kss-hero-img" src="/images/krishna.png" alt="Lord Krishna" />
          <div className="kss-hero-fade" />
        </div>

        <div className="kss-hero-text telugu" aria-label="Telugu heading">
          కమ్మ సేవా సమితి - డల్లాస్
          <br />
          ఇదం ధర్మం, ఇదం కర్తవ్యం!!
        </div>

        <h1 className="kss-welcome">Welcome to Kamma Seva Samithi</h1>
        <p className="kss-sub">
          Experience the divine presence and join our vibrant community dedicated to spiritual growth, cultural
          preservation, and service to humanity. Find peace, wisdom, and connection in our sacred space.
        </p>

        <div className="kss-cta-row">
          <button className="btn primary" onClick={() => onNav("register")}>Register</button>
          <button className="btn ghost" onClick={() => onNav("contact")}>Contact</button>
        </div>
      </div>

      <section className="kss-cards">
        <InfoCard
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4Z" stroke="currentColor" strokeWidth="1.5" /></svg>}
          title="Join Our Community"
          desc="Connect with like-minded devotees and participate in our spiritual journey together."
          cta="Learn More"
          onClick={() => onNav("about")}
        />
        <InfoCard
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m12 21-1-.7C6 17.3 3 14.7 3 11a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 3.7-3 6.3-8 9.3l-1 .7-1-.7c-2-.9-4-2.1-6-3.6" stroke="currentColor" strokeWidth="1.5" /></svg>}
          title="Support Our Mission"
          desc="Help us continue our spiritual and community service through your generous donations."
          cta="Donate Now"
          onClick={() => onNav("donate")}
        />
        <InfoCard
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m18 0-8.4 5.6a2 2 0 0 1-2.2 0L3 8m18 0-2-3a2 2 0 0 0-1.7-1H6.7A2 2 0 0 0 5 5L3 8" stroke="currentColor" strokeWidth="1.5" /></svg>}
          title="Get in Touch"
          desc="Connect with like-minded devotees and participate in our spiritual journey together."
          cta="Contact US"
          onClick={() => onNav("contact")}
        />
      </section>
    </div>
  );
}

function Event() {
  const STRIPE_SINGLE = "https://buy.stripe.com/test_dRm7sL2CD0Jj8as2eugbm00";
  const STRIPE_FAMILY = "https://buy.stripe.com/test_3cIfZh7WX0JjgGY3iygbm01";

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    type: "single",
    adults: 0,
    kids: 0,
  });
  const [err, setErr] = React.useState("");

  const onCardClick = () => setOpen(true);
  const close = () => { if (!loading) setOpen(false); };
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setErr("");
    const { firstName, lastName, phone, type } = form;
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setErr("Please fill all required fields.");
      return;
    }
    if (type === "family" && Number(form.adults || 0) + Number(form.kids || 0) <= 0) {
      setErr("For Family, set Adults or Kids > 0.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/vanabhojanalu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          type: form.type,
          adults: Number(form.adults || 0),
          kids: Number(form.kids || 0),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Cannot submit");

      window.location = form.type === "family" ? STRIPE_FAMILY : STRIPE_SINGLE;
    } catch (e) {
      setErr(e.message || "Server error");
      setLoading(false);
    }
  };

  return (
    <div className="kss-event">
      <h2 className="kss-form-title">Event</h2>

      <div
        className="event-card"
        onClick={onCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onCardClick()}
      >
        <img className="event-img" src="/images/picnic.png" alt="2025 Vanabhojanalu" />
        <div className="event-meta">
          <div className="event-title">2025 Vanabhojanalu</div>
          <div className="event-sub">Click to Register</div>
        </div>
      </div>

      {open && (
        <div className="reg-backdrop" onClick={close}>
          <div className="reg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reg-title">2025 Vanabhojanalu Registration</div>

            <div className="kss-form-grid" style={{ marginTop: 8 }}>
              <div className="kss-field">
                <label className="kss-label">First Name <span className="req">*</span></label>
                <input className="kss-input" name="firstName" value={form.firstName} onChange={onChange} />
              </div>
              <div className="kss-field">
                <label className="kss-label">Last Name <span className="req">*</span></label>
                <input className="kss-input" name="lastName" value={form.lastName} onChange={onChange} />
              </div>
              <div className="kss-field">
                <label className="kss-label">Phone Number <span className="req">*</span></label>
                <input className="kss-input" name="phone" value={form.phone} onChange={onChange} />
              </div>

              <div className="kss-field">
                <label className="kss-label">Type <span className="req">*</span></label>
                <div className="reg-choice">
                  <button type="button" className={"chip " + (form.type === "single" ? "active" : "")} onClick={() => setForm((f) => ({ ...f, type: "single" }))}>Single</button>
                  <button type="button" className={"chip " + (form.type === "family" ? "active" : "")} onClick={() => setForm((f) => ({ ...f, type: "family" }))}>Family</button>
                </div>
              </div>

              {form.type === "family" && (
                <>
                  <div className="kss-field">
                    <label className="kss-label">Adults</label>
                    <input className="kss-input" type="number" min="0" name="adults" value={form.adults} onChange={onChange} />
                  </div>
                  <div className="kss-field">
                    <label className="kss-label">Kids</label>
                    <input className="kss-input" type="number" min="0" name="kids" value={form.kids} onChange={onChange} />
                  </div>
                </>
              )}
            </div>

            {err && <div className="kss-alert err" style={{ marginTop: 6 }}>{err}</div>}

            <div className="reg-actions">
              <button className="btn ghost" onClick={close} disabled={loading}>Cancel</button>
              <button className="btn primary" onClick={submit} disabled={loading}>
                {loading ? "Saving..." : "Continue to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function InfoCard({ icon, title, desc, cta, onClick }) {
  return (
    <div className="kss-card">
      <div className="kss-card-icon">{icon}</div>
      <div className="kss-card-title">{title}</div>
      <p className="kss-card-desc">{desc}</p>
      <button className="btn outline" onClick={onClick}>{cta}</button>
    </div>
  );
}

function About() {
  return (
    <div className="kss-about">
      <h2 className="kss-about-h">About Kamma Seva Samithi</h2>
      <p>
        Welcome to Kamma Seva Samithi, our dedicated community organization serving the spiritual and cultural needs of
        our people. We are committed to preserving and sharing the rich traditions of our heritage while fostering
        community service and spiritual growth.
      </p>
      <p>
        Since our establishment, we have been a beacon of service, providing support to our community members,
        organizing cultural events, and maintaining our sacred traditions. Our samithi serves as a bridge between
        generations, ensuring our values and customs continue to flourish.
      </p>

      <div className="about-cards">
        <AboutCard img="/images/about-1.png" title="Community" desc="Building strong bonds within our diverse community through shared values and traditions." />
        <AboutCard img="/images/about-2.png" title="Spirituality" desc="Fostering spiritual growth through ancient wisdom and modern understanding." />
        <AboutCard img="/images/about-3.png" title="Service" desc="Dedicated to serving our community and spreading compassion to all beings." />
      </div>
    </div>
  );
}

function AboutCard({ img, title, desc }) {
  return (
    <div className="about-card">
      <img src={img} alt={title} className="about-img" />
      <div className="about-title">{title}</div>
      <div className="about-desc">{desc}</div>
    </div>
  );
}

function Field({ label, required, placeholder, name, type="text", value, onChange, as="input" }) {
  return (
    <div className="kss-field">
      <label className="kss-label">
        {label} {required && <span className="req">*</span>}
      </label>
      {as === "textarea" ? (
        <textarea className="kss-input kss-textarea" name={name} required={required} placeholder={placeholder} value={value} onChange={onChange} rows={5} />
      ) : (
        <input className="kss-input" type={type} name={name} required={required} placeholder={placeholder} value={value} onChange={onChange} />
      )}
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phoneUS: "", village: "", mandal: "", district: "" });
  const [status, setStatus] = useState({ ok: null, msg: "" });
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setStatus({ ok: null, msg: "" });
    try {
      const res = await fetch("/api/registration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to submit");
      setStatus({ ok: true, msg: "Registration saved. Thank you!" });
      setForm({ firstName: "", lastName: "", email: "", phoneUS: "", village: "", mandal: "", district: "" });
    } catch (err) { setStatus({ ok: false, msg: err.message }); }
  };

  return (
    <div className="kss-register">
      <h2 className="kss-form-title">Member Registration</h2>
      <form className="kss-form-card" onSubmit={handleSubmit}>
        <div className="kss-form-grid">
          <Field label="First Name" required placeholder="Enter your first name" name="firstName" value={form.firstName} onChange={handleChange} />
          <Field label="Last Name" required placeholder="Enter your Lastname" name="lastName" value={form.lastName} onChange={handleChange} />
          <Field label="Email" required type="email" placeholder="Enter your email address" name="email" value={form.email} onChange={handleChange} />
          <Field label="US Phone Number" required placeholder="(xxx) xxx-xxx" name="phoneUS" value={form.phoneUS} onChange={handleChange} />
        </div>
        <div className="kss-section-sub">India Details</div>
        <div className="kss-form-grid">
          <Field label="Village" required placeholder="Enter your village" name="village" value={form.village} onChange={handleChange} />
          <Field label="Mandal" required placeholder="Enter your mandal" name="mandal" value={form.mandal} onChange={handleChange} />
          <Field label="District" required placeholder="Enter your district" name="district" value={form.district} onChange={handleChange} />
        </div>
        {status.msg && (<div className={"kss-alert " + (status.ok ? "ok" : "err")}>{status.msg}</div>)}
        <button className="btn primary kss-submit" type="submit">Submit</button>
      </form>
    </div>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ ok: null, msg: "" });
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setStatus({ ok: null, msg: "" });
    try {
      const res = await fetch("/api/contactus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to send");
      setStatus({ ok: true, msg: "Message sent. We'll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) { setStatus({ ok:false, msg: err.message }); }
  };

  return (
    <div className="kss-contact">
      <h2 className="kss-form-title">Contact</h2>
      <div className="kss-contact-card">
        <div className="contact-grid">
          <form onSubmit={handleSubmit}>
            <div className="kss-section-sub">Get in Touch</div>
            <div className="kss-form-grid">
              <Field label="Name" required placeholder="Enter your name" name="name" value={form.name} onChange={handleChange} />
              <Field label="Email" required type="email" placeholder="Enter your email address" name="email" value={form.email} onChange={handleChange} />
              <div className="full">
                <Field label="Message" required as="textarea" placeholder="your message..." name="message" value={form.message} onChange={handleChange} />
              </div>
            </div>
            {status.msg && (<div className={"kss-alert " + (status.ok ? "ok" : "err")}>{status.msg}</div>)}
            <button className="btn primary send-btn" type="submit">Send Message</button>
          </form>
          <div className="contact-side">
            <div className="kss-section-sub">Email</div>
            <div className="email-line">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 0 8 6 8-6" stroke="#E6602E" strokeWidth="1.8"/></svg>
              <a href="mailto:info@kammassevasamithi.org">info@kammassevasamithi.org</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Donate() { return (<div className="kss-generic"><h2>Donate</h2><p>Your generous contributions support cultural events, community programs, and temple service activities.</p><button className="btn primary">Donate Now</button></div>); }
function Placeholder({ title }){ return (<div className="kss-generic"><h2>{title}</h2><p>Coming soon.</p></div>); }

const globalCSS = `

/* Registration modal */
.reg-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; z-index:60; }
.reg-modal{ width:min(520px,92vw); background:#fff; border-radius:16px; padding:20px; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.reg-title{ font-weight:800; color:#1d2b20; margin-bottom:8px; }
.reg-actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:10px; }
.reg-choice{ display:flex; gap:8px; }
.chip{ padding:10px 16px; border-radius:9999px; border:1px solid #eee2cf; background:#faf7f0; cursor:pointer; font-weight:700; }
.chip.active{ background:#ffe5d7; border-color:#f0b877; color:#7b3a22; }

/* One-card event layout */
.kss-event{ max-width:980px; margin:0 auto; }
.event-card{
  width:333px; background:#fff; border-radius:12px; overflow:hidden;
  box-shadow:0 10px 24px rgba(0,0,0,.12); cursor:pointer;
  transition:transform .12s ease, box-shadow .2s ease;
}
.event-card:hover{ transform:translateY(-2px); box-shadow:0 14px 30px rgba(0,0,0,.16); }
.event-card.disabled{ opacity:.6; cursor:not-allowed; }
.event-img{ display:block; width:100%; height:auto; }
.event-meta{ padding:10px 12px; text-align:center; }
.event-title{ font-weight:800; color:#1d2b20; }
.event-sub{ color:#6b5b44; font-size:13px; }

/* Quantity modal */
.qty-backdrop{
  position:fixed; inset:0; background:rgba(0,0,0,.35);
  display:flex; align-items:center; justify-content:center; z-index:50;
}
.qty-modal{
  width:min(420px, 92vw); background:#fff; border-radius:16px; padding:20px;
  box-shadow:0 20px 60px rgba(0,0,0,.25);
}
.qty-title{ font-weight:800; color:#1d2b20; margin-bottom:8px; }
.qty-row{ display:flex; align-items:center; gap:12px; margin:10px 0 6px; }
.qty-row label{ min-width:150px; color:#3c2b17; font-weight:700; }
.qty-total{ margin:8px 0 14px; color:#7b3a22; font-weight:800; }
.qty-actions{ display:flex; gap:10px; justify-content:flex-end; }


/* keep site-wide CTAs bigger + rounded like home */
.btn, .btn.primary,  .kss-submit, .send-btn{
  border-radius:9999px; padding:14px 24px; font-size:16px; font-weight:700;background-color:red;
}

.btn.ghost, .btn.outline{border-radius:9999px; padding:14px 24px; font-size:16px; font-weight:700;background-color:white}

:root{ --sidebar-bg:#FFF6E6; --accent:#E6602E; --accent-700:#C94919; --text:#2B2B2B; --card-bg:#FFFFFF; --shadow:0 8px 24px rgba(0,0,0,.08); }
*{box-sizing:border-box} html,body,#root{height:100%}
body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Noto Sans,Helvetica,Arial; color:var(--text)}
.kss-app{min-height:100vh; display:flex;}
.kss-sidebar{width:200px; background:#FFF6E6; border-right:1px solid #f0e2c9; padding:18px 14px;}
.kss-brand{display:flex; align-items:center; gap:10px; margin-bottom:18px;}
.kss-logo{width:44px; height:44px; object-fit:contain; border-radius:8px}
.kss-title{font-size:13px; font-weight:700; letter-spacing:.4px; color:#c2431f}
.kss-nav{display:flex; flex-direction:column; gap:8px; margin-top:6px}
.kss-nav-item{appearance:none; border:0; text-align:left; padding:9px 12px; border-radius:8px; background:transparent; cursor:pointer; font-size:14px; color:#5b5243}
.kss-nav-item:hover{background:#fdebd6}
.kss-nav-item.active{background:linear-gradient(180deg,#ffd9b4,#ffc88e); color:#7b3a22; font-weight:600; box-shadow:inset 0 0 0 1px #f4b06a}
.kss-main{flex:1; background:linear-gradient(180deg,#f7c14a 0%, #e68a1d 65%, #d96e12 100%);} 
.kss-home,.kss-about,.kss-generic,.kss-register,.kss-contact{max-width:980px; margin:0 auto; padding:28px 24px 60px}
/* hero */ .kss-hero{display:flex; flex-direction:column; align-items:center; text-align:center; margin-top:10px; position:relative}
.kss-hero-imgwrap{position:relative; width:min(400px,72vw); filter:drop-shadow(0 18px 36px rgba(0,0,0,.28));}
.kss-hero-img{width:100%; height:auto; display:block}
.kss-hero-badge{position:absolute; left:50%; transform:translate(-50%, -54%); top:17px; width:120px; height:auto; mix-blend-mode:multiply}
.kss-hero-fade{position:absolute; inset:auto 0 -8px 0; height:90px; background:linear-gradient(180deg, rgba(247,193,74,0) 0%, rgba(217,110,18,0.35) 70%, rgba(217,110,18,0.65) 100%); pointer-events:none}
.telugu{font-weight:800; color:white; margin:18px 0 4px; font-size:22px; letter-spacing:.2px; text-shadow:0 1px 0 rgba(255,255,255,.25);} 
.kss-welcome{margin:2px 0 6px; font-size:20px; color:#b2451c; font-weight:700; letter-spacing:.2px}
.kss-sub{max-width:740px; color:#3d2b19; opacity:.9}
.kss-cta-row{display:flex; gap:12px; margin-top:16px}
/* cards */ .kss-cards{display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:24px; margin:32px 0}
.kss-card{background:var(--card-bg); border-radius:18px; padding:22px 20px; box-shadow:var(--shadow); text-align:center}
.kss-card-icon{width:56px; height:56px; display:grid; place-items:center; margin:0 auto 12px; border-radius:50%; color:var(--accent); background:#fff2ea; box-shadow:inset 0 0 0 1px #ffd9c8}
.kss-card-title{font-weight:700; color:#7b3a22; margin-bottom:8px}
.kss-card-desc{color:#5b5243; min-height:48px}
/* about cards */ .about-cards{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:28px; margin-top:22px}
.about-card{text-align:center}
.about-img{width:100%; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,.18)}
.about-title{margin-top:10px; font-weight:800; color:#c25322}
.about-desc{color:#3c2b17; max-width:320px; margin:6px auto 0}
/* shared form */ .kss-form-title{color:#b6471c; margin: 6px 0 16px; font-weight:700}
.kss-form-card{background:#fff; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.12); padding:22px; border:1px solid #f1e5cf}
.kss-form-grid{display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:16px 20px; margin-bottom:10px}
.kss-section-sub{color:#94641a; font-weight:700; margin:10px 0}
.kss-field{display:flex; flex-direction:column}
.kss-label{font-size:14px; color:#3c2b17; margin-bottom:6px; font-weight:700}
.kss-label .req{color:#d23c14}
.kss-input{width:100%; height:40px; padding:8px 12px; border-radius:6px; border:1px solid #eee2cf; outline:none; background:#faf7f0}
.kss-textarea{height:auto; resize:vertical}
.kss-input::placeholder{color:#b3a58e}
.kss-input:focus{border-color:#f0b877; background:#fff}
.kss-alert{margin:6px 0 0; padding:10px 12px; border-radius:8px; font-weight:600}
.kss-alert.ok{background:#eaf8ec; color:#20663a; border:1px solid #bce3c6}
.kss-alert.err{background:#fff1f0; color:#8a1a12; border:1px solid #ffd2cf}
.kss-submit{background-color: #F54800;width:100%; margin-top:12px}
/* contact */ .kss-contact-card{background:#fff; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.12); padding:22px; border:1px solid #f1e5cf}
.contact-grid{display:grid; grid-template-columns:2fr 1fr; gap:28px; align-items:start}
.contact-grid .full{grid-column:1 / -1}
.send-btn{border-radius: 8px; background-color: #F54800; width:100%; margin-top:10px}
.contact-side{padding-top:28px}
.email-line{display:flex; gap:8px; align-items:center}
.email-line a{color:#7b3a22; font-weight:700; text-decoration:none}
.email-line a:hover{text-decoration:underline}
/* Generic */ .kss-generic h2{color:#b6471c} .kss-generic p{max-width:720px; color:#3c2b17}
/* responsive */ @media (max-width: 980px){ .kss-cards{grid-template-columns:1fr} .about-cards{grid-template-columns:1fr} .kss-sidebar{width:176px} }
@media (max-width: 700px){ .kss-app{flex-direction:column} .kss-sidebar{width:100%; border-right:none; border-bottom:1px solid #f0e2c9} .kss-nav{flex-direction:row; flex-wrap:wrap} .kss-form-grid{grid-template-columns:1fr} .contact-grid{grid-template-columns:1fr} }
`


;
