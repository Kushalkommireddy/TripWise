// India-only, curated. Every place here is real, with real coordinates.
// This isn't AI-generated — it's a hand-picked shortlist per destination so
// the most important spots are pre-selected, plus honest context (least-
// visited alternatives, safety notes, best time to go, nearest transport
// hub) that a first-time domestic traveller actually needs. Live
// Wikipedia/OSM search (in /api/poi) fills in anything beyond this list.

export type CuratedPlace = {
  name: string;
  lat: number;
  lng: number;
  extract: string;
  sourceUrl: string;
  mustSee: boolean;
  hiddenGem?: boolean; // real, but far less crowded than the mustSee spots
  safetyNote?: string; // e.g. altitude sickness, strong currents — real, specific
};

export type CuratedDestination = {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  bestSeason: string;
  permitNote?: string;
  permitSourceUrl?: string;
  nearestAirport: string;
  nearestRailway: string;
  generalSafetyNote?: string;
  places: CuratedPlace[];
};

export const indiaDestinations: CuratedDestination[] = [
  {
    slug: "leh-ladakh",
    name: "Leh-Ladakh",
    state: "Ladakh",
    lat: 34.1526,
    lng: 77.5771,
    bestSeason: "June–September (roads open, weather stable)",
    permitNote: "Inner Line Permit required for Pangong Tso, Nubra Valley, and other border-adjacent areas.",
    permitSourceUrl: "https://leh.nic.in/",
    nearestAirport: "Kushok Bakula Rimpochee Airport (IXL), Leh",
    nearestRailway: "No rail link into Ladakh — nearest broad-gauge station is Jammu Tawi, then road/air onward.",
    generalSafetyNote: "High altitude (Leh sits at ~3,500m) — acute mountain sickness is a real risk. Rest a full day on arrival before any strenuous activity or altitude gain, and know the symptoms of AMS.",
    places: [
      { name: "Pangong Tso", lat: 33.7601, lng: 78.6675, extract: "A high-altitude lake stretching into Tibet, famous for its shifting blue hues.", sourceUrl: "https://en.wikipedia.org/wiki/Pangong_Tso", mustSee: true, safetyNote: "At ~4,225m — altitude sickness risk is higher here than in Leh itself." },
      { name: "Nubra Valley", lat: 34.6803, lng: 77.5619, extract: "A cold desert valley beyond Khardung La, known for sand dunes and Bactrian camels.", sourceUrl: "https://en.wikipedia.org/wiki/Nubra_Valley", mustSee: true },
      { name: "Thiksey Monastery", lat: 34.0570, lng: 77.6910, extract: "A striking hilltop monastery resembling a smaller Potala Palace, overlooking the Indus valley.", sourceUrl: "https://en.wikipedia.org/wiki/Thiksey_Monastery", mustSee: true },
      { name: "Khardung La", lat: 34.2792, lng: 77.6031, extract: "One of the world's highest motorable mountain passes, the gateway to Nubra Valley.", sourceUrl: "https://en.wikipedia.org/wiki/Khardung_La", mustSee: true, safetyNote: "Over 5,300m — thin air, sudden weather shifts. Keep visits brief." },
      { name: "Leh Palace", lat: 34.1665, lng: 77.5852, extract: "A nine-storey former royal palace overlooking Leh town, built in the 17th century.", sourceUrl: "https://en.wikipedia.org/wiki/Leh_Palace", mustSee: false },
      { name: "Tso Moriri", lat: 32.9022, lng: 78.3197, extract: "A remote high-altitude lake far less visited than Pangong Tso, inside the Changthang Wildlife Sanctuary.", sourceUrl: "https://en.wikipedia.org/wiki/Tso_Moriri", mustSee: false, hiddenGem: true },
    ],
  },
  {
    slug: "goa",
    name: "Goa",
    state: "Goa",
    lat: 15.2993,
    lng: 74.1240,
    bestSeason: "November–February (cool, dry)",
    nearestAirport: "Goa International Airport / Dabolim (GOI), or Manohar International Airport (GOX) near Mopa",
    nearestRailway: "Madgaon Junction (MAO) and Thivim (THVM)",
    generalSafetyNote: "Rip currents are a real risk on several beaches — swim only where flagged safe and lifeguards are present.",
    places: [
      { name: "Baga Beach", lat: 15.5553, lng: 73.7517, extract: "A lively North Goa beach with water sports, shacks, and nightlife.", sourceUrl: "https://en.wikipedia.org/wiki/Baga_Beach", mustSee: true },
      { name: "Basilica of Bom Jesus", lat: 15.5009, lng: 73.9114, extract: "A UNESCO World Heritage church in Old Goa holding the remains of St. Francis Xavier.", sourceUrl: "https://en.wikipedia.org/wiki/Basilica_of_Bom_Jesus", mustSee: true },
      { name: "Palolem Beach", lat: 15.0100, lng: 74.0233, extract: "A crescent-shaped South Goa beach known for its calmer, laid-back atmosphere.", sourceUrl: "https://en.wikipedia.org/wiki/Palolem", mustSee: true },
      { name: "Dudhsagar Falls", lat: 15.3144, lng: 74.3144, extract: "A four-tiered waterfall on the Goa-Karnataka border, among India's tallest.", sourceUrl: "https://en.wikipedia.org/wiki/Dudhsagar_Falls", mustSee: true, safetyNote: "Best visited with a licensed jeep-safari operator during monsoon/post-monsoon — currents near the base get strong." },
      { name: "Fontainhas", lat: 15.4968, lng: 73.8322, extract: "A Latin Quarter of narrow lanes and Portuguese-era houses in Panaji.", sourceUrl: "https://en.wikipedia.org/wiki/Fontainhas,_Goa", mustSee: false },
      { name: "Cotigao Wildlife Sanctuary", lat: 15.0167, lng: 74.2833, extract: "A quiet forest reserve in South Goa, rarely visited compared to the beaches.", sourceUrl: "https://en.wikipedia.org/wiki/Cotigao_Wildlife_Sanctuary", mustSee: false, hiddenGem: true },
    ],
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    lat: 26.9124,
    lng: 75.7873,
    bestSeason: "October–March (mild, avoids summer heat)",
    nearestAirport: "Jaipur International Airport (JAI)",
    nearestRailway: "Jaipur Junction (JP)",
    places: [
      { name: "Amber Fort", lat: 26.9855, lng: 75.8513, extract: "A hilltop fort of sandstone and marble overlooking Maota Lake, built in the 16th century.", sourceUrl: "https://en.wikipedia.org/wiki/Amer_Fort", mustSee: true },
      { name: "Hawa Mahal", lat: 26.9239, lng: 75.8267, extract: "A honeycombed pink sandstone palace facade with 953 small windows.", sourceUrl: "https://en.wikipedia.org/wiki/Hawa_Mahal", mustSee: true },
      { name: "City Palace, Jaipur", lat: 26.9258, lng: 75.8237, extract: "A palace complex blending Rajput and Mughal architecture, still partly home to the royal family.", sourceUrl: "https://en.wikipedia.org/wiki/City_Palace,_Jaipur", mustSee: true },
      { name: "Jantar Mantar, Jaipur", lat: 26.9246, lng: 75.8246, extract: "An 18th-century astronomical observatory with the world's largest stone sundial.", sourceUrl: "https://en.wikipedia.org/wiki/Jantar_Mantar,_Jaipur", mustSee: true },
      { name: "Nahargarh Fort", lat: 26.9373, lng: 75.8155, extract: "A hill fort offering sweeping sunset views over Jaipur city.", sourceUrl: "https://en.wikipedia.org/wiki/Nahargarh_Fort", mustSee: false },
    ],
  },
  {
    slug: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    lat: 32.2432,
    lng: 77.1892,
    bestSeason: "March–June and September–November",
    nearestAirport: "Kullu-Manali Airport / Bhuntar (KUU)",
    nearestRailway: "No direct rail — nearest broad-gauge station is Chandigarh (CDG), then ~9hr by road.",
    places: [
      { name: "Solang Valley", lat: 32.3172, lng: 77.1567, extract: "A valley near Manali popular for paragliding, zorbing, and snow activities.", sourceUrl: "https://en.wikipedia.org/wiki/Solang_Valley", mustSee: true },
      { name: "Rohtang Pass", lat: 32.3730, lng: 77.2481, extract: "A high mountain pass connecting the Kullu Valley to Lahaul-Spiti, permit-restricted in season.", sourceUrl: "https://en.wikipedia.org/wiki/Rohtang_Pass", mustSee: true, safetyNote: "Permit required in-season; road can close without notice due to weather." },
      { name: "Hadimba Temple", lat: 32.2481, lng: 77.1706, extract: "A wooden cave temple set in a cedar forest, dedicated to Hadimba Devi.", sourceUrl: "https://en.wikipedia.org/wiki/Hidimba_Devi_Temple", mustSee: true },
      { name: "Old Manali", lat: 32.2565, lng: 77.1745, extract: "A laid-back riverside village of cafes and guesthouses across the stream from central Manali.", sourceUrl: "https://en.wikipedia.org/wiki/Manali,_Himachal_Pradesh", mustSee: false },
    ],
  },
  {
    slug: "kerala-backwaters",
    name: "Kerala",
    state: "Kerala",
    lat: 9.4981,
    lng: 76.3388,
    bestSeason: "November–February (post-monsoon, pleasant)",
    nearestAirport: "Cochin International Airport (COK)",
    nearestRailway: "Ernakulam Junction (ERS)",
    places: [
      { name: "Alleppey Backwaters", lat: 9.4981, lng: 76.3388, extract: "A network of canals and lagoons best explored by houseboat, the heart of Kerala's backwater tourism.", sourceUrl: "https://en.wikipedia.org/wiki/Alappuzha", mustSee: true },
      { name: "Kumarakom", lat: 9.6177, lng: 76.4302, extract: "A backwater village on Vembanad Lake known for birdwatching and houseboats.", sourceUrl: "https://en.wikipedia.org/wiki/Kumarakom", mustSee: true },
      { name: "Fort Kochi", lat: 9.9658, lng: 76.2422, extract: "A historic port town with Chinese fishing nets, colonial architecture, and a mixed Portuguese-Dutch-British heritage.", sourceUrl: "https://en.wikipedia.org/wiki/Fort_Kochi", mustSee: true },
      { name: "Munnar", lat: 10.0889, lng: 77.0595, extract: "A hill station of rolling tea plantations in the Western Ghats.", sourceUrl: "https://en.wikipedia.org/wiki/Munnar", mustSee: false },
      { name: "Vembanad Lake, Pathiramanal Island", lat: 9.6500, lng: 76.4167, extract: "A tiny, little-visited island in Vembanad Lake known for migratory birds.", sourceUrl: "https://en.wikipedia.org/wiki/Pathiramanal", mustSee: false, hiddenGem: true },
    ],
  },
  {
    slug: "varanasi",
    name: "Varanasi (Kashi)",
    state: "Uttar Pradesh",
    lat: 25.3176,
    lng: 82.9739,
    bestSeason: "October–March",
    nearestAirport: "Lal Bahadur Shastri Airport (VNS)",
    nearestRailway: "Varanasi Junction / Varanasi Cantt (BSB)",
    generalSafetyNote: "Ghats and lanes are extremely crowded, especially at dawn and during the evening Aarti — keep valuables secure and watch footing on wet stone steps.",
    places: [
      { name: "Dashashwamedh Ghat", lat: 25.3070, lng: 83.0105, extract: "Varanasi's main ghat on the Ganges, site of the nightly Ganga Aarti ceremony.", sourceUrl: "https://en.wikipedia.org/wiki/Dashashwamedh_Ghat", mustSee: true },
      { name: "Kashi Vishwanath Temple", lat: 25.3109, lng: 83.0107, extract: "One of the most revered Hindu temples, dedicated to Lord Shiva, on the western bank of the Ganges.", sourceUrl: "https://en.wikipedia.org/wiki/Kashi_Vishwanath_Temple", mustSee: true },
      { name: "Sarnath", lat: 25.3811, lng: 83.0224, extract: "The deer park where the Buddha gave his first sermon, a short trip from central Varanasi.", sourceUrl: "https://en.wikipedia.org/wiki/Sarnath", mustSee: true },
      { name: "Assi Ghat", lat: 25.2850, lng: 83.0064, extract: "A quieter southern ghat popular for morning yoga and boat rides.", sourceUrl: "https://en.wikipedia.org/wiki/Assi_Ghat", mustSee: false },
      { name: "Ramnagar Fort", lat: 25.2678, lng: 83.0294, extract: "An 18th-century fort across the Ganges, home to a museum of royal artefacts and rarely crowded.", sourceUrl: "https://en.wikipedia.org/wiki/Ramnagar_Fort", mustSee: false, hiddenGem: true },
    ],
  },
  {
    slug: "kashmir",
    name: "Kashmir",
    state: "Jammu and Kashmir",
    lat: 34.0837,
    lng: 74.7973,
    bestSeason: "April–June (spring) or September–November (autumn colours); December–February for snow",
    nearestAirport: "Srinagar International Airport (SXR)",
    nearestRailway: "Srinagar railway station (via the Kashmir Valley line, connects to Banihal/Jammu)",
    generalSafetyNote: "Check current travel advisories before finalizing plans — conditions in parts of the region can change; stick to well-established tourist routes and follow local authority guidance.",
    places: [
      { name: "Dal Lake", lat: 34.1044, lng: 74.8624, extract: "Srinagar's iconic lake, known for houseboats and shikara boat rides.", sourceUrl: "https://en.wikipedia.org/wiki/Dal_Lake", mustSee: true },
      { name: "Gulmarg", lat: 34.0484, lng: 74.3805, extract: "A hill station and ski resort with one of the world's highest cable cars, the Gulmarg Gondola.", sourceUrl: "https://en.wikipedia.org/wiki/Gulmarg", mustSee: true },
      { name: "Pahalgam", lat: 34.0161, lng: 75.3152, extract: "A valley town on the Lidder River, gateway to the Amarnath pilgrimage and popular for trekking.", sourceUrl: "https://en.wikipedia.org/wiki/Pahalgam", mustSee: true },
      { name: "Mughal Gardens, Srinagar", lat: 34.0837, lng: 74.8756, extract: "Terraced Mughal-era gardens (Shalimar Bagh, Nishat Bagh) along Dal Lake's edge.", sourceUrl: "https://en.wikipedia.org/wiki/Shalimar_Bagh,_Srinagar", mustSee: false },
      { name: "Sonamarg", lat: 34.3021, lng: 75.2911, extract: "A high-altitude meadow ('Meadow of Gold') on the way to Ladakh, far quieter than Gulmarg or Pahalgam.", sourceUrl: "https://en.wikipedia.org/wiki/Sonmarg", mustSee: false, hiddenGem: true, safetyNote: "Road can close with early snowfall — check conditions before travelling." },
    ],
  },
  {
    slug: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    lat: 30.0869,
    lng: 78.2676,
    bestSeason: "September–November and February–April",
    nearestAirport: "Jolly Grant Airport (DED), Dehradun",
    nearestRailway: "Rishikesh railway station, or Haridwar Junction (HW) for more connections",
    places: [
      { name: "Laxman Jhula", lat: 30.1226, lng: 78.3293, extract: "A suspension bridge over the Ganges connecting two temple complexes.", sourceUrl: "https://en.wikipedia.org/wiki/Lakshman_Jhula", mustSee: true },
      { name: "Triveni Ghat", lat: 30.0942, lng: 78.2913, extract: "Rishikesh's main ghat, known for its evening Ganga Aarti.", sourceUrl: "https://en.wikipedia.org/wiki/Rishikesh", mustSee: true },
      { name: "Beatles Ashram", lat: 30.1934, lng: 78.3121, extract: "The former Maharishi Mahesh Yogi ashram where the Beatles stayed in 1968, now covered in murals.", sourceUrl: "https://en.wikipedia.org/wiki/Chaurasi_Kutia", mustSee: true },
      { name: "Rajaji National Park", lat: 30.0000, lng: 78.2000, extract: "A national park bordering Rishikesh, home to elephants and tigers.", sourceUrl: "https://en.wikipedia.org/wiki/Rajaji_National_Park", mustSee: false },
    ],
  },
  {
    slug: "andaman",
    name: "Andaman Islands",
    state: "Andaman and Nicobar Islands",
    lat: 11.6234,
    lng: 92.7265,
    bestSeason: "October–May (avoids monsoon)",
    permitNote: "Indian nationals need only standard ID; some tribal reserve areas are restricted.",
    nearestAirport: "Veer Savarkar International Airport (IXZ), Port Blair",
    nearestRailway: "No rail link — reachable only by air or ship from mainland ports.",
    generalSafetyNote: "Some outer/tribal reserve islands are legally off-limits to visitors — stick to permitted tourist zones (Havelock, Neil, Port Blair).",
    places: [
      { name: "Radhanagar Beach", lat: 11.9757, lng: 92.9426, extract: "A Havelock Island beach repeatedly ranked among Asia's best.", sourceUrl: "https://en.wikipedia.org/wiki/Havelock_Island", mustSee: true },
      { name: "Cellular Jail", lat: 11.6757, lng: 92.7486, extract: "A colonial-era prison in Port Blair used to detain freedom fighters, now a national memorial.", sourceUrl: "https://en.wikipedia.org/wiki/Cellular_Jail", mustSee: true },
      { name: "Neil Island", lat: 11.8302, lng: 93.0298, extract: "A smaller, quieter island known for coral reefs and natural rock bridges.", sourceUrl: "https://en.wikipedia.org/wiki/Neil_Island", mustSee: true },
    ],
  },
];

export function findDestination(query: string): CuratedDestination | null {
  const q = query.toLowerCase();
  return (
    indiaDestinations.find(
      (d) => d.name.toLowerCase() === q || d.slug === q || q.includes(d.name.toLowerCase())
    ) || null
  );
}

// The 5 flagship destinations featured on the landing page
export const FEATURED_SLUGS = ["leh-ladakh", "varanasi", "kashmir", "kerala-backwaters", "goa"];
