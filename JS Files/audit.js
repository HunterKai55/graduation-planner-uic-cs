/*
    0  = English
    1  = Math
    3  = Science
    4  = Analyzing the Natural World
    5  = Understanding the past
    6  = Exploring World Cultures
    7  = Understanding the Individual and Society
    8  = Understanding U.S Society
    9  = Understanding the Creative Arts
    10 = Other Free Electives
    11 = Computer Science - Required
    12 = Computer Science - Tech Elective
*/
const VALID_TYPES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const REQUIRED_HOURS = { 11: 55, 12: 12 };
 
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
 
    try {
        const response = await fetch("../data/audit_classes.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
 
        const data = await response.json();
        if (!data || !Array.isArray(data.coursesTaken)) {
            throw new Error('missing a "coursesTaken" list');
        }
 
        data.coursesTaken.forEach((raw) => {
            if (!isValidCourse(raw)) {
                console.warn("Skipped invalid course:", raw);
                return;
            }
            const course = normalize(raw);
            courses.set(courseKey(course), course);
        });
    } catch (err) {
        console.error(`Could not load ${"../data/audit_classes.json"}:`, err);
    }
 
    const all = [...courses.values()];
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
    Object.entries(REQUIRED_HOURS).forEach(([type, required]) => {
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
        c.courseField != null &&
        c.courseNum != null &&
        typeof c.courseName === "string" &&
        typeof c.grade === "string" &&
        Number.isFinite(c.hours)
    );
}
 
function normalize(c) {
    return {
        type: c.type,
        courseField: String(c.courseField).trim().toUpperCase(),
        courseNum: String(c.courseNum).trim(),
        courseName: c.courseName.trim(),
        grade: c.grade.trim().toUpperCase(),
        hours: c.hours
    };
}
 
function courseKey(c) {
    return `${c.courseField} ${c.courseNum}`;
}
 
function render(courses) {
    VALID_TYPES.forEach((type) => {
        const section = document.querySelector(`.course-section[data-type="${type}"]`);
        if (!section) return;
 
        section.querySelectorAll(".course-row:not(.course-head), .empty-note").forEach((el) => el.remove());
 
        courses
            .filter((c) => c.type === type)
            .sort((a, b) => courseKey(a).localeCompare(courseKey(b), undefined, { numeric: true }))
            .forEach((c) => section.appendChild(buildRow(c)));
 
        if (!courses.some((c) => c.type === type)) {
            section.appendChild(buildEmptyNote());
        }
    });
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
    hours.textContent = c.hours.toFixed(2);
 
    const notes = document.createElement("button");
    notes.className = "note-btn";
    notes.textContent = "Add";
 
    row.append(name, grade, hours, notes);
    return row;
}