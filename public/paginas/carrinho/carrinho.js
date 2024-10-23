document.addEventListener('DOMContentLoaded', async () => {
  const userId = sessionStorage.getItem('usuarioId');
  if (!userId) {
    alert('Você precisa estar logado para acessar o carrinho.');
    window.location.href = '/paginas/login/login.html';
    return;
  }

  const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  const cartItemsDiv = document.getElementById('cart-items');

  // Atualiza o botão conforme o estado do carrinho
  updatePurchaseButton(cart);

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<h2>Seu carrinho está vazio.</h2>';
    return;
  }

  // Buscar detalhes dos mangás e exibir
  for (const mangaId of cart) {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/manga/${mangaId}`);
      const data = await response.json();
      const manga = data.data;
      displayManga(manga);
    } catch (error) {
      console.error('Erro ao obter detalhes do mangá:', error);
    }
  }
});

function displayManga(manga) {
  const cartItemsDiv = document.getElementById('cart-items');
  const mangaCard = document.createElement('div');
  mangaCard.classList.add('card-grid');

  const truncatedSynopsis = truncateSynopsis(manga.synopsis);

  mangaCard.innerHTML = `
    <div class="card">
      <img src="${manga.images.jpg.image_url}" class="card-img-top" alt="${manga.title}">
      <div class="card-body">
        <h5 class="card-title">${manga.title}</h5>
        <p class="card-text">${truncatedSynopsis}</p>
        <button class="btn btn-danger remove-btn" data-manga-id="${manga.mal_id}">Remover</button>
      </div>
    </div>
  `;

  cartItemsDiv.appendChild(mangaCard);

  // Evento para remover o mangá do carrinho
  mangaCard.querySelector('.remove-btn').addEventListener('click', () => {
    removeFromCart(manga.mal_id, mangaCard);
  });
}

function truncateSynopsis(synopsis) {
  if (!synopsis) {
    return "Descrição não disponível";
  }

  const maxLength = 150;

  if (synopsis.length <= maxLength) {
    return synopsis;
  }

  const periodIndex = synopsis.indexOf(".", maxLength);
  if (periodIndex !== -1 && periodIndex <= maxLength + 50) {
    return synopsis.substring(0, periodIndex + 1);
  }

  return synopsis.substring(0, maxLength) + "...";
}

function removeFromCart(mangaId, mangaCard) {
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  cart = cart.filter(id => id !== mangaId);
  sessionStorage.setItem('cart', JSON.stringify(cart));
  mangaCard.remove();

  if (cart.length === 0) {
    document.getElementById('cart-items').innerHTML = '<h2>Seu carrinho está vazio.</h2>';
  }

  // Atualiza o botão após remover um mangá
  updatePurchaseButton(cart);
}

async function confirmPurchase() {
  const userId = sessionStorage.getItem('usuarioId');
  const cart = JSON.parse(sessionStorage.getItem('cart')) || [];

  if (!userId) {
    alert('Você precisa estar logado para confirmar a compra.');
    window.location.href = '/paginas/login/login.html';
    return;
  }

  if (cart.length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }

  try {
    const response = await fetch(`/usuarios/${userId}/mangas/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mangaIds: cart })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Compra confirmada com sucesso!');
      // Limpar o carrinho
      sessionStorage.removeItem('cart');
      // Redirecionar para o perfil ou atualizar a página conforme necessário
      window.location.href = '/paginas/perfil/perfil.html';
    } else {
      alert(data.message || 'Erro ao confirmar a compra');
    }
  } catch (error) {
    console.error('Erro ao confirmar a compra:', error);
    alert('Erro ao confirmar a compra');
  }
}

function updatePurchaseButton(cart) {
  const purchaseBtn = document.getElementById('confirm-purchase-btn');

  // Remove todos os event listeners anteriores substituindo o nó
  const newPurchaseBtn = purchaseBtn.cloneNode(true);
  purchaseBtn.parentNode.replaceChild(newPurchaseBtn, purchaseBtn);

  if (cart.length === 0) {
    newPurchaseBtn.textContent = 'Voltar a navegação';
    newPurchaseBtn.classList.remove('btn-success');
    newPurchaseBtn.classList.add('btn-primary');
    newPurchaseBtn.addEventListener('click', () => {
      window.location.href = '/index.html';
    });
  } else {
    newPurchaseBtn.textContent = 'Confirmar Compra';
    newPurchaseBtn.classList.remove('btn-primary');
    newPurchaseBtn.classList.add('btn-success');
    newPurchaseBtn.addEventListener('click', confirmPurchase);
  }
}
