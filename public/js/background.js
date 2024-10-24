// background.js

// Lista de URLs das imagens de fundo
const imagens = [
    'https://wallpaperaccess.com/full/6313.jpg',
    'https://wallpaperaccess.com/full/6315.jpg',
    'https://wallpaperaccess.com/full/6316.jpg',
    'https://wallpaperaccess.com/full/6317.jpg',
    'https://wallpaperaccess.com/full/6320.jpg',
    'https://wallpaperaccess.com/full/6321.jpg',
    'https://wallpaperaccess.com/full/6332.jpg',
    'https://wallpaperaccess.com/full/6335.jpg',
    'https://wallpaperaccess.com/full/6342.jpg',
    'https://wallpaperaccess.com/full/6343.jpg',
    'https://wallpaperaccess.com/full/6356.png',
    'https://wallpaperaccess.com/full/9376353.jpg',
    'https://wallpaperaccess.com/full/5392069.jpg',
    'https://wallpaperaccess.com/full/7920709.jpg',
    'https://wallpaperaccess.com/full/9376367.jpg',
    'https://wallpaperaccess.com/full/9289917.jpg',
    'https://wallpaperaccess.com/full/9197235.png',
    'https://wallpaperaccess.com/full/9376411.jpg',
    'https://wallpaperaccess.com/full/9376413.jpg',
    'https://wallpaperaccess.com/full/5036672.jpg',
    'https://wallpaperaccess.com/full/8739017.jpg',
  ];
  
  // Seleciona uma imagem aleatoriamente
  const imagemAleatoria = imagens[Math.floor(Math.random() * imagens.length)];
  
  // Aplica a imagem selecionada como fundo da página
  document.documentElement.style.background = `url('${imagemAleatoria}') no-repeat center center fixed`;
  document.documentElement.style.backgroundSize = 'cover';
  