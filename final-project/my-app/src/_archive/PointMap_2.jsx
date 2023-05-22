import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const LayerControl = ({ layer, isVisible, toggleVisibility, index, moveLayer }) => {
  // Remove the useState for isVisible

  const handleToggleVisibility = () => {
    toggleVisibility(layer.id);
  };

  const [, drag] = useDrag(() => ({
    type: 'layer',
    item: { id: layer.id, index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      id={layer.id}
      className="draggable-layer"
      ref = {drag}
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
  );
};

  

const Sidebar = ({ layers, toggleVisibility, moveLayer }) => {
  const [, drop] = useDrop(() => ({
    accept: 'layer',
    hover(item, monitor) {
      const dragIndex = item.index;
      const hoverIndex = layers.findIndex(layer => layer.id === item.id);
      
      if (dragIndex === hoverIndex) {
        return;
      }

      moveLayer(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  }));

  return (
    <div id="menu" className="sidebar" ref={drop}>
      {layers.map((layer, index) => (
        <LayerControl
          key={layer.id}
          layer={layer}
          index={index}
          isVisible={layer.visibility}
          toggleVisibility={toggleVisibility}
          moveLayer={moveLayer}
        />
      ))}
    </div>
  );
};
  
  

const PointMap = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [layers, setLayers] = useState([]);

  const moveLayer = (fromIndex, toIndex) => {
    setLayers(layers => {
      const result = Array.from(layers);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);

      if (map) {
        map.moveLayer(removed.id, result[toIndex - 1]?.id);
      }

      return result;
    });
  }

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
      
        pointLayers.forEach((layer,index) => {
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

          map.moveLayer(layer.id, pointLayers[index - 1]?.id);
        });
      
        setLayers(pointLayers);
      },[map]);

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
  
    setLayers(layers => layers.map(layer => {
      if (layer.id === id) {
        return { ...layer, visibility: visibility !== 'visible' };
      }
      return layer;
    }));

  

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="map-container">
        <Sidebar layers={layers} mapInstance={map} toggleVisibility={handleIconClick} moveLayer={moveLayer} />
        <div ref={mapContainer}></div>
        </div>
    </DndProvider>
  );
};

  };
export default PointMap;
