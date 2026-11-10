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
const SEC_REQUIRED_HOURS = { 11: 55, 12: 12 };
const PASSING = ["A", "A-", "B+", "B", "B-", "C+", "C"];
 
const creditsTitle = document.getElementById("credits-title");
const progressFill = document.getElementById("progress-fill");
const toggles = document.querySelectorAll(".toggle");
 
toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
        toggle.parentNode.classList.toggle("active");
    });
});
 
loadCourses();
 
async function loadCourses() {
    const courses = new Map();
    const response = await fetch("../data/audit_classes.json");
    const data = await response.json();

    data.coursesTaken.forEach((raw) => {
        if (!isValidCourse(raw)) {
            console.warn("Skipped invalid course:", raw);
            return;
        }
        const course = normalize(raw);
        courses.set(courseKey(course), course);
    });
 
    const all = [...courses.values()];
    checkGenEds(all);
    checkEngr(all);
    checkTech(all);
    render(all);
    updateCredits(all);
    updateSectionCounts(all);
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
 
        counter.textContent = `${Number(earned.toFixed(2))} / ${required}`;
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
    counter.textContent = `${totalCount} / 9`;
}

function checkEngr(courses) {
    const passingCourses = courses.filter((c) => PASSING.includes(c.grade) && c.type === 11);
    const checkMark = document.getElementById("engrCheck");
    if (sumHours(passingCourses, 11, 55)) {
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
    notes.textContent = localStorage.getItem(`auditNote:${courseKey(c)}`) ? "View" : "Add";
    notes.addEventListener("click", () => {
        window.location.href = `audit_notes.html?course=${encodeURIComponent(courseKey(c))}`;
    });
 
    row.append(name, grade, hours, notes);
    return row;
}