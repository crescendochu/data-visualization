import React from 'react';
import LayerControl from './LayerControl';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Sidebar = ({ layers, toggleVisibility,handleAccessShedChange,applySeverityFilter }) => {
  // Separate the layers into 'City Data' and 'Sidewalk Features'
  const cityDataLayers = layers.filter(layer => layer.id !== 'no-curb-ramp');
  const sidewalkFeaturesLayers = layers.filter(layer => layer.id === 'no-curb-ramp');
  
  return (
    <div id="menu" className="sidebar">
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="sidewalk-features-content"
          id="sidewalk-features-header"
        >
          <h3>Sidewalk Features</h3>
        </AccordionSummary>
        <AccordionDetails>
          {sidewalkFeaturesLayers.map((layer) => (
            <LayerControl
              key={layer.id}
              layer={layer}
              isVisible={layer.visibility}
              toggleVisibility={toggleVisibility}
              handleAccessShedChange={handleAccessShedChange}
              applySeverityFilter={applySeverityFilter}
            />
          ))}
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="city-data-content"
          id="city-data-header"
        >
          <h3>City Data</h3>
        </AccordionSummary>
        <AccordionDetails>
          {cityDataLayers.map((layer) => (
            <LayerControl
              key={layer.id}
              layer={layer}
              isVisible={layer.visibility}
              toggleVisibility={toggleVisibility}
              handleAccessShedChange={handleAccessShedChange}
              applySeverityFilter={applySeverityFilter}
            />
          ))}
        </AccordionDetails>
      </Accordion>
      
    </div>
  );
};;

export default Sidebar;


