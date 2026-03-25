import express from "express"
import cors from "cors"

import paragraphRoutes from "./routes/paragraphRoutes"
import codeRoutes from "./routes/codeRoutes"
import comparisonRoutes from "./routes/comparisonRoutes"
import flagRoutes from "./routes/flagRoutes"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("CollabCoder backend running")
})

app.use("/api", paragraphRoutes)
app.use("/api", codeRoutes)
app.use("/api", comparisonRoutes)
app.use("/api", flagRoutes)

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})