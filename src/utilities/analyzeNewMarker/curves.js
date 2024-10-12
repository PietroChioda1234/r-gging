import React from "react";

// Function to fetch car ways around a given coordinate and calculate the sharp turns
export async function getCarWaysAroundCoordinate(lat, lon, radius = 1500) {
  const overpassUrl = "http://overpass-api.de/api/interpreter";
  const overpassQuery = `
    [out:json];
    way(around:${radius},${lat},${lon}) ["highway"~"^(primary|secondary|tertiary|residential|unclassified|service|motorway|trunk)$"];
    (._;>;);
    out body;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: overpassQuery }),
    });
    const data = await response.json();

    const elements = data.elements;

    const nodes = elements
      .filter((element) => element.type === "node")
      .reduce((acc, element) => {
        acc[element.id] = [element.lat, element.lon];
        return acc;
      }, {});

    const ways = elements.filter((element) => element.type === "way");
    return { ways, nodes };
  } catch (error) {
    console.error("Error fetching data from Overpass API:", error);
    return { ways: [], nodes: {} };
  }
}

// Function to calculate the turn angle
export function calculateTurnAngle(p1, p2, p3) {
  const line1 = [p2[0] - p1[0], p2[1] - p1[1]];
  const line2 = [p3[0] - p2[0], p3[1] - p2[1]];

  const dotProduct = line1[0] * line2[0] + line1[1] * line2[1];
  const magnitude1 = Math.sqrt(line1[0] ** 2 + line1[1] ** 2);
  const magnitude2 = Math.sqrt(line2[0] ** 2 + line2[1] ** 2);

  const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
  return (angle * 180) / Math.PI;
}

// Function to find sharp turns
export async  function findSharpTurns(ways, nodes, threshold = 60) {
  const sharpTurns = [];

  ways.forEach((way) => {
    const nodeIds = way.nodes;
    if (nodeIds.length < 3) return;

    for (let i = 0; i < nodeIds.length - 2; i++) {
      const p1 = nodes[nodeIds[i]];
      const p2 = nodes[nodeIds[i + 1]];
      const p3 = nodes[nodeIds[i + 2]];

      const angle = calculateTurnAngle(p1, p2, p3);
      if (angle < threshold) {
        sharpTurns.push({
          location: p2,
          angle,
          roadType: way.tags?.highway || "unknown",
        });
      }
    }
  });

  return sharpTurns;
}
