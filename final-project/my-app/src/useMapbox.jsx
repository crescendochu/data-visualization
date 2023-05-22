import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const useMapbox = (mapContainer) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jlc2NlbmRvY2h1IiwiYSI6ImNpdGR5MWZ5aDAycjIyc3A5ZHoxZzRwMGsifQ.nEaSxm520v7TpKAy2GG_kA';

    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/crescendochu/clhdvk3i400ea01rhep06ap9r',
        zoom: 11,
        center: [-122.33138275146484, 47.609596252441406]
      });

      map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
      map.addControl(new mapboxgl.NavigationControl(), 'top-right'); 

      map.on('load', () => {
        setMap(map);
      });
    };

    if (!map) initializeMap({ setMap, mapContainer });
  }, [map]);

  return map;
};

export default useMapbox;

