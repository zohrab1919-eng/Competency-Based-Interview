'use client';

import Link from 'next/link';
import { Users, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#F8F9FC' }}>
      <div className="max-w-md w-full text-center mb-10">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4" style={{ backgroundColor: '#E8EBF7', color: '#1C2C6E' }}>
          Enablerz Consulting & Solutions
        </div>
        <h1 className="text-3xl font-semibold mb-2" style={{ color: '#1A1A2E' }}>
          CBI Practice App
        </h1>
        <p className="text-sm" style={{ color: '#5A5A7A' }}>
          Competency-based interview simulator using the S.T.A.R. technique
        </p>
      </div>

      <div className="max-w-md w-full space-y-4">
        <Link
          href="/participant"
          className="flex items-center gap-4 w-full p-5 rounded-xl border shadow-sm bg-white hover:shadow-md transition-shadow"
          style={{ borderColor: '#E2E4EF' }}
        >
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F4F6', color: '#1A7B8A' }}>
            <Users size={24} />
          </div>
          <div className="text-left">
            <div className="font-semibold" style={{ color: '#1A1A2E' }}>Join as participant</div>
            <div className="text-sm mt-0.5" style={{ color: '#5A5A7A' }}>Enter your name and session code to begin your practice interview</div>
          </div>
        </Link>

        <Link
          href="/facilitator"
          className="flex items-center gap-4 w-full p-5 rounded-xl border shadow-sm bg-white hover:shadow-md transition-shadow"
          style={{ borderColor: '#E2E4EF' }}
        >
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEEAF7', color: '#6B3FA0' }}>
            <Settings size={24} />
          </div>
          <div className="text-left">
            <div className="font-semibold" style={{ color: '#1A1A2E' }}>Facilitator setup</div>
            <div className="text-sm mt-0.5" style={{ color: '#5A5A7A' }}>Configure sessions, manage personas, and view participant debriefs</div>
          </div>
        </Link>
      </div>

      <p className="mt-12 text-xs" style={{ color: '#5A5A7A' }}>
        CBI Practice App · Enablerz Consulting & Solutions
      </p>
    </div>
  );
}
