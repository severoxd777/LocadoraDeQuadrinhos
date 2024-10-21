// Array com os caminhos das 5 imagens
const images = [
    '/paginas/perfil/img/kaiju-n8.jpg',
    '/paginas/perfil/img/jujutsu-kaisen.jpg',
    '/paginas/perfil/img/atack-on-titans.jpg',
    '/paginas/perfil/img/naruto.jpg',
    '/paginas/perfil/img/solo-leveling.jpg'
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
