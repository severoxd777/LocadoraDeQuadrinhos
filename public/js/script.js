const API_URL = "https://api.jikan.moe/v4/manga?q=";

// Função para analisar as preferências do usuário, considerando aspas duplas
function parsePreferences(preferences) {
  const regex = /"([^"]+)"|[^,]+/g;
  const matches = [];
  let match;

  while ((match = regex.exec(preferences)) !== null) {
    if (match[1]) {
      // Se corresponder a algo entre aspas
      matches.push(match[1].trim());
    } else {
      // Se corresponder a palavras fora das aspas
      matches.push(match[0].trim());
    }
  }

  return matches;
}

// Função para buscar múltiplos mangás e exibir os 10 mais relevantes na página
async function fetchMangas(queries) {
  const mangaList = document.getElementById("manga-list");
  mangaList.innerHTML = ""; // Limpar a lista antes de adicionar novos itens

  const displayedMangas = new Set(); // Armazena IDs de mangás já exibidos

  for (const query of queries) {
    try {
      const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);
      const data = await response.json();

      // Limitar os resultados aos 10 primeiros mais relevantes
      const topResults = data.data.slice(0, 10);

      // Filtrar os resultados para não exibir mangás repetidos
      const uniqueMangas = topResults.filter((manga) => {
        if (!displayedMangas.has(manga.mal_id)) {
          displayedMangas.add(manga.mal_id); // Adiciona o ID ao Set
          return true;
        }
        return false;
      });

      displayManga(uniqueMangas); // Exibir os mangás únicos na página
    } catch (error) {
      console.error(`Erro ao buscar mangá ${query}:`, error);
    }
  }
}

// Função para truncar a sinopse até o tamanho máximo de 200 caracteres ou até o ponto final de uma frase
function truncateSynopsis(synopsis) {
  if (!synopsis) {
    return "Descrição não disponível";
  }

  const maxLength = 150; // Definir o limite de caracteres

  // Se o tamanho da sinopse for menor que o limite, não truncar
  if (synopsis.length <= maxLength) {
    return synopsis;
  }

  // Tentar encontrar um ponto final próximo ao limite
  const periodIndex = synopsis.indexOf(".", maxLength);
  if (periodIndex !== -1 && periodIndex <= maxLength + 50) {
    return synopsis.substring(0, periodIndex + 1);
  }

  // Se não houver ponto final, truncar no limite e adicionar "..."
  return synopsis.substring(0, maxLength) + "...";
}

// Função para exibir os mangás
function displayManga(mangas) {
  const mangaList = document.getElementById("manga-list");
  const userId = sessionStorage.getItem('usuarioId'); // Obtém o ID do usuário logado

  mangas.forEach((manga, index) => {
    const truncatedSynopsis = truncateSynopsis(manga.synopsis);

    const mangaCard = document.createElement('div');
    mangaCard.classList.add('manga-card', 'col-md-4', 'card');

    // Determinar a posição inicial dos cartões
    if (index % 3 === 0) {
      mangaCard.classList.add('left');
    } else if (index % 3 === 1) {
      mangaCard.classList.add('center');
    } else {
      mangaCard.classList.add('right');
    }

    mangaCard.innerHTML = `
      <div class="card mb-4 shadow-sm">
        <img src="${manga.images.jpg.image_url}" class="card-img-top" alt="${manga.title}">
        <div class="card-body">
          <h5 class="card-title">${manga.title}</h5>
          <p class="card-text">${truncatedSynopsis}</p>
          <button class="btn btn-primary add-manga-btn" data-manga-id="${manga.mal_id}">Adicionar</button>
        </div>
      </div>
    `;

    mangaList.appendChild(mangaCard);

    // Adicionar listener ao botão "Adicionar"
    const addButton = mangaCard.querySelector('.add-manga-btn');
    addButton.addEventListener('click', () => {
      addMangaToCart(manga.mal_id);
    });

    // Usar IntersectionObserver para ativar a animação quando o card entrar no viewport
    observeMangaCard(mangaCard);
  });
}

function addMangaToCart(mangaId) {
  const userId = sessionStorage.getItem('usuarioId');
  if (!userId) {
    alert('Você precisa estar logado para adicionar um mangá ao carrinho.');
    return;
  }

  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  if (!cart.includes(mangaId)) {
    cart.push(mangaId);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    alert('Mangá adicionado ao carrinho!');
  } else {
    alert('Mangá já está no carrinho.');
  }
}

// Função para ativar a animação quando o mangá entra no viewport
function observeMangaCard(card) {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show'); // Adicionar a classe de animação
        observer.unobserve(entry.target); // Para de observar após a animação ocorrer
      }
    });
  }, {
    threshold: 0.08 // Card precisa estar 8% visível para ativar a animação
  });

  observer.observe(card);
}

// Buscar múltiplos mangás ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
  const userId = sessionStorage.getItem('usuarioId');
  let queries = ["Naruto", "Dragon Ball", "Jujutsu"]; // Consultas padrão

  if (userId) {
    try {
      // Buscar as preferências do usuário no backend
      const response = await fetch(`http://localhost:3000/usuarios/perfil/${userId}`);
      const user = await response.json();

      if (response.ok && user.preferencias_leitura) {
        // Se o usuário tiver preferências, utiliza-las como consultas
        queries = parsePreferences(user.preferencias_leitura);
      }
    } catch (error) {
      console.error('Erro ao obter preferências do usuário:', error);
    }
  }

  // Buscar mangás usando as consultas determinadas
  fetchMangas(queries);
});