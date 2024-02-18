const socket = io();

// Handle initialization of checkboxes with their states and labels
socket.on('initCheckboxes', (checkboxes) => {
    Object.keys(checkboxes).forEach(id => {
        const { checked, label } = checkboxes[id];
        addCheckbox(id, checked, label); // Ensure addCheckbox can handle the label parameter
        // Optionally, handle label editor creation here if necessary
    });
});

// Handle creation of a new checkbox
socket.on('createCheckbox', (data) => {
    const { id, label } = data;
    addCheckbox(id, false, label); // Assuming the new checkbox is not checked by default
});

// Socket event listeners for label updates
socket.on('updateLabel', (data) => {
    updateLabel(data.id, data.label);
});

// Handle checkbox toggle state
socket.on('toggleCheckbox', (data) => {
    const checkbox = document.getElementById(data.id);
    if (data.state) {
        checkbox.checked = "checked";
    }else{
        checkbox.checked = "";
    }
});

// Handle checkbox deletion
socket.on('deleteCheckbox', (id) => {
    console.log("caught deleteCheckbox");
    
    const checkboxElement = document.getElementById(id);
    if (checkboxElement && checkboxElement.parentNode) {
        checkboxElement.parentNode.remove(); // This removes the label and the checkbox
    }
});



/*** DOM manipulation functions to add page elements ***/

// Function to add a checkbox
function addCheckbox(id, checked = false, label = '') {
    const container = document.getElementById("checkboxContainer");
    if (!document.getElementById(id)) { // Prevent duplicate IDs
        const labelElement = document.createElement("label");
        labelElement.setAttribute("for", id);
        labelElement.textContent = label; // Set the checkbox label text

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;
        checkbox.checked = checked;
        checkbox.addEventListener("click", () => toggleButton(id)); // Toggle event

        // Append the new elements to the container
        container.appendChild(labelElement);
        container.appendChild(checkbox);
    }
}


// New function to handle label editor creation
function addLabelEditor(id, label = '') {
    const editorContainer = document.getElementById("labelEditorContainer");
    const inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group", "mb-3");

    // Create the 'X' button for removing the input
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add("btn", "btn-outline-danger", "me-2"); // 'me-2' adds margin to the right
    removeButton.textContent = "X"; // Text content 'X' for the button
    // Define the onclick event for the remove button
    removeButton.onclick = function() {
        inputGroup.remove(); // Removes the entire input group from the DOM
        socket.emit('removeCheckbox', {"id": id});
    };

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("form-control");
    input.placeholder = "Label text";
    input.value = label;
    input.dataset.checkboxId = id; // Link input to its checkbox
    const button = document.createElement("button");
    button.classList.add("btn", "btn-outline-secondary");
    button.type = "button";
    button.textContent = "Update";
    button.onclick = () => saveLabel(id, input.value);

    inputGroup.appendChild(removeButton);
    
    inputGroup.appendChild(input);
    inputGroup.appendChild(button);
    editorContainer.appendChild(inputGroup);
}

/*** Handlers that emit socket events. ***/

// Event handler added to checkboxes when they are created
function toggleButton(id) {
    const newState = document.getElementById(id).checked;
    socket.emit('toggleCheckbox', { id, state: newState });
}

// Handle the addition of new labels
document.getElementById('addNewLabelBtn').addEventListener('click', () => {
    const id = `checkbox-${Date.now()}`;
    addCheckbox(id, false, "");
    addLabelEditor(id);
    // Emit an event to create a new checkbox and label across clients
    socket.emit('createCheckbox', { id, label: "" });
});

function saveLabel(id, newText) {
    updateLabel(id, newText);
    // Emit an event to update the label across clients
    socket.emit('updateLabel', { id, label: newText });
}

// Update the label text
function updateLabel(id, newText) {
    const labelEl = document.querySelector(`label[for="${id}"]`);
    if (labelEl) {
        labelEl.textContent = newText;
    }
}

// Listen for offcanvas opening to populate it with label editors
document.addEventListener('click', function (e) {
    if (e.target.matches('[data-bs-toggle="offcanvas"]')) {
        // Populate the offcanvas with label editors
        const labels = document.querySelectorAll('#checkboxContainer label');
        document.getElementById('labelEditorContainer').innerHTML = ''; // Clear previous editors
        labels.forEach(label => {
            const id = label.getAttribute('for');
            const labelText = label.textContent;
            addLabelEditor(id, labelText);
        });
    }
});