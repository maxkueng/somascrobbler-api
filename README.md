SomaScrobbler API Server
========================

Streams [SomaFM](http://somafm.com/) track metadata in real-time over
socket.io. SomaFM's metadata contains a lot of errors and typos, so the
data is auto-corrected and enhanced using Last.fm's correction API.

## Note

SomaFM is probably not too happy if a thousand people poll their API about **46 080** 46080times per day.  
So if you intend to run this software locally just for you, it might be better to use [api.somascrobbler.com](http://api.somascrobbler.com) instead of running your own.

The service can be used for free as much as you want. There is, however, no up-time guarantee or any other type of guarantee or warranty. But we try our best. If you notice that the service is having problems, please just submit an [issue](https://github.com/maxkueng/somascrobbler-api/issues).


## Installing

 - Download and install Node.js. You should use a recent version. 0.10.26 or higher.
 - Clone this repository.

And then install the dependencies:

```bash
cd path/to/somascrobbler-api
npm install
```

Copy and edit the config file. If you're running this locally you'll have to put something like '127.0.0.1' or 'localhost' in `proxy.domain`.

```bash
cp config.dist.json config.json
vi config.json
```

**Important: If you don't need data for all the stations, edit `stations.json` and remove the ones that you don't want. This will reduce the amount of requests fired at SomaFM.**

```bash
vi stations.json
```

Start the program:

```bash
npm start
```
