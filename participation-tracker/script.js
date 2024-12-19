const baseURL = "https://sourabhsuneja.github.io/quiz/";
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
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

// Attach an event listener to each checkbox on the page
checkboxes.forEach(checkbox => {
   checkbox.addEventListener('change', event => {
      saveSelection();
   });
});

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
   const classes = ['6A1', '6A2', '6A3', '6A4', '7A1', '7A2', '7A3', '8A1', '8A2', '8A3', '9A1', '9A2', '9A3', '10A1', '10A2', '11A3'];
   await Promise.all(classes.map(fetchNamesForClassSection));
   populateClassDropdown();
}

// Populate class dropdown
function populateClassDropdown() {
   Object.keys(studentNames).forEach(classKey => {
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
   const student = students[currentIndex];
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

   // scroll to the top
   scrollToTop();
}

// Save selections
function saveSelection() {
   const student = studentNames[currentClass][currentIndex];
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


// helper function to determine the class category
function getClassCategory(classsection, game) {
   const classNumber = parseInt(classsection.split('-')[0], 10);

   const gameName = game.toLowerCase();

   // Check if the game is individual based on keywords
   const individualKeywords = ["race", "running", "jump", "karate", "skating"];
   if (individualKeywords.some(keyword => gameName.includes(keyword))) {
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
   return "Unknown";
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
console.log(data);
        showProcessingDialog();
        const inserted = await insertData('participants', data);
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


fetchAllClasses();