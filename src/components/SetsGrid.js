import React, { useEffect, useState } from 'react';

const SetsGrid = ({ onSelectSet }) => {
  const [sets, setSets] = useState([]);

  useEffect(() => {
    const loadSets = async () => {
      const fetchedSets = await fetchSets(); // Fetch sets from the API
      setSets(fetchedSets);
    };

    loadSets();
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
      {sets.map(set => (
        <div key={set.code} style={{ cursor: 'pointer' }} onClick={() => onSelectSet(set.code)}>
          <img src={set.icon} alt={set.name} style={{ width: '100%', aspectRatio: '1 / 1' }} />
          <p style={{ textAlign: 'center' }}>{set.name}</p>
        </div>
      ))}
    </div>
  );
};
