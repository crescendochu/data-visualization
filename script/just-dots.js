// Set access token and initialize mapbox map
mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jlc2NlbmRvY2h1IiwiYSI6ImNpdGR5MWZ5aDAycjIyc3A5ZHoxZzRwMGsifQ.nEaSxm520v7TpKAy2GG_kA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-74.045944213867188, 40.957992553710938],
  zoom: 12
});


  // Add the line to the map
  d3.json('../data/street.geojson').then(function(streets) {
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
                ['==', ['get', 'count'], 1], 'green',
                ['==', ['get', 'count'], 2], 'yellow',
                ['==', ['get', 'count'], 3], 'orange',
                ['==', ['get', 'count'], 4], 'red',
                '#000000'
            ],
            'line-opacity': 1,
            'line-width': 3
        }
    });
    
});

// Load the GeoJSON data
d3.json("../data/points.geojson").then(function(data) {

  // Create a layer for the points
  map.on('load', function() {
    map.addLayer({
      id: 'points',
      type: 'circle',
      source: {
        type: 'geojson',
        data: data
      },
      paint: {
        'circle-radius': 10,
        'circle-color': 'red'
      }
    });

    var clickedPointIDs = [];
    var numRedPoints = data.features.length; // Initialize the count of red points to the number of features in the data

    // Add click event listener to the layer
    map.on('click', 'points', function(e) {

      // Get the clicked feature and its ID
    var clickedPointID = e.features[0].properties.attribute_id;
    console.log('clickedPointID1: ' + clickedPointID)

    // Check if the point has been clicked before
    var index = clickedPointIDs.indexOf(clickedPointID);
    if (index === -1) {
        // If the point has not been clicked before, add its ID to the array and decrement the count of red points
        clickedPointIDs.push(clickedPointID);
        console.log('clickedPointID2: ' + clickedPointID)
        numRedPoints--;
    } else {
        // If the point has been clicked before, remove its ID from the array and increment the count of red points
        clickedPointIDs.splice(index, 1);
        numRedPoints++;
        console.log('clickedPointID3: ' + clickedPointID)
    }


    var clickedStreetID = e.features[0].properties.street_edge_id
    
    console.log('clickedStreet: ' + clickedStreetID)


      // Update the color of the clicked features
      map.setPaintProperty('points', 'circle-color', [
        'match',
        ['get', 'attribute_id'],
        clickedPointIDs,
        'green',
        'red',
      ]);

      // Log the count of red points to the console
      console.log(numRedPoints);

  var colors = ['green', 'yellow','orange','red'];
  var colorIndex = numRedPoints-1;

  map.setPaintProperty('lineLayer', 'line-color', colors[colorIndex]);

    });
  });
});
