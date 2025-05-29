import React from 'react'
import useSabhaSelectorStore from '../../store/useSabhaSelectorStore';
import { useNavigate } from 'react-router-dom';


const SabhaSelector: React.FC = () => {
  const navigate = useNavigate();
  const selectedCity = useSabhaSelectorStore((state) => state.selectedCity);
  const selectCity = useSabhaSelectorStore((state) => state.selectCity);
  const clearCity = useSabhaSelectorStore((state) => state.clearCity);

  const cities = [
    { label: 'Berlin', value: 1 },
    { label: 'Magdeburg', value: 2 },
    { label: 'Nuerenburg', value: 3 },
  ];

  const handleChange = (value: number) => {
    if (selectedCity === value) {
      clearCity();
    } else {
      selectCity(value);
    }
  };

  const handleRedirect = () => {
    if (selectedCity) {
      navigate(`/layout`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-startr",
      }}
    >
      <h2>Select a Sabha Center</h2>
      {cities.map((city) => (
        <label key={city.value} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '5px 0',
          width: '200px',
        }}>
          <input
            type="checkbox"
            checked={selectedCity === city.value}
            onChange={() => handleChange(city.value)}
          />
          {city.label}
        </label>
      ))}
      {selectedCity && (
        <button
          style={{ marginTop: '20px', padding: '10px 20px' }}
          onClick={handleRedirect}
        >
          Go to Youth Page
        </button>
      )}
    </div>
  );
};

export default SabhaSelector;
