document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      toggleEditProfileForm();
    });
  
    function toggleEditProfileForm() {
      const container = document.getElementById('edit-profile-container');
  
      // Se o formulário já estiver presente, remove-o
      if (document.getElementById('edit-profile-form')) {
        container.innerHTML = '';
        return;
      }
  
      // Verificar se os elementos user-name e user-email existem
      const userNameElement = document.getElementById('user-name');
      const userEmailElement = document.getElementById('user-email');
  
      if (!userNameElement || !userEmailElement) {
        alert('Erro ao carregar informações do usuário.');
        return;
      }
  
      // Obter os valores atuais
      const userName = userNameElement.textContent || '';
      const userEmail = userEmailElement.textContent || '';
  
      // Cria e insere o formulário
      const formHTML = `
        <form id="edit-profile-form" class="edit-profile-form">
          <h2>Editar Informações do Perfil</h2>
          <label class="edit-profile-label" for="edit-name">Nome:</label>
          <input class="edit-profile-imput" type="text" id="edit-name" name="nome" value="${userName}" required>
          <br>
          <label class="edit-profile-label" for="edit-email">Email:</label>
          <input class="edit-profile-imput" type="email" id="edit-email" name="email" value="${userEmail}" required>

          <h3 class="mt-3">Alterar Senha</h3>
          <label class="edit-profile-label" for="current-password">Senha Atual:</label>
          <input class="edit-profile-imput" type="password" id="current-password" name="currentPassword">
          <br>
          <label class="edit-profile-label" for="new-password">Nova Senha:</label>
          <input class="edit-profile-imput" type="password" id="new-password" name="newPassword">
          <br>
          <label class="edit-profile-label" for="confirm-password">Confirmar Nova Senha:</label>
          <input class="edit-profile-imput" type="password" id="confirm-password" name="confirmPassword">
          <br>
          <button type="submit" class="edit-profile-submit">Salvar Alterações</button>
          <button type="button" id="cancel-edit-btn" class="edit-profile-cancel">Cancelar</button>
        </form>
      `;
  
      container.innerHTML = formHTML;
  
      // Adicionar eventos ao formulário
      document.getElementById('edit-profile-form').addEventListener('submit', submitEditProfileForm);
      document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        container.innerHTML = '';
      });
    }
  
    async function submitEditProfileForm(event) {
      event.preventDefault(); // Evita o recarregamento da página
  
      const userId = sessionStorage.getItem('usuarioId');
      if (!userId) {
        alert('Usuário não está logado');
        window.location.href = '/login';
        return;
      }
  
      const nome = document.getElementById('edit-name').value.trim();
      const email = document.getElementById('edit-email').value.trim();
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
  
      // Validação dos campos
      if (!nome || !email) {
        alert('Nome e email são obrigatórios');
        return;
      }
  
      // Objeto para armazenar os dados a serem enviados
      const updatedData = {
        nome,
        email
      };
  
      // Se o usuário deseja alterar a senha
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          alert('Para alterar a senha, preencha todos os campos de senha');
          return;
        }
  
        if (newPassword !== confirmPassword) {
          alert('A nova senha e a confirmação não correspondem');
          return;
        }
  
        updatedData.currentPassword = currentPassword;
        updatedData.newPassword = newPassword;
      }
  
      try {
        const response = await fetch(`/usuarios/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert('Perfil atualizado com sucesso!');
          // Recarrega a página para exibir as informações atualizadas
          location.reload();
        } else {
          alert(result.message || 'Erro ao atualizar perfil');
        }
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('Erro ao conectar com o servidor');
      }
    }
  });
  