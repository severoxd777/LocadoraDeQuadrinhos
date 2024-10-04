    // Função para definir um valor no Session Storage
    function setSessionValue(key, value) {
        sessionStorage.setItem(key, value);
    }

    // Função para obter um valor do Session Storage
    function getSessionValue(key) {
        return sessionStorage.getItem(key);
    }

    // Função para verificar se o usuário é administrador e criar o elemento de admin
    function checkAdmin() {
        const isAdmin = getSessionValue('isAdmin');  // Buscar o valor do session storage 'isAdmin'
        
        if (isAdmin === 'true') {
            // Criar dinamicamente a seção de administração
            const adminSection = document.createElement('div');
            adminSection.setAttribute('id', 'admin-section');
            adminSection.innerHTML = `
                <h2 class="admin-title"><strong>Administrações:</strong></h2>
                <ul class="admin-list">
                    <li><a class="admin-link" href="#">Gerenciar Usuários</a></li>
                    <li><a class="admin-link" href="#">Gerenciar Conteúdo</a></li>
                </ul>
            `;
            
            // Adicionar a seção de administração ao final do container principal
            document.querySelector('.profile-container').appendChild(adminSection);
        } else {
            console.log("Usuário não é administrador ou valor de administrador não encontrado no session storage.");
        }
    }

    // Chamar a função de verificação ao carregar a página
    checkAdmin();