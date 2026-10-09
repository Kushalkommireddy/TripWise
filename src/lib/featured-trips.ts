// The authoritative content for TripWise's 5 featured destinations — sourced
// directly from hand-compiled research (official tourism board pages,
// district tourism sites), not AI-generated. Real places, real routes, real
// day-by-day plans, real budget ranges from Hyderabad. See `sources` at the
// bottom for what backs each destination's facts.
//
// This is deliberately NOT run through the AI itinerary generator — it's
// ground-truth data, more reliable than anything an LLM would produce, and
// is offered to users as-is (with an "always verify before booking" note)
// alongside the AI-assisted option for custom place selections.

export type PlacePriority = "High priority" | "Recommended" | "Optional" | "Alternative" | "Extension";

export type FeaturedPlace = {
  name: string;
  category: string;
  whyVisit: string;
  priority: PlacePriority;
  planningNote: string;
  lat: number;
  lng: number;
};

export type PlanDay = {
  day: number;
  base: string;
  morning: string;
  afternoon: string;
  evening: string;
  transport: string;
  planningNote: string;
  spendEstimate: string; // e.g. "₹2,000–₹3,000" per person, on-ground only
};

export type BudgetBreakdown = {
  total: string;
  accommodation: string;
  food: string;
  transport: string;
  activitiesAndBuffer: string;
  assumptions: string;
};

export type FeaturedDestination = {
  slug: string;
  name: string;
  idealDuration: string;
  budgetRoute: string;
  estimatedBudgetFromHyderabad: string;
  bestSeason: string;
  coreExperience: string;
  places: FeaturedPlace[];
  plan: PlanDay[];
  budget: BudgetBreakdown;
  researchNote: string;
};

