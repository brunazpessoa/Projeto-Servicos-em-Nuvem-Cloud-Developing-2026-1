FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY . .
RUN chmod +x /app/entrypoint.sh
EXPOSE 8080
CMD ["/app/entrypoint.sh"]
