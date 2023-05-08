mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jlc2NlbmRvY2h1IiwiYSI6ImNpdGR5MWZ5aDAycjIyc3A5ZHoxZzRwMGsifQ.nEaSxm520v7TpKAy2GG_kA';
var map = new mapboxgl.Map({
  container: 'map',
  // style: 'mapbox://styles/mapbox/dark-v10',
  // style: 'mapbox://styles/mapbox/light-v11',
  style: 'mapbox://styles/crescendochu/clhdvk3i400ea01rhep06ap9r',
  center: [-74.045944213867188, 40.957992553710938],
  zoom: 13
});

var streets;

var hoveredPointId = null;



function countFixedCurbs(data, clickedPointIDs) {
  return data.features.filter(function (feature) {
    return (clickedPointIDs.includes(feature.properties.attribute_id)
    );
  }).length;
}

function countMissingCurbs(data, clickedPointIDs) {
  return data.features.filter(function (feature) {
    return (!clickedPointIDs.includes(feature.properties.attribute_id)
    );
  }).length;
}

function averageAccessScore (streets) {
  var total = 0;
  for (var i = 0; i < streets.features.length; i++) {
    total += streets.features[i].properties.street_access_score;
  }
  return total / streets.features.length;
}

function recalculateStreetAccessScore(streets, streetID, clickedPointIDs, data) {
    var total_weighted_score = 0;
    var red_points = data.features.filter(function (feature) {
      return (feature.properties.street_edge_id === streetID && !clickedPointIDs.includes(feature.properties.attribute_id));
    });
    for (var i = 0; i < red_points.length; i++) {
      total_weighted_score += red_points[i].properties.weighted_score;
    }
    var street_access_score = 1 + total_weighted_score;
    street_access_score = street_access_score < 0 ? 0 : street_access_score; // Ensure minimum value of 0
    return street_access_score;
  }
  

function updateStreetAccessScore(streets, streetID, newStreetAccessScore, data) {
  for (var i = 0; i < streets.features.length; i++) {
    if (streets.features[i].properties.street_edge_id === streetID) {
      streets.features[i].properties.street_access_score = newStreetAccessScore;
      break;
    }
  }
}

function updateMapBasedOnSeverity(minSeverity, maxSeverity) {
  map.setFilter('points', ['all', ['>=', ['get', 'severity'], minSeverity], ['<=', ['get', 'severity'], maxSeverity]]);
}


function updateMapBasedOnStreetAccessScore(minStreetAccessScore, maxStreetAccessScore) {
  map.setFilter('lineLayer', ['all', ['>=', ['get', 'street_access_score'], minStreetAccessScore], ['<=', ['get', 'street_access_score'], maxStreetAccessScore]]);
}

