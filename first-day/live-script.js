const popupBox = document.getElementById('popupBox');
const popupHeading = document.getElementById('popupHeading');
const popupMsg = document.getElementById('popupMsg');
const ribbons = document.getElementById('ribbons');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const downloadBtn = document.getElementById('downloadBtn');
const defaultHeadline = "Get ready for an action-packed celebration! Jamna Vidyapeeth proudly presents the Annual Sports Meet 2024 – The ultimate showdown begins!";
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

let winners;
async function pollEntireData() {

   winners = await selectData(
      tableName = 'winners_first_day',
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
      const heading = "🎉 " + getRandomCongratulatoryWord() + " 🎉";
      const popupContent = generateWinnersMessage(w.winner1, w.winner2, w.winner3, w.winnerhouse1, w.winnerhouse2, w.winnerhouse3, w.game);
      showPopup(heading, popupContent, true, 60000);
   }
}

// Function to generate cheering text for the pop-up
function generateWinnersMessage(winner1, winner2, winner3, winnerHouse1, winnerHouse2, winnerHouse3, game) {
   return `Cheers to ${winner1} for securing 1st place, ${winner2} for 2nd, and ${winner3} for 3rd in ${game}! <br>🏆 Well done, champions! 🏆`;
}

// Function to randomly pick a congratulatory word or phrase
function getRandomCongratulatoryWord() {
  const randomIndex = Math.floor(Math.random() * congratulatoryWords.length);
  return congratulatoryWords[randomIndex];
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


function addNewRow(winner) {
   const winnersTableBody = document.getElementById('winnersTableBody');

   const row = document.createElement('tr');
   row.id = 'row' + winner.row_id;
   row.innerHTML = `
             <td>${winner.game}</td>
             <td>${winner.winner1}</td>
             <td>${winner.winner2}</td>
             <td>${winner.winner3}</td>
           `;
   winnersTableBody.appendChild(row);
}

function updateExistingRow(winner) {

   const row = document.getElementById('row' + winner.row_id);

   row.innerHTML = `
             <td>${winner.game}</td>
             <td>${winner.winner1}</td>
             <td>${winner.winner2}</td>
             <td>${winner.winner3}</td>
           `;
}

function handleLiveUpdate(payload) {
   if (payload.eventType === 'INSERT') {
      addNewRow(payload.new);
      setHeadlineAndPopupAfterWin(payload.new, 'both');
   } else if (payload.eventType === 'UPDATE') {
      updateExistingRow(payload.new);
      setHeadlineAndPopupAfterWin(payload.new, 'headline');
   }

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

// helper function to capitalize first letter of each word
function capitalizeFirstLetter(string) {
   return string
      .toLowerCase() // Convert the entire string to lowercase
      .split(' ') // Split the string into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the array of words back into a single string
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
      const winner1 = row.cells[1].textContent.trim();
      const winner2 = row.cells[2].textContent.trim();
      const winner3 = row.cells[3].textContent.trim();

      return `<strong>${game}</strong> Results: ${winner1} clinches 1st, ${winner2} bags 2nd, ${winner3} secures 3rd position.`;
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

window.addEventListener('load', function () {
   pollEntireData();
   const subscription = subscribeToTable('winners_first_day', handleLiveUpdate);
   const subscription2 = subscribeToTable('notifications', handleNotifications);
});
