"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useT } from "../i18n/useT";
import { useLocaleConfig } from "./DictionaryProvider";

export default function ContactForm() {
  const t = useT();
  const { locale } = useLocaleConfig();
  const [topic, setTopic] = useState("bug");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const contactEmail = locale === 'ro' ? 'ciocnim@mail.com' : 'trosc.fun@mail.com';

  const handleSubmit = async () => {
    if (!message.trim() || message.trim().length < 5) {
      setStatus(t('contactForm.tooShort'));
      return;
    }
    setSending(true);
    setStatus("");
    try {
      const res = await fetch("/api/ciocnire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actiune: "contact-submit",
          topic,
          message: message.trim(),
          email: email.trim(),
          locale,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(t('contactForm.success'));
        setMessage("");
        setEmail("");
      } else {
        setStatus(t('contactForm.error') + " " + (data.error || ""));
      }
    } catch {
      setStatus(t('contactForm.netError'));
    } finally {
      setSending(false);
    }
  };

  const TOPICS = [
    { key: "bug", label: t('contactForm.topicBug') },
    { key: "suggestion", label: t('contactForm.topicSuggestion') },
    { key: "compliment", label: t('contactForm.topicCompliment') },
    { key: "other", label: t('contactForm.topicOther') },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-card border border-edge rounded-3xl p-6"
    >
      <h2 className="text-lg font-black text-heading mb-1">{t('contactForm.title')}</h2>
      <p className="text-xs text-dim mb-4">{t('contactForm.subtitle')}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {TOPICS.map((tp) => (
          <button
            key={tp.key}
            onClick={() => setTopic(tp.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              topic === tp.key
                ? "bg-red-800 text-white border border-red-600"
                : "bg-elevated text-dim border border-edge hover:text-body"
            }`}
          >
            {tp.label}
          </button>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => { setMessage(e.target.value); setStatus(""); }}
        placeholder={t('contactForm.placeholder')}
        rows={4}
        maxLength={2000}
        className="w-full px-4 py-3 bg-elevated border border-edge-strong rounded-xl text-body outline-none focus:border-red-700 text-sm mb-2 resize-y"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('contactForm.emailPlaceholder')}
        autoComplete="email"
        className="w-full px-4 py-3 bg-elevated border border-edge-strong rounded-xl text-body outline-none focus:border-red-700 text-sm mb-3"
      />
      <button
        onClick={handleSubmit}
        disabled={sending}
        className="w-full py-3 bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-black text-sm transition-all active:scale-95"
      >
        {sending ? t('contactForm.sending') : t('contactForm.send')}
      </button>
      {status && <p className="text-xs mt-2 text-center font-bold">{status}</p>}

      <p className="text-[11px] text-muted mt-4 text-center">
        {t('contactForm.orDirectly')} <a href={`mailto:${contactEmail}`} className="text-red-400 hover:text-red-300 transition-colors">{contactEmail}</a>
      </p>
    </motion.section>
  );
}
