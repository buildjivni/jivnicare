export const BIHAR_DISTRICTS = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
  "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur",
  "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger",
  "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa",
  "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
  "Vaishali", "West Champaran", "Deoghar"
];

export function normalizeDistrict(d: string | null | undefined): string {
  if (!d) return "";
  const cleaned = d.trim().toLowerCase();
  if (!cleaned) return "";
  
  // Quick lookup to maintain exact canonical casing
  const match = BIHAR_DISTRICTS.find(dist => dist.toLowerCase() === cleaned);
  if (match) return match;

  // Fallback title-case
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
