import { verifyToken } from '#api/utils/jwt.util.js'

const isAuth = async (req, res, next) => {
  const tokenFromClient = req.headers['x-access-token'] || req.headers['X-ACCESS-TOKEN']
  if (tokenFromClient) {
    try {
      const decoded = await verifyToken(
        tokenFromClient,
        process.env.ACCESS_TOKEN_SECRET,
        {}
      )
      req.user = decoded
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        if (error.message === 'jwt expired') {
          res.msg = error.message
          const decoded = await verifyToken(
            tokenFromClient,
            process.env.ACCESS_TOKEN_SECRET,
            { ignoreExpiration: true }
          )
          req.user = decoded
          return next()
        }
      }

      return res.status(500).json({ error })
    }
  } else {
    return res.status(403).json({ msg: 'forbidden' })
  }
}

export default isAuth
