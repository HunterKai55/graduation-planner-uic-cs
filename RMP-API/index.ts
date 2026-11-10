
import { RateMyProfessor } from "rate-my-professor-api-ts";

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: any, res: any) => {
    res.send("Rate My Professor API is running!");
});

app.get("/professor", async (req: any, res: any) => {

    try {
        // Get search information from the website
        const fname = req.query.fname;
        const lname = req.query.lname;
        const university = req.query.university;

        if (!fname || !lname || !university) {
            return res.status(400).json({
                error: "Please provide all search fields."
            });
        }

        // Combine first and last name
        const professorName = `${fname} ${lname}`;

        // Create RMP instance
        const rmp = new RateMyProfessor(
            university,
            professorName
        );

        // Retrieve professor information
        const professorInfo = await rmp.get_professor_info();

        // Retrieve professor comments
        const professorComments = await rmp.get_comments_by_professor();

        // Check the actual professor information
        console.log(professorInfo);

        // Send results to website
        res.json({
            professor: professorInfo,
            comments: professorComments
        });

    } catch (error) {
        console.error("Error:", error);

        res.status(500).json({
            error: "Unable to retrieve professor information."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
