// =========================================================
// BUSINESS SETTINGS
// Edit these values directly, then commit the change on GitHub.
// No Firebase, no database, no card needed — this whole site
// runs as plain files.
// =========================================================

const BUSINESS = {
  name: "SG92 Box Cricket Arena",
  // Country code + number, no + and no spaces, e.g. 91 then your 10-digit number
  whatsappNumber: "919999999999",
  defaultWhatsappMessage: "Hi! I'd like to check slot availability at SG92 Box Cricket Arena."
};

function waLink(message) {
  const text = encodeURIComponent(message || BUSINESS.defaultWhatsappMessage);
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${text}`;
}
