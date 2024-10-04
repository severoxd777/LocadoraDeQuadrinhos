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
                <h2>Administrações:</h2>
                <ul>
                    <li><a href="#">Gerenciar Usuários</a></li>
                    <li><a href="#">Gerenciar Conteúdo</a></li>
                </ul>
            `;
            adminSection.style.marginTop = '30px';
            adminSection.style.backgroundColor = '#f1f1f1';
            adminSection.style.padding = '20px';
            adminSection.style.borderRadius = '8px';
            
            // Adicionar a seção de administração ao final do container principal
            document.querySelector('.profile-container').appendChild(adminSection);
        } else {
            console.log("Usuário não é administrador ou valor de administrador não encontrado no session storage.");
        }
    }

    // Chamar a função de verificação ao carregar a página
    checkAdmin();