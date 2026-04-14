"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactForm() {
  const [topic, setTopic] = useState("bug");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || message.trim().length < 5) {
      setStatus("❌ Mesaj prea scurt");
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
          locale: "ro",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ Mesaj trimis! Mulțumesc.");
        setMessage("");
        setEmail("");
      } else {
        setStatus("❌ " + (data.error || "Eroare"));
      }
    } catch {
      setStatus("❌ Eroare rețea");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-card border border-edge rounded-3xl p-6"
    >
      <h2 className="text-lg font-black text-heading mb-1">💬 Spune-mi ce crezi</h2>
      <p className="text-xs text-dim mb-4">Bug, idee, compliment — orice. Citesc tot.</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { key: "bug", label: "🐛 Bug" },
          { key: "suggestion", label: "💡 Sugestie" },
          { key: "compliment", label: "❤️ Compliment" },
          { key: "other", label: "💭 Altceva" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTopic(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              topic === t.key
                ? "bg-red-800 text-white border border-red-600"
                : "bg-elevated text-dim border border-edge hover:text-body"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => { setMessage(e.target.value); setStatus(""); }}
        placeholder="Scrie aici..."
        rows={4}
        maxLength={2000}
        className="w-full px-4 py-3 bg-elevated border border-edge-strong rounded-xl text-body outline-none focus:border-red-700 text-sm mb-2 resize-y"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (opțional — doar dacă vrei să-ți răspund)"
        autoComplete="email"
        className="w-full px-4 py-3 bg-elevated border border-edge-strong rounded-xl text-body outline-none focus:border-red-700 text-sm mb-3"
      />
      <button
        onClick={handleSubmit}
        disabled={sending}
        className="w-full py-3 bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-black text-sm transition-all active:scale-95"
      >
        {sending ? "..." : "📨 Trimite"}
      </button>
      {status && <p className="text-xs mt-2 text-center font-bold">{status}</p>}

      <p className="text-[11px] text-muted mt-4 text-center">
        Sau direct la <a href="mailto:ciocnim@mail.com" className="text-red-400 hover:text-red-300 transition-colors">ciocnim@mail.com</a>
      </p>
    </motion.section>
  );
}
