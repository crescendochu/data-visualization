import React from 'react';

const FilterBar = ({properties, handleFilterChange}) => {
  return (
    <div className="filter-bar">
      <i className="filter-icon">🔍</i>
      <input 
        type="text" 
        placeholder="Search..." 
        onChange={(e) => handleFilterChange(e.target.value)}
      />
      <select name="properties" id="properties-select">
        {properties.map((prop, index) => (
          <option key={index} value={prop}>{prop}</option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
