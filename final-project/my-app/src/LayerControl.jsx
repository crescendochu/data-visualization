// LaterControl.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Plus, ChartPolar, Eye, EyeSlash,Faders,Funnel } from "@phosphor-icons/react";
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const LayerControl = ({ layer, mapInstance, isVisible, toggleVisibility, handleAccessShedChange }) => {
  // const mapInstance = useRef(null);
  const [map, setMap] = useState(null);
  const [severityRange, setSeverityRange] = useState([0, 5]); 
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addAccessShed, setAddAccessShed] = useState(false);
  const [accessShedRange, setAccessShedRange] = useState(0);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [filterProperties, setFilterProperties] = useState([]);
  const [filterInput, setFilterInput] = useState('');

  useEffect(() => {
    if (mapInstance) {
      setMap(mapInstance);
    }
  }, [mapInstance]);


  const applySeverityFilter = (severityRange) => {
    if (map) {
      map.setFilter('no-curb-ramp', ['all', ['>=', 'severity', severityRange[0]], ['<=', 'severity', severityRange[1]]]);
    }
  };


  useEffect(() => {
    if (mapInstance.current && mapInstance.current.getMap()) {
      setMap(mapInstance.current.getMap());
    }
  }, [mapInstance]);
  
  useEffect(() => {
    if (map && layer.id === 'no-curb-ramps' && filterInput === 'severity') {
      map.setFilter('no-curb-ramps', ['all', ['>=', 'severity', severityRange[1]], ['<=', 'severity', severityRange[5]]]);
    }
  }, [map, severityRange, layer.id, filterInput]);


  const layerProperties = {
    'no-curb-ramp': ['severity'],
    'churches': ['wheelchair'],
    // Add other layers here if needed.
  };

const fetchDataProperties = async (url, layerId) => {
    const response = await fetch(url);
    const data = await response.json();
    const properties = data.features?.[0]?.properties;
    
    // Check if layerId exists in layerProperties
    if (properties && layerProperties[layerId]) {
      const selectedProperties = Object.keys(properties).filter(key => layerProperties[layerId].includes(key));
      setFilterProperties(selectedProperties);
    }
  };
  
  
  useEffect(() => {
    if (layer.id === 'no-curb-ramp') {
      fetchDataProperties('https://raw.githubusercontent.com/crescendochu/data-visualization/main/data/Seattle_labels_withZoominLevel/filtered_NoCurbs_zoomin_0.geojson', layer.id);
    } else {
      fetchDataProperties(`https://raw.githubusercontent.com/crescendochu/data-visualization/main/data/Seattle_GeoData_Points/Seattle_${layer.id}_centroids.geojson`, layer.id);
    }
  }, [layer.id]);

  const handleToggleVisibility = () => toggleVisibility(layer.id);
  const handleSettingsClick = () => setSettingsOpen(!settingsOpen);
  const handleAddAccessShed = () => setAddAccessShed(true);

  const handleSliderChange = (event, newValue) => {
    setAccessShedRange(newValue);
    handleAccessShedChange(layer.id, newValue);
  };

  const handleSeveritySliderChange = (event, newValue) => {
    console.log("Severity slider changed with new value: ", newValue);
    setSeverityRange(newValue);
    applySeverityFilter(newValue);
};

  const handleAddFilter = () => setShowFilterBar(true);

  const handleFilterChange = (event, newValue) => setFilterInput(newValue);

  const handleSeverityFilterChange = (event, newValue) => {
    console.log('Severity filter changed with new value: ', newValue);
    setSeverityRange(newValue);
    applySeverityFilter(newValue);  // Apply the filter whenever the slider changes
  };


  return (
    <div className="map-layers" style={{ height: settingsOpen ? 'fit-content' : 'auto' }}>
      <div className="draggable-layer">
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
          <Faders weight="bold" onClick={handleSettingsClick} />
        </div>
      </div>
      {settingsOpen && (
        <div className="settings-container">
          <div className="settings-buttons">
          <Button onClick={handleAddFilter}>  <Plus size={22} weight="bold" />  Filter</Button>
          <Button onClick={handleAddAccessShed}> <Plus size={22} weight="bold" /> Access Shed</Button>
          </div>
          {addAccessShed && (
            <div className="slider-with-icon">
              <ChartPolar size={32} weight="bold" className='icon'/>
              <div className="slider">
            <Slider
              value={accessShedRange}
              onChange={handleSliderChange}
              min={0}
              max={2000}
              step={100}
              marks={[
                {value: 0, label: '0'},

                {value: 500, label: '500m'},
                {value: 1000, label: '1000m'},
                {value: 1500, label: '1500m'},
                {value: 2000, label: '2000m'},
              ]}
            />
            </div>
            </div>
          )}
          {showFilterBar && (
            <div className="filter-and-slider">
            <div className="filter-bar">
              <Funnel size={32} weight="bold" className='icon'/>
              <div className="filter-input">
              <Autocomplete
                options={filterProperties}
                value={filterInput}
                onChange={handleFilterChange}
                renderInput={(params) => <TextField {...params} label="Filter" variant="outlined" />}
              />
              </div>
            </div>
              {filterInput === 'severity' && (
            <div className="slider">
                <Slider
                value={severityRange}
                onChange={handleSeverityFilterChange}
                valueLabelDisplay="auto"
                min={0}
                max={5}
                step={1}
                marks={[
                    { value: 0, label: '0' },
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
    ]}
            />
            </div>
            
                )}
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LayerControl;
