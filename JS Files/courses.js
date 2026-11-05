const searchContainer = document.querySelector('.search-bar')
const magnifier = document.querySelector('.magnifier')

const fileUrls = [
    "../data/non_engineering_required_courses.json",
    "../data/required_engineering_courses.json",
    "../data/technical_electived.json"
];

async function loadCourses() {
    try {
        //start all fetch requests
        const fetchPromises = fileUrls.map(url => fetch(url));
        const responses = await Promise.all(fetchPromises);

        //make sure all of the responses are valid
        const jsonPromises = responses.map(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch ${response.url}: ${response.status}');
            }
            return response.json();
        });

        //wait for all data parsing to be complete
        const allData = await Promise.all(jsonPromises);

        //return all of the data in the form of an array
        return allData

    } catch(err) {
        console.error('an error occured whil parsing data: ', err);
    }
}

loadCourses()

magnifier.addEventListener('click', () => {
    searchContainer.classList.toggle('active')
    console.log("Magnifier clicked!");
})
