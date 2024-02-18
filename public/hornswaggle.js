const socket = io();

// Example function to add a new checkbox dynamically
function addCheckbox(id, checked = false) {
    const container = document.getElementById("checkboxContainer"); // Make sure you have this container in your HTML
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = checked;
    checkbox.onclick = () => toggleButton(id);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` Toggle ${id}`));
    container.appendChild(label);
}

function toggleButton(id) {
    const newState = document.getElementById(id).checked;
    socket.emit('toggle', { id, state: newState });
}

socket.on('toggle', (data) => {
    const { id, state } = data;
    const checkbox = document.getElementById(id);
    if (checkbox) {
        checkbox.checked = state;
    }
});

document.getElementById("createBtn").addEventListener("click", () => {
    const id = `checkbox-${Date.now()}`;
    addCheckbox(id);
    addLabelEditor(id);
    socket.emit('createCheckbox', { id, label: `Checkbox ${id}` });
});

// Function to add a checkbox
function addCheckbox(id, label = `Checkbox ${id}`) {
    const container = document.getElementById("checkboxContainer");
    const labelEl = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    labelEl.htmlFor = checkbox.id;
    labelEl.textContent = label;
    container.appendChild(labelEl);
    container.appendChild(checkbox);
}

// New function to handle label editor creation
function addLabelEditor(id, label = '') {
    const editorContainer = document.getElementById("labelEditorContainer");
    const inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group", "mb-3");
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
    button.onclick = () => updateLabel(id, input.value);
    
    inputGroup.appendChild(input);
    inputGroup.appendChild(button);
    editorContainer.appendChild(inputGroup);
}

// Update the label text
function updateLabel(id, newText) {
    const labelEl = document.querySelector(`label[for="${id}"]`);
    if (labelEl) {
        labelEl.textContent = newText;
    }
    // Emit an event to update the label across clients
    socket.emit('updateLabel', { id, label: newText });
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

// Handle the addition of new labels
document.getElementById('addNewLabelBtn').addEventListener('click', () => {
    const id = `checkbox-${Date.now()}`;
    addCheckbox(id);
    addLabelEditor(id);
    // Emit an event to create a new checkbox and label across clients
    socket.emit('createCheckbox', { id, label: `Checkbox ${id}` });
});

// Socket event listeners for label updates
socket.on('updateLabel', (data) => {
    updateLabel(data.id, data.label);
});
