from node:20 as builder

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist .

COPY package.json .

# Install only production dependencies
RUN npm install --omit=dev

CMD ["node", "main"]
