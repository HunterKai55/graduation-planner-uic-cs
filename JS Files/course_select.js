
const STORAGE_KEY = "uicPlan";

const CATALOG = {
    genEd: [
        { code: "ENGL 161", title: "Academic Writing I", credits: 3 },
        { code: "PSCH 100", title: "Introduction to Psychology", credits: 4 },
        { code: "HIST 100", title: "Western Civilization to 1650", credits: 3 }
    ],
    engineering: [
        { code: "CS 301", title: "Machines and Automation", credits: 3 },
        { code: "CS 251", title: "Data Structures", credits: 4 }
    ]
};

const params = new URLSearchParams(window.location.search);
const term = params.get("term") || "Spring";
const year = params.get("year") || "2026";

function loadPlan() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
        return {};
    }
}

const plan = loadPlan();
let selected = ((plan[year] && plan[year][term]) || []).slice();

// Courses already planned in any OTHER term shouldn't be suggested again
const plannedElsewhere = new Set();
Object.keys(plan).forEach(function (y) {
    Object.keys(plan[y]).forEach(function (t) {
        if (y === year && t === term) return;
        plan[y][t].forEach(function (c) { plannedElsewhere.add(c.code); });
    });
});

const selectedList = document.getElementById("selected-list");
const searchInput = document.getElementById("search");
document.getElementById("heading").textContent = term + " " + year;

function isSelected(code) {
    return selected.some(function (c) { return c.code === code; });
}

function renderSelected() {
    selectedList.innerHTML = "";
    selected.forEach(function (c) {
        const li = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = c.code;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove";
        remove.setAttribute("aria-label", "Remove " + c.code);
        remove.textContent = "×";
        remove.addEventListener("click", function () {
            selected = selected.filter(function (s) { return s.code !== c.code; });
            renderAll();
        });
        li.append(label, remove);
        selectedList.appendChild(li);
    });
}

function renderSuggestions(listEl, courses) {
    const query = searchInput.value.trim().toLowerCase();
    listEl.innerHTML = "";

    const available = courses.filter(function (c) {
        if (isSelected(c.code) || plannedElsewhere.has(c.code)) return false;
        return !query || (c.code + " " + c.title).toLowerCase().includes(query);
    });

    if (available.length === 0) {
        const li = document.createElement("li");
        li.className = "none";
        li.textContent = "No Recommendations Possible";
        listEl.appendChild(li);
        return;
    }

    available.forEach(function (c) {
        const li = document.createElement("li");

        const info = document.createElement("div");
        const code = document.createElement("strong");
        code.textContent = c.code;
        const title = document.createElement("small");
        title.textContent = c.title;
        info.append(code, title);

        const add = document.createElement("button");
        add.type = "button";
        add.className = "btn add";
        add.textContent = "Add Course";
        add.addEventListener("click", function () {
            selected.push(c);
            renderAll();
        });

        li.append(info, add);
        listEl.appendChild(li);
    });
}

function renderAll() {
    renderSelected();
    renderSuggestions(document.getElementById("gened-list"), CATALOG.genEd);
    renderSuggestions(document.getElementById("eng-list"), CATALOG.engineering);
}

document.getElementById("search-btn").addEventListener("click", function () {
    searchInput.hidden = !searchInput.hidden;
    if (!searchInput.hidden) searchInput.focus();
    else { searchInput.value = ""; renderAll(); }
});
searchInput.addEventListener("input", renderAll);

// Save Selection -> store for this term/year, then back to Spring / Summer / Fall
document.getElementById("save-btn").addEventListener("click", function () {
    const latest = loadPlan();
    if (!latest[year]) latest[year] = {};
    latest[year][term] = selected;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(latest));
    window.location.href = "planner.html?year=" + encodeURIComponent(year);
});

renderAll();