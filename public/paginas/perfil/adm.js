    // Função para definir um valor no Session Storage
    function setSessionValue(key, value) {
        sessionStorage.setItem(key, value);
    }

    // Função para obter um valor do Session Storage
    function getSessionValue(key) {
        return sessionStorage.getItem(key);
    }

    async function checkAdmin() {
        const isAdmin = getSessionValue('isAdmin');  // Buscar o valor do session storage 'isAdmin'
        
        if (isAdmin === 'true') {
          try {
            const response = await fetch("http://localhost:3000/usuarios/admin/usuarios");
            const users = await response.json();
      
            if (response.ok) {
              const adminSection = document.createElement('div');
              adminSection.setAttribute('id', 'admin-section');
              adminSection.innerHTML = `
                <h2 class="admin-title"><strong>Administração:</strong></h2>
                <ul class="admin-list">
                  ${users.map(user => `
                    <li>
                      <strong>Nome:</strong> ${user.nome} | 
                      <strong>Email:</strong> ${user.email} | 
                      <strong>Preferências:</strong> ${user.preferencias_leitura || 'N/A'}
                    </li>
                  `).join('')}
                </ul>
              `;
              
              document.querySelector('.profile-container').appendChild(adminSection);
            } else {
              console.error("Erro ao carregar informações de administração");
            }
          } catch (error) {
            console.error("Erro ao carregar informações de administração", error);
          }
        } else {
          console.log("Usuário não é administrador.");
        }
      }
      
      // Chama a função para verificar se o usuário é admin ao carregar a página
      checkAdmin();
      