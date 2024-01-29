FROM node:latest

# Create work directory
WORKDIR /usr/src/app

COPY package*.json ./

# Copy app source to work directory
COPY . /usr/src/app

# Install app dependencies
RUN npm install 

# Build
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run","start:dev" ]