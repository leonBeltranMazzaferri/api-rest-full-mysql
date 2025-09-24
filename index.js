import express from 'express'
const app = express()
const port = 3000
//inicio middleware
app.get('/', (req, res)=>{
  res.send('api rest full mysql')
})



//final middleware
app.use((req, res)=>{
  res.status(404).send('no existe la ruta')
})
app.listen(port, console.log(`servidor http://localhost:${port}`))