export default function handler(req, res) {
    console.log('requested')
    res.status(200).json({ message: 'Hello from Next.js!' })
  }