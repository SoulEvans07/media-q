$BASEDIR = $PSScriptRoot

echo "$BASEDIR\logs"
# mkdir -p "$BASEDIR/logs"

$DATE = Get-Date -Format "yyyy-MM-dd-HHmmss"
echo $DATE

# $CLIENT = "npm run win-start --prefix $BASEDIR/client/"
$CLIENT = "npm run win-start --no-color --prefix $BASEDIR/client/ | Tee-Object -Variable 'cline' | % { Add-Content -Path $BASEDIR/logs/client-$DATE.log -Value $cline; Write-Output $cline; }"
Invoke-Expression $CLIENT

#CLIENT="npm start --prefix $BASEDIR/client/ | Tee-Object -FilePath $BASEDIR/logs/client-$DATE.log | sed -e 's/^/[client] /'"
#SERVER="PORT=3333 npm start --prefix $BASEDIR/server/ | Tee-Object -FilePath $BASEDIR/logs/server-$DATE.log | sed -e 's/^/[server] /'"

# sh -c "$CLIENT & $SERVER & wait"