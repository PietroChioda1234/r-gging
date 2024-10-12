import Map from "ol/Map";
import View from "ol/View";
import { Point } from "ol/geom";
import { Feature } from "ol";
import { Vector as VectorSource } from "ol/source";
import { Style, Icon } from "ol/style";
import { Pixel } from "ol/pixel";
import getMarkerInfo from "./analyzeNewMarker/main";
import { markerLinesMap } from "../components/map/Map";
import { Vector as VectorLayer } from "ol/layer";
import { LineString } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { addRoadSegments } from "../components/map/addMarkersFromDB";
import {
  addErrorIcon,
  addOneSpinningWheel,
  removeOneSpinningWheel,
} from "./spinningWheel";
import {
  setCommunityVote,
  setDevVote_fun,
  manageListenersForVoting,
} from "./voting/votes";
function getLastVectorLayer(map) {
  // Get the layers from the map object
  const layers = map.getLayers().getArray();

  // Find all VectorLayer instances
  const vectorLayers = layers.filter((layer) => layer instanceof VectorLayer);

  // Return the last VectorLayer if it exists, otherwise return null
  return vectorLayers.length > 0 ? vectorLayers[vectorLayers.length - 1] : null;
}
function getMarkerLayer(map) {
  // Get the layers from the map object
  const layers = map.getLayers().getArray();

  // Loop through the layers to find the one containing Point features (markers)
  const markerLayer = layers.find((layer) => {
    if (layer instanceof VectorLayer) {
      const source = layer.getSource();
      const features = source.getFeatures();

      // Check if any of the features are Point geometries
      return features.some((feature) => feature.getGeometry() instanceof Point);
    }
    return false;
  });

  return markerLayer || null; // Return the marker layer or null if not found
}
export default function showContextMenu(event, closestMarker, map) {
  setUpCloseInfoButton();
  const menu = document.getElementById("contextMenu");
  //   toggleContextMenuDisplay(menu, event);
  const linesLayer = getLastVectorLayer(map);
  const markerLayer = getMarkerLayer(map);
  if (!closestMarker) {
    handleNoMarkerCase(menu, markerLayer);
  } else {
    handleMarkerCase(menu);
    setupLinesButton(linesLayer);
    setUpInfoButton();
    console.log("heyy");
  }

  setupContextMenuActions([
    parseFloat(sessionStorage.getItem("longitude")),
    parseFloat(sessionStorage.getItem("latitude")),
  ]);
  manageListenersForVoting();
  //   manageListenersForVoting();
  event.preventDefault();
}

// export function toggleContextMenuDisplay(menu, event) {
//   if (menu.style.display == "block") {
//     menu.style.display = "none";
//     event.preventDefault();
//   } else {
//     menu.style.display = "block";
//     menu.style.left = event.pageX + "px";
//     menu.style.top = event.pageY + "px";
//   }
// }
export function positionContextMenu(menu, event) {
  menu.style.display = "block";
  menu.style.left = event.pixel[0] + "px";
  menu.style.top = event.pixel[1] + "px";
}
function handleNoMarkerCase(menu, markerLayer) {
  hideMarkerOptions(menu);

  replaceAnalyzeButton(markerLayer);

  //   const lonlat = calculateLonLatFromPixel(event, mapOffset, map);

  //   const transformedLonLat = transformLonLat(lonlat, map);
  // replaceAnalyzeButton(transformedLonLat);
  //   storeCoordinatesInSessionStorage(transformedLonLat);
}

function hideMarkerOptions(menu) {
  menu.children[0].children[2].style.display = "none";
  menu.children[0].children[3].style.display = "none";
  menu.children[0].children[4].style.display = "block";
}

async function replaceAnalyzeButton(markerLayer) {
  const oldElement = document.getElementById("analyze");
  const newElement = oldElement.cloneNode(true);
  oldElement.parentNode.replaceChild(newElement, oldElement);
  document.getElementById("analyze").addEventListener("click", async () => {
    const wheel = addOneSpinningWheel();

    try {
      const lon = parseFloat(sessionStorage.getItem("longitude"));
      const lat = parseFloat(sessionStorage.getItem("latitude"));
      addMarkerToLayer(
        markerLayer,
        [lon, lat],
        "https://cdn-icons-png.flaticon.com/128/9131/9131546.png"
      );
      const newMarker = await getMarkerInfo(lat, lon);
      const markers = JSON.parse(sessionStorage.getItem("markers"));
      console.log(newMarker);
      markers.push(newMarker);
      addRoadSegments(newMarker.slopes_info, markers.length - 1, markerLayer);
      sessionStorage.setItem("markers", JSON.stringify(markers));
      removeOneSpinningWheel();
    } catch (e) {
      addErrorIcon(wheel);
    }
  });
}

function addMarkerToLayer(layer, lonLat, src) {
  // Create a new marker feature with a Point geometry
  const marker = new Feature({
    geometry: new Point(fromLonLat(lonLat)), // Use fromLonLat if coordinates are in [lon, lat]
  });

  // Set the style for the marker
  marker.setStyle(
    new Style({
      image: new Icon({
        src: src, // Path to marker image
        anchor: [0.5, 1], // Anchor point (0.5 centers horizontally, 1 is at the bottom)
        scale: 0.16, // Adjust size
      }),
    })
  );

  // Add the marker to the layer's source
  layer.getSource().addFeature(marker);
}
function handleMarkerCase(menu) {
  showMarkerOptions(menu);
  //   const transformedLonLat = closestMarker.getGeometry().getCoordinates();
  //   setupFillBarButton(menu, transformedLonLat);
  //   setupLinesButton(transformedLonLat, vectorLayer);
}

