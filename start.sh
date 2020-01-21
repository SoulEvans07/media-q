#!/usr/bin/env bash
BASEDIR=`dirname "$0"`
mkdir -p "$BASEDIR/logs"

DATE=$(date +%Y-%m-%d-%H%M%S)

CLIENT="npm start --prefix $BASEDIR/client/ | tee $BASEDIR/logs/client-$DATE.log | sed -e 's/^/[client] /'"
SERVER="npm start --prefix $BASEDIR/server/ | tee $BASEDIR/logs/server-$DATE.log | sed -e 's/^/[server] /'"

sh -c "$CLIENT & $SERVER & wait"