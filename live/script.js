let prevHouseTotals = {
  'Ruby': 70,
  'Emerald': 59,
  'Sapphire': 48,
  'Topaz': 54
};
let winners;
const popupBox = document.getElementById('popupBox');
const popupHeading = document.getElementById('popupHeading');
const popupMsg = document.getElementById('popupMsg');
const ribbons = document.getElementById('ribbons');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const downloadBtn = document.getElementById('downloadBtn');
const defaultHeadline = "Get ready for an action-packed celebration! Jamna Vidyapeeth proudly presents the Annual Sports Meet 2024-25. The ultimate showdown begins!";
const savedResultsURL = "https://sourabhsuneja.github.io/jvp-sports-meet/saved-results/";
// Array of congratulatory words and phrases
const congratulatoryWords = [
  "Bravo!",
  "Congratulations!",
  "Well done!",
  "Amazing performance!",
  "Fantastic effort!",
  "Outstanding!",
  "Great job!",
  "Keep it up!",
  "You're a star!",
  "Way to go!",
  "Impressive!",
  "Excellent work!",
  "Superb!",
  "You're unstoppable!",
  "What a win!"
];

async function pollEntireData() {
   let inLiveMode = true;
   const resultName = getParameterByName('result');
   if(resultName) {
     const fetchedData = await fetchSavedResult(`${savedResultsURL}${resultName}.json`);
     inLiveMode = false;
     winners = fetchedData['winners'];
     prevHouseTotals = fetchedData['Previous Total'];
     console.log('Data fetched from an already saved JSON results file.');
   } else {
     winners = await selectData(
        tableName = 'winners',
        fetchSingle = false,
        columns = '*',
        matchColumns = [],
        matchValues = [],
        orderByColumn = 'classcategory',
        orderDirection = 'asc'
     );
   }

   // Populate table rows dynamically
   winners.forEach(winner => {
      addNewRow(winner);
   });

   // Hide loading dialog
   hideProcessingDialog();

   const houseScores = calculateScores(winners);
   updateDashboard(houseScores);
   return inLiveMode;
}

// Close the popup when clicking the close button
popupCloseBtn.addEventListener('click', () => {
   popupBox.style.display = 'none';
   ribbons.style.display = 'none';
});

// Close the popup when clicking outside the popup content
popupBox.addEventListener('click', (e) => {
   if (e.target === popupBox) {
      popupBox.style.display = 'none';
      ribbons.style.display = 'none';
   }
});

function showPopup(heading, message, showRibbons = false, stayAlive = 43200000) {
   popupHeading.innerHTML = heading;
   popupMsg.innerHTML = message;
   popupBox.style.display =  'flex';
   if (showRibbons) {
      ribbons.style.display = 'block';
      ribbons.style.animation = 'showHide 2.5s ease-in-out forwards';
   }
   setTimeout(hidePopup, stayAlive); // hide pop-up after a set interval
}

function hidePopup() {
   popupCloseBtn.click();
}

// Set headlines and pop-up after win update
function setHeadlineAndPopupAfterWin(w, updateElement = 'both') {

   if (updateElement === 'headline' || updateElement === 'both') {
      const headlines = generateLiveWinHeadline();
      // update scrolling text
      updateScrollingText(newText = headlines, stayAlive = 240000);
   }

   if (updateElement === 'popup' || updateElement === 'both') {
      // show pop-up with a cheers message
      const heading = "🥳 " + getRandomCongratulatoryWord() + " 🥳";
      const popupContent = generateWinnersMessage(w.winner1, w.winner2, w.winner3, w.winnerhouse1, w.winnerhouse2, w.winnerhouse3, w.game);
      showPopup(heading, popupContent, true, 60000);
   }
}

// Function to generate cheering text for the pop-up
function generateWinnersMessage(winner1, winner2, winner3, winnerHouse1, winnerHouse2, winnerHouse3, game) {
   if(getGameType(game) === 'individual') {
      return `Cheers to ${winner1} from ${winnerHouse1} House for securing 1st place, ${winner2} from ${winnerHouse2} House for 2nd, and ${winner3} from ${winnerHouse3} House for 3rd in ${game}! <br><br>🏅 Well done, champions! 🏅`;
   } else {
      return `Cheers to ${winnerHouse1} House for securing 1st place, and ${winnerHouse2} House for 2nd place in ${game}! <br><br>🏅 Well done, champions! 🏅`;
   }   
}

// Function to randomly pick a congratulatory word or phrase
function getRandomCongratulatoryWord() {
  const randomIndex = Math.floor(Math.random() * congratulatoryWords.length);
  return congratulatoryWords[randomIndex];
}

// Function to download data as a file
function downloadFile(data, fileName, mimeType) {
   const blob = new Blob([data], { type: mimeType });
   const url = URL.createObjectURL(blob);
   const anchor = document.createElement('a');
   anchor.href = url;
   anchor.download = fileName;
   document.body.appendChild(anchor); // Append to the DOM for compatibility
   anchor.click();
   document.body.removeChild(anchor); // Clean up the DOM
   URL.revokeObjectURL(url); // Release the object URL
}

// Event listener for downloading files
downloadBtn.addEventListener('click', () => {
   // Generate CSV content from table
   const winnersTable = document.getElementById('winnersTable');
   const csvContent = Array.from(winnersTable.rows)
      .map(row => Array.from(row.cells)
         .map(cell => `"${cell.textContent}"`)
         .join(','))
      .join('\n');

   // Prepare JSON content
   const jsonContent = JSON.stringify({
      'Previous Total': prevHouseTotals,
      winners: winners
   }, null, 2);

   // Download files with a slight delay between them
   downloadFile(csvContent, 'winners.csv', 'text/csv');
   setTimeout(() => {
      downloadFile(jsonContent, 'winners.json', 'application/json');
   }, 100); // 100ms delay
});

function processClassString(str) {
   if (str === '6 to 8' || str === '9 to 12' || str === '9 to 10' || str === '11 to 12') {
      return '6 to 12';
   }
   // Check if the string contains the word 'to' or is exactly '3 to 5' or '6 to 12'
   if (str === '3 to 5' || str === '6 to 12' || str.includes(' to ')) {
      return str;
   }

   // Convert the string to a number
   const num = Number(str);

   // Check if the string is a valid number and within the range 3-5 or 6-12
   if (!isNaN(num)) {
      if (num >= 3 && num <= 5) {
         return '3 to 5';
      } else if (num >= 6 && num <= 12) {
         return '6 to 12';
      } else if (num === 1 || num === 2) {
         return '1 to 2';
      }
   }

   // Default return if none of the above conditions are met
   return 'NA';
}

function calculateScores(winners) {
   // Initialize the scores object
   const scores = {
      'Total': {
         'Ruby': 0,
         'Emerald': 0,
         'Sapphire': 0,
         'Topaz': 0
      },
      'Previous Total': prevHouseTotals
   };

   // Add previous totals to the house totals
    for(const house in scores.Total) {
        scores.Total[house] += scores['Previous Total'][house];
    }

 // Function to add points to one or more houses
function addPoints(scoreObj, house, points) {
    // Split the house string by "/" (if present in case of ties between two houses) and trim whitespace from each house name
    const houseArray = house.split("/").map(item => item.trim());
    // points = points / houseArray.length;

    // Iterate over the house names and update the scores
    houseArray.forEach(houseName => {
        // Initialize the house score if it doesn't exist
        if (!scoreObj[houseName]) {
            scoreObj[houseName] = 0;
        }
        // Add the specified points
        scoreObj[houseName] += points;
    });
}

   // Iterate through each winner entry
   winners.forEach(entry => {
      const category = processClassString(entry.classcategory);

      // Initialize the category in the scores object if not already present
      if (!scores[category]) {
         scores[category] = {
            'Ruby': 0,
            'Emerald': 0,
            'Sapphire': 0,
            'Topaz': 0
         };
      }

      // Add points for winner1, winner2, and winner3
      addPoints(scores[category], entry.winnerhouse1, 10);
      addPoints(scores[category], entry.winnerhouse2, 7);
      addPoints(scores[category], entry.winnerhouse3, 5);

      // Add points to the total as well
      addPoints(scores.Total, entry.winnerhouse1, 10);
      addPoints(scores.Total, entry.winnerhouse2, 7);
      addPoints(scores.Total, entry.winnerhouse3, 5);
   });
   return scores;
}


