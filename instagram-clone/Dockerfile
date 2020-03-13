FROM node:10
WORKDIR /usr
COPY /api/package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
# RUN cd api/ && cat package.json && cd src/config && cat dev.env
CMD ["sh", "-c", "npm", "run dev"]
