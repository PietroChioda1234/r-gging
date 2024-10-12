import { useState } from "react";
import { fromLonLat } from "ol/proj"; // Projection helper
import Feature from "ol/Feature"; // For creating map features
import Point from "ol/geom/Point"; // For the marker geometry
import Style from "ol/style/Style"; // To style the marker
import Icon from "ol/style/Icon"; // For marker icons
import VectorLayer from "ol/layer/Vector"; // Layer for markers
import VectorSource from "ol/source/Vector"; // Source to hold markers
// Function to add a marker
const addMarker = (lon, lat, markersLayer) => {
  const markerCoordinates = fromLonLat([lon, lat]);

  // Create a marker feature with the coordinates
  const marker = new Feature({
    geometry: new Point(markerCoordinates),
  });

  // Set an icon for the marker
  marker.setStyle(
    new Style({
      image: new Icon({
        src: "https://openlayers.org/en/latest/examples/data/icon.png", // Path to your marker image
        anchor: [0.5, 1], // Adjust the anchor point
        // scale: 0.05, // Adjust marker size
      }),
    })
  );

  // Add the marker to the marker layer
  markersLayer.getSource().addFeature(marker);
};
export default function SearchBarComponent({ map, markersLayer }) {
  const [input, setInput] = useState("");

  const searchMap = () => {
    if (input.includes(",")) {
      const coords = input.split(",").map((coord) => parseFloat(coord.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const center = fromLonLat([coords[1], coords[0]]);
        addMarker(coords[1], coords[0], markersLayer);
        const view = map.getView();
        view.setCenter(center);
        view.setZoom(14);
      } else {
        alert("Invalid coordinates.");
      }
    } else {
      alert('Please enter coordinates in the format "lat, lon".');
    }
  };

  return (
    <>
      <div id="search-container">
        <input
          type="text"
          id="search-input"
          placeholder="Enter coordinates (lat, lon)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={searchMap}>&#128270;</button>
      </div>
      <style jsx>{`
        #search-container {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background-color: white;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
        }

        #search-input {
          width: 200px;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 3px;
        }

        #search-button {
          padding: 5px 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }

        #search-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </>
  );
}
