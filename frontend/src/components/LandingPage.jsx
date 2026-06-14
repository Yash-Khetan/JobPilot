import { motion } from 'framer-motion'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] },
})

const painPoints = [
  'Internshala', 'LinkedIn', 'Naukri', 'Indeed', 'AngelList',
  'Wellfound', 'Unstop', 'HackerRank', 'Glassdoor', 'Monster',
  'Internshala', 'LinkedIn', 'Naukri', 'Indeed', 'AngelList',
  'Wellfound', 'Unstop', 'HackerRank', 'Glassdoor', 'Monster',
]

function LandingPage({ onGetStarted }) {
  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <motion.div className="hero__tag" {...fade(0.1)}>
          <div className="hero__tag-line" />
          for students, by someone who gets it
        </motion.div>

        <motion.h1 className="hero__headline" {...fade(0.2)}>
          Stop opening<br />
          <em>10 tabs</em> to find<br />
          one internship.
        </motion.h1>

        <motion.p className="hero__sub" {...fade(0.35)}>
          You shouldn't have to juggle Internshala, LinkedIn, Naukri, and 
          seven other portals every morning. <strong>Job Pilot does the hunting 
          — you just pick what fits.</strong>
        </motion.p>

        <motion.div className="hero__cta-row" {...fade(0.5)}>
          <button className="btn btn--primary" onClick={onGetStarted} id="cta-search">
            Start searching →
          </button>
          <button className="btn btn--ghost" onClick={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            How it works
          </button>
        </motion.div>
      </section>

      {/* ── PAIN MARQUEE ── */}
      <div className="pain-strip">
        <div className="pain-strip__track">
          {painPoints.map((p, i) => (
            <span className="pain-strip__item" key={i}>
              <span>✕</span> opened {p} <span>✕</span> no results <span>✕</span> repeat
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="how" id="how-it-works">
        <motion.div className="section-label" {...fade(0)}>How it works</motion.div>
        <motion.h2 className="section-title" {...fade(0.1)}>
          Three fields. One click. Done.
        </motion.h2>

        <div className="steps">
          {[
            {
              n: '01',
              title: 'Tell us what you want',
              desc: 'Type your role and city. Want a minimum stipend? Add that too. That\'s literally it.',
            },
            {
              n: '02',
              title: 'We scrape in real-time',
              desc: 'Job Pilot hits Internshala live — no stale databases, no cached results from 3 weeks ago. Fresh listings only.',
            },
            {
              n: '03',
              title: 'Apply directly',
              desc: 'Every result has a direct link to the listing. Click, apply, close the tab. No middlemen, no sign-up walls.',
            },
          ].map((step, i) => (
            <motion.div
              className="step"
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="step__number">{step.n}</div>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <motion.section
        className="bottom-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="bottom-cta__text">Your internship hunt shouldn't feel like a job.</h2>
        <p className="bottom-cta__sub">Let Job Pilot do the boring part.</p>
        <button className="btn btn--primary" onClick={onGetStarted}>
          Search internships →
        </button>
      </motion.section>

      <footer className="footer">
        built because we were tired of the same grind · jobpilot © 2025
      </footer>
    </>
  )
}

export default LandingPage
