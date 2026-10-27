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
    keywords: [
      'pothole', 'road', 'asphalt', 'tar', 'crater', 'divider', 'footpath', 
      'pavement', 'sidewalk', 'speed breaker', 'hump', 'flyover', 'bridge', 
      'manhole', 'culvert', 'ditch', 'tarmac'
    ],
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
    keywords: [
      'streetlight', 'street light', 'lamp', 'darkness', 'bulb', 'electric', 
      'wire', 'pole', 'transformer', 'sparking', 'short circuit', 'current', 
      'shock', 'cable', 'power line'
    ],
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
    keywords: [
      'garbage', 'waste', 'trash', 'rubbish', 'dustbin', 'dump', 'stench', 
      'smell', 'sewage', 'drain', 'drainage', 'gutter', 'dead animal', 
      'carcass', 'sanitation', 'toilet', 'plastic waste', 'filth'
    ],
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
    keywords: [
      'water', 'pipe', 'pipeline', 'leak', 'leakage', 'burst', 'tap water', 
      'drinking water', 'dirty water', 'muddy water', 'contamination', 
      'supply', 'borewell', 'water tank', 'flow'
    ],
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
    keywords: [
      'fallen tree', 'branch', 'tree', 'trench', 'pit', 'stray dog', 
      'dog bite', 'monkey', 'hazard', 'safety', 'danger', 'encroachment', 
      'wall collapse', 'barrier', 'flooding'
    ],
  },
};

/**
 * Rule-based fallback classifier
 */
export const ruleBasedClassifier = (title = '', description = '') => {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  let bestCategory = 'Roads & Infrastructure';
  let bestSubcategory = 'Pothole';
  let maxScore = 0;

  for (const [category, data] of Object.entries(CIVIC_TAXONOMY)) {
    let score = 0;
    for (const kw of data.keywords) {
      if (combinedText.includes(kw)) {
        score += (title.toLowerCase().includes(kw) ? 3 : 1);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
      
      // Attempt subcategory resolution
      const sub = data.subcategories.find(s => 
        combinedText.includes(s.toLowerCase().split(' ')[0])
      );
      bestSubcategory = sub || data.subcategories[0];
    }
  }

  // Estimate severity based on risk keywords
  let severity = 'MEDIUM';
  const criticalWords = ['danger', 'accident', 'burst', 'collapsed', 'electrocution', 'severe', 'sparking', 'critical', 'urgent', 'hospital', 'open manhole'];
  const highWords = ['heavy', 'deep', 'overflowing', 'blocked', 'major', 'huge', 'contaminated', 'foul', 'broken'];
  const lowWords = ['minor', 'small', 'flickering', 'dim', 'slight', 'aesthetic'];

  if (criticalWords.some(w => combinedText.includes(w))) {
    severity = 'CRITICAL';
  } else if (highWords.some(w => combinedText.includes(w))) {
    severity = 'HIGH';
  } else if (lowWords.some(w => combinedText.includes(w))) {
    severity = 'LOW';
  }

  const confidence = maxScore > 0 ? Math.min(0.95, 0.65 + (maxScore * 0.05)) : 0.55;

  return {
    isAiAssisted: false,
    predictedCategory: bestCategory,
    predictedSubcategory: bestSubcategory,
    department: CIVIC_TAXONOMY[bestCategory].department,
    predictedSeverity: severity,
    confidenceScore: Math.round(confidence * 100) / 100,
    explanation: 'Rule-based taxonomy heuristic matching civic keywords and urgency triggers.',
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
