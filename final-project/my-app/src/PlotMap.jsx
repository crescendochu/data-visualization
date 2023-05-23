// PlotMap.jsx
import React, { useRef, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import useMapbox from './useMapbox';
import LayerControl from './LayerControl';

const PlotMap = () => {
  const mapContainer = useRef(null);
  const [layers, setLayers] = useState([]);
  const map = useMapbox(mapContainer);
  const [accessShedRange, setAccessShedRange] = useState(0);


  // useEffect(() => {
  //   if (map) {
  //     fetch('https://raw.githubusercontent.com/crescendochu/data-visualization/main/data/Seattle_labels_withZoominLevel/filtered_NoCurbs_zoomin_0.geojson')
  //       .then(response => response.json())
  //       .then(data => {
  //         // check the first feature for severity property
  //         if (data.features.length > 0 && 'severity' in data.features[0].properties) {
  //           console.log(`Severity is of type ${typeof data.features[0].properties.severity}`);
  //           // print unique values of severity
  //           const severityValues = data.features.map(feature => feature.properties.severity);
  //           console.log('Unique severity values:', [...new Set(severityValues)]);
  //         }
  //         // add the source to the map
  //         map.addSource('no-curb-ramp', {
  //           type: 'geojson',
  //           data: data
  //         });
  
  //         // The rest of your code here...
  //       });
  //   }
  // }, [map]);


  useEffect(() => {
    if (map) {
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

      const sidewalkLayers = [
        {
          id: 'no-curb-ramp',
          source: 'no-curb-ramp',
          visibility: true,
          color: '#E679B6'
        }
      ];

      const pointLayers = [
        {
          id: 'churches',
          source: 'churches',
          color: '#EBCB8B',
          visibility: true
        },
        {
          id: 'hospitals',
          source: 'hospitals',
          visibility: true,
          color: '#BF616A'
        },
        {
          id: 'libraries',
          source: 'libraries',
          visibility: true,
          color: '#88C0D0'
        },
        {
          id: 'pharmacies',
          source: 'pharmacies',
          visibility: true,
          color: '#B48EAD'
        },
        {
          id: 'schools',
          source: 'schools',
          visibility: true,
          color: '#D08770'
        },
        {
          id: 'grocery',
          source: 'grocery',
          visibility: true,
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
    
      setLayers([...sidewalkLayers, ...pointLayers]);
    }
  }, [map]);


  
  const translateToPixels = (distanceInMeters) => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const metersPerPixel = (156543.03392 * Math.cos((center.lat * Math.PI) / 180)) / Math.pow(2, zoom);

    const distanceInPixels = distanceInMeters / metersPerPixel;
    return distanceInPixels;
  };


  const defaultAccessShedRadius = 500; // Define a default radius for the access shed layer

const handleIconClick = (id) => {
  const visibility = map.getLayoutProperty(id, 'visibility');
  const newVisibility = visibility === 'visible' ? 'none' : 'visible';
  
  map.setLayoutProperty(id, 'visibility', newVisibility);

  const shedLayerId = 'access-shed-layer-' + id;

  if (!map.getLayer(shedLayerId)) {
    const layer = layers.find(l => l.id === id);
    handleAccessShedChange(id, defaultAccessShedRadius, layer.color);
  }
  else {
    map.setLayoutProperty(shedLayerId, 'visibility', newVisibility);
  }

  setLayers(layers => layers.map(layer => {
    if (layer.id === id) {
      return { ...layer, visibility: newVisibility !== 'visible' };
    }
    return layer;
  }));
};


const handleSliderChange = (event, newValue, layerId, layerColor) => {
  setAccessShedRange(newValue);
  const layer = layers.find(l => l.id === layerId);

  // remove the old access shed layer
  if (map.getLayer('access-shed-layer-' + layerId)) {
    map.removeLayer('access-shed-layer-' + layerId);
  }

  // add a new access shed layer
  map.addLayer({
    id: 'access-shed-layer-' + layerId, // appends the layerId to the string 'access-shed-layer-'
    type: 'circle',
    source: layerId, // use the same source as the original layer
    paint: {
      'circle-radius': translateToPixels(newValue), // use the new value from the slider
      'circle-color': layer.color, // use the same color as the original layer
      'circle-opacity': 0.2,
    }
  });
};

const handleAccessShedChange = (id, radius, color) => {
  handleSliderChange(null, radius, id, color);
};

const applySeverityFilter = (severityRange) => {
  map.setFilter('no-curb-ramp', ['all', ['>=', 'severity', severityRange[0]], ['<=', 'severity', severityRange[1]]]);
};

  return (
    <div className="map-container">
      <Sidebar 
      layers={layers} 
      mapInstance={map} 
      toggleVisibility={handleIconClick}
      handleAccessShedChange={handleAccessShedChange}
      applySeverityFilter={applySeverityFilter} 
      />
      <div ref={mapContainer}></div>
    </div>
  );
};

export default PlotMap;

