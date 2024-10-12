"use client";
import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import { transform, fromLonLat, toLonLat } from "ol/proj";
import SearchBarComponent from "./SearchBar";
import VectorLayer from "ol/layer/Vector"; // Layer for markers
import VectorSource from "ol/source/Vector"; // Source to hold markers
import Feature from "ol/Feature"; // For creating map features
import Point from "ol/geom/Point"; // For the marker geometry
import Style from "ol/style/Style"; // To style the marker
import Icon from "ol/style/Icon";
import ContextMenu from "../contextMenu/ContextMenu";
import addMarkersFromDB from "./addMarkersFromDB";
export const new_markers = [];
export const markerLinesMap = {};

const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        }
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
};
const MapComponent = () => {
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [map, setMap] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null); // Store markers layer
  

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { latitude, longitude } = await getUserLocation();
        setCoords([longitude, latitude]);
      } catch (error) {
        console.error(error);
        setCoords([0, 0]);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    if (mapRef.current && !map && coords) {
      const vectorSource = new VectorSource({
        features: [],
      });
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        visible: true,
        zIndex: 1000,
      });
      
      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vectorLayer,
          // Add marker layer here
        ],
        view: new View({
          center: fromLonLat([coords[0], coords[1]]),
          zoom: 6,
        }),
      });
     
      setMarkersLayer(vectorLayer); // Store the marker layer
      setMap(initialMap);
      //HOW TO ADD A MARKER

      // const center = fromLonLat([coords[0], coords[1]]);
      // const marker = new Feature({
      //   geometry: new Point(center),
      // });
      // marker.setStyle(
      //   new Style({
      //     image: new Icon({
      //       src: "https://openlayers.org/en/latest/examples/data/icon.png",
      //       anchor: [0.5, 1],
      //     }),
      //   })
      // );

      // const source = vectorLayer.getSource();
      // if (source) {
      //   source.addFeature(marker); // Add marker to the markers layer
      // } else {
      //   console.error("Markers layer source is not available.");
      // }
      addMarkersFromDB(
        initialMap,
        "https://static.vecteezy.com/system/resources/thumbnails/019/897/155/small/location-pin-icon-map-pin-place-marker-png.png",
        vectorLayer
      );
    }
  }, [coords]);

  return (
    <>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100vh", overflow: "hidden" }}
      />
      {map && markersLayer && (
        <SearchBarComponent map={map} markersLayer={markersLayer} />
      )}
      {map && (
        <ContextMenu
          map={map}
        ></ContextMenu>
      )}
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          right: "30px",
          zIndex: 10000,
        }}
      >
        <div>
          <div
            style={{
              backgroundColor: "red",
              minHeight: "10px",
              minWidth: "80px",
            }}
          ></div>
          <p
            style={{
              WebkitTextStrokeWidth: "1px",
              WebkitTextStrokeColor: "black",
            }}
          >
            flat
          </p>
        </div>
        <div>
          <div
            style={{
              backgroundColor: "green",
              minHeight: "10px",
              minWidth: "80px",
            }}
          ></div>
          <p
            style={{
              WebkitTextStrokeWidth: "1px",
              WebkitTextStrokeColor: "black",
            }}
          >
            steeper
          </p>
        </div>
      </div>
    </>
  );
};

export default MapComponent;
