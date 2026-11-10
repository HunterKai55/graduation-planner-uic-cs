const params = new URLSearchParams(window.location.search);
const course = params.get("course");
 
const title = document.getElementById("notes-title");
const box = document.getElementById("notes-box");
const backBtn = document.getElementById("back-btn");
const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const statusLabel = document.getElementById("notes-status");
 
const noteKey = `auditNote:${course}`;
let savedText = "";
let statusTimer;
 
if (course) {
    title.textContent = `Notes For: ${course}`;
    savedText = localStorage.getItem(noteKey) || "";
    box.value = savedText;
} else {
    title.textContent = "No course selected";
    box.disabled = true;
    saveBtn.disabled = true;
    deleteBtn.disabled = true;
}
 
saveBtn.addEventListener("click", () => {
    if (box.value.trim()) {
        savedText = box.value;
        localStorage.setItem(noteKey, savedText);
    } else {
        savedText = "";
        box.value = "";
        localStorage.removeItem(noteKey);
    }
    showStatus("Saved");
});
 
deleteBtn.addEventListener("click", () => {
    if (!savedText && !box.value) {
        showStatus("No notes to delete");
        return;
    }
    if (!confirm(`Delete all notes for ${course}? This can't be undone.`)) {
        return;
    }
    savedText = "";
    box.value = "";
    localStorage.removeItem(noteKey);
    showStatus("Notes deleted");
});
 
backBtn.addEventListener("click", () => {
    if (box.value !== savedText && !confirm("You have unsaved changes. Leave without saving?")) {
        return;
    }
    window.location.href = "degree_audit.html";
});
 
function showStatus(text) {
    statusLabel.textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
        statusLabel.textContent = "";
    }, 2000);
}