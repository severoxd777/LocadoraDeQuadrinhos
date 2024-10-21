// Função para carregar as preferências do usuário
async function loadUserPreferences() {
    const userId = sessionStorage.getItem("usuarioId");

    try {
        const response = await fetch(`http://localhost:3000/usuarios/perfil/${userId}`);
        const user = await response.json();

        if (response.ok) {
            // Carrega as preferências no textarea
            document.getElementById("preferences-input").value = user.preferencias_leitura || "";
        } else {
            alert(user.message || "Erro ao carregar preferências do usuário");
        }
    } catch (error) {
        console.error("Erro ao carregar preferências do usuário", error);
        alert("Erro ao conectar com o servidor");
    }
}

// Função para salvar as preferências do usuário
async function saveUserPreferences() {
    const userId = sessionStorage.getItem("usuarioId");
    const preferencias = document.getElementById("preferences-input").value;

    try {
        const response = await fetch(`http://localhost:3000/usuarios/perfil/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ preferencias_leitura: preferencias })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Preferências atualizadas com sucesso!");
            // Atualiza o campo de preferências exibido
            document.getElementById("user-preferences").textContent = preferencias;
        } else {
            alert(result.message || "Erro ao atualizar preferências");
        }
    } catch (error) {
        console.error("Erro ao atualizar preferências", error);
        alert("Erro ao conectar com o servidor");
    }
}

// Adiciona evento ao botão de salvar preferências
document.getElementById("save-preferences-btn").addEventListener('click', saveUserPreferences);


async function loadUserProfile() {
    const userId = sessionStorage.getItem("usuarioId");
    
    if (!userId) {
      alert("Usuário não está logado");
      window.location.href = "/login";
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/usuarios/perfil/${userId}`);
      const user = await response.json();
  
      if (response.ok) {
        document.getElementById("user-name").textContent = user.nome;
        document.getElementById("user-email").textContent = user.email;
        document.getElementById("profile-picture").src = user.foto_perfil || getRandomImage();
        document.getElementById("user-preferences").textContent = user.preferencias_leitura || "Não especificado";
        return Promise.resolve(); // Indica que o carregamento foi bem-sucedido
      } else {
        alert(user.message || "Erro ao carregar perfil do usuário");
        return Promise.reject();
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário", error);
      alert("Erro ao conectar com o servidor");
      return Promise.reject();
    }
  }
  
  // Chama a função para carregar as informações do usuário
  window.onload = function() {
    loadUserProfile()
      .then(() => {
        // Carrega outros scripts que dependem das informações do usuário
      })
      .catch(() => {
        // Lida com erros
      });
  };
  


document.addEventListener('DOMContentLoaded', () => {
const userId = sessionStorage.getItem('usuarioId');
if (!userId) {
    alert('Você precisa estar logado para ver esta página.');
    window.location.href = '/login';
    return;
}

// Buscar informações do usuário
fetch(`/usuarios/perfil/${userId}`)
    .then(response => response.json())
    .then(data => {
    const userInfoDiv = document.getElementById('user-info');
    userInfoDiv.innerHTML = `
        <p><strong>Nome:</strong> ${data.nome}</p>
        <p><strong>Email:</strong> ${data.email}</p>
    `;
    })
    .catch(error => {
    console.error('Erro ao obter informações do usuário:', error);
    alert('Erro ao obter informações do usuário');
    });

// Buscar os mangás do usuário
fetch(`/usuarios/${userId}/mangas`)
    .then(response => response.json())
    .then(data => {
    const mangaIds = data.mangaIds;
    if (mangaIds.length === 0) {
        document.getElementById('user-mangas').innerHTML = '<p>Você ainda não adicionou nenhum mangá.</p>';
        return;
    }

// Para cada mangaId, buscar detalhes na API e exibir
mangaIds.forEach(mangaId => {
    fetch(`https://api.jikan.moe/v4/manga/${mangaId}`)
    .then(response => response.json())
    .then(data => {
        const manga = data.data;
        displayManga(manga);
    })
    .catch(error => {
        console.error('Erro ao obter detalhes do mangá:', error);
    });
});
})
.catch(error => {
console.error('Erro ao obter mangás do usuário:', error);
alert('Erro ao obter mangás do usuário');
});

function displayManga(manga) {
    const userMangasDiv = document.getElementById('user-mangas');
    const mangaCard = document.createElement('div');
    mangaCard.classList.add('col-md-4', 'card');
    
    const truncatedSynopsis = truncateSynopsis(manga.synopsis);
    
    mangaCard.innerHTML = `
        <div class="card mb-4 shadow-sm" style="padding: 2%; display: flex; flex-direction: row; align-items: center; text-align: center; border: 2px solid gold; border-radius: 15px; margin-bottom: 5%;">
        <img src="${manga.images.jpg.image_url}" class="card-img-top" alt="${manga.title}">
        <div class="card-body" style="margin-left: 5%;">
            <h5 class="card-title">${manga.title}</h5>
            <p class="card-text">${truncatedSynopsis}</p>
            <button class="btn btn-danger delete-manga-btn" data-manga-id="${manga.mal_id}">Remover</button>
        </div>
        </div>
    `;
    
    userMangasDiv.appendChild(mangaCard);
    
    const deleteButton = mangaCard.querySelector('.delete-manga-btn');
    deleteButton.addEventListener('click', () => {
        deleteMangaFromUser(manga.mal_id, mangaCard);
    });
    }  
      
function truncateSynopsis(synopsis) {
    if (!synopsis) {
    return "Descrição não disponível";
    }

    const maxLength = 150; // Definir o limite de caracteres

    if (synopsis.length <= maxLength) {
    return synopsis;
    }

    const periodIndex = synopsis.indexOf(".", maxLength);
    if (periodIndex !== -1 && periodIndex <= maxLength + 50) {
    return synopsis.substring(0, periodIndex + 1);
    }

    return synopsis.substring(0, maxLength) + "...";
}
});

// Função para deletar o mangá do usuário
async function deleteMangaFromUser(mangaId, mangaCard) {
    const userId = sessionStorage.getItem('usuarioId');
    if (!userId) {
      alert('Você precisa estar logado para deletar um mangá.');
      window.location.href = '/login';
      return;
    }
  
    if (confirm('Tem certeza que deseja remover este mangá do seu perfil?')) {
      try {
        const response = await fetch(`/usuarios/${userId}/mangas/${mangaId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert('Mangá removido com sucesso!');
          // Remove o cartão do mangá da interface
          mangaCard.remove();
        } else {
          alert(data.message || 'Erro ao remover mangá');
        }
      } catch (error) {
        console.error('Erro ao remover mangá:', error);
        alert('Erro ao remover mangá');
      }
    }
  }