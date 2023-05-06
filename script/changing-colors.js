var streets;

var hoveredPointId = null;

function updateStreetNoCurbsCount(streets, streetID, newNoCurbsCount) {
  for (var i = 0; i < streets.features.length; i++) {
    if (streets.features[i].properties.street_edge_id === streetID) {
      streets.features[i].properties.no_curbs_count = newNoCurbsCount;
      break;
    }
  }
}

function countRedPointsInStreet(data, streetID, clickedPointIDs) {
  return data.features.filter(function (feature) {
    return (
      feature.properties.street_edge_id === streetID &&
      !clickedPointIDs.includes(feature.properties.attribute_id)
    );
  }).length;
}

mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jlc2NlbmRvY2h1IiwiYSI6ImNpdGR5MWZ5aDAycjIyc3A5ZHoxZzRwMGsifQ.nEaSxm520v7TpKAy2GG_kA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-74.045944213867188, 40.957992553710938],
  zoom: 12
});

d3.json('../data/streets_full.geojson').then(function (loadedStreets) {
  streets = loadedStreets;

  map.addSource('streets', {
    type: 'geojson',
    data: streets
  });

  map.addLayer({
    id: 'lineLayer',
    type: 'line',
    source: 'streets',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'no_curbs_count'], 1],
        '#cc607d',
        ['==', ['get', 'no_curbs_count'], 2],
        '#ad466c',
        ['==', ['get', 'no_curbs_count'], 3],
        '#8b3058',
        ['==', ['get', 'no_curbs_count'], 4],
        '#672044',
        'green'
      ],
      'line-width': 5
    }
  });

  // Load the GeoJSON data and create the point layer inside the streets data callback
  d3.json("../data/points_full.geojson").then(function (data) {
    data.features.forEach(function (feature) {
        feature.id = feature.properties.attribute_id;
      });
    map.on('load', function () {
      map.addLayer({
        id: 'points',
        type: 'circle',
        source: {
          type: 'geojson',
          data: data
        },
        paint: {
            'circle-radius': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              7,
              5
            ],
            'circle-color': 'red',
            'circle-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              1,
              0.6
            ]
          }
      });

      var clickedPointIDs = [];

      map.on('click', 'points', function (e) {
        var clickedPointID = e.features[0].properties.attribute_id;
      
        var index = clickedPointIDs.indexOf(clickedPointID);
        if (index === -1) {
          clickedPointIDs.push(clickedPointID);
        } else {
          clickedPointIDs.splice(index, 1);
        }
      
        var clickedStreetID = e.features[0].properties.street_edge_id;
      
        var numRedPoints = countRedPointsInStreet(data, clickedStreetID, clickedPointIDs);
      
        updateStreetNoCurbsCount(streets, clickedStreetID, numRedPoints);
      
        map.getSource('streets').setData(streets);
      
        map.setPaintProperty('points', 'circle-color', [
          'case',
          ['in', ['get', 'attribute_id'], ['literal', clickedPointIDs]],
          'green',
          'red'
        ]);
      
        map.setPaintProperty('lineLayer', 'line-color', [
          'case',
          ['==', ['get', 'street_edge_id'], clickedStreetID],
          [
            'case',
            ['==', numRedPoints, 4], '#672044',
            ['==', numRedPoints, 3], '#8b3058',
            ['==', numRedPoints, 2], '#ad466c',
            ['==', numRedPoints, 1], '#cc607d',
            ['==', numRedPoints, 0], 'green',
            '#000000'
          ],
          [
            'case',
            ['==', ['get', 'no_curbs_count'], 1], '#cc607d',
            ['==', ['get', 'no_curbs_count'], 2], '#ad466c',
            ['==', ['get', 'no_curbs_count'], 3], '#8b3058',
            ['==', ['get', 'no_curbs_count'], 4], '#672044',
            ['==', ['get', 'no_curbs_count'], 0], 'green',
            '#000000'
          ]
        ]);
        });

    // Add mouseenter event listener to the 'points' layer
    map.on('mouseenter', 'points', function (e) {
        // Change the cursor to a pointer when hovering over a point
        map.getCanvas().style.cursor = 'pointer';
      
        if (e.features.length > 0) {
          if (hoveredPointId) {
            map.setFeatureState(
              { source: 'points', id: hoveredPointId },
              { hover: false }
            );
          }
          hoveredPointId = e.features[0].id;
          map.setFeatureState(
            { source: 'points', id: hoveredPointId },
            { hover: true }
          );
        }
      });
    
  // Add mouseleave event listener to the 'points' layer
  map.on('mouseleave', 'points', function () {
    // Change the cursor back to the default cursor when not hovering over a point
    map.getCanvas().style.cursor = '';
  
    if (hoveredPointId) {
      map.setFeatureState(
        { source: 'points', id: hoveredPointId },
        { hover: false }
      );
    }
    hoveredPointId = null;
  });
  


        
        });
        });
        });
