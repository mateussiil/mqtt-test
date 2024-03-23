# Use a imagem oficial do Node.js como base
FROM node:latest

# Diretório de trabalho na imagem
WORKDIR /usr/src/app

# Copie o arquivo package.json e package-lock.json (se existir)
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o código-fonte da aplicação
COPY . .

# Porta que a aplicação irá escutar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "app.js"]
