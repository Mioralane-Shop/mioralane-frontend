"use client";

import { useState } from "react";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { SITE_WHATSAPP } from "@/constants/site";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Contact
        </span>
        <h1 className="mt-3 text-4xl font-serif font-medium text-ink">
          We&apos;d love to hear from you
        </h1>
        <p className="mt-3 text-ink/50">
          Questions about an order, a product, or your routine? Send us a
          message and we&apos;ll get back to you within 24 hours.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-5">
        {/* Info */}
        <div className="space-y-6 md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface">
              <MessageCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">WhatsApp</p>
              <a
                href={`https://wa.me/${SITE_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink/50 transition-colors hover:text-accent"
              >
                +880 17XX-XXXXXXX
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Email</p>
              <a
                href="mailto:hello@mioralane.com"
                className="text-sm text-ink/50 transition-colors hover:text-accent"
              >
                hello@mioralane.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Location</p>
              <p className="text-sm text-ink/50">Dhaka, Bangladesh</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Hours</p>
              <p className="text-sm text-ink/50">
                Sun – Sat · 10:00 AM – 10:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          {submitted ? (
            <div className="rounded-2xl border border-ink/10 bg-surface p-10 text-center">
              <p className="text-2xl">✅</p>
              <h2 className="mt-3 text-xl font-serif font-medium text-ink">
                Message sent!
              </h2>
              <p className="mt-2 text-sm text-ink/50">
                Thanks for reaching out. We&apos;ll get back to you within 24
                hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                  placeholder="Tell us more..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
