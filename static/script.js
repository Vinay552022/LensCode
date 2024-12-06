// Handle image upload and preview
document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Create an image element for the uploaded file
            const imageElement = document.createElement("img");
            imageElement.src = e.target.result;
            imageElement.alt = "Uploaded Image";

            // Clear any previous preview and append the new image
            document.querySelector("#imagePreview").innerHTML = "";
            document.querySelector("#imagePreview").appendChild(imageElement);

            // Show the submit button after image upload
            document.getElementById("submitButton").classList.remove("hidden");
            document.getElementById("submitButton").classList.add("show");
        };
        reader.readAsDataURL(file);
    }
});

 document.addEventListener("DOMContentLoaded", function () {
            const form = document.getElementById('uploadForm');
            const codeOutput = document.getElementById('codeBlock');
            const progressBar = document.getElementById('progress-bar');
            const progressContainer = document.getElementById('progress-container');
            const submitButton = document.getElementById('submitButton');

            form.addEventListener('submit', (event) => {
                event.preventDefault();

                // Show the progress bar and reset its value
                progressContainer.style.display = 'block';
                progressBar.style.width = '0%';  // Reset progress to 0
                progressBar.textContent = '0%';  // Show 0% text initially

                const formData = new FormData(form);
                
                // Simulate progress by updating the progress bar value in intervals
                let progress = 0;
                const interval = setInterval(() => {
                    if (progress < 90) {
                        progress += 5;  // Increase the progress by 5
                        progressBar.style.width = `${progress}%`;
                        progressBar.textContent = `${progress}%`;  // Update text to match progress
                    }
                }, 100);  // Update the progress every 100ms

                // Send the request to generate the code
                fetch('/', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    // Wait for the progress bar to reach 90% before displaying the code
                    setTimeout(() => {
                        clearInterval(interval);  // Stop the progress simulation

                        // Hide the progress bar
                        progressContainer.style.display = 'none';

                        // Display the generated code
                        codeOutput.textContent = data.code;
                    }, 2000);  // Wait for 2 seconds after the request finishes
                })
                .catch(error => {
                    console.error('Error:', error);
                    clearInterval(interval);  // Stop the progress simulation on error
                    progressContainer.style.display = 'none';  // Hide the progress bar in case of error
                });
            });
        });


// Copy code to clipboard function
function copyCode() {
    const codeText = document.getElementById("codeBlock").innerText;
    navigator.clipboard.writeText(codeText).then(function() {
        // Change the button text to "Copied"
        const copyButton = document.getElementById("copyButton");
        copyButton.innerText = "Copied!";
        copyButton.style.backgroundColor = "#32cd32"; // Change the button color to a success green

        // Reset the button text back to "Copy" after a few seconds
        setTimeout(function() {
            copyButton.innerText = "Copy Code";
            copyButton.style.backgroundColor = "#32CD32"; // Reset to original color
        }, 2000); // Reset after 2 seconds
    }, function(err) {
        console.error('Error copying code: ', err);
    });
}

// Divider resizing functionality (left and right sections)
const divider = document.getElementById('divider');
const leftSection = document.querySelector('.left-section');
const rightSection = document.querySelector('.right-section');

let isDragging = false;
let startX = 0;
let initialLeftWidth = 0;

// Mouse down event for divider (start dragging)
divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    initialLeftWidth = leftSection.offsetWidth;  // Store the initial left section width
    document.body.style.cursor = 'ew-resize';  // Change cursor to resizing
});

// Mouse move event (during dragging)
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return; // Only proceed if dragging

    const moveX = e.clientX - startX;  // Calculate the distance moved

    // Calculate new widths with a limit on the left section's width to prevent negative or excessive resizing
    const newLeftWidth = Math.max(100, Math.min(initialLeftWidth + moveX, window.innerWidth - 100));  // Prevent left section from becoming too small or large

    leftSection.style.width = `${newLeftWidth}px`;
    rightSection.style.width = `calc(100% - ${newLeftWidth + divider.offsetWidth}px)`;  // Adjust the right section width
});

// Mouse up event to stop dragging
document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';  // Reset cursor back to default
    }
});

// File upload area click and drag & drop functionality
document.addEventListener("DOMContentLoaded", function () {
    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");
    const imagePreview = document.getElementById("imagePreview");

    // Handle click to open file dialog
    uploadArea.addEventListener("click", () => fileInput.click());

    // Handle drag over event (when file is dragged over the upload area)
    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = "#6a5acd";  // Change border color to indicate drag over
    });

    // Handle drag leave event (when file leaves the upload area)
    uploadArea.addEventListener("dragleave", () => {
        uploadArea.style.borderColor = "#ccc";  // Reset border color
    });

    // Handle drop event (when file is dropped into the upload area)
    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = "#ccc";  // Reset border color
        handleFileUpload(e.dataTransfer.files[0]);  // Handle the uploaded file
    });

    // Handle file input change (file selected from dialog)
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Function to handle the uploaded file (image preview)
    function handleFileUpload(file) {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;  // Show image preview
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file.");
        }
    }
});
