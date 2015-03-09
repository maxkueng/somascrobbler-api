SomaScrobbler API Server
========================

Streams [SomaFM](http://somafm.com/) track metadata in real-time over
socket.io. SomaFM's metadata contains a lot of errors and typos, so the data is
auto-corrected and enhanced using Last.fm's correction API.

## Note

SomaFM is probably not too happy if a thousand people poll their API about
**46 080** times per day.  So if you intend to run this software locally just
for you, it might be better to use
[api.somascrobbler.com](http://api.somascrobbler.com) instead of running your
own.

The service can be used for free as much as you want. There is, however, no
up-time guarantee or any other type of guarantee or warranty. But we try our
best. If you notice that the service is having problems, please just submit an
[issue](https://github.com/maxkueng/somascrobbler-api/issues).


## Installing

 - Download and install Node.js. You should use a recent version.
 - Clone this repository.

And then install the dependencies:

```bash
cd path/to/somascrobbler-api
npm install
```

Create a configuration file called ".somascrobblerapirc".

Here's a sample config file:

```
logLevel = debug
lastfmApiKey = xx123456789012345678901234567890
address = 0.0.0.0
port = 9987
uri = http://localhost:9987
```

Copy and edit the config file. If you're running this locally you'll have to put something like '127.0.0.1' or 'localhost' in `proxy.domain`.

```bash
cp config.dist.json config.json
vi config.json
```

```bash
npm start
```
