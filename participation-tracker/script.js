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

function handleSubmission(selection) {
  console.log('Submission:', selection);
}
