import { Link } from 'react-router-dom'
import { Activity, Github, Mail, Shield, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-medical-600 flex items-center justify-center">
                <Activity size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">MedVision AI</p>
                <p className="text-2xs text-slate-500">Medical Imaging Intelligence</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Enterprise-grade AI-powered medical image interpretation platform for radiologists,
              hospitalists, and healthcare professionals.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Shield size={14} className="text-health-500" />
              <span className="text-xs text-slate-500">HIPAA-compatible architecture</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Platform</p>
            <ul className="space-y-3">
              {[
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Analysis History', to: '/history' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Information</p>
            <ul className="space-y-3">
              {[
                'NIH Chest X-ray 14',
                'MIMIC-CXR Dataset',
                'Stanford CheXpert',
                'ACR Reporting Standards',
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm text-slate-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} MedVision AI. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for healthcare
          </p>
          <p className="text-xs text-slate-600 text-center sm:text-right max-w-sm">
            ⚠ AI-generated reports are for research and informational purposes only.
            Not a substitute for professional medical diagnosis.
          </p>
        </div>
      </div>
    </footer>
  )
}
