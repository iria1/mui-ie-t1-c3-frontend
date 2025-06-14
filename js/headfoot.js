function loadHTML(file, elementId) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading HTML:', error));
}

// Load the header and footer
loadHTML('/template/header.html', 'header');
loadHTML('/template/footer.html', 'footer');