function fillInCourseInformation(){
    //get course information from session storage
    var course = JSON.parse(sessionStorage.getItem("course"));

    var courseName = document.getElementById("courseName");
    courseName.textContent = `${course.course_code} \n${course.course_title}`;

    var creditHours = document.getElementById("creditHours");
    creditHours.textContent = `${course.credit_hours}`;

    var courseDescription = document.getElementById("courseDescription");
    courseDescription.textContent = `${course.description} \n${course.course_information}`;

}

fillInCourseInformation();


function professorSearch() {

    $("#searchProfessor").click(function (e) {
        e.preventDefault();

        // Get professor search info
        const fname = $("#fnameText").val().trim();
        const lname = $("#lnameText").val().trim();

        // Check if user filled out the form
        if (!fname || !lname) {
            alert("Please enter the professor's first and last name.");
            return;
        }

        // Send request to the backend
        $.ajax({
            url: "http://localhost:3000/professor",
            method: "GET",

            data: {
                fname: fname,
                lname: lname,
                university: "University of Illinois Chicago"
            },

            success: function (result) {

                console.log(result.comments);
                console.log($("#professorComments").length);


                //display overall rating
                $("#overallRating").text(
                    result.professor.avgRating + "/5"
                );

                //display would take again percentage
                $("#takeAgain").text(
                    String(Math.round(result.professor.wouldTakeAgainPercent)) + "%"
                );

                //display average difficulty
                $("#averageDifficulty").text(result.professor.avgDifficulty + "/5");

                // Display comments
                const comments = $("#professorComments");

                comments.find(".review-card").remove();

                result.comments.forEach(function (review) {

                    const card = $("<div>").addClass("review-card");

                    $("<h3>")
                        .text(review.class)
                        .appendTo(card);

                    $("<p>")
                        .text(review.comment)
                        .appendTo(card);

                    $("<p>")
                        .text("Date: " + review.date_posted)
                        .appendTo(card);

                    comments.append(card);
                });
            },

            error: function (xhr) {
                console.error(xhr.responseText);
                alert("Unable to retrieve professor information.");
            }
        });

    });

}

professorSearch();