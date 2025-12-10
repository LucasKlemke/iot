import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// const model = google('gemini-2.5-flash');
const model = openai('gpt-4o-mini');

const analysisSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'extreme']),
  accuracy: z.number().min(0).max(1),
  commentaries: z.string()
});

const AI_PROMPT = `Você é um assistente médico especializado em dermatologia. Analise a imagem de pele fornecida e avalie o risco de câncer de pele.

Forneça uma análise baseada nos critérios ABCDE:
- Assimetria da lesão
- Bordas irregulares
- Variação de cor (Color)
- Diâmetro maior que 6mm
- Evolução/mudanças (Evolution)

Classifique a severidade como:
- "low": Lesão benigna, sem características preocupantes
- "medium": Algumas características que merecem atenção
- "high": Várias características suspeitas presentes
- "extreme": Características altamente suspeitas de malignidade

Responda APENAS com um objeto JSON contendo EXATAMENTE estas três propriedades:
- severity: string ("low", "medium", "high" ou "extreme")
- accuracy: number (0.0 a 1.0)
- commentaries: string com comentários detalhados

Seja preciso mas cauteloso em suas análises.`;
router.get('/', async (req, res) => {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

    const { object } = await generateObject({
      model,
      schema: analysisSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: AI_PROMPT },
            { type: 'image', image: imageDataUrl }
          ]
        }
      ]
    });

    const analysis = await prisma.analysis.create({
      data: {
        imageBase64: imageDataUrl,
        severity: object.severity,
        accuracy: object.accuracy,
        commentaries: object.commentaries
      }
    });

    res.json(analysis);
  } catch (error) {
    console.error('Error creating analysis:', error);
    res.status(500).json({ error: 'Failed to create analysis' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.analysis.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

export default router;