// function to count winner houses
function countWinnerHouses(winners) {
   const winnerCounts = {};

   // Initialize the "Total" category
   winnerCounts["Total"] = {
      'Ruby': 0,
      'Topaz': 0,
      'Emerald': 0,
      'Sapphire': 0
   };

   // Loop through each winner entry
   winners.forEach(entry => {
      let {
         classcategory,
         winnerhouse1
      } = entry;

      // Parse class into correct class category
      classcategory = processClassString(classcategory)

      // Initialize the class category in the result object if not already present
      if (!winnerCounts[classcategory]) {
         winnerCounts[classcategory] = {
            'Ruby': 0,
            'Topaz': 0,
            'Emerald': 0,
            'Sapphire': 0
         };
      }

      // Increment the count for the house in the class category
      if (winnerCounts[classcategory][winnerhouse1] !== undefined) {
         winnerCounts[classcategory][winnerhouse1]++;
      }

      // Increment the count for the house in the "Total" category
      if (winnerCounts["Total"][winnerhouse1] !== undefined) {
         winnerCounts["Total"][winnerhouse1]++;
      }
   });

   return winnerCounts;
}

// function to animate to the new score while updating the dashboard 
function updateScoreWithAnimation(element, newContent) {
   // Parse the current score and new content as integers
   let oldScore = parseInt(element.textContent, 10);
   let newScore = parseInt(newContent, 10);

   // if new score is same as old score, do nothing
   if (oldScore === newScore) {
      return;
   }

   // Determine the direction of counting (up or down)
   let step = oldScore < newScore ? 1 : -1;

   // Create an interval to update the score step by step
   let interval = setInterval(() => {
      oldScore += step;
      element.textContent = oldScore;

      // Stop the interval once we reach the new score
      if (oldScore === newScore) {
         clearInterval(interval);
      }
   }, 10); // Delay between each update for the animation effect
}


// function to rank houses based on their total scores
function rankHouses(score) {
    // Remove the "NIL" key if it exists
    delete score['NIL'];

    // Convert the score object to an array of [house, score] pairs
    let scoreArray = Object.entries(score);

    // Sort the array in descending order of scores
    scoreArray.sort((a, b) => b[1] - a[1]);

    // Create a rank object
    let rank = {};
    scoreArray.forEach((item, index) => {
        rank[item[0]] = index + 1;
    });

    return rank;
}

// function to dynamically reorder house score tiles based on their current ranks
function updateTileOrder(ranks, container) {
    const tilesContainer = document.querySelector(`.${container}`);
    if(!tilesContainer) return;
    const tiles = Array.from(tilesContainer.children);

    // Filter out hidden tiles (e.g., "NIL")
    const visibleTiles = tiles.filter(tile => !tile.classList.contains("hidden"));

    // Sort the visible tiles based on the ranks object
    visibleTiles.sort((a, b) => {
        const houseA = a.classList.contains('ruby') ? 'Ruby' :
                       a.classList.contains('emerald') ? 'Emerald' :
                       a.classList.contains('sapphire') ? 'Sapphire' :
                       a.classList.contains('topaz') ? 'Topaz' : null;
        const houseB = b.classList.contains('ruby') ? 'Ruby' :
                       b.classList.contains('emerald') ? 'Emerald' :
                       b.classList.contains('sapphire') ? 'Sapphire' :
                       b.classList.contains('topaz') ? 'Topaz' : null;

        return ranks[houseA] - ranks[houseB];
    });

    // Append the visible tiles back in sorted order
    visibleTiles.forEach(tile => tilesContainer.appendChild(tile));
}


// function to update the dashboard 
function updateDashboard(scores) {
  
   // Loop through each class category in the scores object
   for (const classcategory in scores) {

      // Format the class category and house into the ID pattern
      const formattedCategory = classcategory.toLowerCase().replace(/ /g, '_');

      // Get the house counts for the current category
      const subtotals = scores[classcategory];

      // Get ranks for all houses
      const ranks = rankHouses(subtotals);

      // Dynamically re-order the score tiles based on ranks
      updateTileOrder(ranks, `tiles_${formattedCategory}`)

      // Update rank labels for all houses
      for(const [house, rank] of Object.entries(ranks)) {
         // Find the rank label element
         const id = `${house.toLowerCase()}_${formattedCategory}_rank`;
         const element = document.getElementById(id);
         let ordinalVal;
         switch(rank) {
            case 1: ordinalVal = 'First';
            break;
            case 2: ordinalVal = 'Second';
            break;
            case 3: ordinalVal = 'Third';
            break;
            case 4: ordinalVal = 'Fourth';
            break;
            default: ordinalVal = undefined;
         }
         if(element && ordinalVal) {         
            element.innerText = ordinalVal;
         }
      }

      // Loop through each house in the subtotals object
      for (const house in subtotals) {
         
         const id = `${house.toLowerCase()}_${formattedCategory}`;

         // Find the HTML element by the ID
         const element = document.getElementById(id);

         // If the element exists, update its content
         if (element) {
            updateScoreWithAnimation(element, subtotals[house]);
         } else {
            console.warn(`Element with ID "${id}" not found.`);
         }
      }
   }
}


