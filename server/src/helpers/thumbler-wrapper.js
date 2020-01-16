import _thumbler from 'thumbler'

const Thumbler = function(options) {
  return new Promise((resolve, reject) => {
    _thumbler(options, (err, path) => {
      if (err) return reject(err)
      return resolve(path)
    })
  })
}

export default Thumbler
