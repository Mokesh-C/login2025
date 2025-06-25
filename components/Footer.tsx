'use client'

import { Instagram, Mail, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      id="footer-section"
      className="
        /* --- background & glass effect --- */
        bg-gradient-to-br from-[#251840] to-[#140b29]
        bg-white/5
        backdrop-blur-sm
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]

        /* --- text & border colours from Tailwind palette --- */
        text-neutral-white
        border-t border-neutral-muted  /* first colour */
        border border-white/10         /* final colour (matches old override) */

      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-12 md:grid-cols-3">
        {/* ─────────────────── Location / Map ─────────────────── */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-accent-cyan">Location</h3>

          <div className="rounded-lg overflow-hidden shadow-md h-56 w-full">
            <iframe
              className="w-full h-full border-0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.1914293960344!2d77.00024787355565!3d11.02425965457647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8582f1435fa59%3A0x137d95bfd8909293!2sPSG%20College%20Of%20Technology%20-!5e0!3m2!1sen!2sin!4v1723285596362!5m2!1sen!2sin"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* ─────────────────── Bus Route Info ─────────────────── */}
        <div className="space-y-4 text-sm">
          <h3 className="text-xl font-semibold text-accent-cyan">Bus Routes</h3>

          <div>
            <p className="font-medium">Gandhipuram → PSG Tech</p>
            <p className="text-neutral-muted">
              105C, 108A, 19C, 19D, 20A, 20D, 30D, 40A, 40B
            </p>
          </div>

          <div>
            <p className="font-medium">Singanallur → PSG Tech</p>
            <p className="text-neutral-muted">140, S11, S1, S16, S21B</p>
          </div>

          <div>
            <p className="font-medium">Ukkadam / Railway Station → PSG Tech</p>
            <p className="text-neutral-muted">90A, 16C, 16B, 10A, S7A</p>
          </div>
        </div>

        {/* ─────────────────── Contact & Social ─────────────────── */}
        <div className="space-y-6 text-sm">
          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold text-accent-cyan">Contact</h3>
            <p className="mt-2 text-neutral-muted">Peelamedu, Coimbatore – 641004</p>
            <p className="mt-1 text-neutral-muted">
              Email:{' '}
              <Link
                href="mailto:login@psgtech.ac.in"
                className="underline hover:text-accent-cyan"
              >
                login@psgtech.ac.in
              </Link>
            </p>
          </div>

          {/* Phone */}
          <div>
            <h4 className="text-sm font-semibold text-gradient-1 mb-1">Phone</h4>
            <p>
              <Link href="tel:+918248384721" className="hover:underline">
                +91 82483 84721
              </Link>
            </p>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-gradient-1 mb-2">Follow Us</h4>
            <div className="flex gap-4 text-accent">
              <Link
                href="https://www.instagram.com/loginpsgtech/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5 hover:text-pink-500 transition" />
              </Link>
              <Link href="mailto:login@psgtech.ac.in">
                <Mail className="w-5 h-5 hover:text-cyan-400 transition" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/login-psg-tech/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-5 h-5 hover:text-blue-500 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────── Bottom Copyright ─────────────────── */}
      <div className="text-center text-md text-neutral-muted py-4 border-t border-accent">
        © {new Date().getFullYear()} PSG College of Technology. All rights reserved.
      </div>
    </footer>
  )
}
