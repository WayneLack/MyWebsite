function openModal(file) {

    fetch(file)

        .then(response => response.text())

        .then(text => {

            document.getElementById("modal-text").textContent = text;

            document.getElementById("modal").style.display = "block";

        });

}

 

function closeModal() {

    document.getElementById("modal").style.display = "none";

}
