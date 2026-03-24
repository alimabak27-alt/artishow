import express from "express"
import { codes } from "../data/codes"
import { Code } from "../models/Code"

const router = express.Router()

router.post("/codes", (req, res) => {
  const { paragraphId, userId, text } = req.body

  const newCode: Code = {
    id: Date.now().toString(),
    paragraphId,
    userId,
    text
  }

  codes.push(newCode)

  res.status(201).json(newCode)
})

router.get("/codes/:paragraphId", (req, res) => {
  const { paragraphId } = req.params

  const result = codes.filter(code => code.paragraphId === paragraphId)

  res.json(result)
})

export default router