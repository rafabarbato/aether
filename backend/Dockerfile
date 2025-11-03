FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY node_modules ./node_modules

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

RUN mkdir -p logs uploads

ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

USER node

CMD ["node", "dist/server.js"]
