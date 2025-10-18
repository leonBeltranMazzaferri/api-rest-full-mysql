import express from "express";


const app = express();
const PORT = 3000;

app.use(express.json());
// middleware para interpretar los json q entran por request

import userRoutes from './src/routes/users.routes.js';
app.use(userRoutes);

app.get("/", async(req, res) => {
    res.send('Api_Rest_Ful_MySql');
});

app.use((req, res) => {
    res.status(404).send('Api_Rest_Ful_MySql');
});

app.listen(PORT, () => {
  console.log(`server corriendo en http://localhost:${PORT}`);
});