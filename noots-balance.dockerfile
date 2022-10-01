FROM nginx

# Override the default nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf
COPY Docker/balancer-nginx.conf /etc/nginx/nginx.conf