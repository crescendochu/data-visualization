import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Eye, EyeSlash } from "@phosphor-icons/react";

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';



const LayerControl = ({ layer, isVisible, toggleVisibility, index }) => {
  const handleToggleVisibility = () => {
    toggleVisibility(layer.id);
  };
  console.log('layer.id', layer.id);

  return (
    <Draggable draggableId={layer.id} index={index}>
      {(provided) => (
        <div
          id={layer.id}
          className="draggable-layer"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div className="layer-name-container">
            <div
              className="color-strip"
              style={{ backgroundColor: layer.color || "transparent" }}
            />
            <span>{layer.id}</span>
          </div>
          <div className="icon-container">
            {isVisible ? (
              <Eye weight="bold" onClick={handleToggleVisibility} />
            ) : (
              <EyeSlash weight="bold" onClick={handleToggleVisibility} />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};



const Sidebar = ({ layers, toggleVisibility, onDragEnd, mapLoaded }) => {
  return (
    <div id="menu" className="sidebar">
    {mapLoaded && layers.length > 0 && (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {layers.map((layer, index) => (
                <LayerControl
                  key={layer.id}
                  layer={layer}
                  isVisible={layer.visibility}
                  toggleVisibility={toggleVisibility}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )}
  </div>
  );
};




const PointMap = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setLoading(false); // set loading to false after first render
  }, []);



  useEffect(() => {
    if (loading) {
      return; // if loading is true, do not initialize map
    }
    
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
      
        setMapLoaded(true);
        setLayers(pointLayers);
        

        // move the map layers according to our layers array
        pointLayers.reverse().forEach((layer) => {
          map.moveLayer(layer.id);
        });

      });
      

      map.on('idle', () => {
        // ... handle idle
      });

      setMap(map);
    };

    if (!map) initializeMap({ setMap, mapContainer });
  }, [loading,map]);



  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newLayers = Array.from(layers);
    const [removed] = newLayers.splice(result.source.index, 1);
    newLayers.splice(result.destination.index, 0, removed);

    // move the layer in the map according to the new ordering
    // ...

    // move the layer in the map according to the new ordering
    newLayers.slice().reverse().forEach((layer) => {
      map.moveLayer(layer.id);
    });

    setLayers(newLayers);
  };

  const handleIconClick = (id) => {
    const visibility = map.getLayoutProperty(id, 'visibility');
    if (visibility === 'visible') {
      map.setLayoutProperty(id, 'visibility', 'none');
    } else {
      map.setLayoutProperty(id, 'visibility', 'visible');
    }
  
    setLayers(layers => layers.map(layer => {
      if (layer.id === id) {
        return { ...layer, visibility: visibility !== 'visible' };
      }
      return layer;
    }));
  };

  return (
    <div className="map-container">
      <Sidebar layers={layers} toggleVisibility={handleIconClick} onDragEnd={handleDragEnd} mapLoaded={mapLoaded} />


      <div ref={mapContainer}></div>
    </div>
  );
};

export default PointMap;
