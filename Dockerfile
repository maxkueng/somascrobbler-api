FROM node:0.12
MAINTAINER Max Kueng <me@maxkueng.com>

EXPOSE 9987

COPY . /src
RUN cd /src; npm install

WORKDIR /src

ENTRYPOINT [ "/usr/local/bin/npm", "run" ]

CMD [ "start" ]
