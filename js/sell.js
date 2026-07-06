// ============================================================
// Home-value form — no API, no backend, no monthly bill.
// It opens the visitor's own email app with a pre-written
// report request addressed to Jessica.
//
// TO ACTIVATE: put Jessica's email address between the quotes
// below. Until then the form runs in preview mode (shows a
// confirmation but doesn't open the email app).
// ============================================================
const JESSICA_EMAIL = ""; // e.g. "jessica.mackrael@cbrealty.com"

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("value-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = document.getElementById("value-note");
    const val = (id) => (document.getElementById(id) || {}).value || "";
    const checked = (id) => (document.getElementById(id) || {}).checked;

    // simple required-field check
    if (!val("v-address").trim() || !val("v-zip").trim() || !val("v-name").trim() || !val("v-email").trim()) {
      note.style.display = "block";
      note.textContent = "Please fill in the address, zip code, your name, and your email so Jessica can send your report.";
      return;
    }

    const prefs = [checked("v-c-email") && "Email", checked("v-c-phone") && "Phone", checked("v-c-text") && "Text"]
      .filter(Boolean).join(", ") || "Email";

    const body = [
      "Hi Jessica,",
      "",
      "I'd like a complimentary home valuation report.",
      "",
      "Property address: " + val("v-address") + " (" + val("v-zip") + ")",
      "Approx. size: " + val("v-sqft") + " sq ft",
      "Beds: " + val("v-beds") + "  |  Baths: " + val("v-baths"),
      "",
      "Name: " + val("v-name"),
      "Email: " + val("v-email"),
      "Phone: " + (val("v-phone") || "—"),
      "Preferred contact: " + prefs,
    ].join("\n");

    if (JESSICA_EMAIL) {
      const subject = "Home Valuation Request — " + val("v-address");
      window.location.href = "mailto:" + JESSICA_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      note.style.display = "block";
      note.textContent = "Your email app should open with your request ready to send. Prefer to talk now? Call or text 850.687.9888.";
    } else {
      // Preview mode — email address not configured yet
      note.style.display = "block";
      note.textContent = "Thank you, " + val("v-name").split(" ")[0] + " — your valuation request is noted. (Design preview: submissions activate once Jessica's email is connected. For a valuation today, call or text 850.687.9888.)";
      form.reset();
    }
  });
});
