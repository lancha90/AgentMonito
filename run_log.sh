#!/bin/sh
nohup supervisor server.js > /data/app/logs/log.log 2> /data/app/logs/error.log &
echo $! > server.pid
