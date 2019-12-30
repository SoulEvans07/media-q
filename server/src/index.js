import fs from 'fs'

const target = __dirname + '/../target/'
const instagram = 'instagram/'

if (!fs.existsSync(target + instagram)){
  fs.mkdirSync(target + instagram)

  const metaFile = '.meta'
  fs.writeFileSync(target+instagram+metaFile, "Hey there!");
}

