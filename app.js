import express, { json } from 'express'
const app = express()
import { connect } from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
import bodyParser from 'body-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import userRouter from './routes/userRoutes.js'
app.use(helmet())
app.use(cors())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan('tiny'));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(json())

connect(process.env.MONGO_URL).then(() => {
  console.log("mongoose connected",);
}).catch((err) => { 
  console.log("mongoose url error", err);
})

//routes
app.use('/api', userRouter)


// Start the server 
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`); 
});