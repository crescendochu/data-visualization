import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Eye, EyeSlash } from "@phosphor-icons/react";

const LayerControl = ({ layer, toggleVisibility, handleDragStart, handleDragOver, handleDrop }) => {
    const { id, color } = layer;

    const [isVisible, setIsVisible] = useState(true);

    const handleToggleVisibility = () => {
        toggleVisibility(id);
        setIsVisible(!isVisible);
    };
  
    return (
        <div id={id} className="draggable-layer" draggable="true" onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="layer-name-container">
                <div className="color-strip" style={{ backgroundColor: color || 'transparent' }} />
                <span>{id}</span>
            </div>
            <div className="icon-container">
                {isVisible ? <Eye onClick={handleToggleVisibility} /> : <EyeSlash onClick={handleToggleVisibility} />}
            </div>
        </div>
    );
  };
  

  const Sidebar = ({ layers, toggleVisibility, handleDragStart, handleDragOver, handleDrop }) => {
    return (
      <div id="menu" className="sidebar">
        {layers.map((layer) => (
          <LayerControl 
            key={layer.id} 
            layer={layer} 
            toggleVisibility={toggleVisibility} 
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
          />
        ))}
      </div>
    );
  };
  

const PointMap = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jlc2NlbmRvY2h1IiwiYSI6ImNpdGR5MWZ5aDAycjIyc3A5ZHoxZzRwMGsifQ.nEaSxm520v7TpKAy2GG_kA';
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/crescendochu/clhdvk3i400ea01rhep06ap9r',
        zoom: 11,
        center: [-122.33138275146484, 47.609596252441406]
      });

      map.on('load', () => {
        map.addSource('no-curb-ramp', {
          type: 'geojson',
          data: 'https://raw.githubusercontent.com/crescendochu/data-visualization/main/data/Seattle_labels_withZoominLevel/filtered_NoCurbs_zoomin_0.geojson'
        });
      
        map.addLayer({
          id: 'no-curb-ramp',
          type: 'circle',
          source: 'no-curb-ramp',
          paint: {
            'circle-radius': 2,
            'circle-color': '#E679B6'
          }
        });
      
        const pointLayers = [
          {
            id: 'churches',
            source: 'churches',
            color: '#EBCB8B'
          },
          {
            id: 'hospitals',
            source: 'hospitals',
            color: '#BF616A'
          },
          {
            id: 'libraries',
            source: 'libraries',
            color: '#88C0D0'
          },
          {
            id: 'pharmacies',
            source: 'pharmacies',
            color: '#B48EAD'
          },
          {
            id: 'schools',
            source: 'schools',
            color: '#D08770'
          },
          {
            id: 'grocery',
            source: 'grocery',
            color: '#A3BE8C'
          }
        ];
      
        pointLayers.forEach(layer => {
          map.addSource(layer.id, {
            type: 'geojson',
            data: `https://raw.githubusercontent.com/crescendochu/data-visualization/main/data/Seattle_GeoData_Points/Seattle_${layer.id}_centroids.geojson`
          });
      
          map.addLayer({
            id: layer.id,
            type: 'circle',
            source: layer.id,
            paint: {
              'circle-radius': 4,
              'circle-color': layer.color
            }
          });
        });
      
        setLayers(pointLayers);
      });
      

      map.on('idle', () => {
        // ... handle idle
      });

      setMap(map);
    };

    if (!map) initializeMap({ setMap, mapContainer });
  }, [map]);

  const handleIconClick = (id) => {
    const visibility = map.getLayoutProperty(id, 'visibility');
    if (visibility === 'visible') {
      map.setLayoutProperty(id, 'visibility', 'none');
    } else {
      map.setLayoutProperty(id, 'visibility', 'visible');
    }
  };

  return (
    <div className="map-container">
      <Sidebar layers={layers} toggleVisibility={handleIconClick} />
      <div ref={mapContainer}></div>
    </div>
  );
};

export default PointMap;
