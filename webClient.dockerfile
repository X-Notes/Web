FROM node:16 AS builder

WORKDIR /app

COPY Client .

RUN yarn && \
    yarn prod

FROM nginx:alpine

COPY --from=builder /app/dist/Client/* /usr/share/nginx/html/
COPY --from=builder /app/dist/Client/assets/ /usr/share/nginx/html/assets/
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf