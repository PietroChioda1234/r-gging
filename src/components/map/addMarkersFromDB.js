"use client";
import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import { transform, fromLonLat } from "ol/proj";
import SearchBarComponent from "./SearchBar";
import VectorLayer from "ol/layer/Vector"; // Layer for markers
import Icon from "ol/style/Icon";
import ContextMenu from "../contextMenu/ContextMenu";
import { Circle as CircleGeom, Point, LineString } from "ol/geom";
import { Feature } from "ol";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke } from "ol/style";
import { Circle as CircleStyle } from "ol/style";
import { markerLinesMap } from "./Map";
import axios from "axios";

async function getData() {
  const response = await fetch("http://localhost:3000/marker");
  const json = await response.json();
  return json;
}
function getColorFromDegree(degree) {
  if (degree >= 7) {
    return "green";
  } else {
    return "red";
  }
}
export function addRoadSegments(slopes_info, markerId, vectorLayer) {
  markerLinesMap[markerId] = []; // Initialize array for the marker's lines
  slopes_info.forEach((slope) => {
    var coordinates = slope.coordinates;
    var degree = slope.degree;

    // Extract the two coordinates for the line segment and project them
    const start = fromLonLat([coordinates[0][1], coordinates[0][0]]);
    const end = fromLonLat([coordinates[1][1], coordinates[1][0]]);

    // Create a line geometry using the projected coordinates
    const line = new LineString([start, end]);

    // Determine the color based on the degree (this function is assumed to be defined elsewhere)
    const color = getColorFromDegree(degree);
    const rgbaColor =
      color === "green" ? "rgba(0, 255, 0, 0.8)" : "rgba(255, 0, 0, 0.8)"; // Example

    // Create a vector feature with the line geometry and style
    const lineFeature = new Feature({
      geometry: line,
    });

    // Style the line feature
    lineFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: color,
          width: 10,
          opacity: 1,
          lineCap: "round", // Border cap style (e.g., 'butt', 'round', 'square')
          lineDash: ["solid"], // Border dash style (e.g., solid, dash, dot)
        }),
      })
    );
    // Store the feature in the markerLinesMap
    markerLinesMap[markerId].push(lineFeature);
    // Add the feature to the vector layer source
    vectorLayer.getSource().addFeature(lineFeature);
    vectorLayer.getSource().removeFeature(lineFeature);
  });
}
function addAllMarkers(markers, map, markersLayer, src) {
  markers.forEach((fetched_marker, index) => {
    fetched_marker.id = index;
    var lat = fetched_marker.coordinates[0];
    var lon = fetched_marker.coordinates[1];
    console.log(lat, lon);
    var lonLat = fromLonLat([lon, lat]);

    const marker = new Feature({
      geometry: new Point(lonLat),
    });
    marker.setStyle(
      new Style({
        image: new Icon({
          src: src, // Path to your marker image
          anchor: [0.5, 1], // Adjust the anchor point
          scale: 0.09, // Adjust marker size
        }),
      })
    );
    markersLayer.getSource().addFeature(marker);

    const backgroundColorFromValue = (value) => {
      if (!value) value = -60;
      // Ensure the value is within the range -60 to 60
      const clampedValue = Math.max(-60, Math.min(60, value));

      // Convert the value to a scale of 0 to 1
      const normalizedValue = (clampedValue + 60) / 120;

      // Calculate the RGB components
      const red = Math.round(255 * (1 - normalizedValue));
      const green = Math.round(255 * normalizedValue);
      const blue = 0; // We don't change blue, as the gradient is between red and green
      return `rgb(${red}, ${green}, ${blue})`;
    };
    // Create circle around marker
    const radius = 1500; // Radius in meters

    // Create the circle geometry (OpenLayers uses projections, so we project coordinates)
    const circle = new CircleGeom(lonLat, radius);

    // Create a feature for the circle
    const circleFeature = new Feature({
      geometry: circle,
    });

    // Create a vector source and layer to hold the circle feature
    const vectorSource = new VectorSource({
      features: [circleFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: backgroundColorFromValue(fetched_marker["slope"]), // Background fill color
        }),
        stroke: new Stroke({
          color: "#0394fc", // Stroke color
          width: 2, // Stroke width
        }),
      }),
    });
    vectorLayer.setOpacity(0.3);
    // Add the vector layer to the map
    map.addLayer(vectorLayer);

    // Assuming fetched_marker['slopes_info'] contains the slopes data
    if (fetched_marker.slopes_info) {
      // Javascript
      // console.log(fetched_marker.slopes_info);
      addRoadSegments(
        fetched_marker.slopes_info,
        fetched_marker.id,
        vectorLayer
      );
    }
  });
}
export default async function addMarkersFromDB(map, src, markersLayer) {
  const data = await getData();
  sessionStorage.setItem("markers", JSON.stringify(data));
  addAllMarkers(data, map, markersLayer, src);
}
