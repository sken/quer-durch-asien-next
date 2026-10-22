FROM node:22

WORKDIR /app

# The schema is needed by the postinstall `prisma generate`
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
