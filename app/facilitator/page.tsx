'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { loadFacilitatorConfig } from '@/lib/storage';

export default function FacilitatorLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const config = loadFacilitatorConfig();
    const correctPin = config.pin || process.env.NEXT_PUBLIC_FACILITATOR_PIN || '1234';
    if (pin === correctPin) {
      sessionStorage.setItem('cbi_facilitator_auth', 'true');
      router.push('/facilitator/dashboard');
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#F8F9FC' }}>
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-xl border shadow-sm p-8" style={{ borderColor: '#E2E4EF' }}>
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEEAF7', color: '#6B3FA0' }}>
              <Lock size={22} />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-center mb-1" style={{ color: '#1A1A2E' }}>
            Facilitator access
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: '#5A5A7A' }}>
            Enter your PIN to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(''); }}
                placeholder="Enter PIN"
                className="w-full px-4 py-3 rounded-lg border text-center text-2xl tracking-widest outline-none focus:ring-2"
                style={{ borderColor: error ? '#dc2626' : '#E2E4EF', color: '#1A1A2E' }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#5A5A7A' }}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!pin}
              className="w-full py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#1C2C6E' }}
            >
              Continue
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: '#5A5A7A' }}>
            Default PIN is <span className="font-mono font-semibold">1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
