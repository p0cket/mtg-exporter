import React, { useEffect, useState } from 'react';

function App() {
  const [sets, setSets] = useState([]);
  const [setQuery, setSetQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [massEntryList, setMassEntryList] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rarityQuantities, setRarityQuantities] = useState({
    common: 1,
    uncommon: 1,
    rare: 1,
    mythic: 1,
  });
  const [selectedRarities, setSelectedRarities] = useState({
    common: true,
    uncommon: true,
    rare: true,
    mythic: true,
  });
  
  useEffect(() => {
    fetch('https://api.scryfall.com/sets')
      .then(response => response.json())
      .then(data => setSets(data.data))
      .catch(error => console.error("Error fetching sets:", error));
  }, []);

  const fetchCardsForSet = (setCode) => {
    setIsLoading(true);
    fetch(`https://api.scryfall.com/cards/search?order=set&q=e:${setCode}&unique=prints`)
      .then(response => response.json())
      .then(data => {
        setCards(data.data);
        generateMassEntryList(data.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching cards:", error);
        setIsLoading(false);
      });
  };

  // const generateMassEntryList = (cards) => {
  //   const list = cards.map(card => {
  //     const quantity = rarityQuantities[card.rarity] || 1;
  //     // Ensure there's no extra space after commas
  //     return `${quantity} ${card.name} [${card.set.toUpperCase()}] ${card.collector_number}`;
  //   }).join('\n');
  //   setMassEntryList(list);
  // };
//   const generateMassEntryList = (cards) => {
//     // Map each card to the 'quantity card name' format
//     const list = cards.map(card => {
//         const quantity = rarityQuantities[card.rarity] || 1;
//         // Note: No set code or item number included
//         return `${quantity} ${card.name}`;
//     }).join('\n');
//     setMassEntryList(list);
// };

// const generateMassEntryList = (cards) => {
//   const excludedCards = ["Nazgûl"]; // Add any other problematic cards here
//   const cardNamesIncluded = new Set(); // Track included card names to avoid duplicates

//   const filteredAndUniqueCards = cards
//       .map(card => {
//           // Normalize card names by removing prefixes and handling special cases
//           let normalizedName = card.name.replace(/^A-/, ''); // Remove 'A-' prefix
//           normalizedName = normalizedName.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove diacritics, e.g., 'û' in 'Nazgûl'
//           return { ...card, name: normalizedName };
//       })
//       .filter(card => {
//           // Exclude specific problematic cards
//           if (excludedCards.includes(card.name)) return false;
          
//           // Ensure each card is included only once
//           if (cardNamesIncluded.has(card.name)) return false;
//           cardNamesIncluded.add(card.name);
//           return true;
//       });

//   // Generate the mass entry list with quantity and normalized card names
//   const list = filteredAndUniqueCards.map(card => {
//       const quantity = rarityQuantities[card.rarity] || 1;
//       return `${quantity} ${card.name}`;
//   }).join('\n');

//   setMassEntryList(list);
// };
function preprocessAndFilterCards(cards) {
  const processedCards = [];

  cards.forEach(card => {
    // Normalize card names by using the name before '//' for transform cards
    let normalizedName = card.name.split(' // ')[0].trim();

    // Remove prefixes like "A-" that might cause issues
    normalizedName = normalizedName.replace(/^A-/, '');

    // Exclude specific cards (e.g., problematic ones) based on conditions
    if (normalizedName !== 'Nazgûl') {
      // Check if we've already added this card name to avoid duplicates
      const existingCard = processedCards.find(c => c.name === normalizedName);
      if (!existingCard) {
        processedCards.push({ ...card, name: normalizedName });
      }
    }
  });

  return processedCards;
}


const generateMassEntryList = (cards) => {
  // Preprocess and filter the cards based on the defined rules
  const processedCards = preprocessAndFilterCards(cards.filter(card => selectedRarities[card.rarity]));

  // Generate the list from the processed cards
  const list = processedCards.map(card => {
    const quantity = rarityQuantities[card.rarity] || 1;
    return `${quantity} ${card.name}`; // Use the normalized name
  }).join('\n');

  setMassEntryList(list);
};



function handleRaritySelectionChange(rarity) {
  setSelectedRarities(prev => ({ ...prev, [rarity]: !prev[rarity] }));
}



  
  // const generateMassEntryList = (cards) => {
  //   const list = cards.map(card => 
  //     `${rarityQuantities[card.rarity] || 1} ${card.name} [${card.set.toUpperCase()}] ${card.collector_number}`)
  //     .join('\n');
  //   setMassEntryList(list);
  // };

//   function generateMassEntryList(cards) {
//     const formattedCards = cards.map(card => {
//         const quantity = rarityQuantities[card.rarity] || 1;
//         // Format card name, ensuring to include the full name for double-faced cards
//         const cardName = card.name.includes('//') ? `"${card.name}"` : card.name; // Enclose double-faced names in quotes
//         return `${quantity}, ${cardName}, [${card.set.toUpperCase()}], ${card.collector_number}`;
//     }).join('\n');

//     setMassEntryList(formattedCards);
// }

  const handleRarityQuantityChange = (rarity, value) => {
    setRarityQuantities(prevQuantities => ({
      ...prevQuantities,
      [rarity]: Math.max(1, parseInt(value) || 0)
    }));
  };

  const handleSelectSet = (setName) => {
    const selectedSet = sets.find(set => set.name === setName);
    if (selectedSet) {
      setSetQuery(selectedSet.name);
      fetchCardsForSet(selectedSet.code);
    }
  };
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(massEntryList).then(() => {
      alert('Copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };
  function preprocessCardNames(cardList) {
    return cardList.map(card => {
        // Split the card name if it contains '//'
        if (card.includes("//")) {
            let [name1, name2] = card.split(" // ");
            name1 = name1.trim();
            name2 = name2.trim();

            // Extract set and number (assumes the format "name [SET] number")
            const setNumberMatch = name2.match(/\[(.*?)\]\s(\d+)/);
            if (setNumberMatch && setNumberMatch.length === 3) {
                const setName = setNumberMatch[1];
                const cardNumber = setNumberMatch[2];

                // Reformat the names
                return `1 ${name1} [${setName}] ${cardNumber}\n1 ${name2} [${setName}] ${cardNumber}`;
            } else {
                return card; // Return original if no match
            }
        } else {
            return card; // Return original if no '//' found
        }
    }).join('\n');
}

// Example usage
// const cardNames = [
//     "Aetherblade Agent // Gitaxian Mindstinger [MOM] 88",
//     "Ayara, Widow of the Realm // Ayara, Furnace Queen [MOM] 90",
//     // Add more card names...
// ];

// const preprocessedList = preprocessCardNames(cardNames);
// console.log(preprocessedList);


  const filteredSets = sets.filter(set => set.name.toLowerCase().includes(setQuery.toLowerCase()));

  const styles = {
    container: { padding: "20px", fontFamily: "Arial, sans-serif" },
    input: { padding: "10px", margin: "5px", width: "calc(100% - 22px)" },
    rarityInputContainer: { display: "flex", justifyContent: "space-between", maxWidth: "600px", margin: "10px 0" },
    rarityLabel: { marginRight: "10px" },
    listContainer: { maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "5px", margin: "5px 0" },
    listItem: { padding: "5px", cursor: "pointer", margin: "5px 0", borderRadius: "5px", transition: "background-color 0.3s" },
    button: { padding: "10px 20px", marginLeft: "10px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px" },
  };

  return (
    <div style={styles.container}>
      <h1>MTG Set List Generator</h1>
      
      <input
        style={styles.input}
        type="text"
        placeholder="Search for a set"
        value={setQuery}
        onChange={(e) => setSetQuery(e.target.value)}
      />
      <div style={styles.listContainer}>
        {filteredSets.slice(0, 10).map(set => (
          <div key={set.code} onClick={() => handleSelectSet(set.name)} style={{...styles.listItem, ...{':hover': {backgroundColor: "#f0f0f0"}}}}>
            {set.name}
          </div>
        ))}
      </div>
      <div>
  {Object.keys(selectedRarities).map(rarity => (
    <label key={rarity}>
      <input
        type="checkbox"
        checked={selectedRarities[rarity]}
        onChange={() => handleRaritySelectionChange(rarity)}
      />
      Include {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
    </label>
  ))}
</div>
      <div style={styles.rarityInputContainer}>
        {Object.keys(rarityQuantities).map((rarity) => (
          <div key={rarity}>
            <label style={styles.rarityLabel}>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}:</label>
            <input
              type="number"
              value={rarityQuantities[rarity]}
              onChange={(e) => handleRarityQuantityChange(rarity, e.target.value)}
              style={styles.input}
            />
          </div>
        ))}
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <textarea
            value={massEntryList}
            readOnly
            rows="10"
            cols="50"
            style={styles.input}
          />
                        <button style={styles.button} onClick={handleCopyToClipboard}>Copy to Clipboard</button>

          <button style={styles.button} onClick={() => {}}>Download List</button>
        </>
      )}
    </div>
  );
}

export default App;
