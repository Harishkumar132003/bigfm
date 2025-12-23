FROM node:18-alpine

WORKDIR /app

# Copy only build folder
COPY bigfm-frontend/build ./build

# Install static server
RUN npm install -g serve

EXPOSE 3000

# Run static build on port 3000
CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:3000"]