function addNewRow(winner) {
   const winnersTableBody = document.getElementById('winnersTableBody');

   const row = document.createElement('tr');
   row.id = 'row' + winner.row_id;
   row.innerHTML = `
             <td>${formatGameName(winner.game)}</td>
             <td>${winner.classcategory}</td>
             <td>${formatWinnerName(winner.winner1)}</td>
             <td>${formatWinnerName(winner.winner2)}</td>
             <td>${formatWinnerName(winner.winner3)}</td>
             <td>${winner.winnerhouse1}</td>
             <td>${winner.winnerhouse2}</td>
             <td>${winner.winnerhouse3}</td>
           `;
   winnersTableBody.appendChild(row);

}


function updateExistingRow(winner) {

   const row = document.getElementById('row' + winner.row_id);

   row.innerHTML = `
             <td>${formatGameName(winner.game)}</td>
             <td>${winner.classcategory}</td>
             <td>${formatWinnerName(winner.winner1)}</td>
             <td>${formatWinnerName(winner.winner2)}</td>
             <td>${formatWinnerName(winner.winner3)}</td>
             <td>${winner.winnerhouse1}</td>
             <td>${winner.winnerhouse2}</td>
             <td>${winner.winnerhouse3}</td>
           `;

}


function updateWinner(rowID, newWinnerData) {
   // Find the index of the object with the matching row_id
   const index = winners.findIndex(winner => winner.row_id === rowID);

   // If the object is found, update it with the newWinnerData
   if (index !== -1) {
      winners[index] = {
         ...winners[index],
         ...newWinnerData
      };
   } else {
      console.log(`Row with ID ${rowID} not found.`);
   }
}

function handleLiveUpdate(payload) {
   if (payload.eventType === 'INSERT') {
      winners.push(payload.new);
      addNewRow(payload.new);
      setHeadlineAndPopupAfterWin(payload.new, 'both');
   } else if (payload.eventType === 'UPDATE') {
      updateWinner(payload.new.row_id, payload.new);
      updateExistingRow(payload.new);
      setHeadlineAndPopupAfterWin(payload.new, 'headline');
   }

   const winnerCounts = calculateScores(winners);
   updateDashboard(winnerCounts);

}

function updateScrollingText(newText = defaultHeadline, stayAlive = 43200000) {

   const scrollingTextElement = document.getElementById('scrollingText');

   // Update the scrolling text
   scrollingTextElement.innerHTML = newText;

   // Remove the headlines after a set duration
 setTimeout(resetHeadline, stayAlive);
}

// function to reset the headline back to the default welcome headline
function resetHeadline() {
   document.getElementById('scrollingText').innerHTML = defaultHeadline;
}

// helper function to remove the class category part from the game name for a cleaner string
function formatGameName(input) {
   // Split the string at the "|" symbol
   const parts = input.split('|');

   // If there's a "|" symbol, return the substring after it, trimmed
   return parts.length > 1 ? parts[1].trim() : input;
}

// helper function to format winner name so that class is always displayed in the next line
function formatWinnerName(str) {
	const match = str.match(/\((?:Class\s)?\d+(?:-\w+)?\)$/i);
	return match ? str.replace(match[0], `<br>${match[0]}`) : str;
}

// helper function to capitalize first letter of each word
function capitalizeFirstLetter(string) {
   return string
      .toLowerCase() // Convert the entire string to lowercase
      .split(' ') // Split the string into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the array of words back into a single string
}

// helper function to determine game type (individual or team)
function getGameType(game) {
   const gameName = game.toLowerCase();
   // Check if the game is team game based on keywords
   const teamKeywords = ["kho kho", "kabaddi", "rollball", "basketball", "handball"];
   if (teamKeywords.some(keyword => gameName.includes(keyword))) {
      return 'team';
   } else {
      return 'individual';
   }
}