export const featuredDestinations: FeaturedDestination[] = [
  {
    slug: "leh-ladakh",
    name: "Leh-Ladakh",
    idealDuration: "9–11 days",
    budgetRoute: "Leh → Sham/Lamayuru → Nubra → Pangong → Leh",
    estimatedBudgetFromHyderabad: "₹35,000–₹55,000",
    bestSeason: "May–Sep, subject to conditions",
    coreExperience: "High-altitude lakes, monasteries, valleys",
    researchNote: "Official Ladakh tourism lists Pangong, Nubra, Lamayuru, Hemis, Alchi, Thiksey and other attractions; route/permit conditions can change.",
    places: [
      { name: "Pangong Lake", category: "Iconic / must-see", whyVisit: "Lake + mountain landscape", priority: "High priority", planningNote: "High altitude; road/weather dependent", lat: 33.7601, lng: 78.6675 },
      { name: "Nubra Valley", category: "Iconic / must-see", whyVisit: "Valley, dunes, monasteries", priority: "High priority", planningNote: "Khardung La route subject to conditions", lat: 34.6803, lng: 77.5619 },
      { name: "Thiksey Monastery", category: "Top cultural", whyVisit: "Monastery + Indus Valley views", priority: "High priority", planningNote: "Easy from Leh", lat: 34.0570, lng: 77.6910 },
      { name: "Leh Palace + Shanti Stupa", category: "Top cultural", whyVisit: "Heritage + panoramic views", priority: "High priority", planningNote: "After acclimatization", lat: 34.1665, lng: 77.5852 },
      { name: "Lamayuru", category: "Scenic/cultural", whyVisit: "Moonland + monastery", priority: "High priority", planningNote: "Sham circuit", lat: 34.2946, lng: 76.7810 },
      { name: "Alchi", category: "Cultural / underrated", whyVisit: "Ancient art/monastery", priority: "Recommended", planningNote: "Combine with Lamayuru", lat: 34.2333, lng: 77.1667 },
      { name: "Turtuk", category: "Less visited", whyVisit: "Balti village culture", priority: "Optional", planningNote: "Adds distance", lat: 34.9333, lng: 76.9833 },
      { name: "Tso Moriri", category: "Remote / underrated", whyVisit: "Remote high-altitude lake", priority: "Alternative", planningNote: "Do not force into core route", lat: 32.9022, lng: 78.3197 },
      { name: "Hemis", category: "Cultural", whyVisit: "Monastery + landscape", priority: "Recommended", planningNote: "Festival timing changes experience", lat: 33.9068, lng: 77.7381 },
    ],
    plan: [
      { day: 1, base: "Leh", morning: "Arrival + rest", afternoon: "Short local walk only if well", evening: "Early dinner", transport: "Flight/taxi", planningNote: "Acclimatization first", spendEstimate: "₹2,000–₹3,000" },
      { day: 2, base: "Leh", morning: "Shanti Stupa", afternoon: "Leh Palace + market", evening: "Local food", transport: "Walk/taxi", planningNote: "Keep altitude load light", spendEstimate: "₹1,500–₹2,500" },
      { day: 3, base: "Leh/Sham", morning: "Thiksey + Shey", afternoon: "Hemis", evening: "Return to Leh", transport: "Taxi/shared taxi", planningNote: "Cultural day", spendEstimate: "₹2,000–₹3,500" },
      { day: 4, base: "Leh → Nubra", morning: "Drive via Khardung La if open", afternoon: "Diskit", evening: "Hunder dunes", transport: "Shared taxi", planningNote: "Stay Nubra", spendEstimate: "₹3,000–₹5,000" },
      { day: 5, base: "Nubra", morning: "Turtuk optional", afternoon: "Village/culture", evening: "Hunder", transport: "Local taxi", planningNote: "Skip if tight", spendEstimate: "₹2,000–₹4,000" },
      { day: 6, base: "Nubra → Pangong", morning: "Drive", afternoon: "Lake viewpoints", evening: "Sunset", transport: "Shared taxi", planningNote: "Stay near lake", spendEstimate: "₹3,500–₹5,500" },
      { day: 7, base: "Pangong → Leh", morning: "Sunrise", afternoon: "Return", evening: "Rest", transport: "Road", planningNote: "Buffer for delays", spendEstimate: "₹2,500–₹4,000" },
      { day: 8, base: "Leh → Lamayuru/Alchi → Leh", morning: "Lamayuru", afternoon: "Alchi", evening: "Leh", transport: "Shared taxi", planningNote: "Scenic/cultural", spendEstimate: "₹2,000–₹4,000" },
      { day: 9, base: "Leh", morning: "Free/buffer", afternoon: "Market/monastery", evening: "Relax", transport: "Local", planningNote: "Weather/road buffer", spendEstimate: "₹1,500–₹2,500" },
      { day: 10, base: "Leh", morning: "Departure", afternoon: "—", evening: "—", transport: "Flight", planningNote: "Trip complete", spendEstimate: "₹1,000–₹2,000" },
    ],
    budget: { total: "₹35,000–₹55,000", accommodation: "₹8k–₹12k", food: "₹5k–₹8k", transport: "₹12k–₹20k", activitiesAndBuffer: "₹5k–₹8k", assumptions: "From Hyderabad; shared transport; airfare highly variable" },
  },
  {
    slug: "varanasi",
    name: "Kashi (Varanasi)",
    idealDuration: "4–6 days",
    budgetRoute: "Varanasi + Sarnath + optional Ramnagar",
    estimatedBudgetFromHyderabad: "₹12,000–₹20,000",
    bestSeason: "Oct–Mar",
    coreExperience: "Ghats, temples, Ganga, food, heritage",
    researchNote: "Varanasi district identifies Sarnath, Ganga ghats and Kashi Vishwanath Temple among major tourist places.",
    places: [
      { name: "Kashi Vishwanath Temple", category: "Iconic / must-see", whyVisit: "Major pilgrimage site", priority: "High priority", planningNote: "Check current entry/security rules", lat: 25.3109, lng: 83.0107 },
      { name: "Ganga Ghats", category: "Iconic / must-see", whyVisit: "Riverfront life", priority: "High priority", planningNote: "Dawn + evening", lat: 25.3070, lng: 83.0105 },
      { name: "Ganga Aarti", category: "Iconic", whyVisit: "Evening ritual", priority: "High priority", planningNote: "Crowds vary", lat: 25.3070, lng: 83.0105 },
      { name: "Sarnath", category: "Iconic / must-see", whyVisit: "Buddhist heritage", priority: "High priority", planningNote: "Half-day", lat: 25.3811, lng: 83.0224 },
      { name: "Old City lanes", category: "Best experience", whyVisit: "Food, crafts, temples", priority: "High priority", planningNote: "Walk slowly", lat: 25.3100, lng: 83.0095 },
      { name: "Assi Ghat", category: "Popular", whyVisit: "Sunrise + cafes + river", priority: "Recommended", planningNote: "Early morning", lat: 25.2850, lng: 83.0064 },
      { name: "Ramnagar Fort", category: "Less visited", whyVisit: "Riverfront heritage", priority: "Optional", planningNote: "Check timings", lat: 25.2678, lng: 83.0294 },
      { name: "BHU", category: "Less visited", whyVisit: "Campus/culture", priority: "Optional", planningNote: "Flexible", lat: 25.2677, lng: 82.9913 },
      { name: "Kedar Ghat", category: "Quieter ghat", whyVisit: "Local atmosphere", priority: "Recommended", planningNote: "Alternative to busiest ghats", lat: 25.2975, lng: 83.0080 },
    ],
    plan: [
      { day: 1, base: "Varanasi", morning: "Assi sunrise", afternoon: "Old City + Kashi Vishwanath", evening: "Ganga Aarti", transport: "Walk/auto", planningNote: "Core spiritual day", spendEstimate: "₹1,500–₹2,500" },
      { day: 2, base: "Varanasi", morning: "Ghat/boat", afternoon: "Sarnath", evening: "Old City food", transport: "Local", planningNote: "Core heritage", spendEstimate: "₹1,500–₹2,500" },
      { day: 3, base: "Varanasi", morning: "Ghats", afternoon: "BHU + museums", evening: "Assi Ghat", transport: "Local", planningNote: "Slow day", spendEstimate: "₹1,200–₹2,000" },
      { day: 4, base: "Varanasi", morning: "Ramnagar optional", afternoon: "Markets/crafts", evening: "Aarti", transport: "Local", planningNote: "Flexible", spendEstimate: "₹1,500–₹2,500" },
      { day: 5, base: "Varanasi", morning: "Food/heritage walk", afternoon: "Free exploration", evening: "Sunset ghats", transport: "Walk/local", planningNote: "Budget day", spendEstimate: "₹1,200–₹2,000" },
      { day: 6, base: "Varanasi", morning: "Optional Chunar/extra Sarnath", afternoon: "Return", evening: "Final ghats", transport: "Road", planningNote: "Only for extended stay", spendEstimate: "₹1,500–₹3,000" },
    ],
    budget: { total: "₹12,000–₹20,000", accommodation: "₹4k–₹7k", food: "₹2k–₹4k", transport: "₹3k–₹6k", activitiesAndBuffer: "₹3k–₹4k", assumptions: "Budget stay + rail/low-cost flight; local walking" },
  },
  {
    slug: "kashmir",
    name: "Kashmir",
    idealDuration: "8–10 days",
    budgetRoute: "Srinagar → Gulmarg → Pahalgam → Sonamarg → Yusmarg/Doodhpathri",
    estimatedBudgetFromHyderabad: "₹25,000–₹40,000",
    bestSeason: "Mar–Jun; Sep–Nov; winter for snow",
    coreExperience: "Valleys, lakes, meadows, mountains",
    researchNote: "J&K Tourism's current planning page includes Srinagar, Gulmarg, Pahalgam, Sonamarg, Yusmarg and Doodhpathri.",
    places: [
      { name: "Srinagar + Dal Lake", category: "Iconic / must-see", whyVisit: "Lake, shikara, houseboats", priority: "High priority", planningNote: "2–3 nights", lat: 34.1044, lng: 74.8624 },
      { name: "Gulmarg", category: "Iconic / must-see", whyVisit: "Mountains, gondola/snow", priority: "High priority", planningNote: "Weather dependent", lat: 34.0484, lng: 74.3805 },
      { name: "Pahalgam", category: "Iconic / must-see", whyVisit: "Valleys, rivers, meadows", priority: "High priority", planningNote: "2 nights ideal", lat: 34.0161, lng: 75.3152 },
      { name: "Sonamarg", category: "Iconic / must-see", whyVisit: "Mountain valley/glacier region", priority: "High priority", planningNote: "Access varies", lat: 34.3021, lng: 75.2911 },
      { name: "Mughal Gardens", category: "Popular", whyVisit: "Gardens + heritage", priority: "Recommended", planningNote: "Easy Srinagar circuit", lat: 34.0837, lng: 74.8756 },
      { name: "Old Srinagar", category: "Cultural", whyVisit: "Shrines, markets, heritage", priority: "Recommended", planningNote: "Guided walk", lat: 34.0908, lng: 74.7940 },
      { name: "Yusmarg", category: "Less visited", whyVisit: "Quiet meadow landscape", priority: "Recommended", planningNote: "Crowd escape", lat: 33.8880, lng: 74.6390 },
      { name: "Doodhpathri", category: "Less visited", whyVisit: "Meadows + streams", priority: "Recommended", planningNote: "Check access/weather", lat: 34.0000, lng: 74.5667 },
      { name: "Aharbal", category: "Underrated", whyVisit: "Waterfall + nature", priority: "Optional", planningNote: "Adds transit", lat: 33.7333, lng: 74.7833 },
      { name: "Gurez Valley", category: "Remote", whyVisit: "Mountain valley + culture", priority: "Extension", planningNote: "Needs extra days", lat: 34.6333, lng: 74.8000 },
    ],
    plan: [
      { day: 1, base: "Srinagar", morning: "Arrival + Dal Lake", afternoon: "Mughal Gardens", evening: "Shikara", transport: "Local", planningNote: "Easy start", spendEstimate: "₹2,000–₹3,500" },
      { day: 2, base: "Srinagar", morning: "Old Srinagar", afternoon: "Dal Lake", evening: "Free evening", transport: "Local", planningNote: "Culture", spendEstimate: "₹1,500–₹2,500" },
      { day: 3, base: "Srinagar → Gulmarg", morning: "Drive", afternoon: "Gulmarg", evening: "Gulmarg", transport: "Shared taxi", planningNote: "Weather buffer", spendEstimate: "₹2,500–₹4,500" },
      { day: 4, base: "Gulmarg", morning: "Local/mountain day", afternoon: "Optional gondola/snow", evening: "Gulmarg", transport: "Local", planningNote: "Paid activity optional", spendEstimate: "₹1,500–₹4,000" },
      { day: 5, base: "Gulmarg → Pahalgam", morning: "Drive", afternoon: "Pahalgam", evening: "Valley walk", transport: "Shared taxi", planningNote: "Stay Pahalgam", spendEstimate: "₹2,500–₹4,500" },
      { day: 6, base: "Pahalgam", morning: "Aru/Betab/Baisaran subject to access", afternoon: "Valley", evening: "Relax", transport: "Local taxi", planningNote: "Don't overpack", spendEstimate: "₹2,000–₹4,000" },
      { day: 7, base: "Pahalgam → Srinagar", morning: "Drive", afternoon: "Free time", evening: "Dal Lake", transport: "Shared taxi", planningNote: "Buffer", spendEstimate: "₹1,500–₹2,500" },
      { day: 8, base: "Sonamarg", morning: "Day trip", afternoon: "Mountain valley", evening: "Return", transport: "Shared taxi/tour", planningNote: "Weather dependent", spendEstimate: "₹2,000–₹3,500" },
      { day: 9, base: "Yusmarg or Doodhpathri", morning: "Nature", afternoon: "Meadow", evening: "Return", transport: "Shared taxi", planningNote: "Choose one", spendEstimate: "₹2,000–₹3,500" },
      { day: 10, base: "Srinagar", morning: "Free morning", afternoon: "Departure", evening: "—", transport: "Flight", planningNote: "Buffer", spendEstimate: "₹1,000–₹2,000" },
    ],
    budget: { total: "₹25,000–₹40,000", accommodation: "₹8k–₹12k", food: "₹5k–₹8k", transport: "₹7k–₹12k", activitiesAndBuffer: "₹5k–₹8k", assumptions: "Shared taxis/transport; airfare highly variable" },
  },
  {
    slug: "kerala-backwaters",
    name: "Kerala",
    idealDuration: "9–11 days",
    budgetRoute: "Kochi → Munnar → Thekkady → Alappuzha → Varkala",
    estimatedBudgetFromHyderabad: "₹22,000–₹35,000",
    bestSeason: "Oct–Mar generally",
    coreExperience: "Tea hills, wildlife, backwaters, beaches",
    researchNote: "Kerala Tourism 2025 statistics place Munnar and Kochi City among top domestic-visit destinations; official tourism pages also highlight Alappuzha, Varkala, Thekkady and Wayanad.",
    places: [
      { name: "Munnar", category: "Top visited + must-see", whyVisit: "Tea hills, viewpoints", priority: "High priority", planningNote: "2–3 nights", lat: 10.0889, lng: 77.0595 },
      { name: "Kochi / Fort Kochi", category: "Top visited + must-see", whyVisit: "Heritage, food, art", priority: "High priority", planningNote: "1–2 nights", lat: 9.9658, lng: 76.2422 },
      { name: "Thekkady", category: "Top visited + must-see", whyVisit: "Periyar, spice country", priority: "High priority", planningNote: "1–2 nights", lat: 9.5916, lng: 77.1600 },
      { name: "Alappuzha", category: "Top visited + must-see", whyVisit: "Backwaters, houseboat", priority: "High priority", planningNote: "1 night", lat: 9.4981, lng: 76.3388 },
      { name: "Varkala", category: "Top visited + must-see", whyVisit: "Cliff + beach", priority: "High priority", planningNote: "1–2 nights", lat: 8.7379, lng: 76.7163 },
      { name: "Kumarakom", category: "Popular alternative", whyVisit: "Backwaters + birding", priority: "Alternative", planningNote: "Choose instead of Alappuzha if desired", lat: 9.6177, lng: 76.4302 },
      { name: "Wayanad", category: "Popular/underrated", whyVisit: "Forests, caves, hills", priority: "Extension", planningNote: "Needs 2–3 nights", lat: 11.6854, lng: 76.1320 },
      { name: "Vagamon", category: "Underrated", whyVisit: "Meadows + hills", priority: "Alternative", planningNote: "Alternative to Munnar", lat: 9.6900, lng: 76.9100 },
      { name: "Athirappilly", category: "Underrated", whyVisit: "Waterfall", priority: "Optional", planningNote: "Adds transit", lat: 10.2851, lng: 76.5686 },
      { name: "Bekal", category: "Less visited", whyVisit: "Fort + coast", priority: "Extension", planningNote: "Separate north Kerala route", lat: 12.3900, lng: 75.0300 },
    ],
    plan: [
      { day: 1, base: "Kochi", morning: "Fort Kochi", afternoon: "Mattancherry/Jew Town", evening: "Sunset", transport: "Local", planningNote: "Start easy", spendEstimate: "₹1,500–₹2,500" },
      { day: 2, base: "Kochi → Munnar", morning: "Drive", afternoon: "Scenic stops", evening: "Munnar", transport: "Bus/shared cab", planningNote: "Long transfer", spendEstimate: "₹2,000–₹3,500" },
      { day: 3, base: "Munnar", morning: "Tea country", afternoon: "Viewpoints", evening: "Town", transport: "Shared taxi", planningNote: "Core day", spendEstimate: "₹1,500–₹2,500" },
      { day: 4, base: "Munnar", morning: "Park/museum subject to status", afternoon: "Tea/market", evening: "Relax", transport: "Local", planningNote: "Check opening status", spendEstimate: "₹1,500–₹3,000" },
      { day: 5, base: "Munnar → Thekkady", morning: "Drive", afternoon: "Spice country", evening: "Thekkady", transport: "Bus/shared cab", planningNote: "Transfer", spendEstimate: "₹2,000–₹3,500" },
      { day: 6, base: "Thekkady", morning: "Periyar activity", afternoon: "Spice market", evening: "Relax", transport: "Local", planningNote: "Official/permitted activity", spendEstimate: "₹1,500–₹3,500" },
      { day: 7, base: "Thekkady → Alappuzha", morning: "Drive", afternoon: "Backwater check-in", evening: "Backwater cruise", transport: "Road/boat", planningNote: "Short/shared cruise saves money", spendEstimate: "₹2,500–₹5,000" },
      { day: 8, base: "Alappuzha → Varkala", morning: "Morning backwaters", afternoon: "Transfer", evening: "Cliff sunset", transport: "Train/bus", planningNote: "Budget transport", spendEstimate: "₹1,500–₹2,500" },
      { day: 9, base: "Varkala", morning: "Beach", afternoon: "Cliff/cafes", evening: "Sunset", transport: "Walk", planningNote: "Relaxed", spendEstimate: "₹1,500–₹2,500" },
      { day: 10, base: "Varkala → Kochi/Trivandrum", morning: "Free morning", afternoon: "Departure", evening: "—", transport: "Train/bus/flight", planningNote: "Nearest practical airport", spendEstimate: "₹1,500–₹3,000" },
    ],
    budget: { total: "₹22,000–₹35,000", accommodation: "₹7k–₹10k", food: "₹5k–₹8k", transport: "₹5k–₹8k", activitiesAndBuffer: "₹5k–₹9k", assumptions: "Buses/trains; budget stays; no private luxury houseboat" },
  },
  {
    slug: "goa",
    name: "Goa",
    idealDuration: "6–8 days",
    budgetRoute: "North Goa → Panaji/Old Goa → South Goa",
    estimatedBudgetFromHyderabad: "₹15,000–₹25,000",
    bestSeason: "Nov–Feb",
    coreExperience: "Beaches, heritage, food, nightlife, nature",
    researchNote: "Goa Tourism notes broad budget accommodation availability and peak-season pressure around Christmas/New Year.",
    places: [
      { name: "Palolem", category: "Must-see", whyVisit: "South Goa beach", priority: "High priority", planningNote: "2 nights", lat: 15.0100, lng: 74.0233 },
      { name: "Agonda", category: "Quieter / underrated", whyVisit: "Relaxed beach", priority: "High priority", planningNote: "Budget-friendly", lat: 15.0450, lng: 73.9833 },
      { name: "Anjuna + Vagator", category: "Popular", whyVisit: "Beach, cliffs, nightlife", priority: "High priority", planningNote: "North Goa", lat: 15.5847, lng: 73.7434 },
      { name: "Panaji + Fontainhas", category: "Must-see", whyVisit: "Portuguese heritage, cafes", priority: "High priority", planningNote: "Half-day", lat: 15.4968, lng: 73.8322 },
      { name: "Old Goa", category: "Must-see", whyVisit: "Churches + heritage", priority: "High priority", planningNote: "Combine with Panaji", lat: 15.5009, lng: 73.9114 },
      { name: "Baga/Calangute", category: "Most visited", whyVisit: "Classic beach/nightlife", priority: "Optional", planningNote: "Crowded", lat: 15.5553, lng: 73.7517 },
      { name: "Dudhsagar", category: "Popular nature", whyVisit: "Waterfall/forest", priority: "Recommended", planningNote: "Permitted access only", lat: 15.3144, lng: 74.3144 },
      { name: "Mandrem", category: "Quieter / underrated", whyVisit: "Beach", priority: "Recommended", planningNote: "North alternative", lat: 15.6667, lng: 73.7167 },
      { name: "Divar Island", category: "Underrated", whyVisit: "Village/heritage", priority: "Optional", planningNote: "Check ferry timing", lat: 15.5167, lng: 73.8833 },
      { name: "Chorla / Western Ghats", category: "Underrated", whyVisit: "Forest + waterfalls", priority: "Optional", planningNote: "Season/access dependent", lat: 15.6167, lng: 74.1000 },
    ],
    plan: [
      { day: 1, base: "North Goa", morning: "Anjuna/Vagator", afternoon: "Beach", evening: "Nightlife optional", transport: "Local", planningNote: "Budget hostel base", spendEstimate: "₹1,500–₹2,500" },
      { day: 2, base: "North Goa", morning: "Fort Aguada", afternoon: "Candolim", evening: "Vagator sunset", transport: "Scooter/bus", planningNote: "Compare transport", spendEstimate: "₹1,500–₹2,500" },
      { day: 3, base: "North Goa", morning: "Mandrem", afternoon: "Arambol/nearby", evening: "Beach sunset", transport: "Local", planningNote: "Quieter beach", spendEstimate: "₹1,200–₹2,200" },
      { day: 4, base: "Panaji/Old Goa", morning: "Fontainhas", afternoon: "Old Goa", evening: "Panaji", transport: "Bus/local", planningNote: "Heritage day", spendEstimate: "₹1,200–₹2,000" },
      { day: 5, base: "North → South Goa", morning: "Transfer", afternoon: "Palolem", evening: "Sunset", transport: "Bus/taxi", planningNote: "Stay South Goa", spendEstimate: "₹1,500–₹2,500" },
      { day: 6, base: "South Goa", morning: "Palolem", afternoon: "Agonda", evening: "Beach", transport: "Local", planningNote: "Slow day", spendEstimate: "₹1,200–₹2,200" },
      { day: 7, base: "Dudhsagar area", morning: "Waterfall if access open", afternoon: "Return", evening: "Rest", transport: "Permitted operator/transport", planningNote: "Season/access dependent", spendEstimate: "₹2,000–₹4,000" },
      { day: 8, base: "Goa", morning: "Free morning", afternoon: "Departure", evening: "—", transport: "Flight/train", planningNote: "Can shorten to 7–8 days", spendEstimate: "₹1,000–₹2,000" },
    ],
    budget: { total: "₹15,000–₹25,000", accommodation: "₹5k–₹8k", food: "₹4k–₹6k", transport: "₹3k–₹5k", activitiesAndBuffer: "₹3k–₹6k", assumptions: "Budget stay + public/shared transport; avoid peak pricing" },
  },
];

export const costWarning = "All budget figures are planning estimates, not live quotations. Verify transport, accommodation, attraction fees and weather/access before booking.";
export const budgetPrinciple = "Use hostels/guesthouses, public buses/trains, shared taxis, local food and free attractions. Paid activities are optional where noted.";

export function findFeaturedDestination(slug: string): FeaturedDestination | null {
  return featuredDestinations.find((d) => d.slug === slug) || null;
}
