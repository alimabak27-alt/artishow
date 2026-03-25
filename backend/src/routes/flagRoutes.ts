import express, { Request, Response } from "express"
import { flags } from "../data/flags"
import { Flag } from "../models/Flag"

const router = express.Router()

// Ajouter un flag
router.post("/flags", (req: Request, res: Response) => {

  const { codeId, userId, reason } = req.body

  const newFlag: Flag = {
    id: Date.now().toString(),
    codeId,
    userId,
    reason
  }

  flags.push(newFlag)

  res.status(201).json(newFlag)

})

// récupérer les flags d'un code
router.get("/flags/:codeId", (req: Request, res: Response) => {

  const { codeId } = req.params

  const result = flags.filter(flag => flag.codeId === codeId)

  res.json(result)

})

export default router