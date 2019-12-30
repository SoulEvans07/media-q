import request from 'request'
import FormData from 'form-data'

export const login = (account) => {
  return new Promise((resolve, reject) => {
    request({
      url: 'https://www.instagram.com/accounts/login/ajax/',
      method: 'POST',
      form: {...account},
      headers: {
        'User-Agent': 'request',
        'Host': 'www.instagram.com',
        'X-CSRFToken': 'EJMrAsTOEi1SKiZLHzNf2RMBEZTQkI9I',
        'X-Instagram-AJAX': '1',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.instagram.com/',
        'Cookie': 'csrftoken=EJMrAsTOEi1SKiZLHzNf2RMBEZTQkI9I;'
      }
    },
    (err, resHeader, res) => {
      if (err) reject(err)

      res = JSON.parse(res)

      if (res.authenticated) {
        resolve(resHeader.headers['set-cookie'].join(';'))
      } else {
        reject('Wrong username/password!')
      }
    })
  })
}
