import {
  removeArrayElements,
  dynamicDirection,
  getElementByTextContent,
  generateArabicNumberDuplicates,
  generateCpuKeywords,
} from "./utile.js";

// Constants and Configuration
const DOM_ELEMENTS = {
  tagInput: document.getElementById("tagInput"),
  searchTagInput: document.getElementById("searchTagInput"),
  copyButton: document.getElementById("copyButton"),
  clearButton: document.getElementById("clearButton"),
  notificationSound: document.getElementById("notificationSound"),
  tagsList: document.getElementById("tagsList"),
  alertContainer: document.getElementById("alertContainer"),
  keywordsCounter: document.getElementById("keywords-counter"),
  showingKeywordsCounter: document.getElementById("showing-keywords-counter"),
};

const KEYBOARD_SHORTCUTS = {
  copy: ["c", "C", "ؤ"],
  clear: ["x", "X", "ء"],
  undo: ["z", "Z", "ئ"],
};

// Data Initialization
const brandsData = [];
const categoriesData = [];
let tags = [];
let tempTags = [];

// Initial Setup
initializeApp();

// Main Functions
function initializeApp() {
  setupEventListeners();
  displaySearchInput();
  renderEmptyState();
}

function setupEventListeners() {
  // Tag Input Events
  DOM_ELEMENTS.tagInput.addEventListener("keyup", handleTagInputKeyUp);
  DOM_ELEMENTS.tagInput.addEventListener("paste", handleTagInputPaste);
  DOM_ELEMENTS.tagInput.addEventListener("input", dynamicDirection);
  DOM_ELEMENTS.tagInput.addEventListener("focusout", dynamicDirection);

  // Search Input Events
  DOM_ELEMENTS.searchTagInput.addEventListener("keyup", handleSearchInputKeyUp);

  // Button Events
  DOM_ELEMENTS.copyButton.addEventListener("click", copyToClipboard);
  DOM_ELEMENTS.clearButton.addEventListener("click", clearTags);

  // Global Events
  document.addEventListener("keydown", handleGlobalKeyDown);
  document.addEventListener("click", handleGlobalClick);
}

// Event Handlers
function handleTagInputKeyUp(event) {
  if (event.key === "Enter") {
    addTag();
    dynamicDirection(event);
  } else {
    event.target.value = event.target.value.toLowerCase();
  }
}

function handleTagInputPaste(event) {
  event.target.value = event.target.value.toLowerCase();
}

function handleSearchInputKeyUp(event) {
  event.preventDefault();
  // event.target.value = event.target.value.toLowerCase();

  const searchValue = event.target.value.trim().toLowerCase();
  const filteredTags = tags.filter((tag) => tag.includes(searchValue));

  if (filteredTags.length === 0) {
    renderEmptyState("No keywords found");
    keywordStatus(tags, filteredTags);
    return;
  }

  renderTags(filteredTags);
  keywordStatus(tags, filteredTags);
}

function handleGlobalKeyDown(event) {
  if (!event.ctrlKey) return;

  if (KEYBOARD_SHORTCUTS.copy.includes(event.key)) {
    copyToClipboard();
    event.preventDefault();
  } else if (KEYBOARD_SHORTCUTS.clear.includes(event.key)) {
    clearTags();
    event.preventDefault();
  } else if (KEYBOARD_SHORTCUTS.undo.includes(event.key)) {
    undoClear();
    event.preventDefault();
  }
}

function handleGlobalClick(event) {
  if (event.target.closest("#unClear")) {
    undoClear();
  } else if (event.target.classList.contains("remove-tag")) {
    removeTag(event.target.dataset.index);
  } else if (event.target.classList.contains("edit-tag")) {
    editTag(event.target.dataset.index);
  }
}

function handleCommaSeparatedInput(event) {
  const searchValue = DOM_ELEMENTS.searchTagInput.value.trim();
  let data = event.target.value.split(/,|،/).filter((tag) => tag.trim());

  if (searchValue) {
    data = data.filter((tag) => tag.includes(searchValue));
  }

  addCollectionOfTags(data.join(","));
  event.target.value = "";
  dynamicDirection(event);
}

