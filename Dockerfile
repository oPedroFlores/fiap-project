FROM node:20

RUN apt update && \
    apt install -y wget netcat-traditional && \
    wget -q -O /usr/bin/wait-for https://raw.githubusercontent.com/eficode/wait-for/v2.2.3/wait-for && \
    chmod +x /usr/bin/wait-for

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY . .

# Expõe a porta utilizada pelo seu aplicativo Nest.js (por padrão, é a porta 3000)
EXPOSE 8080

# Comando para iniciar o aplicativo quando o contêiner for iniciado
RUN ["chmod", "+x", "/usr/app/start.sh"]
