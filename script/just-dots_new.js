// Set access token and initialize mapbox map
mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jlc2NlbmRvY2h1IiwiYSI6ImNpdGR5MWZ5aDAycjIyc3A5ZHoxZzRwMGsifQ.nEaSxm520v7TpKAy2GG_kA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-74.045944213867188, 40.957992553710938],
  zoom: 12
});



  // Add the line to the map
  d3.json('../data/streets_full.geojson').then(function(streets) {
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
    
});

// // Load the GeoJSON data
// d3.json("../data/points_full.geojson").then(function(data) {

//   // Create a layer for the points
//   map.on('load', function() {
//     map.addLayer({
//       id: 'points',
//       type: 'circle',
//       source: {
//         type: 'geojson',
//         data: data
//       },
//       paint: {
//         'circle-radius': 10,
//         'circle-color': 'red'
//       }
//     });

//     var clickedPointIDs = [];
//     var numRedPoints = data.features.length; // Initialize the count of red points to the number of features in the data

//     // Add click event listener to the layer
//     map.on('click', 'points', function(e) {

//       // Get the clicked feature and its ID
//     var clickedPointID = e.features[0].properties.attribute_id;

//     // Check if the point has been clicked before
//     var index = clickedPointIDs.indexOf(clickedPointID);
//     if (index === -1) {
//         // If the point has not been clicked before, add its ID to the array and decrement the count of red points
//         clickedPointIDs.push(clickedPointID);
//         numRedPoints--;
//     } else {
//         // If the point has been clicked before, remove its ID from the array and increment the count of red points
//         clickedPointIDs.splice(index, 1);
//         numRedPoints++;
//     }


//     var clickedStreetID = e.features[0].properties.street_edge_id
    
//     console.log('clickedStreet: ' + clickedStreetID)


//       // Update the color of the clicked features
//       // map.setPaintProperty('points', 'circle-color', [
//       //   'match',
//       //   ['get', 'attribute_id'],
//       //   clickedPointIDs,
//       //   'green',
//       //   'red',
//       // ]);

//           // Update the color of the clicked features
//     map.setPaintProperty('points', 'circle-color', [
//       'case',
//       ['in', ['get', 'attribute_id'], ['literal', clickedPointIDs]],
//       'green',
//       'red'
//     ]);

//       // Log the count of red points to the console
//       console.log('red'+numRedPoints);

//         var colors = ['green', 'yellow','orange','red','black'];
//         var colorIndex = numRedPoints-1;

//         map.setPaintProperty('lineLayer', 'line-color', [
//           'case',
//           ['==', ['get', 'street_edge_id'], clickedStreetID], colors[colorIndex],
//           [
//             'case',
//             ['==', ['get', 'no_curbs_count'], 1], 'green',
//             ['==', ['get', 'no_curbs_count'], 2], 'yellow',
//             ['==', ['get', 'no_curbs_count'], 3], 'orange',
//             ['==', ['get', 'no_curbs_count'], 4], 'red',
//             '#000000'
//           ]
//         ]);
        
//     });
//   });
// });

// Add a function to count the red points within a specific street
function countRedPointsInStreet(data, streetID, clickedPointIDs) {
  return data.features.filter(function (feature) {
    return (
      feature.properties.street_edge_id === streetID &&
      !clickedPointIDs.includes(feature.properties.attribute_id)
    );
  }).length;
}

// Load the GeoJSON data
d3.json("../data/points_full.geojson").then(function (data) {
  // Create a layer for the points
  map.on('load', function () {
    map.addLayer({
      id: 'points',
      type: 'circle',
      source: {
        type: 'geojson',
        data: data
      },
      paint: {
        'circle-radius': 7,
        'circle-color': 'red'
      }
    });

    var clickedPointIDs = [];
    var streetColors = {};

    // Add click event listener to the layer
    map.on('click', 'points', function (e) {
      // Get the clicked feature and its ID
      var clickedPointID = e.features[0].properties.attribute_id;

      // Check if the point has been clicked before
      var index = clickedPointIDs.indexOf(clickedPointID);
      if (index === -1) {
        // If the point has not been clicked before, add its ID to the array and decrement the count of red points
        clickedPointIDs.push(clickedPointID);
      } else {
        // If the point has been clicked before, remove its ID from the array and increment the count of red points
        clickedPointIDs.splice(index, 1);
      }

      var clickedStreetID = e.features[0].properties.street_edge_id;

      // Count the number of red points within the clickedStreet
      var numRedPoints = countRedPointsInStreet(data, clickedStreetID, clickedPointIDs);

      // Update the color of the clicked features
      map.setPaintProperty('points', 'circle-color', [
        'case',
        ['in', ['get', 'attribute_id'], ['literal', clickedPointIDs]],
        'green',
        'red'
      ]);

      // Log the count of red points to the console
      console.log('red' + numRedPoints);


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
          '#000000'
        ]
      ]);
    });
  });
});
