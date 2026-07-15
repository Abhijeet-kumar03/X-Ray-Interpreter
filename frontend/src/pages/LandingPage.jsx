import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import Stats from '../components/landing/Stats'
import Footer from '../components/landing/Footer'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Stats />

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors">
        <div className="section-container text-center">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Ready to transform your diagnostic workflow?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto"
          >
            Start analyzing medical scans with AI-powered precision in seconds.
            No setup required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/login"
              className="btn-primary btn-xl inline-flex shadow-lg hover:shadow-xl"
              id="landing-cta-button"
            >
              Launch Platform
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
