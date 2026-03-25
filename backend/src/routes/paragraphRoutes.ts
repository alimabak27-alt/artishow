import express from "express"
import { paragraphs } from "../data/paragraphs"

const router = express.Router()

router.get("/paragraphs", (req, res) => {
  res.json(paragraphs)
})

export default router
