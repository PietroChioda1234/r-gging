// Import the necessary math functions and utilities
import { processCoordinate } from "./slopes"; // Assuming previous code is in this file
import { findSharpTurns, getCarWaysAroundCoordinate } from "./curves";
// Helper function to calculate logarithm with any base
function logBase(val, base) {
  return Math.log(val) / Math.log(base);
}

// Function to calculate a value based on slopes
function funAlg(slopes, threshold = 8) {
  let overThresholdSlopes = 0;

  for (let i = 0; i < slopes.length; i++) {
    if (slopes[i] > threshold) {
      overThresholdSlopes += logBase(slopes[i], 24); // Logarithm to base 22
    }
  }

  const percentageHighSlopes = overThresholdSlopes / slopes.length;

  if (percentageHighSlopes > 0) {
    return (logBase(percentageHighSlopes, 10) + 1) * 100;
  }

  return 0;
}

// Main function to process the coordinate and calculate steep roads and sharp turns
async function processCoordinateData(lat, lon) {
  // Slope calculations for steep roads
  const steepRoads = await processCoordinate(lat, lon); // Call the function to get steep roads
  const allData = [];
  const slopesInfo = [];
  console.log(steepRoads.length); //
  // Loop through steep roads to extract slope data
  for (const road of steepRoads) {
    allData.push(Math.abs(road.slope)); // Collect slope data
    slopesInfo.push({
      degree: Math.abs(road.slope),
      coordinates: [road.start, road.end],
    });
  }

  // Calculate the funAlg value for slopes above the threshold
  const funValue = funAlg(allData, 7);

  // Turn calculations (sharp turns)
  const { ways, nodes } = await getCarWaysAroundCoordinate(lat, lon);
  console.log(ways, nodes);
  const sharpTurns = await findSharpTurns(ways, nodes); // Assuming `findSharpTurns` function exists as per the Python code

  let curvesCount = 0;
  for (const turn of sharpTurns) {
    const { angle, roadType } = turn;
    // if (angle > 30 && roadType !== "service" && roadType !== "residential") {
    //   curvesCount += 1; // Count the valid sharp turns
    // }
    if (angle > 40) {
      curvesCount += 1;
    }
  }

  // Constructing the final object with results
  const newObject = {
    type: "", // Replace with dynamic value if needed
    tags: {
      type: steepRoads.length > 0 ? steepRoads[0].roadType : "unknown",
    },
    coordinates: [parseFloat(lat), parseFloat(lon)], // Convert lat/lon to float
    curves: curvesCount, // Number of sharp turns
    slope: funValue, // Fun algorithm value for slopes
    slopes_info: slopesInfo, // Detailed slope info
  };

  // Return or handle the result object
  return newObject;
}

// Example usage:
export default async function getMarkerInfo(lat, lon) {
  // Example latitude (replace with real input)
  // Example longitude (replace with real input)
  const result = await processCoordinateData(lat, lon);
  return result;
}
