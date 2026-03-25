import express, { Request, Response } from "express"
import { codes } from "../data/codes"
import { Code } from "../models/Code"

const router = express.Router()

router.get("/comparison/:paragraphId", (req: Request, res: Response) => {

  const { paragraphId } = req.params

  const paragraphCodes = codes.filter(
    (code: Code) => code.paragraphId === paragraphId
  )

  const users: { [key: string]: Code[] } = {}

  paragraphCodes.forEach((code: Code) => {

    if (!users[code.userId]) {
      users[code.userId] = []
    }

    users[code.userId].push(code)

  })

  const divergences: string[] = []

  const userIds = Object.keys(users)

  if (userIds.length >= 2) {

    const codesA = users[userIds[0]].map(c => c.text)
    const codesB = users[userIds[1]].map(c => c.text)

    codesA.forEach(code => {
      if (!codesB.includes(code)) divergences.push(code)
    })

    codesB.forEach(code => {
      if (!codesA.includes(code)) divergences.push(code)
    })

  }

  res.json({
    users,
    divergences
  })

})

export default router

/* router.get("/comparison/:paragraphId", async (req, res) => {
  const { paragraphId } = req.params

  // Récupérer tous les codes pour ce paragraphe
  const paragraphCodes = codes.filter(code => code.paragraphId === paragraphId)

  // Grouper par utilisateur
  const users: { [userId: string]: Code[] } = {}
  paragraphCodes.forEach(code => {
    if (!users[code.userId]) {
      users[code.userId] = []
    }
    users[code.userId].push(code)
  })

  // Calcul simple des divergences : codes différents entre utilisateurs
  // Ici on compare simplement le texte pour détecter les différences
  const divergences: string[] = []
  const userIds = Object.keys(users)
  if (userIds.length >= 2) {
    const [userA, userB] = userIds
    const codesA = users[userA].map(c => c.text)
    const codesB = users[userB].map(c => c.text)

    codesA.forEach(code => {
      if (!codesB.includes(code)) divergences.push(code)
    })
    codesB.forEach(code => {
      if (!codesA.includes(code)) divergences.push(code)
    })
  }

  res.json({
    users,
    divergences
  })
})

export default router
 */