function showMarkerOptions(menu) {
  menu.children[0].children[2].style.display = "block";
  menu.children[0].children[3].style.display = "block";
  menu.children[0].children[4].style.display = "none";
}

// function setupFillBarButton(menu, transformedLonLat) {
//   menu.children[0].children[2].addEventListener("click", () => {
//     fillBar(transformedLonLat);
//   });
// }

function setupLinesButton(vectorLayer) {
  document.getElementById("lines").onclick = () => {
    console.log("shosjfoisdj");
    const markerId = findIndexFromLatLon({
      lat: parseFloat(sessionStorage.getItem("latitude")),
      lon: parseFloat(sessionStorage.getItem("longitude")),
    });
    const lines = markerLinesMap[markerId];
    toggleLinesVisibility(lines, vectorLayer);
  };
}
function setUpInfoButton() {
  document.getElementById("info").onclick = () => {
    const marker_index = findIndexFromLatLon({
      lat: parseFloat(sessionStorage.getItem("latitude")),
      lon: parseFloat(sessionStorage.getItem("longitude")),
    });
    fillBar(marker_index);
    openBar();
  };
}
function setUpCloseInfoButton() {
  document
    .getElementById("close_left_opt_btn")
    .addEventListener("click", closeBar);
}
function openBar() {
  document.getElementById("leftOpt").classList.remove("come-out-left");
  document.getElementById("leftOpt").classList.add("come-in-left");
}
function closeBar() {
  document.getElementById("leftOpt").classList.remove("come-in-left");

  document.getElementById("leftOpt").classList.add("come-out-left");
}

export function findIndexFromLatLon(latLon) {
  let result = null;
  const markers = JSON.parse(sessionStorage.getItem("markers"));
  markers.forEach((marker, index) => {
    if (
      marker.coordinates[0].toFixed(5) == latLon.lat.toFixed(5) &&
      marker.coordinates[1].toFixed(5) == latLon.lon.toFixed(5)
    ) {
      result = index;
    }
  });

  // if (result == null) {
  //   new_markers.forEach((marker, index) => {
  //     console.log(marker);
  //     if (
  //       marker.coordinates[0].toFixed(5) == latLon.lat.toFixed(5) &&
  //       marker.coordinates[1].toFixed(5) == latLon.lon.toFixed(5)
  //     ) {
  //       result = 0 - index - 1;

  //       var lat = latLon.lat;
  //       var lon = latLon.lon;
  //       var lonLat = new OpenLayers.LonLat(lon, lat).transform(
  //         new OpenLayers.Projection("EPSG:4326"),
  //         map.getProjectionObject()
  //       );
  //     }
  //   });
  // }
  return result;
}
export async function fillBar(index) {
  const markers = JSON.parse(sessionStorage.getItem("markers"));
  var info = markers[index];
  if (!info) {
    info = index;
  }
  // await removeAllChildrenExceptFirst(bar);
  console.log(info);
  // const name = document.getElementById("left_bot_short");
  // name.textContent = info.name;
  const type = document.querySelector("#left_top_short ul");
  type.innerHTML = "";
  try {
    let tags;
    try {
      //its an already saves marker, the tags strct is different
      let tags_string = info.tags.replaceAll("'", '"');
      tags_string.replaceAll('"', "'");
      tags = JSON.parse(tags_string);
      setCommunityVote(info.community_vote, info.votes);
    } catch (e) {
      //its a new marker
      tags = info.tags;
    }

    for (const key in tags) {
      if (Object.prototype.hasOwnProperty.call(tags, key)) {
        const element = tags[key];
        const li = document.createElement("li");
        li.classList.add("font-sans");
        li.classList.add("font-bold");
        li.textContent = element;
        type.appendChild(li);
      }
    }
  } catch (e) {
    console.error("Error with tags", e);
  }

  setDevVote_fun(info.slope);
  const img = document.querySelector(".leftOpt img");
  if (img) {
    img.src = info.url;
  }

  // const police = document.getElementById("additional_leftOpt");
  // police.textContent = info.police;
  const curves = document.getElementById("curves");
  curves.children[0].textContent = info.curves;
  openBar();
}
// function calculateLines(markerId) {
//   // Implement your logic here, using OpenLayers 10 data structure
//   // Example: return markerLinesMap[markerId];
// }

function toggleLinesVisibility(lines, vectorLayer) {
  console.log(vectorLayer);
  const isVisible =
    lines.length > 0 &&
    vectorLayer.getSource().getFeatures().includes(lines[0]);

  if (isVisible) {
    vectorLayer.getSource().removeFeatures(lines);
  } else {
    vectorLayer.getSource().addFeatures(lines);
  }
}

function setupContextMenuActions(transformedLonLat) {
  document.getElementById("copy-coordinates").onclick = () =>
    copyCoordinates(transformedLonLat);
  document.getElementById("open-google-maps").onclick = () =>
    openInGoogleMaps(transformedLonLat);
}

function copyCoordinates(transformedLonLat) {
  const coords = `${transformedLonLat[1].toFixed(
    6
  )},${transformedLonLat[0].toFixed(6)}`;
  navigator.clipboard.writeText(coords).then(() => {
    console.log("Coordinates copied to clipboard: " + coords);
    document.getElementById("contextMenu").style.display = "none";
  });
}

function openInGoogleMaps(transformedLonLat) {
  const googleMapsUrl = `https://www.google.com/maps?q=${transformedLonLat[1]},${transformedLonLat[0]}`;
  window.open(googleMapsUrl, "_blank");
  document.getElementById("contextMenu").style.display = "none";
}
