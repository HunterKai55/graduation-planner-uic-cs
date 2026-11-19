/*
    Type Values:                                    |   Sub type values for 11:
    1  = English                                    |   0  = Probability
    2  = Math                                       |   1  = 100 lvl
    3  = Science                                    |   2  = 200 lvl
    4  = Analyzing the Natural World                |   3  = 300 lvl
    5  = Understanding the past                     |   4  = 400 lvl
    6  = Exploring World Cultures                   |   5  = Orientation
    7  = Understanding the Individual and Society   |   6  = Prof. Seminar
    8  = Understanding U.S Society                  |   7  = Other
    9  = Understanding the Creative Arts            |   99 = Not type 11
    10 = Other Free Electives                       |   
    11 = Computer Science - Required                |
    12 = Computer Science - Tech Elective           |
*/
const VALID_TYPES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const VALID_SUBTYPES = [0, 1, 2, 3, 4, 5, 6, 7, 99];
const SEC_REQUIRED_HOURS = { 11: 48, 12: 12 };
const PASSING = ["A", "B", "C", "S"];

// For chem 122 and 124, additional checks are required, done in the function.
const SCIENCECOURSES = [
    "BIOS 110",
    "BIOS 120",
    "PHYS 141",
    "PHYS 142",
    "EAES 101",
    "EAES 111",
    "CHEM 122",
    "CHEM 124",
];

const ADDED_KEY = "auditAddedCourses";
const REMOVED_KEY = "auditRemovedCourses";
let jsonCourses = [];

function readList(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}
 
const creditsTitle = document.getElementById("credits-title");
const progressFill = document.getElementById("progress-fill");
const toggles = document.querySelectorAll(".toggle");
 
toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
        toggle.parentNode.classList.toggle("active");
    });
});
 
loadCourses();

const addDialog = document.getElementById("add-dialog");
const addForm = document.getElementById("add-form");
const addCategory = document.getElementById("add-category");
const addSubtypeLabel = document.getElementById("add-subtype-label");
const addError = document.getElementById("add-error");

document.getElementById("add-button").addEventListener("click", () => {
  addForm.reset();
  addSubtypeLabel.hidden = true;
  addError.textContent = "";
  addDialog.showModal();
});

document.getElementById("add-cancel").addEventListener("click", () => addDialog.close());

addCategory.addEventListener("change", () => {
  addSubtypeLabel.hidden = addCategory.value !== "11";
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(addForm);
  const type = Number(data.get("category"));

  const raw = {
    type: type,
    subtype: type === 11 ? Number(data.get("subtype")) : 99,
    courseField: data.get("field").trim().toUpperCase(),
    courseNum: data.get("num").trim(),
    courseName: data.get("name").trim(),
    grade: data.get("grade"),
    hours: Number(data.get("hours"))
  };

  if (!isValidCourse(raw)) {
    addError.textContent = "Please check the course details.";
    return;
  }

  const key = courseKey(raw);
  const added = readList(ADDED_KEY).filter((c) => courseKey(c) !== key);
  added.push(raw);
  writeList(ADDED_KEY, added);

  addDialog.close();
  refresh();
});

function removeCourse(key) {
  writeList(ADDED_KEY, readList(ADDED_KEY).filter((c) => courseKey(c) !== key));

  const removed = readList(REMOVED_KEY);
  if (!removed.includes(key)) {
    removed.push(key);
    writeList(REMOVED_KEY, removed);
  }

  localStorage.removeItem("auditNote:" + key);
  refresh();
}
 
async function loadCourses() {
    //const response = await fetch("data/audit_classes.json");
    //const data = await response.json();
    //jsonCourses = data.coursesTaken;
    refresh();
}

function refresh() {
    const removed = readList(REMOVED_KEY);
    const byKey = new Map();
    jsonCourses.map(normalize).filter((c) => !removed.includes(courseKey(c))).forEach((c) => byKey.set(courseKey(c), c));
    readList(ADDED_KEY).map(normalize).forEach((c) => byKey.set(courseKey(c), c));
    const courses = [...byKey.values()];

    checkGenEds(courses);
    checkEngr(courses);
    checkTech(courses);
    render(courses);
    updateCredits(courses);
    updateSectionCounts(courses);
}
 