// Tag Management
function addTag() {
  const searchValue = DOM_ELEMENTS.searchTagInput.value.trim().toLowerCase();
  const tagName = sterilizeText(DOM_ELEMENTS.tagInput.value.trim());
  const cpuKeywords = generateCpuKeywords(tagName);

  if (!tagName) {
    showAlert("Field cannot be blank!⚠️", "danger");
    return;
  }

  if (tags.includes(tagName)) {
    showAlert("Keyword already exists!", "warning");
    return;
  }

  if (checkBrand(tagName)) {
    showAlert("Keyword already Exist in brand keywords!", "warning");
    return;
  }

  if (checkCategory(tagName)) {
    showAlert("Keyword already Exist in Category keywords!", "warning");
    return;
  }

  tags.push(...cpuKeywords);
  DOM_ELEMENTS.tagInput.value = "";
  sortTags();

  // Render based on current search filter
  if (searchValue) {
    const filteredTags = tags.filter((tag) => tag.includes(searchValue));
    renderTags(filteredTags);
  } else {
    renderTags();
  }

  showAlert("Keyword added successfully!✅", "success");
}

function addCollectionOfTags(data) {
  const updatedArray = data
    .split(/,|،/)
    .map((tag) => sterilizeText(tag.trim()));

  console.log(updatedArray);
  const updatedArrayWithArabicDuplicates =
    generateArabicNumberDuplicates(updatedArray);

  const results = processTags(updatedArrayWithArabicDuplicates);

  if (results.addedTags > 0) {
    sortTags();
    renderTags();
    showSuccessResults(results);
  } else {
    showWarningResults(results);
  }
}

function processTags(tagArray) {
  const results = {
    addedTags: 0,
    duplicateTags: [],
    brandTags: [],
    categoryTags: [],
  };

  tagArray.forEach((tag) => {
    if (!tag) return;

    if (tags.includes(tag)) {
      results.duplicateTags.push(tag);
      return;
    }

    if (checkBrand(tag)) {
      results.brandTags.push(tag);
      return;
    }

    if (checkCategory(tag)) {
      results.categoryTags.push(tag);
      return;
    }

    tags.push(tag);
    results.addedTags++;
  });

  return results;
}

function removeTag(index, searchValue = null) {
  if (searchValue === null) {
    searchValue = DOM_ELEMENTS.searchTagInput.value.trim().toLowerCase();
  }

  // Get actual index in full tags array
  const filteredTags = searchValue
    ? tags.filter((tag) => tag.includes(searchValue))
    : tags;

  const actualIndex = tags.indexOf(filteredTags[index]);
  const removedTag = tags[actualIndex];

  tags.splice(actualIndex, 1);

  // Re-render based on current search
  if (searchValue) {
    const newFilteredTags = tags.filter((tag) => tag.includes(searchValue));
    renderTags(newFilteredTags);
  } else {
    renderTags();
  }

  showAlert(`Keyword removed: ${removedTag} 🗑️`, "danger");
}

function editTag(index) {
  const searchValue = DOM_ELEMENTS.searchTagInput.value.trim().toLowerCase();

  if (DOM_ELEMENTS.tagInput.value !== "") {
    addTag();
    return;
  }

  // Get the actual tag from filtered results
  const filteredTags = searchValue
    ? tags.filter((tag) => tag.includes(searchValue))
    : tags;

  DOM_ELEMENTS.tagInput.value = filteredTags[index];
  removeTag(index, searchValue);
}

function clearTags() {
  if (tags.length === 0) return;

  tempTags = [...tags];
  tags = [];
  DOM_ELEMENTS.tagInput.value = "";
  renderTags();
  showAlert("Keywords cleared successfully!✅", "danger", true);
  updateButtonText(DOM_ELEMENTS.clearButton, "Cleared!");
}

function undoClear() {
  if (tempTags.length === 0) return;

  tags = [...tempTags];
  tempTags = [];
  renderTags();
  showAlert("Keywords restored successfully!✅", "success");
}

// Rendering Functions
function renderTags(tagsToRender = tags) {
  if (tagsToRender.length === 0) {
    renderEmptyState();
    return;
  }

  DOM_ELEMENTS.tagsList.style.cssText =
    "display: flex; place-items: unset; height: unset;";
  DOM_ELEMENTS.tagsList.innerHTML = "";

  tagsToRender.sort((a, b) => a.length - b.length);

  tagsToRender.forEach((tag, index) => {
    const tagElement = createTagElement(tag, index);
    DOM_ELEMENTS.tagsList.appendChild(tagElement);
  });

  keywordStatus(tags, tagsToRender);
  displaySearchInput();

  // Maintain search input value
  const searchValue = DOM_ELEMENTS.searchTagInput.value.trim();
  if (searchValue) {
    DOM_ELEMENTS.searchTagInput.value = searchValue;
  }
}

function renderEmptyState(message = "No keywords added") {
  DOM_ELEMENTS.tagsList.innerHTML = `
    <p class="text-secondary opacity-75 small text-center">${message}</p>
  `;
  DOM_ELEMENTS.tagsList.style.cssText =
    "display: grid; place-items: center; height: 400px;";
  keywordStatus(tags);
  displaySearchInput();
}

