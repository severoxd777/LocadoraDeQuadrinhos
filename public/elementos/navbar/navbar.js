function loadNavbar() {
    fetch('/elementos/navbar/navbar.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;
  
        // Após inserir o HTML da navbar, execute o script de verificação de login
        checkLoginStatus();
  
        // Adiciona o event listener para o botão de logout
        document.getElementById('logout-link').addEventListener('click', logout);
  
        // Chama a função para definir o link ativo
        setActiveNavLink();
      })
      .catch(error => console.error('Erro ao carregar a navbar:', error));
  }
  
  function checkLoginStatus() {
    const userId = sessionStorage.getItem('usuarioId');
    if (userId) {
      document.getElementById('login-link').classList.add('d-none');
      document.getElementById('register-link').classList.add('d-none');
      document.getElementById('logout-link').classList.remove('d-none');
    } else {
      document.getElementById('login-link').classList.remove('d-none');
      document.getElementById('register-link').classList.remove('d-none');
      document.getElementById('logout-link').classList.add('d-none');
    }
  }
  
  function logout() {
    sessionStorage.removeItem('usuarioId');
    window.location.href = '/';
  }
  
  function setActiveNavLink() {
    // Obtém o caminho da URL atual
    const path = window.location.pathname;
  
    // Seleciona todos os links da navbar
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
    navLinks.forEach(link => {
      // Remove a classe "active" de todos os links
      link.classList.remove('active');
  
      // Verifica se o href do link corresponde ao caminho atual
      if (link.getAttribute('href') === path) {
        link.classList.add('active');
      }
    });
  }
  