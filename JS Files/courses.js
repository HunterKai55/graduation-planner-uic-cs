console.log("Courses.js is running!");

const searchContainer = document.querySelector('.search-bar');
const magnifier = document.querySelector('.magnifier');

const fileUrls = [
    "../data/non_engineering_required_courses.json",
    "../data/required_engineering_courses.json",
    "../data/technical_electives.json"
];

async function loadCourses() {
    try {
        //start all fetch requests to request the json files in fileUrls
        const fetchPromises = fileUrls.map(url => fetch(url));
        const responses = await Promise.all(fetchPromises);

        //make sure all of the responses are valid
        const jsonPromises = responses.map(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${response.url}: ${response.status}`);
            }
            //parses the text and returns a json array
            return response.json();
        });

        //wait for all data parsing to be complete
        const allData = await Promise.all(jsonPromises);

        //extract courses from data
        const allCourses = allData.flatMap(data => data.courses);

        //return all of the data in the form of an array
        return allCourses;

    } catch(err) {
        console.error('an error occured whil parsing data: ', err);
        return [];
    }
}

const data = await loadCourses();

magnifier.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
    console.log("Magnifier clicked!");
})

function setUpCourseGrid(courses) {
    //all ids are camelcase
    //gets the grid div from the html file
    const container = document.getElementById("courseGrid");

    console.log("Courses received:", courses);
    console.log("Grid container:", container);

    courses.forEach(course => {
        container.innerHTML += `
            <div class="panel-body" data-class='${JSON.stringify(course)}'>
                <h1>${course.course_code}</h1>
                <p>${course.course_title}</p>
            </div>
        `;
    });

    container.addEventListener('click', (event) => {
        let savedCourse = event.target.closest('.panel-body');

        //if it's not a div ignore it
        if (!savedCourse) return;
        let courseData = savedCourse.dataset.class;

        //save course data in the session storage
        sessionStorage.setItem("course", courseData);

        //switch over to the course description page
        window.location.href = "course_description.html";
    })
}

setUpCourseGrid(data);

