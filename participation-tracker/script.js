const baseURL = "https://sourabhsuneja.github.io/quiz/students/";
const studentNames = {};

let selection = {};
let currentClass = '';
let currentIndex = 0;

const classSelect = document.getElementById('classSelect');
const studentCard = document.getElementById('studentCard');
const studentName = document.getElementById('studentName');
const houseSelect = document.getElementById('houseSelect');
const gamesCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtnTop = document.getElementById('prevBtnTop');
const nextBtnTop = document.getElementById('nextBtnTop');
const submitBtn = document.getElementById('submitBtn');
const backupBtn = document.getElementById('backupBtn');
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

// Attach an event listener to each checkbox on the page
checkboxes.forEach(checkbox => {
   checkbox.addEventListener('change', event => {
      saveSelection();
      if(!event.target.checked) {
          // delete current student's participation in the selected game if the checkbox state changed from checked to unchecked
          const participant = capitalizeFirstLetter(studentNames[currentClass][currentIndex]);
          const game = event.target.value;
          const classsection = currentClass;
          const classcategory = getClassCategory(classsection, game)
          deleteParticipant(participant, game, classsection, classcategory, event.target);
      }
   });
});

async function deleteParticipant(participant, game, classsection, classcategory, checkbox) {
    const confirm = await showDialog ({
        title: 'Remove Participant',
        message: `Are you sure you want to remove ${participant} (${classsection}) from ${game}?`,
        type: 'confirm'
                         });
    if(confirm) {
        showProcessingDialog(false);
        const success = await deleteRow('participants', ['participant', 'game', 'classsection', 'classcategory'], [participant, game, classsection, classcategory]);
        if(success) {
            await showDialog({
         title: 'Success',
         message: "Participant removed successfully!",
         type: 'alert'
      });
        }
        else {
            await showDialog({
         title: 'Error',
         message: "Error deleting the participant!",
         type: 'alert'
      });
        }
        hideProcessingDialog();
    } else {
        checkbox.checked = true;
    }
}

async function fetchNamesForClassSection(classSection) {
   try {
      const response = await fetch(`${baseURL}${classSection}.txt`);
      if (!response.ok) throw new Error(`Failed to fetch ${classSection}`);
      const text = await response.text();

      // Process the text content, ignoring blank lines
      studentNames[classSection] = text.split('\n')
         .map(name => name.trim())
         .filter(name => name); // Filter out any empty lines
   } catch (error) {
      console.error(error);
   }
}

async function fetchAllClasses() {
   const classes = [
  '1-A1', '1-A2', '1-A3',
  '2-A1', '2-A2', '2-A3',
  '3-A1', '3-A2', '3-A3', '3-A4',
  '4-A1', '4-A2', '4-A3', '4-A4',
  '5-A1', '5-A2', '5-A3', '5-A4',
  '6-A1', '6-A2', '6-A3', '6-A4',
  '7-A1', '7-A2', '7-A3',
  '8-A1', '8-A2', '8-A3',
  '9-A1', '9-A2', '9-A3',
  '10-A1', '10-A2',
  '11-COM', '11-HUM', '11-SCI',
  '12-COM', '12-HUM', '12-SCI'
];

   await Promise.all(classes.map(fetchNamesForClassSection));
   populateClassDropdown(classes);
}

// Populate class dropdown
function populateClassDropdown(classes) {
   classes.forEach(classKey => {
      const option = document.createElement('option');
      option.value = classKey;
      option.textContent = classKey;
      classSelect.appendChild(option);
   });
}

// Handle class selection
classSelect.addEventListener('change', () => {
   currentClass = classSelect.value;
   currentIndex = 0;
   if (!selection[currentClass]) selection[currentClass] = {};
   showStudent();
});

// Handle house selection
houseSelect.addEventListener('change', () => {
   saveSelection();
});

// Show student card
function showStudent() {
   if (!currentClass) return;
   const students = studentNames[currentClass];
   const student = capitalizeFirstLetter(students[currentIndex]);
   studentName.textContent = student;
   const studentData = selection[currentClass][student] || {
      house: '',
      games: []
   };
   houseSelect.value = studentData.house || '';
   gamesCheckboxes.forEach(checkbox => {
      checkbox.checked = studentData.games.includes(checkbox.value);
   });

   studentCard.classList.remove('hidden');
   submitBtn.classList.remove('hidden');
backupBtn.classList.remove('hidden');

   // scroll to the top
   scrollToTop();
}

// Save selections
function saveSelection() {
   const student = capitalizeFirstLetter(studentNames[currentClass][currentIndex]);
   const house = houseSelect.value;
   const games = gamesCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

   if (house || games.length) {
      selection[currentClass][student] = {
         house,
         games
      };
   } else {
      delete selection[currentClass][student];
   }
}

function moveToNextStudent() {
   currentIndex = (currentIndex + 1) % studentNames[currentClass].length;
   showStudent();
}

function moveToPrevStudent() {
   currentIndex = (currentIndex - 1 + studentNames[currentClass].length) % studentNames[currentClass].length;
   showStudent();
}

// Navigate students
prevBtn.addEventListener('click', () => {
   moveToPrevStudent();
});

nextBtn.addEventListener('click', () => {
   moveToNextStudent();
});

prevBtnTop.addEventListener('click', () => {
   moveToPrevStudent();
});

nextBtnTop.addEventListener('click', () => {
   moveToNextStudent();
});

// Submit selections
submitBtn.addEventListener('click', () => {
   handleSubmission(selection);
});

function scrollToTop() {
   window.scrollTo({
      top: 0,
      behavior: 'smooth'
   });
}

//Validates if all students participating in games have their houses specified.
function areAllHousesSpecified(selection) {
   for (const className in selection) {
      const students = selection[className];

      for (const studentName in students) {
         const student = students[studentName];

         // Check if the student is participating in games but has no house specified
         if (student.games.length > 0 && student.house === "") {
            return false;
         }
      }
   }
   return true;
}

// helper function to capitalize first letter of each word
function capitalizeFirstLetter(string) {
   return string
               .toLowerCase() // Convert the entire string to lowercase
               .split(' ')    // Split the string into an array of words
               .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
               .join(' ');    // Join the array of words back into a single string
}

// helper function to determine game type (individual or team)
function getGameType(game) {
   const gameName = game.toLowerCase();
   // Check if the game is individual based on keywords
   const teamKeywords = ["kho kho", "kabaddi", "rollball", "basketball", "handball"];
   if (teamKeywords.some(keyword => gameName.includes(keyword))) {
      return 'team';
   } else {
      return 'individual';
   }
}

// helper function to determine the class category
function getClassCategory(classsection, game) {
   const classNumber = parseInt(classsection.split('-')[0], 10);
   const gameName = game.toLowerCase();
   
   // if game type is individual, return class number as class category
   if (getGameType(game) === 'individual') {
      return classNumber.toString();
   }

   // If class category is already appearing in the game name, use that category
   if (gameName.includes("1 to 2")) {
      return "1 to 2";
   } else if (gameName.includes("3 to 5")) {
      return "3 to 5";
   } else if (gameName.includes("6 to 8")) {
      return "6 to 8";
   } else if (gameName.includes("9 to 12")) {
      return "9 to 12";
   }

   // Determine team game category based on class number, if class category wasn't found in the game name
   if (classNumber >= 1 && classNumber <= 2) {
      return "1 to 2";
   } else if (classNumber >= 3 && classNumber <= 5) {
      return "3 to 5";
   } else if (classNumber >= 6 && classNumber <= 12) {
      return "6 to 12";
   }

   // Default category (if class number is out of bounds)
   return "NA";
}

// Converts the selection object into an array of participation data.
function convertSelectionToArray(selection) {
   const outputArray = [];

   for (const classsection in selection) {
      const students = selection[classsection];

      for (const participant in students) {
         const {
            house,
            games
         } = students[participant];

         if (games.length > 0) {
            games.forEach(game => {
               outputArray.push({
                  game,
                  participant,
                  classsection,
                  classcategory: getClassCategory(classsection, game),
                  house
               });
            });
         }
      }
   }

   return outputArray;
}

function convertArrayToSelection(participationArray) {
   const selection = {};

   participationArray.forEach(entry => {
      const { game, participant, classsection, house } = entry;

      // Initialize the class section if it doesn't exist
      if (!selection[classsection]) {
         selection[classsection] = {};
      }

      // Initialize the participant if they don't exist
      if (!selection[classsection][participant]) {
         selection[classsection][participant] = {
            house: house || "", // Default to empty string if house is not provided
            games: []
         };
      }

      // Add the game to the participant's games array
      selection[classsection][participant].games.push(game);
   });

   return selection;
}


async function handleSubmission(selection) {
   if (!areAllHousesSpecified(selection)) {
      await showDialog({
         title: 'Error',
         message: "Please select houses for all participating students. You haven't specified the house for some students.",
         type: 'alert'
      });
      return;
   }
   // send data to Supabase
   sendToDatabase(convertSelectionToArray(selection));
}

async function sendToDatabase(data) {
        showProcessingDialog();
        const inserted = await upsertData('participants', data, ["game", "classcategory", "participant", "classsection"]);
        hideProcessingDialog();
        if (inserted) {
         showDialog({
            title: 'Success',
            message: 'Participants updated successfully!',
            type: 'alert'
         });
      } else {
         showDialog({
            title: 'Error',
            message: 'Error inserting data!',
            type: 'alert'
         });
      }
}

// fetch classwise list of all students in school
fetchAllClasses();

window.onload = async function() {
  // check auth status
  const authSuccess = await window.checkAuth();
           if(authSuccess) {
               document.getElementById('sign-in-screen').style.display = 'none';
           }
  
  const participationArray = await selectData('participants');
  selection = convertArrayToSelection(participationArray);
}

// function to login user
         async function login() {
         const signInScreen = document.getElementById('sign-in-screen');
         const errorField = document.getElementById('error-message');
         const btn = document.getElementById('sign-in-btn');
         const username = document.getElementById('username').value.trim();
         const password = document.getElementById('password').value;
         
         const errorIcon = '<ion-icon name="alert-circle-outline" class="sign-in-error-icon"></ion-icon>';
         
         const email = (username + '@jvp.com').toLowerCase();
         
         btn.innerHTML = '<i class="fas white fa-spinner fa-spin"></i> Wait...';
         btn.disabled = true;
         errorField.innerHTML = '';
         
         if(username === '' || password === '') {
         errorField.innerHTML = errorIcon + '<span>Username and password are required.</span>';
         btn.disabled = false;
         btn.innerHTML = 'Sign In';
         return ;       
         }
         
         try {
         const data = await window.signInUser(email, password);
         window.userId = data.user.id;
         signInScreen.style.display = 'none';
         } catch (error) {
         errorField.innerHTML = errorIcon + '<span>' + error.message + '</span>';
         btn.disabled = false;
         btn.innerHTML = 'Sign In';
         }
         }
         
         // add event listener to sign in button
         document.getElementById('sign-in-btn').addEventListener('click', function(event) {
         event.preventDefault();
         login();
         });

// backup download
backupBtn.addEventListener('click', () => {
   downloadParticipantsAsJSON(convertSelectionToArray(selection));
});

function downloadParticipantsAsJSON(participants) {
    // Format current date and time
    const now = new Date();
    const formattedDate = now.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }).replace(/,/g, "").replace(/ /g, "-").replace(/:/g, "-");

    // File name with current date and time
    const fileName = `participants-backup-${formattedDate}.json`;

    // Convert participants array to JSON string
    const jsonString = JSON.stringify(participants, null, 4); // Pretty print with 4 spaces

    // Create a blob from the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
}

         // Add an event listener to the document for keydown events to allow easy switching between cards
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        nextBtn.click();
    } else if (event.key === 'ArrowLeft') {
        prevBtn.click();
    }
});

