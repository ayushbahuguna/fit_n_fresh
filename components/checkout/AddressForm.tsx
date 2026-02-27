'use client';

import { useState } from 'react';
import type { Address } from '@/types';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

interface FormState {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default: boolean;
}

interface Props {
  onSuccess: (address: Address) => void;
  onCancel?: () => void;
}

const EMPTY: FormState = {
  name: '', line1: '', line2: '', city: '',
  state: '', pincode: '', phone: '', is_default: false,
};

export default function AddressForm({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function setField(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.line1.trim()) errs.line1 = 'Address line 1 is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state) errs.state = 'Please select a state';
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setServerError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, line2: form.line2.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message ?? 'Failed to save address');
        return;
      }
      onSuccess(data.data as Address);
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      {/* Name + Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Full Name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Recipient's full name"
            autoComplete="name"
            className={inputCls(!!errors.name)}
          />
        </FormField>

        <FormField label="Mobile Number" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="10-digit number"
            maxLength={10}
            inputMode="numeric"
            autoComplete="tel"
            className={inputCls(!!errors.phone)}
          />
        </FormField>
      </div>

      {/* Line 1 */}
      <FormField label="Address Line 1" error={errors.line1}>
        <input
          type="text"
          value={form.line1}
          onChange={(e) => setField('line1', e.target.value)}
          placeholder="Flat / House no., Street name"
          autoComplete="address-line1"
          className={inputCls(!!errors.line1)}
        />
      </FormField>

      {/* Line 2 */}
      <FormField label="Address Line 2" hint="Optional">
        <input
          type="text"
          value={form.line2}
          onChange={(e) => setField('line2', e.target.value)}
          placeholder="Landmark, Area"
          autoComplete="address-line2"
          className={inputCls(false)}
        />
      </FormField>

      {/* City + Pincode */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="City" error={errors.city}>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
            placeholder="City"
            autoComplete="address-level2"
            className={inputCls(!!errors.city)}
          />
        </FormField>

        <FormField label="Pincode" error={errors.pincode}>
          <input
            type="text"
            value={form.pincode}
            onChange={(e) => setField('pincode', e.target.value)}
            placeholder="6-digit PIN"
            maxLength={6}
            inputMode="numeric"
            autoComplete="postal-code"
            className={inputCls(!!errors.pincode)}
          />
        </FormField>
      </div>

      {/* State */}
      <FormField label="State" error={errors.state}>
        <select
          value={form.state}
          onChange={(e) => setField('state', e.target.value)}
          className={inputCls(!!errors.state)}
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FormField>

      {/* Default toggle */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => setField('is_default', e.target.checked)}
          className="h-4 w-4 rounded border-surface-border accent-primary"
        />
        <span className="text-sm text-ink-muted">Set as my default address</span>
      </label>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {submitting ? 'Saving…' : 'Save Address'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-xl border px-4 py-2.5 text-sm text-ink placeholder:text-ink-subtle bg-white',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
    hasError ? 'border-red-400' : 'border-surface-border',
  ].join(' ');
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <span className="text-xs text-ink-subtle">({hint})</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
