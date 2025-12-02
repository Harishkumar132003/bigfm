FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY bigfm-frontend/build /usr/share/nginx/html
COPY bigfm-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
