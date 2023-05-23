import React, { useState } from 'react';
import { Eye, EyeSlash } from "@phosphor-icons/react";
import SettingsIcon from '@mui/icons-material/Settings';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';

const LayerControl = ({ layer, isVisible, toggleVisibility, handleAccessShedChange }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addAccessShed, setAddAccessShed] = useState(false);
  const [accessShedRange, setAccessShedRange] = useState(0);

  const handleToggleVisibility = () => toggleVisibility(layer.id);
  const handleSettingsClick = () => setSettingsOpen(!settingsOpen);
  const handleAddFilter = () => {
    // Add filter logic here
  };
  const handleAddAccessShed = () => setAddAccessShed(true);

  const handleSliderChange = (event, newValue) => {
    setAccessShedRange(newValue);
    handleAccessShedChange(layer.id, newValue);
  };

  return (
    <div className="map-layers" style={{ height: settingsOpen ? '120px' : 'auto' }}>
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
          <SettingsIcon onClick={handleSettingsClick} />
        </div>
      </div>
      {settingsOpen && (
        <div className="settings-container">
          <Button onClick={handleAddFilter}>Add Filter</Button>
          <Button onClick={handleAddAccessShed}>Add Access Shed</Button>
          {addAccessShed && (
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
          )}
        </div>
      )}
    </div>
  );
};


export default LayerControl;