function createTagElement(tag, index) {
  const tagElement = document.createElement("span");
  tagElement.className = "tag";
  tagElement.innerHTML = `
    <button data-index="${index}" class="edit-tag" dir="auto">${tag}</button>
    <button data-index="${index}" class="remove-tag">&times;</button>
  `;
  return tagElement;
}

// Helper Functions
function displaySearchInput() {
  DOM_ELEMENTS.searchTagInput.style.display =
    tags.length === 0 ? "none" : "block";
}

function sortTags() {
  tags.sort((a, b) => a.length - b.length);
}

function checkBrand(tagName) {
  return brandsData.includes(tagName);
}

function checkCategory(tagName) {
  return categoriesData.includes(tagName);
}

function sterilizeText(text) {
  return text
    .replace(/[^\S\n]+/g, " ")
    .replace(/[-_,.:"';`~!@#$%^&*()\[\]{}|\\\/?<>=؛ـ٠<>–]/g, " ")
    .trim();
}

function copyToClipboard() {
  if (tags.length === 0) return;

  // Always copy ALL tags regardless of current filter
  navigator.clipboard.writeText(tags.join(","));
  showAlert("All keywords copied to clipboard successfully!✅", "success");
  updateButtonText(DOM_ELEMENTS.copyButton, "Copied!");

  // Maintain the current filtered view
  const searchValue = DOM_ELEMENTS.searchTagInput.value.trim().toLowerCase();
  if (searchValue) {
    const filteredTags = tags.filter((tag) => tag.includes(searchValue));
    renderTags(filteredTags);
  }
}

function keywordStatus(allTags, filteredTags = allTags) {
  DOM_ELEMENTS.keywordsCounter.textContent = allTags.length;
  DOM_ELEMENTS.showingKeywordsCounter.textContent = filteredTags.length;
}

function updateButtonText(button, text) {
  button.innerHTML = text;
  setTimeout(() => {
    button.innerHTML = button === DOM_ELEMENTS.copyButton ? "Copy" : "Clear";
  }, 2000);
}

// Alert System
function showAlert(message, type, showUndo = false) {
  const alert = createAlertElement(message, type, showUndo);
  DOM_ELEMENTS.alertContainer.appendChild(alert);

  if (type === "warning" || type === "danger") {
    DOM_ELEMENTS.notificationSound.play();
  }

  setupAlertTimeout(alert, showUndo ? 5 : 2.5);
}

function createAlertElement(message, type, showUndo) {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-relative`;

  alert.innerHTML = `
    <div style="display: flex; align-items: center;">
      <strong>${message}</strong>
      ${showUndo ? createUndoButton() : ""}
    </div>
  `;

  return alert;
}

function createUndoButton() {
  return `
    <span id="progressContainer" style="margin-right:10px">5</span>
    <button class="btn btn-sm btn-outline-secondary mt-2 undo-btn" style="margin-top: 0 !important" id="unClear">
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343">
          <path d="M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z"/>
        </svg>
      </span>
      <span>Undo</span>
    </button>
  `;
}

function setupAlertTimeout(alert, seconds) {
  const progressContainer = alert.querySelector("#progressContainer");

  if (progressContainer) {
    let time = seconds;
    const intervalId = setInterval(() => {
      time--;
      progressContainer.textContent = time;
      if (time <= 0) {
        progressContainer.textContent = "0";
        clearInterval(intervalId);
      }
    }, 1000);
  }

  setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 500);
  }, seconds * 1000);
}

// Results Display
function showSuccessResults(results) {
  showAlert(`${results.addedTags} keywords added successfully!✅`, "success");

  if (results.duplicateTags.length > 0) {
    showAlert(`${results.duplicateTags.length} Keyword deleted!`, "warning");
    highlightDuplicateTags(results.duplicateTags);
  }
}

function showWarningResults(results) {
  showAlert(`${results.addedTags} keywords added!`, "warning");

  const totalWarnings =
    results.duplicateTags.length +
    results.brandTags.length +
    results.categoryTags.length;

  if (totalWarnings > 0) {
    showAlert(`${totalWarnings} Keyword deleted!`, "warning");
    highlightDuplicateTags([
      ...results.duplicateTags,
      ...results.brandTags,
      ...results.categoryTags,
    ]);
  }
}

function highlightDuplicateTags(duplicateTags) {
  duplicateTags.forEach((tag) => {
    const element = getElementByTextContent(tag);
    if (element) {
      const parentElement = element.parentElement;
      parentElement.classList.add("highlight-effect");
      setTimeout(() => {
        parentElement.classList.remove("highlight-effect");
        parentElement.classList.add("bg-reset");
      }, 2000);
    }
  });
}