function generateLiveWinHeadline() {
   const table = document.getElementById("winnersTable");
   const tableBody = table.querySelector("tbody");
   const rows = tableBody ? tableBody.querySelectorAll("tr") : [];

   if (rows.length === 0) {
      return; // Do nothing if the table is empty
   }

   // Get the last 3 rows or fewer if there are not enough rows
   const lastRows = Array.from(rows).slice(-3).reverse();

   const headlines = lastRows.map(row => {
      const game = row.cells[0].textContent.trim();
      const classGroup = row.cells[1].textContent.trim();
      const winner1 = row.cells[2].textContent.trim();
      const winner2 = row.cells[3].textContent.trim();
      const winner3 = row.cells[4].textContent.trim();
      const winnerHouse1 = row.cells[5].textContent.trim();
      const winnerHouse2 = row.cells[6].textContent.trim();
      const winnerHouse3 = row.cells[7].textContent.trim();

      // Check if it's a team game (i.e., Class 3 to 5 | Kho Kho, etc.)
      if (getGameType(game) === 'team') {
         return `<strong>${game}</strong> Results (Classes ${classGroup}): ${winnerHouse1} clinches 1st, ${winnerHouse2} bags 2nd, ${winnerHouse3} secures 3rd position.`;
      } else {
         // For individual games
         return `<strong>${game} Results (Class ${classGroup}):</strong> ${winner1} from ${winnerHouse1} house clinches 1st, ${winner2} from ${winnerHouse2} house bags 2nd, ${winner3} from ${winnerHouse3} house secures 3rd position.`;
      }
   });

   // Return the formatted headlines as a string
   return headlines.join("&nbsp;  |  &nbsp;");
}

function handleNotifications(payload) {
    if (payload.eventType === 'INSERT' && payload.new) {
        const { type, heading, content } = payload.new;

        if (type === 'headline' || type === 'both') {
            const combined = `<strong>${heading}: </strong>${content}`;
            updateScrollingText(combined);
        }
        if (type === 'popup' || type === 'both') {
            showPopup(heading, content, false, 120000);
        }
    }
}

// Function to get URL parameters
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Function to fetch saved results of past sessions stored as JSON files
async function fetchSavedResult(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null; // Return null in case of an error
  }
}

// Function to format the timestamp to be displayed in the tooltip when a winner row is hovered upon
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  return date.toLocaleString('en-US', options);
}

// Adding hover functionality to the rows to display the time the result was recorded
document.addEventListener('DOMContentLoaded', () => {

  const table = document.getElementById('winnersTable');

  // Create a tooltip div
  const tooltip = document.createElement('div');
  tooltip.id = 'resultTimestamp';
  tooltip.style.position = 'absolute';
  tooltip.style.padding = '8px';
  tooltip.style.background = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.display = 'none';
  tooltip.style.zIndex = '50';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.transform = 'translateY(-10px)';
  tooltip.style.whiteSpace = 'nowrap';
  document.body.appendChild(tooltip);

// Function to update the tooltip position and keep it within the viewport
function updateTooltipPosition(event) {
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = event.pageX + 20;
  let top = event.pageY + 35;

  // Adjust if the tooltip goes beyond the right edge of the viewport
  if (left + tooltipRect.width > viewportWidth) {
    left = viewportWidth - tooltipRect.width - 40; // Add some padding
  }

  // Update the tooltip's position
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

  table.addEventListener('mouseover', (event) => {
    const row = event.target.closest('tr');
    if (row && row.id && row.id.startsWith('row')) {
      const rowId = parseInt(row.id.replace('row', ''), 10);
      const winner = winners.find(w => w.row_id === rowId);

      if (winner) {
        tooltip.textContent = `Result recorded on ${formatTimestamp(winner.timestamp)}`;
        tooltip.style.display = 'block';
      }
    }
  });

  table.addEventListener('mousemove', (event) => {
    updateTooltipPosition(event);
  });

  table.addEventListener('mouseout', (event) => {
    tooltip.style.display = 'none';
  });
});


window.addEventListener('load', async function () {
   const isLive = await pollEntireData();
   if(isLive) {
      const subscription = subscribeToTable('winners', handleLiveUpdate);
      const subscription2 = subscribeToTable('notifications', handleNotifications);
   }
});


