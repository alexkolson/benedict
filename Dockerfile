FROM node:alpine

RUN apk update && apk add python g++ make && rm -rf /var/cache/apk/*

ENV HOME=/home/app
ENV WORKDIR=$HOME/direktzu

RUN addgroup -S app && adduser -S -G app app 

RUN chown -R app:app $HOME

USER app

RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

COPY . .

RUN npm install --only=production

CMD npm start
