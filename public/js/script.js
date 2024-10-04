const API_URL = "https://api.jikan.moe/v4/manga?q=";

// Função para buscar múltiplos mangás e exibir os 10 mais relevantes na página
async function fetchMangas(queries) {
  const mangaList = document.getElementById("manga-list");
  mangaList.innerHTML = ""; // Limpar a lista antes de adicionar novos itens

  const displayedMangas = new Set(); // Armazena IDs de mangás já exibidos

  // Loop através das consultas e fazer requisições para a API
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

// Função para truncar a sinopse até o final do primeiro parágrafo
function truncateSynopsis(synopsis) {
  if (!synopsis) {
    return "Descrição não disponível";
  }

  // Encontrar o primeiro ponto final após 100 caracteres
  const periodIndex = synopsis.indexOf(".", 100);

  if (periodIndex !== -1) {
    // Se encontrado, truncar até o primeiro ponto final encontrado
    return synopsis.substring(0, periodIndex + 1);
  } else {
    // Se não houver ponto final após 100 caracteres, retorna o texto original
    return synopsis;
  }
}

// Função para exibir os mangás
function displayManga(mangas) {
  const mangaList = document.getElementById("manga-list");

  mangas.forEach((manga) => {
    // Truncar a sinopse até o final do primeiro parágrafo
    const truncatedSynopsis = truncateSynopsis(manga.synopsis);

    const mangaCard = `
      <div class="col-md-4">
          <div class="card mb-4 shadow-sm">
              <img src="${manga.images.jpg.image_url}" class="card-img-top" alt="${manga.title}">
              <div class="card-body">
                  <h5 class="card-title">${manga.title}</h5>
                  <p class="card-text">${truncatedSynopsis}</p>
                  <button class="btn btn-primary">Alugar</button>
              </div>
          </div>
      </div>
    `;
    mangaList.innerHTML += mangaCard;
  });
}

// Buscar múltiplos mangás ao carregar a página, sem repetir mangás
fetchMangas(["Naruto", "Dragon Ball", "Jujutsu"]); // Exemplo: busca por vários mangás
