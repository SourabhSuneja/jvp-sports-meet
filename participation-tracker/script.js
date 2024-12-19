const studentNames = {
  '6-A1': ['Aryan', 'Abhay', 'Sushila'],
  '6-A2': ['Bhavna', 'Chhavi', 'Dikshant'],
  '6-A3': ['Avani', 'Bhavesh', 'Piyush', 'Tarun', 'Utkarsh'],
};

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

// Populate class dropdown
Object.keys(studentNames).forEach(classKey => {
  const option = document.createElement('option');
  option.value = classKey;
  option.textContent = classKey;
  classSelect.appendChild(option);
});

// Handle class selection
classSelect.addEventListener('change', () => {
  currentClass = classSelect.value;
  currentIndex = 0;
  if (!selection[currentClass]) selection[currentClass] = {};
  showStudent();
});

// Show student card
function showStudent() {
  if (!currentClass) return;
  const students = studentNames[currentClass];
  const student = students[currentIndex];
  studentName.textContent = student;

  const studentData = selection[currentClass][student] || { house: '', games: [] };
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
    selection[currentClass][student] = { house, games };
  } else {
    delete selection[currentClass][student];
  }
}

function moveToNextStudent() {
  saveSelection();
  currentIndex = (currentIndex + 1) % studentNames[currentClass].length;
  showStudent();
}

function moveToPrevStudent() {
  saveSelection();
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
  saveSelection();
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

    // Check if the game is individual based on keywords
    const individualKeywords = ["race", "running", "jump", "karate"];
    if (individualKeywords.some(keyword => game.toLowerCase().includes(keyword))) {
        return classNumber.toString();
    }

    // Determine team game category based on class number
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
            const { house, games } = students[participant];

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
  if(!areAllHousesSpecified(selection)) {
    await showDialog({
            title: 'Error',
            message: "Please select houses for all participating students. You haven't specified the house for some students.",
            type: 'alert'
    });
    return;
  }
  document.write(JSON.stringify(convertSelectionToArray(selection)));
}
