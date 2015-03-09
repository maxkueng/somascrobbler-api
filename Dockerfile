FROM node:0.12
MAINTAINER Max Kueng <me@maxkueng.com>

EXPOSE 9987

COPY . /src
RUN \
	cd /src; npm install -g \
	&& chmod +x /src/docker-entrypoint.sh

WORKDIR /src

ENTRYPOINT /src/docker-entrypoint.sh
