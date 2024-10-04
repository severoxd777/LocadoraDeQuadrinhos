// Array com os caminhos das 5 imagens
const images = [
    './img/kaiju-n8.jpg',
    './img/jujutsu-kaisen.jpg',
    './img/atack-on-titans.jpg',
    './img/naruto.jpg',
    './img/solo-leveling.jpg'
];

// Função para selecionar uma imagem aleatória
function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

// Alterar a imagem de perfil ao carregar a página
window.onload = function() {
    const profilePicture = document.getElementById('profile-picture');
    profilePicture.src = getRandomImage();  // Define a imagem aleatória
};
