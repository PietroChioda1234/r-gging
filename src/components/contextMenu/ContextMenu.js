import React from "react";
import "./style/contextMenu.css"; // Import the CSS file
import { fromLonLat, toLonLat } from "ol/proj";
import { useState } from "react";
import { unByKey } from "ol/Observable";
import showContextMenu, {
  positionContextMenu,
} from "../../utilities/contextMenuFunctions";
const keys = [];
function calculateDistance(lonlat1, lonlat2) {
  var dx = lonlat1[0] - lonlat2[0];
  var dy = lonlat1[1] - lonlat2[1];
  return Math.sqrt(dx * dx + dy * dy); // Euclidean distance
}
function getClosestMarker(minDistance) {
  const lon = parseFloat(sessionStorage.getItem("longitude"));
  const lat = parseFloat(sessionStorage.getItem("latitude"));
  // Convert pixel to geographic coordinates
  var closestMarker = null;
  // Loop through all markers in the markersLayer
  var markers = JSON.parse(sessionStorage.getItem("markers"));
  if (markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      const coords_meters = fromLonLat([lon, lat]);
      const coords_marker = fromLonLat([
        marker.coordinates[1],
        marker.coordinates[0],
      ]);
      // console.log(coords_meters, coords_marker);
      // Calculate the distance(meters) between the current marker and the given lonlat
      var distance = calculateDistance(coords_meters, coords_marker);
      console.log(distance + " " + i);
      // Check if this is the smallest distance found so far
      if (distance <= minDistance) {
        closestMarker = marker;
      }
    }
  }

  // Return the closest marker's coordinates (or null if no marker is found)
  return closestMarker;
}
// export function showContextMenu(event) {
//   console.log(markers.markers[1]);
//   const menu = document.getElementById("contextMenu");

//   toggleContextMenuDisplay(menu, event);
//   const mapOffset = getMapOffset();
//   const closestMarker = findClosestMarker(event, mapOffset);
//   console.log(closestMarker);

//   if (!closestMarker) {
//     handleNoMarkerCase(event, menu, mapOffset);
//   } else {
//     handleMarkerCase(menu, closestMarker);
//   }

//   transformedLonLat = convertCoordsIfWrong(transformedLonLat);
//   setupContextMenuActions(transformedLonLat);
//   manageListenersForVoting();
//   // Prevent the default context menu from appearing
//   event.preventDefault();
// }
export default function ContextMenu({ map }) {
  const new_key = map.on("contextmenu", (event) => {
    const menu = document.getElementById("contextMenu");

    event.preventDefault();
    const lonLat = toLonLat(event.coordinate);
    sessionStorage.setItem("longitude", lonLat[0]);
    sessionStorage.setItem("latitude", lonLat[1]);
    const closestMarker = getClosestMarker(1400);
    if (closestMarker) {
      sessionStorage.setItem("longitude", closestMarker.coordinates[1]);
      sessionStorage.setItem("latitude", closestMarker.coordinates[0]);
    }
    positionContextMenu(menu, event);
    showContextMenu(event, closestMarker, map);
    keys.forEach((key, index) => {
      if (index > 0 && key) {
        // Make sure key is valid
        unByKey(key); // Remove listener correctly
      }
    });
  });
  keys.push(new_key);

  map.on("click", (event) => {
    const menu = document.getElementById("contextMenu");
    if (menu) {
      menu.style.display = "none";
    }
  });
  map.on("zoomstart", (event) => {
    const menu = document.getElementById("contextMenu");

    if (menu) {
      menu.style.display = "none";
    }
  });
  map.on("movestart", (event) => {
    const menu = document.getElementById("contextMenu");
    if (menu) {
      menu.style.display = "none";
    }
  });
  return (
    <div
      id="contextMenu"
      className="context-menu"
      style={{
        display: "none",
        position: "absolute",
      }}
    >
      <ul>
        <li
          id="copy-coordinates"
          className="px-5 font-bold font-sans hover:bg-yellow-200 cursor-pointer"
        >
          Copy Coordinates
        </li>
        <li
          id="open-google-maps"
          className="px-5 font-semibold font-sans hover:bg-green-200 cursor-pointer"
        >
          Open in Google Maps
        </li>
        <li
          id="info"
          className="px-5 font-bold font-sans hover:bg-red-300 cursor-pointer"
        >
          More Info
        </li>
        <li
          id="lines"
          className="px-5 font-bold font-sans hover:bg-orange-300 cursor-pointer"
        >
          Show/Hide slopes
        </li>
        <li
          id="analyze"
          className="px-5 font-bold font-sans hover:bg-yellow-300 cursor-pointer"
        >
          Analyze Area
        </li>
      </ul>
    </div>
  );
}
