const STORAGE_KEY = "uicPlan";

function loadPlan() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
        return {};
    }
}

const yearSelect = document.getElementById("year");

const yearParam = new URLSearchParams(window.location.search).get("year");
if (yearParam) yearSelect.value = yearParam;

function render() {
    const plan = loadPlan();
    const year = yearSelect.value;

    document.querySelectorAll(".seme").forEach(function (card) {
        const term = card.dataset.term;
        const courses = (plan[year] && plan[year][term]) || [];
        const list = card.querySelector(".course-list");
        list.innerHTML = "";

        if (courses.length === 0) {
            const li = document.createElement("li");
            li.className = "empty";
            li.textContent = "No Classes Listed";
            list.appendChild(li);
        } else {
            courses.forEach(function (c) {
                const li = document.createElement("li");
                li.textContent = c.code + " – " + c.title;
                list.appendChild(li);
            });
        }

        const total = courses.reduce(function (sum, c) { return sum + c.credits; }, 0);
        card.querySelector(".total span").textContent = total;
    });
}

document.querySelectorAll(".addBttn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const term = btn.closest(".seme").dataset.term;
        const year = yearSelect.value;
        window.location.href =
            "course_select.html?term=" + encodeURIComponent(term) +
            "&year=" + encodeURIComponent(year);
    });
});

yearSelect.addEventListener("change", render);
render();