import Complaint from '../models/Complaint.js';

// Calculate Great Circle Haversine Distance in meters
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// Common stopwords to ignore in text similarity
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'near',
  'beside', 'to', 'of', 'for', 'with', 'from', 'by', 'there', 'this', 'that',
  'very', 'my', 'area', 'location', 'please', 'help', 'having', 'front'
]);

// Tokenize text into normalized tokens
const tokenize = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
};

// Cosine similarity between two text bags of words
export const calculateTextSimilarity = (textA = '', textB = '') => {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const freqA = {};
  const freqB = {};
  const allTokens = new Set([...tokensA, ...tokensB]);

  tokensA.forEach(t => (freqA[t] = (freqA[t] || 0) + 1));
  tokensB.forEach(t => (freqB[t] = (freqB[t] || 0) + 1));

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const token of allTokens) {
    const a = freqA[token] || 0;
    const b = freqB[token] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (magA === 0 || magB === 0) return 0;

  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
};

/**
 * Intelligent Duplicate Detection Service
 * Retrieves complaints within 500m radius and computes semantic text similarity.
 */
export const checkDuplicateComplaint = async ({
  title,
  description,
  latitude,
  longitude,
  mainCategory,
  excludeId = null,
  radiusMeters = 500,
}) => {
  const query = {
    status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] }, // active issues
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  // 1. Geospatial retrieval (up to 1.5km to ensure we don't miss borderline items)
  let candidates = [];
  try {
    candidates = await Complaint.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusMeters,
        },
      },
    }).limit(10);
  } catch (geoErr) {
    // In case 2dsphere index is still building or mock db, fallback to manual Haversine
    const allActive = await Complaint.find(query).limit(50);
    candidates = allActive.filter(c => {
      if (!c.location?.coordinates) return false;
      const [cLng, cLat] = c.location.coordinates;
      const dist = calculateDistanceMeters(latitude, longitude, cLat, cLng);
      return dist <= radiusMeters;
    });
  }

  // Format candidates with distance and similarity
  const targetText = `${title} ${description}`;
  let highestSimilarity = 0;
  let matchedComplaint = null;

  const nearbyComplaints = candidates.map(c => {
    const [cLng, cLat] = c.location.coordinates;
    const distance = calculateDistanceMeters(latitude, longitude, cLat, cLng);
    const candidateText = `${c.title} ${c.description}`;
    const sim = calculateTextSimilarity(targetText, candidateText);
    
    // Give boost if same category
    const categoryBoost = c.mainCategory === mainCategory ? 0.15 : 0;
    const finalScore = Math.min(1.0, sim + categoryBoost);

    if (finalScore > highestSimilarity) {
      highestSimilarity = finalScore;
      matchedComplaint = c;
    }

    return {
      _id: c._id,
      trackingId: c.trackingId,
      title: c.title,
      description: c.description,
      mainCategory: c.mainCategory,
      subcategory: c.subcategory,
      status: c.status,
      formattedAddress: c.formattedAddress,
      distanceMeters: distance,
      similarityScore: Math.round(finalScore * 100) / 100,
      createdAt: c.createdAt,
    };
  });

  // Sort by closest distance
  nearbyComplaints.sort((a, b) => a.distanceMeters - b.distanceMeters);

  // If similarity is above 0.55 and within 500m, flag as probable duplicate
  const isDuplicateFlagged = highestSimilarity >= 0.55 && matchedComplaint !== null;

  return {
    isDuplicate: isDuplicateFlagged,
    similarityScore: Math.round(highestSimilarity * 100) / 100,
    matchedComplaint: isDuplicateFlagged ? {
      _id: matchedComplaint._id,
      trackingId: matchedComplaint.trackingId,
      title: matchedComplaint.title,
      mainCategory: matchedComplaint.mainCategory,
      status: matchedComplaint.status,
    } : null,
    nearbyComplaints,
    countInRadius: nearbyComplaints.length,
  };
};
