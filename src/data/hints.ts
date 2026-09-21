import type { Airport } from './airports'

/** Curated facts — no city, IATA, or airport proper name. */
export const HINTS_BY_IATA: Record<string, string[]> = {
  AMS: [
    'Built on polder land below sea level, with a huge central plaza linking rail and terminals.',
    'One of Europe’s oldest major hubs, famous for a vast landside shopping plaza under one roof.',
  ],
  LHR: [
    'Western Europe’s busiest hub, with a striking glass-and-steel flagship terminal opened in the 2000s.',
    'A long-standing intercontinental gateway west of a major capital, with five passenger terminals.',
  ],
  JFK: [
    'Named for a US president; several terminals face a bay on the edge of a megacity.',
    'A classic mid-century international gateway with a famous TWA-era curved terminal nearby.',
  ],
  NRT: [
    'The farther-out international gateway for a mega metro, opened in the 1970s on the Pacific side.',
    'Known for meticulous Japanese wayfinding and long train links into the capital region.',
  ],
  SFO: [
    'Sits beside a bay; the international hall is known for high glass walls and bridge views.',
    'A West Coast hub where fog and water views often frame the approach roads.',
  ],
  CDG: [
    'Famous for a circular concrete terminal and long satellite piers in a northern suburb.',
    'A major European transfer hub with futuristic tube walkways between halls.',
  ],
  SIN: [
    'Home to a multi-storey indoor waterfall and a nature-themed mall.',
    'Often ranked among the world’s best airports, with butterfly gardens and rooftop pools.',
  ],
  DXB: [
    'A desert megahub with one of the world’s longest continuous terminal buildings.',
    'Built around a giant duty-free and lounge complex serving a global long-haul network.',
  ],
  FRA: [
    'A Rhine-Main transfer giant with an elevated people-mover linking distant terminals.',
    'Europe’s busiest cargo hub as well as a major passenger crossroads.',
  ],
  HKG: [
    'Built on a reclaimed island with a vast Y-shaped roof and sea on both sides.',
    'A gateway known for sky bridges, ferry links, and a dramatic open check-in hall.',
  ],
  LAX: [
    'Famous for a mid-century Theme Building “flying saucer” between the terminals.',
    'A sprawling coastal US hub with a U-shaped horseshoe of terminals around a central plaza.',
  ],
  SYD: [
    'An island-continent gateway with water views and a curved international pier.',
    'Serves a harbour city; the international hall looks out toward the bay.',
  ],
  ORD: [
    'A Midwestern US hub named with an Irish apostrophe, long among the world’s busiest.',
    'Known for a dense warren of terminals and a busy domestic transfer complex.',
  ],
  IST: [
    'A vast new-build hub on the European side of a strait city, opened to replace an older airport.',
    'One of the world’s largest terminal footprints, designed as a global transfer machine.',
  ],
  ICN: [
    'A showcase East Asian hub on an island west of the capital, often topping service rankings.',
    'Known for cultural performances, long free transit tours, and immaculate halls.',
  ],
  MAD: [
    'Iberia’s main hub, with a bamboo-roofed satellite terminal that looks like a forest canopy.',
    'A southern European gateway with a striking red-and-yellow themed boarding area.',
  ],
  BCN: [
    'A Mediterranean hub with a wave-like roof and strong leisure traffic.',
    'Serves a coastal design capital; Terminal 1 is known for its sweeping glass facade.',
  ],
  FCO: [
    'Named for a Renaissance polymath; the main international gateway to a historic capital.',
    'A Mediterranean hub with long piers and heavy leisure plus pilgrimage traffic.',
  ],
  MXP: [
    'A northern Italian long-haul gateway set in open countryside north of a fashion capital.',
    'Two main terminals linked by a people-mover across a wide apron.',
  ],
  MUC: [
    'A Bavarian hub with two terminals and a central midfield plaza of shops and beer gardens.',
    'Known for orderly German design and a satellite linked by an underground people-mover.',
  ],
  ZRH: [
    'An Alpine-country hub with views toward lake and mountains on clear days.',
    'Compact, efficient, and a classic European transfer stop in a German-speaking canton.',
  ],
  VIE: [
    'A Central European hub east of the Alps, a long-time bridge toward the Balkans.',
    'Known for a clean modern pier and strong east–west transfer traffic.',
  ],
  CPH: [
    'A Nordic hub on an island, with a reputation for hygge-friendly design and bike culture nearby.',
    'Scandinavia’s busiest gateway, sitting between the capital and a bridge to another country.',
  ],
  DUB: [
    'An island nation’s main hub, with a modern glass terminal popular with transatlantic traffic.',
    'A Celtic-capital gateway and a common US pre-clearance stop.',
  ],
  ATH: [
    'A Mediterranean capital hub opened for a summer Olympics, east of the ancient city core.',
    'Serves a peninsula famous for islands; the terminal is modern and sun-bleached.',
  ],
  BRU: [
    'A Low Countries capital hub and NATO-region gateway with a classic European pier layout.',
    'Known as a compact EU-capital airport with strong African long-haul links.',
  ],
  DOH: [
    'A Gulf hub famous for a giant yellow teddy bear sculpture in the departures hall.',
    'Built as a showpiece transfer airport with orchids, luxury retail, and a vast central concourse.',
  ],
  AUH: [
    'A Gulf capital hub with a newer midfield terminal and strong long-haul growth.',
    'Neighbor to a larger desert megahub; known for a calm, design-forward hall.',
  ],
  CAI: [
    'Africa’s busiest airport by many measures, gateway to a Nile metropolis.',
    'A North African hub with heavy pilgrimage and regional traffic beside an ancient capital.',
  ],
  JNB: [
    'Southern Africa’s main transfer hub, named for a liberation-era president.',
    'A high-veld gateway inland from the coast, linking the region to the world.',
  ],
  CPT: [
    'A scenic coastal hub with mountain views on the approach.',
    'Serves a harbour city at Africa’s southwestern tip; clear days show flat-topped peaks.',
  ],
  HND: [
    'The closer-in city airport for a mega metro, with monorail links and bay-side runways.',
    'Often praised for punctual domestic ops and a sleek international terminal on the water.',
  ],
  BKK: [
    'A major hub on the Gulf of Thailand with a vast glass-roofed main terminal.',
    'Known for a soaring arched roof and orchids in a sprawling Southeast Asian gateway.',
  ],
  KUL: [
    'A Southeast Asian hub with a train link to a satellite terminal across the apron.',
    'Famous for a jungle-boarded satellite and a long automated people-mover ride.',
  ],
  TPE: [
    'An island East Asian hub with strong tech-export traffic and sleek modern terminals.',
    'Gateway to a mountainous island democracy; Terminal 2 is known for bright, airy halls.',
  ],
  PVG: [
    'A coastal Chinese megahub with a dramatic magnetic-levitation link toward downtown.',
    'One of two big gateways for a Yangtze delta metropolis; known for a vast modern pier.',
  ],
  DEL: [
    'Named for a former prime minister; Terminal 3 is a huge glass-and-steel showpiece.',
    'North India’s main international gateway, with heavy domestic feeder traffic.',
  ],
  BOM: [
    'Named for a warrior king; a Arabian Sea metropolis hub with a striking T2 canopy.',
    'A western Indian financial-capital gateway known for ornate traditional art in the terminal.',
  ],
  MEL: [
    'A southern Australian hub inland from the bay, with a long domestic–international complex.',
    'Serves a laneway culture capital; often busy with domestic jet traffic.',
  ],
  AKL: [
    'The main gateway to a Pacific island nation of two main islands.',
    'Known as a relaxed Oceania hub with strong links across the Tasman.',
  ],
  ATL: [
    'Often ranks as the world’s busiest airport by passenger traffic.',
    'A Southern US mega-hub built around an underground plane-train connecting concourses.',
  ],
  DFW: [
    'A Texas dual-city hub with a huge footprint and a skylink train between terminals.',
    'One of the world’s largest airport sites by acreage, serving a sprawling metroplex.',
  ],
  DEN: [
    'Famous for a peaked white fabric roof that looks like a tent city.',
    'A high-altitude US hub on the plains east of a mountain range, with a conspiracy-famous art piece.',
  ],
  SEA: [
    'A Pacific Northwest hub with views of a volcanic peak on clear days.',
    'Known for local coffee culture airside and a busy West Coast domestic network.',
  ],
  MIA: [
    'A sunbelt US gateway with huge Latin American transfer traffic.',
    'A humid coastal hub where Spanish is as common as English in the halls.',
  ],
  BOS: [
    'A New England harbour-city hub with water views and a mix of historic and new terminals.',
    'Serves a university-dense metro; the harbor runway approaches are distinctive.',
  ],
  YYZ: [
    'Canada’s busiest hub, a major North American transfer point north of the lakes.',
    'A large two-terminal complex serving a diverse anglophone metropolis.',
  ],
  YVR: [
    'Famous for Northwest Coast indigenous art and an indoor stream in the international hall.',
    'A Pacific Canada gateway with mountain and water scenery on the approach.',
  ],
  MEX: [
    'A high-altitude capital hub with intense domestic traffic and colorful local design cues.',
    'One of Latin America’s busiest gateways, squeezed into a dense urban basin.',
  ],
  GRU: [
    'South America’s busiest airport, serving a Southern Hemisphere megacity.',
    'A Brazilian hub with heavy domestic jets and long-haul links across the Atlantic.',
  ],
  LIS: [
    'An Atlantic European capital hub, a classic stop between Europe and Brazil or Africa.',
    'Known for azulejo-influenced design cues and a compact coastal-country gateway.',
  ],
  OSL: [
    'A Nordic capital hub in the forest north of town, linked by a fast airport train.',
    'Known for clean Scandinavian design and strong long-haul leisure traffic.',
  ],
  ARN: [
    'A Nordic hub north of a archipelago capital, with multiple terminals in the woods.',
    'Scandinavia’s second-busiest; known for calm design and winter operations.',
  ],
  HEL: [
    'A Nordic hub marketed as a short polar route toward Asia.',
    'Known for a wavy wooden interior and punctual cold-climate operations.',
  ],
  WAW: [
    'A Central European capital hub named for a Romantic-era composer.',
    'Poland’s main gateway, rebuilt and expanded after decades of change.',
  ],
  PRG: [
    'A Central European capital hub named for a playwright-turned-president.',
    'A compact castle-city gateway popular with weekend city-break traffic.',
  ],
  BUD: [
    'A Central European hub named for a Hungarian composer, southeast of the Danube capital.',
    'Known as a low-cost and legacy mix serving a thermal-bath capital.',
  ],
  MAN: [
    'A northern English hub with strong long-haul leisure traffic outside the capital.',
    'Serves a music and football city; one of the UK’s busiest outside London.',
  ],
  EDI: [
    'A Scottish capital hub with castle-country approaches and growing long-haul links.',
    'Gateway to Highlands tourism as well as a compact historic capital.',
  ],
  GVA: [
    'An Alpine hub beside a lake, with a runway almost touching another country’s border.',
    'A UN- and finance-oriented gateway in a bilingual Swiss canton.',
  ],
  ADD: [
    'East Africa’s main transfer hub, nicknamed for a vast new terminal complex.',
    'A highland capital gateway and a major link between Africa and the Middle East/Asia.',
  ],
  NBO: [
    'An East African safari-country hub named for a independence leader.',
    'A highland gateway where wildlife-park traffic mixes with regional transfers.',
  ],
  LOS: [
    'West Africa’s busiest hub, serving a huge coastal megacity.',
    'A Gulf of Guinea gateway with intense domestic and regional traffic.',
  ],
  CGK: [
    'An archipelago nation’s main hub, with terminals linked across a busy apron.',
    'Gateway to a volcanic island chain; often congested with domestic narrowbodies.',
  ],
  MNL: [
    'An archipelago capital hub named for a national hero and senator.',
    'A Southeast Asian island gateway with a dense mix of terminals beside the bay.',
  ],
  SGN: [
    'A southern Vietnamese hub still bearing an older wartime-era name in local memory.',
    'Gateway to a Mekong metropolis; busy with regional low-cost and legacy traffic.',
  ],
  HAN: [
    'A northern Vietnamese capital hub with a modern international terminal expansion.',
    'Serves a historic capital of lakes and old quarters; strong regional Asia links.',
  ],
  CAN: [
    'A Pearl River Delta megahub inland from the coast, among China’s busiest.',
    'A southern Chinese gateway with a vast new terminal and heavy domestic traffic.',
  ],
  PEK: [
    'A northern Chinese capital hub with a dramatic dragon-shaped Terminal 3.',
    'Long one of Asia’s busiest; the older primary gateway before a newer Daxing airport.',
  ],
  HYD: [
    'A south-central Indian tech-city hub named for a former prime minister.',
    'Known as a greenfield airport with long taxiways outside a software capital.',
  ],
  PER: [
    'One of the world’s most remote major hubs, facing the Indian Ocean.',
    'A western Australian gateway with long “kangaroo route” sectors toward Africa and Asia.',
  ],
  BNE: [
    'A subtropical Australian hub with a parallel runway and river-city approaches.',
    'Gateway to reef and sunshine-state tourism as well as a river metropolis.',
  ],
  EZE: [
    'A Southern Cone capital hub named for a mid-century aviation minister.',
    'Argentina’s main international gateway, inland from a Río de la Plata metropolis.',
  ],
  SCL: [
    'An Andean capital hub with snow-capped peaks often visible on approach.',
    'Chile’s main gateway, a long thin-country stop between the Pacific and the mountains.',
  ],
  BOG: [
    'A high-altitude Andean capital hub, among South America’s busiest.',
    'A Colombian gateway where thin air and mountain weather shape operations.',
  ],
  LIM: [
    'A Pacific South American capital hub named for an early aviator.',
    'Gateway to Incan highland tourism as well as a desert-coast metropolis.',
  ],
  GIG: [
    'A Brazilian coastal hub on an island-like site with dramatic mountain-and-sea views.',
    'Serves a carnival and beach metropolis; the international pier faces the bay.',
  ],
  EWR: [
    'A New York–area hub in a neighboring state, popular with mainland US connections.',
    'One of three big gateways for the same metro; known for a busy United complex.',
  ],
  IAH: [
    'A Texas energy-city hub with a huge intercontinental terminal complex.',
    'A southern US gateway with strong Latin America links and a sprawling campus.',
  ],
  PHX: [
    'A desert Southwest US hub with intense summer heat operations.',
    'Serves a sprawling sunbelt metro; known for a sky-train between terminals.',
  ],
  MSP: [
    'An Upper Midwest US hub between twin cities, strong for northern domestic links.',
    'Known for skyways, cold-weather ops, and a major legacy-carrier fortress.',
  ],
  MCO: [
    'A Florida leisure megahub built around theme-park tourism traffic.',
    'One of the US’s busiest for originating passengers; long landside tram rides.',
  ],
}

