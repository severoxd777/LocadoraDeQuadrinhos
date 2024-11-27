# Use a versão mais recente do Node.js (v20)
FROM node:20

# Definir o diretório de trabalho
WORKDIR /usr/src/app

# Copiar o package.json e package-lock.json para o contêiner
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Expor a porta 3000
EXPOSE 3000

# Comando para rodar o servidor usando o script 'start'
CMD ["npm", "start"]
