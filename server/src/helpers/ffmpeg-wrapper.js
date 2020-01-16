import _ffmpeg from 'fluent-ffmpeg'

class FFMPEG {
  static ffprobe(path) {
    return new Promise((resolve, reject) => {
      _ffmpeg.ffprobe(path, (err, meta) => {
        if (err) return reject(err)
        return resolve(meta)
      })
    })
  }
}

export default FFMPEG