/** Broader-than-country region labels. */
export const REGION_BY_IATA: Record<string, string> = {
  AMS: 'Northwest Europe',
  LHR: 'Northwest Europe',
  JFK: 'US Northeast',
  NRT: 'East Asia',
  SFO: 'US West Coast',
  CDG: 'Western Europe',
  SIN: 'Southeast Asia',
  DXB: 'Arabian Gulf',
  FRA: 'Central Europe',
  HKG: 'East Asia',
  LAX: 'US West Coast',
  SYD: 'Oceania',
  ORD: 'US Midwest',
  IST: 'Eastern Mediterranean',
  ICN: 'East Asia',
  MAD: 'Southern Europe',
  BCN: 'Southern Europe',
  FCO: 'Southern Europe',
  MXP: 'Southern Europe',
  MUC: 'Central Europe',
  ZRH: 'Central Europe',
  VIE: 'Central Europe',
  CPH: 'Nordic Europe',
  DUB: 'Northwest Europe',
  ATH: 'Eastern Mediterranean',
  BRU: 'Northwest Europe',
  DOH: 'Arabian Gulf',
  AUH: 'Arabian Gulf',
  CAI: 'North Africa',
  JNB: 'Southern Africa',
  CPT: 'Southern Africa',
  HND: 'East Asia',
  BKK: 'Southeast Asia',
  KUL: 'Southeast Asia',
  TPE: 'East Asia',
  PVG: 'East Asia',
  DEL: 'South Asia',
  BOM: 'South Asia',
  MEL: 'Oceania',
  AKL: 'Oceania',
  ATL: 'US South',
  DFW: 'US South',
  DEN: 'US Mountain West',
  SEA: 'US West Coast',
  MIA: 'US South',
  BOS: 'US Northeast',
  YYZ: 'Eastern Canada',
  YVR: 'Pacific Canada',
  MEX: 'Central America / Mexico',
  GRU: 'South America',
  LIS: 'Southern Europe',
  OSL: 'Nordic Europe',
  ARN: 'Nordic Europe',
  HEL: 'Nordic Europe',
  WAW: 'Central Europe',
  PRG: 'Central Europe',
  BUD: 'Central Europe',
  MAN: 'Northwest Europe',
  EDI: 'Northwest Europe',
  GVA: 'Central Europe',
  ADD: 'East Africa',
  NBO: 'East Africa',
  LOS: 'West Africa',
  CGK: 'Southeast Asia',
  MNL: 'Southeast Asia',
  SGN: 'Southeast Asia',
  HAN: 'Southeast Asia',
  CAN: 'East Asia',
  PEK: 'East Asia',
  HYD: 'South Asia',
  PER: 'Oceania',
  BNE: 'Oceania',
  EZE: 'South America',
  SCL: 'South America',
  BOG: 'South America',
  LIM: 'South America',
  GIG: 'South America',
  EWR: 'US Northeast',
  IAH: 'US South',
  PHX: 'US Southwest',
  MSP: 'US Midwest',
  MCO: 'US South',
}

const MIN_COUNTRY_COUNT = 3

function countryCounts(bank: Airport[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const a of bank) {
    map.set(a.country, (map.get(a.country) ?? 0) + 1)
  }
  return map
}

/** Build a mixed pool and pick one stable hint for the round. */
export function pickHint(airport: Airport, bank: Airport[]): string {
  const pool: string[] = []

  const facts = HINTS_BY_IATA[airport.iata]
  if (facts?.length) pool.push(...facts)

  const region = REGION_BY_IATA[airport.iata]
  if (region) pool.push(`Somewhere in ${region}.`)

  const counts = countryCounts(bank)
  if ((counts.get(airport.country) ?? 0) >= MIN_COUNTRY_COUNT) {
    pool.push(`Somewhere in ${airport.country}.`)
  }

  if (pool.length === 0) {
    return region
      ? `Somewhere in ${region}.`
      : 'A major international hub — look for local cues in the photo.'
  }

  return pool[Math.floor(Math.random() * pool.length)]!
}
