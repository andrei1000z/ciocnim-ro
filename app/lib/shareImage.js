/**
 * Generate result share image as Blob via canvas.
 * Used post-battle la butonul "Share rezultat".
 * Returnează un Blob PNG sau null dacă canvas fail.
 */
export async function generateResultImage({ win, playerName, wins, losses, site = "ciocnim.ro" }) {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background gradient — verde pentru win, roșu pentru loss
    const grad = ctx.createRadialGradient(540, 400, 100, 540, 540, 800);
    if (win) {
      grad.addColorStop(0, "#16a34a");
      grad.addColorStop(0.5, "#14532d");
      grad.addColorStop(1, "#052e16");
    } else {
      grad.addColorStop(0, "#dc2626");
      grad.addColorStop(0.5, "#7f1d1d");
      grad.addColorStop(1, "#0c0a0a");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Textured noise overlay (dots subtle)
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1080;
      const y = Math.random() * 1080;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Big 🥚 emoji în centru-sus
    ctx.font = "240px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(win ? "🥚" : "💔", 540, 320);

    // Status (WIN / LOSS)
    ctx.font = "bold 120px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = win ? "#bbf7d0" : "#fecaca";
    ctx.fillText(win ? "AM CÂȘTIGAT!" : "AM PIERDUT", 540, 520);

    // Player name
    ctx.font = "bold 80px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(playerName || "JUCATOR", 540, 640);

    // Stats
    ctx.font = "600 54px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(`${wins || 0} victorii · ${losses || 0} înfrângeri`, 540, 740);

    // Footer brand
    ctx.font = "bold 52px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(`🥚 ${site}`, 540, 920);

    // Subtitle
    ctx.font = "38px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Ciocnește ouă de Paște online", 540, 980);

    return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  } catch (e) {
    return null;
  }
}

/**
 * Shareează rezultatul ca imagine via Web Share API (dacă suportat),
 * altfel fallback la download.
 */
export async function shareResultImage(opts) {
  const blob = await generateResultImage(opts);
  if (!blob) return { ok: false, reason: "no-canvas" };
  const file = new File([blob], "ciocnim-rezultat.png", { type: "image/png" });
  const shareData = {
    title: "Ciocnim.ro",
    text: opts.win
      ? `🥚 Am câștigat la ciocnit ouă online! ${opts.wins} victorii pe ${opts.site}`
      : `🥚 Joc ciocnit ouă online pe ${opts.site}`,
    files: [file],
  };
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share(shareData);
      return { ok: true, method: "native" };
    }
  } catch (e) {}
  // Fallback: download
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ciocnim-rezultat.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true, method: "download" };
  } catch (e) {
    return { ok: false, reason: "fallback-failed" };
  }
}