function updateCredits(courses) {
    const total = courses.reduce((sum, c) => sum + c.hours, 0);
    const percent = Math.min((total / 128) * 100, 100);
 
    creditsTitle.textContent = `${Number(total.toFixed(2))}/${128} Credits`;
    progressFill.style.width = `${percent}%`;
}
 
function updateSectionCounts(courses) {
    Object.entries(SEC_REQUIRED_HOURS).forEach(([type, required]) => {
        const counter = document.getElementById(`count-${type}`);
        if (!counter) return;
 
        const earned = courses
            .filter((c) => c.type === Number(type))
            .reduce((sum, c) => sum + c.hours, 0);
 
        counter.textContent = `${Number(earned.toFixed(2))} / ${required} Hours`;
    });
}
 
function isValidCourse(c) {
    return (
        c &&
        VALID_TYPES.includes(c.type) &&
        VALID_SUBTYPES.includes(c.subtype) &&
        c.courseField != null &&
        c.courseNum != null &&
        typeof c.courseName === "string" &&
        typeof c.grade === "string" &&
        Number.isFinite(c.hours)
    );
}
 
function normalize(c) {
    const grade = c.grade.trim().toUpperCase();
    return {
        type: c.type,
        subtype: c.subtype,
        courseField: String(c.courseField).trim().toUpperCase(),
        courseNum: String(c.courseNum).trim(),
        courseName: c.courseName.trim(),
        grade: grade,
        hours: PASSING.includes(grade) ? c.hours : 0
    };
}
 
function courseKey(c) {
    return `${c.courseField} ${c.courseNum}`;
}
 
function render(courses) {
    document.querySelectorAll(".course-section[data-type]").forEach((section) => {
        const type = Number(section.dataset.type);
        const subtype = section.dataset.subtype === undefined ? null : Number(section.dataset.subtype);
 
        section.querySelectorAll(".course-row:not(.course-head), .empty-note").forEach((el) => el.remove());
 
        const matching = courses
            .filter((c) => c.type === type && (subtype === null || c.subtype === subtype))
            .sort((a, b) => courseKey(a).localeCompare(courseKey(b), undefined, { numeric: true }));
 
        matching.forEach((c) => section.appendChild(buildRow(c)));
 
        if (matching.length === 0) {
            section.appendChild(buildEmptyNote());
        }
    });
}

function checkGenEds(courses) {
    const passingCourses = courses.filter((c) => PASSING.includes(c.grade) && c.type != 11 && c.type != 12);
    let totalCount = 0;

    if (checkForSpecific(passingCourses, ["ENGL 160", "ENGL 161"])) {
        totalCount++;
    }

    if (checkForSpecific(passingCourses, ["MATH 180", "MATH 181", "MATH 210"]) && sumHours(passingCourses, 2, 20)) {
        totalCount++;
    }

    if(checkForScience(passingCourses)) {
        totalCount++;
    }

    [4, 5, 6, 7, 8, 9].forEach((n) => {
        if (sumHours(passingCourses, n, 3)) { totalCount++; }
    });

    const checkMark = document.getElementById("genCheck");
    if (totalCount < 9) {
       checkMark.style.visibility = 'hidden';
    }
    else {
        checkMark.style.visibility = 'visible';
    }
    const counter = document.getElementById("gencount");
    counter.textContent = `${totalCount} / 9 Sections`;
}

