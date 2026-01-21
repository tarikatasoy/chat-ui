# Build aşaması
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- EKLENEN KISIM BAŞLANGIÇ ---
# Docker Compose'dan gelen argümanları yakala
ARG VITE_API_BASE_URL
ARG VITE_HUB_URL

# Bunları build süreci için ortam değişkeni yap
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_HUB_URL=$VITE_HUB_URL
# --- EKLENEN KISIM BİTİŞ ---

RUN npm run build

# Yayın aşaması
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]