// Import necessary libraries
// For geodesic calculation, we will need to use a library like geolib

// API for SRTM data might differ in JavaScript. You can fetch elevation data from an external API
// This placeholder function mimics getting elevation data.
//[{id : latlon, elevation : float}]
// Store elevations in memory to avoid duplicate API calls

let elevations;
let iterations = 0;
async function getAllElevationData(nodes) {
  const locations = [];
  for (const key in nodes) {
    if (Object.prototype.hasOwnProperty.call(nodes, key)) {
      const element = nodes[key];
      locations.push({ latitude: element.lat, longitude: element.lon });
    }
  }
  const url = `http://localhost:3000/elevation`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ locations: locations }),
  });

  if (!response.ok) throw new Error("API request failed");

  const data = await response.json();
  elevations = data.results;
}
export async function getElevation(lat, lon) {
  // Prepare the locations string for the API call (only for nodes without cached elevation)
  let elevation = 0;
  let found = false;
  let decimals = 5;

  while (!found) {
    elevations.forEach((element) => {
      if (
        element.latitude.toFixed(5) == lat.toFixed(5) &&
        element.longitude.toFixed(5) == lon.toFixed(5)
      ) {
        elevation = element.elevation;
        found = true;
      }
      iterations += 1;
    });
    decimals -= 1;
    if (decimals < 1) {
      return elevation;
    }
  }
  if (!found) {
    console.alert("WTF");
  }

  return elevation;
}

// Geodesic calculation based on latitude and longitude
export function geodesic(lat, lon, point) {
  const segmentLon = 40075000 / 360;
  const segmentLat = 40008000 / 180;
  const pointLat = point[0];
  const pointLon = point[1];
  const side1 = Math.abs(
    Math.abs(lat * segmentLat) - Math.abs(pointLat * segmentLat)
  );
  const side2 = Math.abs(
    Math.abs(lon * segmentLon) - Math.abs(pointLon * segmentLon)
  );
  const diagonal = Math.sqrt(side1 ** 2 + side2 ** 2);
  return diagonal / 2;
}

// Function to get car ways around a coordinate using Overpass API
export async function getCarWaysAroundCoordinate(lat, lon, radius = 1500) {
  const overpassUrl = "http://overpass-api.de/api/interpreter";
  const overpassQuery = `
    [out:json];
    way(around:${radius},${lat},${lon}) 
      ["highway"]
      ["access"!~"private|no|destination"]
      ["highway"!~"service|pedestrian|footway|cycleway|path"];
    (._;>;);
    out body;
    `;
  const response = await fetch(overpassUrl, {
    method: "POST",
    body: new URLSearchParams({ data: overpassQuery }),
  });
  const data = await response.json();

  const nodes = {};
  const ways = [];
  data.elements.forEach((element) => {
    if (element.type === "node") {
      nodes[element.id] = { lat: element.lat, lon: element.lon };
    } else if (element.type === "way") {
      ways.push(element);
    }
  });
  return { ways, nodes };
}

// Function to calculate slope between two points
export async function calculateSlope(p1, p2, numIntermediatePoints = 10) {
  const elevation1 = await getElevation(p1[0], p1[1]);
  const elevation2 = await getElevation(p2[0], p2[1]);

  if (!elevation1 || !elevation2) return null;

  const distance = geodesic(p1[0], p1[1], p2);

  const latDiff = (p2[0] - p1[0]) / (numIntermediatePoints + 1);
  const lonDiff = (p2[1] - p1[1]) / (numIntermediatePoints + 1);

  const elevations = [elevation1];
  for (let i = 1; i <= numIntermediatePoints; i++) {
    const intermediateLat = p1[0] + i * latDiff;
    const intermediateLon = p1[1] + i * lonDiff;
    const elevation = await getElevation(intermediateLat, intermediateLon);
    if (elevation) elevations.push(elevation);
  }
  elevations.push(elevation2);

  const rise = elevations[elevations.length - 1] - elevations[0];
  const slope = (rise / distance) * 100;
  return slope;
}

// Function to find steep roads based on a slope threshold
export async function findSteepRoads(ways, nodes, slopeThreshold = 0) {
  const steepRoads = [];
  let n_slopes = 0;
  let slopes_string = [];
  await getAllElevationData(nodes);
  for (const way of ways) {
    const nodeIds = way.nodes;
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const p1 = [nodes[nodeIds[i]].lat, nodes[nodeIds[i]].lon];
      const p2 = [nodes[nodeIds[i + 1]].lat, nodes[nodeIds[i + 1]].lon];
      if (geodesic(p1[0], p1[1], p2) > 30) {
        const slope = await calculateSlope(p1, p2);
        n_slopes += 1;
        slopes_string.push(slope);
        if (Math.abs(slope) > slopeThreshold && Math.abs(slope) < 40) {
          steepRoads.push({
            start: p1,
            end: p2,
            slope,
            roadType: way.tags.highway || "unknown",
          });
        }
      }
    }
  }

  return steepRoads;
}

// Function to check if a point is on water using Overpass API
export async function isOnWater(lat, lon) {
  const overpassUrl = "http://overpass-api.de/api/interpreter";
  const overpassQuery = `
    [out:json];
    (
      way(around:50, ${lat}, ${lon}) ["natural"="water"];
      relation(around:50, ${lat}, ${lon}) ["natural"="water"];
    );
    out body;
    `;
  const response = await fetch(overpassUrl, {
    method: "POST",
    body: new URLSearchParams({ data: overpassQuery }),
  });
  const data = await response.json();

  return data.elements.length > 0;
}

// Function to clean ways and remove redundant nodes
export function cleanWays(nodes, ways) {
  ways.forEach((way) => {
    const nodeIds = way.nodes;
    const nodesToRemove = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      for (let j = 0; j < nodeIds.length - 1; j++) {
        const p1 = [nodes[nodeIds[i]].lat, nodes[nodeIds[i]].lon];
        const p2 = [nodes[nodeIds[j]].lat, nodes[nodeIds[j]].lon];
        if (p1 !== p2 && geodesic(p1[0], p1[1], p2) < 10) {
          nodesToRemove.push(nodeIds[j]);
        }
      }
    }
    way.nodes = way.nodes.filter((nodeId) => !nodesToRemove.includes(nodeId));
  });
  return ways;
}

// Function to process a single coordinate to find steep roads
export async function processCoordinate(lat, lon) {
  const { ways, nodes } = await getCarWaysAroundCoordinate(lat, lon);
  const steepRoads = await findSteepRoads(ways, nodes);
  return steepRoads;
}
