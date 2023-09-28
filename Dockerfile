# Define a imagem base
FROM node:14-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto para o diretório de trabalho
COPY . .

# Instala as dependências
RUN npm install

# Expõe a porta 3000
EXPOSE 3000

# Inicia o servidor
CMD ["npm", "run", "dev"]