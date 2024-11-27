function loadFooter() {
    fetch('/elementos/footer/footer.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
      })
      .catch(error => console.error('Erro ao carregar o rodapé:', error));
  }
  