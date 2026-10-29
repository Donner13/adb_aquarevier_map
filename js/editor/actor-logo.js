document.addEventListener('DOMContentLoaded', () => {
    const logoInput = document.getElementById('contact-logo');
    if (!logoInput) return;

    const uploadContainer = document.createElement('div');
    uploadContainer.style.marginTop = '4px';
    uploadContainer.style.display = 'flex';
    uploadContainer.style.alignItems = 'center';
    uploadContainer.style.gap = '8px';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'contact-logo-upload';
    fileInput.accept = 'image/png, image/jpeg, image/svg+xml, image/webp';
    fileInput.style.display = 'none';

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.textContent = '📁 Datei hochladen';
    uploadBtn.className = 'filter-btn';
    uploadBtn.style.padding = '4px 8px';
    uploadBtn.style.fontSize = '10px';
    uploadBtn.style.cursor = 'pointer';

    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            logoInput.value = event.target.result;
            // Dispatch input and change events to ensure the framework/editor notices the change
            logoInput.dispatchEvent(new Event('input', { bubbles: true }));
            logoInput.dispatchEvent(new Event('change', { bubbles: true }));
        };
        reader.readAsDataURL(file);
    });

    uploadContainer.appendChild(uploadBtn);
    uploadContainer.appendChild(fileInput);

    logoInput.parentNode.insertBefore(uploadContainer, logoInput.nextSibling);
});
