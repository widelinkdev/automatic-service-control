FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache postgresql-client bash

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x /app/entrypoint.sh

RUN npx prisma generate

ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm", "start"]
