const popupBox = document.getElementById('popupBox');
const popupHeading = document.getElementById('popupHeading');
const popupMsg = document.getElementById('popupMsg');
const ribbons = document.getElementById('ribbons');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const downloadBtn = document.getElementById('downloadBtn');

let winners;
async function pollEntireData() {

   winners = await selectData(
      tableName = 'winners',
      fetchSingle = false,
      columns = '*',
      matchColumns = [],
      matchValues = [],
      orderByColumn = 'row_id',
      orderDirection = 'asc'
   );

   // Populate table rows dynamically
   winners.forEach(winner => {
      addNewRow(winner);
   });

   const winnerCounts = calculateScores(winners);
   updateDashboard(winnerCounts);

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

function showPopup(heading, message, showRibbons = false) {
   popupHeading.innerHTML = heading;
   popupMsg.innerHTML = message;
   popupBox.style.display =  'flex';
   if (showRibbons) {
      ribbons.style.display = 'block';
      ribbons.style.animation = 'showHide 2.5s ease-in-out forwards';
   }
}

function hidePopup() {
   popupCloseBtn.click();
}

// Set headlines and pop-up after win update
function setHeadlineAndPopupAfterWin(w, updateElement = 'both') {

   if (updateElement === 'headline' || updateElement === 'both') {
      const headlines = generateLiveWinHeadline();
      // update scrolling text
      updateScrollingText(headlines);
   }

   if (updateElement === 'popup' || updateElement === 'both') {
      // show pop-up with a cheers message
      const heading = "Bravo!";
      const popupContent = generateWinnersMessage(w.winner1, w.winner2, w.winner3, w.winnerhouse1, w.winnerhouse2, w.winnerhouse3, w.game);
      showPopup(heading, popupContent, true);
   }
}

// Function to generate cheering text for the pop-up
function generateWinnersMessage(winner1, winner2, winner3, winnerHouse1, winnerHouse2, winnerHouse3, game) {
   return `🎉 Cheers to ${winner1} from ${winnerHouse1} for securing 1st place, ${winner2} from ${winnerHouse2} for 2nd, and ${winner3} from ${winnerHouse3} for 3rd in ${game}! <br>🏆 Well done, champions! 🏆`;
}

// Function to download table data as CSV
downloadBtn.addEventListener('click', () => {
   const table = document.getElementById('winnersTable');
   const rows = Array.from(table.rows);

   // Convert rows to CSV format
   const csvContent = rows.map(row => {
      const cells = Array.from(row.cells);
      return cells.map(cell => `"${cell.textContent}"`).join(',');
   }).join('\n');

   // Create a blob and download it
   const blob = new Blob([csvContent], {
      type: 'text/csv'
   });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'winners_table.csv';
   a.click();
   URL.revokeObjectURL(url);
});

function processClassString(str) {
   if (str === '6 to 8' || str === '9 to 12') {
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
      }
   };

   // Function to add points to a house
   function addPoints(scoreObj, house, points) {
      if (!scoreObj[house]) {
         scoreObj[house] = 0;
      }
      scoreObj[house] += points;
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
   }, 40); // Delay between each update for the animation effect
}

// function to update the dashboard 
function updateDashboard(winnerCounts) {
   // Loop through each class category in the winnerCounts object
   for (const classcategory in winnerCounts) {
      // Get the house counts for the current category
      const houseCounts = winnerCounts[classcategory];

      // Loop through each house in the houseCounts object
      for (const house in houseCounts) {
         // Format the class category and house into the ID pattern
         const formattedCategory = classcategory.toLowerCase().replace(/ /g, '_');
         const id = `${house.toLowerCase()}_${formattedCategory}`;

         // Find the HTML element by the ID
         const element = document.getElementById(id);

         // If the element exists, update its content
         if (element) {
            updateScoreWithAnimation(element, houseCounts[house]);
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
             <td>${winner.winner1}</td>
             <td>${winner.winner2}</td>
             <td>${winner.winner3}</td>
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
             <td>${winner.winner1}</td>
             <td>${winner.winner2}</td>
             <td>${winner.winner3}</td>
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
      setHeadlineAndPopupAfterWin(payload.new, 'both');
   }

   const winnerCounts = calculateScores(winners);
   updateDashboard(winnerCounts);

}

function updateScrollingText(newText, speed = 35) {

   speed = Math.ceil((35 / 137) * newText.length);
   const scrollingTextElement = document.getElementById('scrollingText');

   // Update the scrolling text
   scrollingTextElement.innerHTML = newText;

   // Adjust the animation speed dynamically
   scrollingTextElement.style.animationDuration = `${speed}s`;

   // Restart the animation to reflect the changes instantly
   scrollingTextElement.style.animation = 'none'; // Reset the animation
   void scrollingTextElement.offsetWidth; // Trigger a reflow
   scrollingTextElement.style.animation = `scrollText ${speed}s linear infinite`; // Reapply the animation
}

// helper function to remove the class category part from the game name for a cleaner string
function formatGameName(input) {
   // Split the string at the "|" symbol
   const parts = input.split('|');

   // If there's a "|" symbol, return the substring after it, trimmed
   return parts.length > 1 ? parts[1].trim() : input;
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
   // Check if the game is individual based on keywords
   const individualKeywords = ["race", "running", "jump", "karate", "skating"];
   if (individualKeywords.some(keyword => gameName.includes(keyword))) {
      return 'individual';
   } else {
      return 'team';
   }
}

function generateLiveWinHeadline() {
   const table = document.getElementById("winnersTable");
   const tableBody = table.querySelector("tbody");
   const rows = tableBody ? tableBody.querySelectorAll("tr") : [];

   if (rows.length === 0) {
      return; // Do nothing if the table is empty
   }

   // Get the last 2 rows or fewer if there are not enough rows
   const lastRows = Array.from(rows).slice(-2);

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
   return headlines.join(" ");
}

window.addEventListener('load', function () {
   pollEntireData();
   const subscription = subscribeToTable('winners', handleLiveUpdate);
});


