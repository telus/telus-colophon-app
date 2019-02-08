FROM node:alpine
LABEL name="Colophon App"
LABEL description=""
LABEL maintainer="Ahmad Nassri <email@ahmadnassri.com>"

WORKDIR /src
VOLUME /src

COPY . ./
COPY package*.json ./

RUN apk --no-cache --virtual build-dependencies add python make g++
RUN npm ci
RUN apk del build-dependencies

EXPOSE 3000 9229

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]

# TODO: allow for dev and start run
