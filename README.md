![SomaScrobbler API Server](./static/logo.png)
==============================================


**SomaScrobbler API Server** streams [SomaFM](http://somafm.com/) track
metadata in real-time over socket.io. SomaFM's metadata contains a lot of
errors and typos, so the data is auto-corrected and enhanced using Last.fm's
correction API.

#### Note: This is also available as a service

SomaFM is probably not too happy if a thousand people poll their API about
several dozen thousand times per day.  So if you intend to run this software
locally just for you, it might be better to use
[api.somascrobbler.com](http://api.somascrobbler.com) instead of running your
own.

The service can be used for free as much as you want. There is, however, no
up-time guarantee or any other type of guarantee or warranty. But we try our
best. If you notice that the service is having problems, please just submit an
[issue](https://github.com/maxkueng/somascrobbler-api/issues).

_**Additional note**: api.somascrobbler.com currently runs an older version of the
server. If you'd like to use the current version you can use
http://api2.somascrobbler.com/ until migration is complete._


## Installation

 - Download and install Node.js or io.js. You should use a recent version.
 - Then install the `somascrobbler-api` package globally (`-g`) from npm. You
   may have to prefix the sommand with `sudo` depending on your setup.

```sh
npm install somascrobbler-api -g
```

## Configuration

Create a config file "$HOME/.somascrobblerapirc" or "/etc/somascrobblerapirc",
or any other location supported by the [rc](https://www.npmjs.com/package/rc)
module.

Here's a sample config file:

```
logLevel = debug
somafmPollInterval = 20000
lastfmApiKey = xx123456789012345678901234567890
address = 0.0.0.0
port = 9987
uri = http://localhost:9987

```

 - `logLevel` *(string; optional; default: info)*: The log level. Can be either "debug", "info", "warn", or "error".

 - `somafmPollInterval` *(integer; optional; default: 10000)*: The number of milliseconds to wait between SomaFM API requests.

 - `lastfmApiKey` *(string; optional; default: null)*: Your Last.fm API key. This is required for metadata auto-correction. If omitted metadata will not be corrected and contain lots and lots of typos.

 - `address` *(string; optional; default: 0.0.0.0)*: The IP of the interface for the web server to listen on. By default it will listen on all interfaces.

 - `port` *(integer; optional; default: 9987)*: The port for the web interface to listen on.

 - `uri` *(string; optional; default: http://localhost:9987)*: The full public URL through which the web interface will be accessible including the port number unless you're using one of the default ports.

Configuration options can also be provided through environment variables. For example, the valirable key for `lastfmApiKey` would be `somascrobblerapi_lastfmApiKey`.


## Run

```sh
somascrobbler-api
```

Or provide an alternate config file:

```sh
somascrobbler-api --config=path/to/theconfig
```

Additionally, configuration options can be overridden through command-line arguments:

```sh
somascrobbler-api --lastfmApiKey=blabla_my_lasfm_key
```

## Docker

SomaScrobbler API Server is also available as a Docker image. It should work with Docker 1.5 or later.

Pull the image from the registry:

```sh
docker pull maxkueng/somascrobbler-api:latest
```

To run it, provide all non-default configuration options as environment variables:

```sh
docker run -d \
  -p 80:9987 \
  -e somascrobblerapi_lastfmApiKey=xx123456789012345678901234567890 \
  -e somascrobblerapi_uri=example.com \
  --restart on-failure \
  maxkueng/somascrobbler-api:latest
```

You can also mount an external config file instead of using environment
variables (or use a combination of both):

```sh
docker run -d \
  -p 80:9987 \
  -v /path/to/the/config/file:/etc/somascrobblerapirc \
  --restart on-failure \
  maxkueng/somascrobbler-api:latest

```
