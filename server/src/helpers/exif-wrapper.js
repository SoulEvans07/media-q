import _exif from 'exif2'

class Exif {
  static getImageData(path) {
    return new Promise((resolve, reject) => {
      _exif(path, (err, data) => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }
}

export default Exif
