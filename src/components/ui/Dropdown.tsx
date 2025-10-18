import React from 'react';

interface Props {
  label: string;
  items: string[];
}

const Dropdown: React.FC<Props> = ({ label, items }) => (
  <div className="dropdown">
    <button>{label}</button>
    <div className="dropdown-content">
      {items.map(item => (
        <a key={item} href={`/${item.toLowerCase()}`}>{item}</a>
      ))}
    </div>
  </div>
);

export default Dropdown;
