export const CIVIC_TAXONOMY = {
  'Roads & Infrastructure': {
    department: 'Roads & Infrastructure',
    subcategories: [
      'Pothole',
      'Damaged Road Surface',
      'Broken Footpath/Pavement',
      'Missing Manhole Cover',
      'Bridge/Flyover Defect',
      'Illegal Road Cutting',
    ],
    phrases: [
      'hole in road', 'road hole', 'hole in the street', 'hole in the road',
      'pothole', 'potholes', 'damaged road', 'broken road', 'bad road', 'poor road',
      'road surface', 'tar road', 'cement road', 'gravel road', 'open manhole',
      'manhole open', 'missing manhole', 'manhole cover', 'drain cover missing',
      'broken footpath', 'broken pavement', 'broken sidewalk', 'pedestrian path',
      'speed breaker', 'illegal speed breaker', 'road cutting', 'digging road',
      'unauthorized digging', 'road cracked', 'cracked road', 'uneven road',
      'waterlogging on road', 'culvert broken', 'bridge crack', 'flyover crack',
      'cave in', 'road caved in', 'sinkhole', 'crater on road', 'street road'
    ],
    keywords: [
      'pothole', 'potholes', 'hole', 'holes', 'pit', 'pits', 'crater', 'craters',
      'sinkhole', 'sinkholes', 'asphalt', 'tar', 'tarmac', 'road', 'roads',
      'footpath', 'footpaths', 'pavement', 'pavements', 'sidewalk', 'sidewalks',
      'divider', 'dividers', 'median', 'curb', 'kerb', 'flyover', 'flyovers',
      'bridge', 'bridges', 'overpass', 'underpass', 'subway', 'culvert', 'culverts',
      'manhole', 'manholes', 'chamber', 'ditch', 'ditches', 'caved', 'rut', 'ruts',
      'gravel', 'paver', 'pavers', 'speedbreaker', 'bump'
    ],
    conceptObjects: [
      'road', 'roads', 'street road', 'pavement', 'footpath', 'sidewalk',
      'highway', 'lane', 'tarmac', 'asphalt', 'divider', 'bridge', 'flyover',
      'culvert', 'speedbreaker', 'curb'
    ],
    conceptDefects: [
      'hole', 'holes', 'pothole', 'potholes', 'pit', 'pits', 'crater', 'craters',
      'broken', 'damaged', 'crack', 'cracks', 'cracked', 'caved', 'sinkhole',
      'uneven', 'rough', 'digging', 'cutting', 'patch', 'open manhole', 'missing cover'
    ],
    subKeywords: {
      'Pothole': ['pothole', 'potholes', 'hole', 'holes', 'crater', 'craters', 'pit', 'pits', 'sinkhole', 'sinkholes', 'depression', 'cavity'],
      'Damaged Road Surface': ['damaged road', 'broken road', 'tar', 'asphalt', 'surface', 'rough road', 'gravel', 'cracked road', 'uneven', 'erosion'],
      'Broken Footpath/Pavement': ['footpath', 'pavement', 'sidewalk', 'pedestrian', 'walkway', 'paver block', 'curb'],
      'Missing Manhole Cover': ['manhole', 'open drain cover', 'drain lid', 'manhole cover', 'open manhole', 'chamber lid'],
      'Bridge/Flyover Defect': ['bridge', 'flyover', 'overpass', 'expansion joint', 'flyover crack', 'pier'],
      'Illegal Road Cutting': ['road cutting', 'digging road', 'unauthorized cutting', 'trench cutting', 'cable digging'],
    },
  },
  'Streetlights & Electricity': {
    department: 'Streetlights & Electricity',
    subcategories: [
      'Streetlight Outage',
      'Exposed/Hanging Electric Wire',
      'Sparking Electric Pole',
      'Damaged Transformer',
      'Open Distribution Box',
    ],
    phrases: [
      'street light', 'street lights', 'streetlight', 'streetlights', 'lamp post',
      'light pole', 'electric pole', 'hanging wire', 'hanging wires', 'loose wire',
      'exposed wire', 'open wire', 'sparking pole', 'electric spark', 'electric wire',
      'power cut', 'no street light', 'lights not working', 'light not working',
      'dark street', 'pitch dark', 'short circuit', 'open distribution box',
      'damaged transformer', 'transformer blast', 'electric shock', 'current leakage',
      'feeder pillar', 'electric box', 'meter box', 'high voltage', 'eb pole'
    ],
    keywords: [
      'streetlight', 'streetlights', 'lamp', 'lamps', 'lamppost', 'bulb', 'bulbs',
      'lighting', 'darkness', 'dark', 'electric', 'electricity', 'wire', 'wires',
      'cable', 'cables', 'transformer', 'transformers', 'spark', 'sparking', 'sparks',
      'electrocution', 'shock', 'fuse', 'blackout', 'pillar', 'voltage', 'powerline'
    ],
    conceptObjects: [
      'streetlight', 'streetlights', 'street light', 'lamp', 'lamppost', 'bulb',
      'wire', 'wires', 'cable', 'cables', 'pole', 'electric pole', 'transformer',
      'distribution box', 'feeder pillar', 'fuse', 'power line'
    ],
    conceptDefects: [
      'outage', 'dark', 'darkness', 'off', 'not working', 'pitch dark', 'hanging',
      'exposed', 'open', 'loose', 'spark', 'sparking', 'sparks', 'fire', 'shock',
      'electrocution', 'short circuit', 'power cut', 'blackout', 'flickering', 'broken', 'blast'
    ],
    subKeywords: {
      'Streetlight Outage': ['outage', 'darkness', 'dark', 'off', 'not working', 'bulb', 'light', 'streetlight', 'street light', 'pitch dark', 'flickering', 'dim'],
      'Exposed/Hanging Electric Wire': ['hanging wire', 'exposed wire', 'open wire', 'loose wire', 'cable', 'dangling wire', 'wire'],
      'Sparking Electric Pole': ['sparking', 'spark', 'pole fire', 'smoke', 'electric pole', 'short circuit', 'sparks'],
      'Damaged Transformer': ['transformer', 'substation', 'oil leak', 'transformer blast', 'burnt transformer'],
      'Open Distribution Box': ['distribution box', 'feeder pillar', 'open box', 'electric panel', 'meter box', 'junction box'],
    },
  },
  'Waste Management & Sanitation': {
    department: 'Waste Management & Sanitation',
    subcategories: [
      'Garbage Dump Accumulation',
      'Overflowing Community Bin',
      'Dead Animal Removal',
      'Sewage Overflow / Clogged Drain',
      'Public Toilet Sanitation',
      'Littering Hotspot',
    ],
    phrases: [
      'garbage dump', 'garbage pile', 'trash pile', 'waste dump', 'overflowing bin',
      'overflowing dustbin', 'full dustbin', 'dead animal', 'dead dog', 'dead cat',
      'dead cow', 'dead bird', 'animal carcass', 'clogged drain', 'blocked drain',
      'drain blockage', 'choked drain', 'sewage overflow', 'sewage leak',
      'sewage water', 'drain water', 'waste pile', 'foul smell', 'bad smell',
      'stinking garbage', 'public toilet', 'urinal dirty', 'drain block',
      'drainage overflow', 'gutter overflow', 'plastic waste', 'open dumping',
      'garbage truck', 'waste collection'
    ],
    keywords: [
      'garbage', 'trash', 'waste', 'rubbish', 'debris', 'dustbin', 'bin', 'bins',
      'dump', 'dumping', 'stench', 'stink', 'stinking', 'smell', 'odour', 'odor',
      'sewage', 'sewer', 'sewerage', 'drain', 'drains', 'drainage', 'gutter',
      'gutters', 'carcass', 'dead', 'sanitation', 'toilet', 'toilets', 'urinal',
      'urinals', 'restroom', 'latrine', 'litter', 'littering', 'filth', 'hygiene'
    ],
    conceptObjects: [
      'garbage', 'trash', 'waste', 'rubbish', 'dustbin', 'bin', 'drain',
      'drainage', 'gutter', 'sewage', 'sewer', 'toilet', 'urinal', 'animal', 'carcass'
    ],
    conceptDefects: [
      'dump', 'dumped', 'dumping', 'overflow', 'overflowing', 'pile', 'piled',
      'clog', 'clogged', 'blocked', 'choke', 'choked', 'smell', 'bad smell',
      'foul smell', 'stench', 'stink', 'stinking', 'dirty', 'filth', 'dead',
      'not cleaned', 'uncleaned'
    ],
    subKeywords: {
      'Garbage Dump Accumulation': ['garbage dump', 'trash pile', 'waste dump', 'rubbish', 'garbage', 'waste pile', 'dumping site', 'heap of garbage'],
      'Overflowing Community Bin': ['overflowing bin', 'dustbin', 'bin overflow', 'full bin', 'bin', 'garbage container'],
      'Dead Animal Removal': ['dead animal', 'carcass', 'dead dog', 'dead cat', 'dead bird', 'dead cow', 'animal body', 'decaying'],
      'Sewage Overflow / Clogged Drain': ['sewage', 'clogged drain', 'drain overflow', 'gutter', 'drain block', 'drain', 'drainage', 'sewer overflow', 'choked gutter'],
      'Public Toilet Sanitation': ['toilet', 'restroom', 'urinal', 'washroom', 'latrine', 'public toilet'],
      'Littering Hotspot': ['litter', 'plastic waste', 'bottles', 'dumping', 'littering', 'plastic bags'],
    },
  },
  'Water Supply': {
    department: 'Water Supply',
    subcategories: [
      'Pipeline Leakage / Burst',
      'Contaminated Drinking Water',
      'Low Water Pressure',
      'No Water Supply',
      'Borewell Malfunction',
    ],
    phrases: [
      'water pipe', 'pipe leak', 'pipe leakage', 'pipe is leaking', 'water leaking',
      'water leak', 'burst pipe', 'pipe burst', 'drinking water', 'drink water',
      'potable water', 'no water', 'water shortage', 'water cut', 'dirty water',
      'muddy water', 'yellow water', 'smelly water', 'low water pressure',
      'water pressure', 'slow water', 'water supply', 'tap water', 'borewell motor',
      'borewell pump', 'water tank', 'tanker water', 'overhead tank', 'sump motor',
      'water contamination', 'water pipeline', 'faucet leak', 'tap leaking'
    ],
    keywords: [
      'water', 'pipe', 'pipes', 'pipeline', 'pipelines', 'leak', 'leaks',
      'leaking', 'leakage', 'burst', 'bursting', 'tap', 'taps', 'borewell',
      'tank', 'tanks', 'drinking', 'drink', 'potable', 'supply', 'faucet',
      'faucets', 'motor', 'pump', 'pumping', 'chlorine', 'muddy', 'pressure',
      'trickle', 'trickling', 'hydrant', 'plumbing', 'sump', 'overhead'
    ],
    conceptObjects: [
      'water', 'pipe', 'pipes', 'pipeline', 'tap', 'faucet', 'borewell',
      'motor', 'pump', 'tank', 'sump', 'drinking water', 'water supply'
    ],
    conceptDefects: [
      'leak', 'leaks', 'leaking', 'leakage', 'burst', 'bursting', 'no water',
      'low pressure', 'pressure', 'dirty', 'contaminated', 'muddy', 'smell',
      'shortage', 'cut', 'dry', 'broken', 'trickle'
    ],
    subKeywords: {
      'Pipeline Leakage / Burst': ['pipe', 'pipeline', 'leak', 'leakage', 'leaking', 'burst', 'water pipe', 'broken pipe', 'main line burst'],
      'Contaminated Drinking Water': ['contaminated', 'drinking water', 'drink water', 'dirty water', 'muddy water', 'drink', 'drinking', 'bad taste', 'yellow water', 'smell'],
      'Low Water Pressure': ['low pressure', 'slow flow', 'trickle', 'pressure', 'slow water', 'scanty water'],
      'No Water Supply': ['no water', 'supply stopped', 'water cut', 'dry tap', 'not coming', 'water shortage'],
      'Borewell Malfunction': ['borewell', 'motor', 'pump', 'submersible', 'bore', 'motor burnt', 'no suction'],
    },
  },
  'Public Safety & Other Civic Hazards': {
    department: 'Public Safety & Other Civic Hazards',
    subcategories: [
      'Fallen Tree / Heavy Branches',
      'Dangerous Open Trench',
      'Stray Dog / Animal Menace',
      'Unauthorized Encroachment',
      'Structural Collapse Risk',
    ],
    phrases: [
      'fallen tree', 'tree fallen', 'tree fell', 'tree branch', 'heavy branch',
      'broken branch', 'uprooted tree', 'open trench', 'deep pit', 'open excavation',
      'construction ditch', 'stray dog', 'stray dogs', 'dog bite', 'dog menace',
      'rabid dog', 'aggressive dog', 'barking dog', 'monkey menace', 'animal attack',
      'building collapse', 'wall collapse', 'cracked building', 'falling plaster',
      'roof collapse', 'unauthorized encroachment', 'illegal construction',
      'blocking footpath', 'blocking road', 'safety hazard'
    ],
    keywords: [
      'tree', 'trees', 'branch', 'branches', 'uprooted', 'timber', 'trench',
      'trenches', 'excavation', 'stray', 'dog', 'dogs', 'puppy', 'puppies',
      'monkey', 'monkeys', 'cattle', 'bull', 'snake', 'bite', 'bites',
      'hazard', 'danger', 'dangerous', 'safety', 'risk', 'encroachment',
      'illegal', 'collapse', 'collapsed', 'collapsing', 'plaster', 'rubble'
    ],
    conceptObjects: [
      'tree', 'trees', 'branch', 'branches', 'trench', 'trenches', 'pit',
      'dog', 'dogs', 'stray dog', 'monkey', 'monkeys', 'building', 'wall', 'encroachment'
    ],
    conceptDefects: [
      'fallen', 'fell', 'uprooted', 'bite', 'biting', 'aggressive', 'menace',
      'danger', 'dangerous', 'hazard', 'collapse', 'collapsed', 'collapsing',
      'cracked', 'illegal', 'blocking'
    ],
    subKeywords: {
      'Fallen Tree / Heavy Branches': ['fallen tree', 'branch', 'tree fallen', 'heavy branch', 'tree', 'uprooted tree', 'blocking branch'],
      'Dangerous Open Trench': ['open trench', 'trench', 'deep pit', 'open ditch', 'pit', 'excavation', 'open pit'],
      'Stray Dog / Animal Menace': ['stray dog', 'dog bite', 'monkey menace', 'animal bite', 'aggressive dog', 'dog', 'monkey', 'stray animals', 'rabid'],
      'Unauthorized Encroachment': ['encroachment', 'illegal structure', 'blocking road', 'pavement shop', 'illegal construction', 'blocked pathway'],
      'Structural Collapse Risk': ['collapse', 'wall fall', 'building cracked', 'falling plaster', 'roof collapsed', 'dilapidated building'],
    },
  },
};

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const countWordOccurrences = (text, term) => {
  if (!text || !term) return 0;
  const pattern = new RegExp(`\\b${escapeRegex(term.toLowerCase())}\\b`, 'gi');
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

const countPhraseOccurrences = (text, phrase) => {
  if (!text || !phrase) return 0;
  const pattern = new RegExp(`${escapeRegex(phrase.toLowerCase())}`, 'gi');
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

/**
 * Intelligent Rule-based NLP classifier using Term-Frequency (TF), concept co-occurrence,
 * and narrative-dominant weighting
 */
export const ruleBasedClassifier = (title = '', description = '') => {
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  const combinedText = `${t} ${d}`.trim();
  
  let bestCategory = 'Roads & Infrastructure';
  let bestScore = -1;

  for (const [category, data] of Object.entries(CIVIC_TAXONOMY)) {
    let titleScore = 0;
    let descScore = 0;

    // 1. Multi-word phrase matches (Phrases provide strong contextual intent)
    if (data.phrases) {
      for (const phrase of data.phrases) {
        const cntInTitle = countPhraseOccurrences(t, phrase);
        const cntInDesc = countPhraseOccurrences(d, phrase);
        if (cntInTitle > 0) titleScore += cntInTitle * 4.0;
        if (cntInDesc > 0) descScore += cntInDesc * 7.0;
      }
    }

    // 2. Keyword occurrences with word boundaries (avoids substring collisions)
    for (const kw of data.keywords) {
      const inTitle = countWordOccurrences(t, kw);
      const inDesc = countWordOccurrences(d, kw);
      if (inTitle > 0) titleScore += inTitle * 1.5;
      if (inDesc > 0) descScore += inDesc * 2.5;
    }

    // 3. Semantic Concept Co-occurrence (Asset/Object + Defect/Condition pairing)
    if (data.conceptObjects && data.conceptDefects) {
      const hasObjInDesc = data.conceptObjects.some(obj => d.includes(obj));
      const hasDefectInDesc = data.conceptDefects.some(def => d.includes(def));
      if (hasObjInDesc && hasDefectInDesc) {
        descScore += 10.0;
      }

      const hasObjInTitle = data.conceptObjects.some(obj => t.includes(obj));
      const hasDefectInTitle = data.conceptDefects.some(def => t.includes(def));
      if (hasObjInTitle && hasDefectInTitle) {
        titleScore += 5.0;
      }
    }

    // 4. Distractor Shield:
    // If a category matches ONLY in title with 0 description confirmation,
    // and the customer has written an actual description (> 10 chars),
    // heavily discount the title score (80% penalty) because descriptions carry actual intent.
    if (descScore === 0 && titleScore > 0 && d.trim().length > 10) {
      titleScore = titleScore * 0.2;
    }

    const totalScore = titleScore + descScore;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestCategory = category;
    }
  }

  // 5. Subcategory resolution
  const catData = CIVIC_TAXONOMY[bestCategory];
  let bestSubcategory = catData.subcategories[0];
  let bestSubScore = -1;

  if (catData.subKeywords) {
    for (const [sub, kwList] of Object.entries(catData.subKeywords)) {
      let subScore = 0;
      for (const sk of kwList) {
        const inDesc = sk.includes(' ') ? countPhraseOccurrences(d, sk) : countWordOccurrences(d, sk);
        const inTitle = sk.includes(' ') ? countPhraseOccurrences(t, sk) : countWordOccurrences(t, sk);
        subScore += (inDesc * (sk.includes(' ') ? 4 : 2)) + (inTitle * (sk.includes(' ') ? 2 : 1));
      }
      if (subScore > bestSubScore) {
        bestSubScore = subScore;
        bestSubcategory = sub;
      }
    }
  }

  // Estimate severity based on risk keywords
  let severity = 'MEDIUM';
  const criticalWords = ['danger', 'accident', 'burst', 'collapsed', 'electrocution', 'severe', 'sparking', 'critical', 'urgent', 'hospital', 'open manhole', 'fire', 'live wire', 'blast'];
  const highWords = ['heavy', 'deep', 'overflowing', 'blocked', 'major', 'huge', 'contaminated', 'foul', 'broken', 'leaking', 'stinking', 'bite'];
  const lowWords = ['minor', 'small', 'flickering', 'dim', 'slight', 'aesthetic', 'slow'];

  if (criticalWords.some(w => combinedText.includes(w))) {
    severity = 'CRITICAL';
  } else if (highWords.some(w => combinedText.includes(w))) {
    severity = 'HIGH';
  } else if (lowWords.some(w => combinedText.includes(w))) {
    severity = 'LOW';
  }

  const confidence = bestScore > 0 ? Math.min(0.98, 0.75 + (bestScore * 0.015)) : 0.60;

  return {
    isAiAssisted: false,
    predictedCategory: bestCategory,
    predictedSubcategory: bestSubcategory,
    department: CIVIC_TAXONOMY[bestCategory].department,
    predictedSeverity: severity,
    confidenceScore: Math.round(confidence * 100) / 100,
    explanation: `NLP detected ${bestCategory} (${bestSubcategory}) based on narrative semantics and matched civic indicators.`,
  };
};

/**
 * AI-assisted classifier using Google Gemini (with graceful rule-based fallback)
 */
export const classifyCivicIssue = async (title = '', description = '') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return ruleBasedClassifier(title, description);
  }

  try {
    const prompt = `You are the CivicEye AI municipal triage engine. Analyze the following civic complaint:
Title: "${title}"
Description: "${description}"

Allowed categories and subcategories:
1. Roads & Infrastructure (Subcategories: Pothole, Damaged Road Surface, Broken Footpath/Pavement, Missing Manhole Cover, Bridge/Flyover Defect, Illegal Road Cutting)
2. Streetlights & Electricity (Subcategories: Streetlight Outage, Exposed/Hanging Electric Wire, Sparking Electric Pole, Damaged Transformer, Open Distribution Box)
3. Waste Management & Sanitation (Subcategories: Garbage Dump Accumulation, Overflowing Community Bin, Dead Animal Removal, Sewage Overflow / Clogged Drain, Public Toilet Sanitation, Littering Hotspot)
4. Water Supply (Subcategories: Pipeline Leakage / Burst, Contaminated Drinking Water, Low Water Pressure, No Water Supply, Borewell Malfunction)
5. Public Safety & Other Civic Hazards (Subcategories: Fallen Tree / Heavy Branches, Dangerous Open Trench, Stray Dog / Animal Menace, Unauthorized Encroachment, Structural Collapse Risk)

Respond strictly in valid JSON with these keys:
{
  "category": "One of the 5 exact category names above",
  "subcategory": "One of the listed subcategories",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": number between 0.5 and 0.99,
  "explanation": "One concise sentence explaining why"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      }),
    });

    if (!response.ok) {
      console.warn(`[CivicEye AI] Gemini API returned status ${response.status}, falling back to rule engine.`);
      return ruleBasedClassifier(title, description);
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(textOutput);

    const validCategory = CIVIC_TAXONOMY[parsed.category] ? parsed.category : 'Roads & Infrastructure';

    return {
      isAiAssisted: true,
      predictedCategory: validCategory,
      predictedSubcategory: parsed.subcategory || CIVIC_TAXONOMY[validCategory].subcategories[0],
      department: CIVIC_TAXONOMY[validCategory].department,
      predictedSeverity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.severity) ? parsed.severity : 'MEDIUM',
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.92,
      explanation: parsed.explanation || 'Classified via Google Gemini NLP model.',
    };
  } catch (err) {
    console.warn(`[CivicEye AI] Error connecting to Gemini API: ${err.message}. Using rule-based fallback.`);
    return ruleBasedClassifier(title, description);
  }
};