function checkEngr(courses) {
    const passingCourses = courses.filter((c) => PASSING.includes(c.grade) && c.type === 11);
    const keys = passingCourses.map(courseKey);
    let engrCount = 0;

    if (keys.includes("ENGR 100") || keys.includes("ENGR 101")) { engrCount++; }
    if (keys.includes("CS 111") || keys.includes("CS 112") || keys.includes("CS 113")) { engrCount++ }
    if (keys.includes("CS 141")) { engrCount++; }
    if (keys.includes("CS 151")) { engrCount++; }
    if (keys.includes("CS 211")) { engrCount++; }
    if (keys.includes("CS 251")) { engrCount++; }
    if (keys.includes("CS 261")) { engrCount++; }
    if (keys.includes("CS 277")) { engrCount++; }
    if (keys.includes("CS 301")) { engrCount++; }
    if (keys.includes("CS 341")) { engrCount++; }
    if (keys.includes("CS 342")) { engrCount++; }
    if (keys.includes("CS 361")) { engrCount++; }
    if (keys.includes("CS 362")) { engrCount++; }
    if (keys.includes("CS 377")) { engrCount++; }
    if (keys.includes("CS 401")) { engrCount++; }
    if (keys.includes("CS 499")) { engrCount++; }
    if (keys.includes("IE 342") || keys.includes("STAT 381")) { engrCount++; }

    const checkMark = document.getElementById("engrCheck");
    if (sumHours(passingCourses, 11, 48) && engrCount >= 17) {
        checkMark.style.visibility = 'visible';
    }
    else {
        checkMark.style.visibility = 'hidden';
    }
}

function checkTech(courses) {
    const passingCourses = courses.filter((c) => PASSING.includes(c.grade) && c.type === 12);
    const checkMark = document.getElementById("techCheck");
    if (sumHours(passingCourses, 12, 12)) {
        checkMark.style.visibility = 'visible';
    }
    else {
        checkMark.style.visibility = 'hidden';
    }
}

function checkForSpecific(courses, reqClasses) {
    return reqClasses.every((r) => courses.some((c) => courseKey(c) === r));
}

function sumHours(courses, type, req) {
    const filtered = courses.filter((c) => c.type === type);
    return (filtered.reduce((sum, c) => sum + c.hours, 0) >= req);
}

function checkForScience(courses) {
    const keys = courses.filter((c) => c.type === 3).map(courseKey);
    if (keys.length < 2) { return false; }

    let scienceCount = 0;
    let chemOneFlag = false;
    let chemTwoFlag = false;

    keys.forEach((key) => {
        if (key === "CHEM 122") { chemOneFlag = true; }
        else if (key === "CHEM 124") { chemTwoFlag = true; }
        else if (SCIENCECOURSES.includes(key)) { scienceCount++; }
    });

    if (scienceCount >= 2) { return true; }

    if (chemOneFlag && (keys.includes("CHEM 123") || keys.includes("CHEM 116"))) {
        scienceCount++;
    }
    if (chemTwoFlag && (keys.includes("CHEM 125") || keys.includes("CHEM 118"))) {
        scienceCount++;
    }

    return scienceCount >= 2;
}

function buildEmptyNote() {
    const note = document.createElement("p");
    note.className = "empty-note";
    note.textContent = "No classes taken yet.";
    return note;
}
 
function buildRow(c) {
    const row = document.createElement("div");
    row.className = "course-row";
 
    const name = document.createElement("span");
    name.className = "course-name";
    name.textContent = `${courseKey(c)} - ${c.courseName}`;
 
    const grade = document.createElement("span");
    grade.textContent = c.grade;
 
    const hours = document.createElement("span");
    if (!PASSING.includes(c.grade)) {
        grade.style.color = 'red';
        name.style.color = 'red';
        hours.style.color = 'red';
    }
    hours.textContent = c.hours.toFixed(2);
 
    const notes = document.createElement("button");
    notes.className = "note-btn";
    notes.textContent = localStorage.getItem(`auditNote:${courseKey(c)}`) ? "View Notes" : "Add Notes";
    notes.addEventListener("click", () => {
        window.location.href = `audit_notes.html?course=${encodeURIComponent(courseKey(c))}`;
    });
 
    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.textContent = "Remove Course";
    remove.addEventListener("click", () => {
        if (confirm(`Remove ${courseKey(c)} from your audit?`)) {
            removeCourse(courseKey(c));
        }
    });
 
    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.append(notes, remove);
 
    row.append(name, grade, hours, actions);
    return row;
}