const streetAccessScoreColorScale = d3.scaleLinear()
  .domain([0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0])
  .range(['#cf597e', '#e88471', '#eeb479', '#e9e29c', '#9ccb86', '#39b185', '#009392']);

  const severityColorScale = d3.scaleLinear()
  .domain([0, 1, 2, 3, 4, 5])
  .range([ '#b1c7b3', '#f1eac8', '#e5b9ad', '#d98994', '#d0587e','#70284a']);




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
        'interpolate',
        ['linear'],
        ['get', 'street_access_score'],
        0.4, '#cf597e',
        0.5,'#e88471',
        0.6, '#eeb479',
        0.7,'#e9e29c',
        0.8,'#9ccb86',
        0.9,'#39b185',
        1.0,'#009392'
      ],
      'line-width': 5,
      'line-opacity': 0.7
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
        paint: {          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            7,
            5
          ],
          'circle-color': 'white',
          'circle-stroke-color': 'white',
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            0
          ],
          'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.8,
            0.4
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
      
        var street_access_score = recalculateStreetAccessScore(streets, clickedStreetID, clickedPointIDs, data);
        
        updateStreetAccessScore(streets, clickedStreetID, street_access_score, data);

      
        map.getSource('streets').setData(streets);
      
        map.setPaintProperty('points', 'circle-color', [
          'case',
          ['in', ['get', 'attribute_id'], ['literal', clickedPointIDs]],
          '#67dba5',
          'white'
        ]);

        map.setPaintProperty('points', 'circle-opacity', [
            'case',
            ['in', ['get', 'attribute_id'], ['literal', clickedPointIDs]],
            1,
            0.4
          ]);
      
        map.setPaintProperty('lineLayer', 'line-color', [
          'interpolate',
          ['linear'],
          ['get', 'street_access_score'],
          0.4, '#cf597e',
          0.5,'#e88471',
          0.6, '#eeb479',
          0.7,'#e9e29c',
          0.8,'#9ccb86',
          0.9,'#39b185',
          1.0,'#009392'
        ]);


        var fixedCurbCount = countFixedCurbs(data, clickedPointIDs);
        var missingCurbCount = countMissingCurbs(data, clickedPointIDs);

        var accessScore = averageAccessScore(streets);
        console.log(accessScore)
        document.getElementById("fixed-curb-count").innerHTML = fixedCurbCount;
        document.getElementById("missing-curb-count").innerHTML = missingCurbCount;
        // round to 2 decimal places
        document.getElementById("access-score").innerHTML = accessScore.toFixed(4);

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

      ///////
      function createSeverityHistogram() {
        const margin = { top: 10, right: 20, bottom: 20, left: 30 };
      const width = 360 - margin.left - margin.right;
      const height = 120 - margin.top - margin.bottom;
      
      const svg = d3.select("#histogram")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      
        const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("brush end", brushed);
      
      const gBrush = svg.append("g")
        .attr("class", "brush")
        .call(brush);
      
      
      const severityValues = data.features.map((feature) => feature.properties.severity);
      const x = d3.scaleLinear().domain([0, 5]).range([0, width]);
      const histogram = d3.histogram().domain(x.domain()).thresholds(x.ticks(6))(severityValues);
      const y = d3.scaleLinear().domain([0, 120]).range([height, 0]);
      
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(6));
      
      svg.append("g")
        .call(d3.axisLeft(y).ticks(3));
      
      const bar = svg.selectAll(".bar")
        .data(histogram)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.x0) + 1)
        .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", (d) => y(d.length))
        .attr("height", (d) => height - y(d.length))
        .attr("fill", (d) => severityColorScale(d.x0));
      
        function brushed(event) {
          if (!event.sourceEvent) return;
          const [minSeverity, maxSeverity] = event.selection.map(x.invert).map(Math.round);
          updateMapBasedOnSeverity(minSeverity, maxSeverity);
        }
      }
      createSeverityHistogram();


      function createStreetAccessScoreHistogram() {
        // Place the code for the street_access_score histogram here
        const margin = { top: 10, right: 20, bottom: 20, left: 30 };
const width = 360 - margin.left - margin.right;
const height = 120 - margin.top - margin.bottom;

const svg = d3.select("#histogram-street-score")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const brush = d3.brushX()
  .extent([[0, 0], [width, height]])
  .on("brush end", brushed);

const gBrush = svg.append("g")
  .attr("class", "brush")
  .call(brush);

const streetAccessScoreValues = streets.features.map((feature) => feature.properties.street_access_score);
const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
const histogram = d3.histogram().domain(x.domain()).thresholds(x.ticks(11))(streetAccessScoreValues);
const y = d3.scaleLinear().domain([0, 50]).range([height, 0]);

svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x).ticks(11));

svg.append("g")
  .call(d3.axisLeft(y).ticks(3));

const bar = svg.selectAll(".bar")
  .data(histogram)
  .join("rect")
  .attr("class", "bar")
  .attr("x", (d) => x(d.x0) + 1)
  .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
  .attr("y", (d) => y(d.length))
  .attr("height", (d) => height - y(d.length))
  .attr("fill", (d) => streetAccessScoreColorScale(d.x0))

function brushed(event) {
  if (!event.sourceEvent) return;
  const [minStreetAccessScore, maxStreetAccessScore] = event.selection.map(x.invert);
  updateMapBasedOnStreetAccessScore(minStreetAccessScore, maxStreetAccessScore);
}

      }
      createStreetAccessScoreHistogram();

  /////////
  ////////
  
      map.addControl(new mapboxgl.NavigationControl());
    });

    const markerHeight = 10;
const markerRadius = 20;
const linearOffset = 25;

  const popupOffsets = {
    'top': [0, 0],
    'top-left': [0, 0],
    'top-right': [0, 0],
    'bottom': [0, -markerHeight],
    'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'left': [markerRadius, (markerHeight - markerRadius) * -1],
    'right': [-markerRadius, (markerHeight - markerRadius) * -1]
    };

       // Create a popup, but don't add it to the map yet.
       const popup = new mapboxgl.Popup({
        offset: popupOffsets,
        closeButton: true,
        closeOnClick: true
    })
    .setMaxWidth("300px")
;



  map.on('mouseenter', 'points', (e) => {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';

    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    // const label_type = e.features[0].properties.label_type;
    const severity = e.features[0].properties.severity;
    const url = e.features[0].properties.img_url;
    // const tag = e.features[0].properties.tag_list;
    const img = "<img width = 240px src=" +"'" + url + "'" + "/>";


    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML
    ("<div>"+"<strong>Missing Curb Ramp</strong>" +  "</div>"
    + "<div>"+"<strong>Severity:</strong> " + severity + "</div>"
   + "<div>"+img+"</div>").addTo(map);
});  

  
   

    
  });
});

