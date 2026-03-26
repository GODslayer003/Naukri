const CANONICAL_ZONES = ["North", "South", "East", "West"];

const normalizeZoneInput = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  const found = CANONICAL_ZONES.find((zone) => zone.toLowerCase() === normalized);
  return found || "";
};

const inferZoneFromTerritory = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  if (/\bnorth\b/.test(normalized)) {
    return "North";
  }

  if (/\bsouth\b/.test(normalized)) {
    return "South";
  }

  if (/\beast\b/.test(normalized)) {
    return "East";
  }

  if (/\bwest\b/.test(normalized)) {
    return "West";
  }

  return "";
};

const buildZoneRegex = (zone = "") => {
  const normalizedZone = normalizeZoneInput(zone);
  if (!normalizedZone) {
    return null;
  }

  return new RegExp(`\\b${normalizedZone}\\b`, "i");
};

module.exports = {
  CANONICAL_ZONES,
  normalizeZoneInput,
  inferZoneFromTerritory,
  buildZoneRegex,
};
