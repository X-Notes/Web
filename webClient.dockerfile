FROM node:alpine AS builder

WORKDIR /app

COPY Client .

RUN npm install && \
    npm run prod

FROM nginx:alpine

COPY --from=builder /app/dist/Client/* /usr/share/nginx/html/
COPY --from=builder /app/dist/Client/assets/ /usr/share/nginx/html/assets/
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf