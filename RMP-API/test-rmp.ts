import { RateMyProfessor } from "rate-my-professor-api-ts";

async function main() {
    try {
        const rmp = new RateMyProfessor(
            "University of Illinois Chicago",
            "Shavila Devi"
        );

        // Retrieve professor summary
        const professorInfo = await rmp.get_professor_info();

        console.log("PROFESSOR INFORMATION:");
        console.log(professorInfo);

        // Retrieve student comments
        const professorComments = await rmp.get_comments_by_professor();

        console.log("PROFESSOR COMMENTS:");
        console.log(professorComments);

    } catch (error) {
        console.error("Error retrieving professor information:", error);
    }
}

main();