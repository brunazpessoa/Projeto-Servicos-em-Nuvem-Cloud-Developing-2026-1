# Usa a imagem oficial do Node.js
FROM node:20-alpine

# Define a pasta /app dentro do container como diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependências para o container
COPY package*.json ./

# Instala as dependências do projeto dentro do container
RUN npm install

# Copia todo o código do backend para o container
COPY . .

# Informa que a aplicação usará a porta 3000
EXPOSE 3000

# Comando que será executado quando o container for iniciado
CMD ["node", "src/index.js"]