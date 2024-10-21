  async function loadUserProfile() {
    const userId = sessionStorage.getItem("usuarioId");
    const isAdmin = sessionStorage.getItem("isAdmin") === 'true';

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

        // Se o usuário for administrador, carrega a seção de admin
        if (isAdmin) {
          loadAdminSection();
        }
      } else {
        alert(user.message || "Erro ao carregar perfil do usuário");
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário", error);
      alert("Erro ao conectar com o servidor");
    }
  }

  // Função para carregar a seção de administração
  async function loadAdminSection() {
    try {
      const isAdmin = sessionStorage.getItem("isAdmin") === 'true';
      if (!isAdmin) return;

      const response = await fetch("http://localhost:3000/usuarios/admin/usuarios", {
        headers: {
          'isadmin': 'true' // Envia o header para indicar que é administrador
        }
      });
      const users = await response.json();

      if (response.ok) {
        const adminSection = document.createElement('div');
        adminSection.setAttribute('id', 'admin-section');
        adminSection.innerHTML = `
          <h2 class="admin-title"><strong>Administração:</strong></h2>
          <ul class="admin-list">
            ${users.map(user => `
              <li>
                <strong>Nome:</strong> ${user.nome}
                <br>
                <strong>Email:</strong> ${user.email}
                <br>
                <strong>Preferências:</strong> ${user.preferencias_leitura || 'N/A'}
                <br>
                <button class="delete-user-btn" data-user-id="${user.id}">Deletar</button>
              </li>
            `).join('')}
          </ul>
        `;

        document.querySelector('.profile-container').appendChild(adminSection);

        // Adicionar eventos aos botões de deletar
        document.querySelectorAll('.delete-user-btn').forEach(button => {
          button.addEventListener('click', async (event) => {
            const userIdToDelete = event.target.getAttribute('data-user-id');

            if (confirm('Tem certeza que deseja deletar este usuário?')) {
              try {
                const deleteResponse = await fetch(`http://localhost:3000/usuarios/admin/usuarios/${userIdToDelete}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'isadmin': 'true'
                  }
                });

                const result = await deleteResponse.json();

                if (deleteResponse.ok) {
                  alert(result.message);
                  // Recarrega a página após o usuário clicar em "OK" no alerta
                  window.location.reload();
                } else {
                  alert(result.message || 'Erro ao deletar usuário');
                }
              } catch (error) {
                console.error('Erro ao deletar usuário', error);
                alert('Erro ao deletar usuário');
              }
            }
          });
        });
      } else {
        alert(users.message || "Erro ao carregar informações de administração");
      }
    } catch (error) {
      console.error("Erro ao carregar informações de administração", error);
      alert("Erro ao carregar informações de administração");
    }
  }
  

  // Chama a função para carregar as informações do usuário
  window.onload = loadUserProfile;
  // Chama a função para carregar as preferências ao carregar a página
  window.onload = function() {
    loadUserProfile();
    loadUserPreferences();
};
