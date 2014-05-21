SomaScrobbler API Server
========================

Streams [SomaFM](http://somafm.com/) track metadata in real-time over
socket.io. SomaFM's metadata contains a lot of errors and typos, so the
data is auto-corrected and enhanced using Last.fm's correction API.

Work in progress.

Before starting program you must do this

```
sudo apt-get install npm
npm install socket.io through lastfm-autocorrect somastation lodash debug
```
