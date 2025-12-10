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
const model = openai('gpt-4o');

const analysisSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'extreme']),
  accuracy: z.number().min(0).max(1),
  commentaries: z.string()
});

const AI_PROMPT = `Você é um assistente de triagem dermatológica especializado em análise de lesões de pele. Sua função é fornecer uma avaliação preliminar baseada em critérios clínicos estabelecidos.

**IMPORTANTE**: Esta análise é apenas para triagem e não substitui avaliação médica presencial. Sempre recomende consulta com dermatologista para diagnóstico definitivo.

## METODOLOGIA DE ANÁLISE

Avalie a lesão utilizando os **critérios ABCDE** de melanoma:

**A - Assimetria**
- Compare mentalmente a lesão dividida ao meio
- Lesões benignas tendem a ser simétricas
- Assimetria em um ou dois eixos aumenta suspeição

**B - Bordas**
- Bordas bem definidas e regulares: benignas
- Bordas irregulares, recortadas ou difusas: suspeitas
- Observe se há "entalhes" ou expansões assimétricas

**C - Cor (Color)**
- Uniformidade de cor: geralmente benigna
- Múltiplas cores (preto, marrom, vermelho, branco, azul): suspeita
- Variações tonais abruptas aumentam risco

**D - Diâmetro**
- Lesões > 6mm (tamanho de uma borracha de lápis): maior atenção
- Melanomas podem ser menores, não descarte por tamanho
- Considere contexto: lesões crescentes são mais preocupantes

**E - Evolução**
- Pergunte-se: esta lesão parece estar mudando?
- Considere características de lesões em evolução:
  - Crescimento recente
  - Mudança de forma ou cor
  - Sintomas novos (coceira, sangramento)

## CRITÉRIOS DE CLASSIFICAÇÃO

**"low"** - Lesão provavelmente benigna:
- 0-1 critério ABCDE positivo
- Aparência uniforme e simétrica
- Sem sinais de alarme
- Ex: nevo melanocítico comum, efélide

**"medium"** - Atenção necessária:
- 2 critérios ABCDE positivos
- Algumas características atípicas mas não conclusivas
- Recomenda monitoramento ou avaliação médica breve

**"high"** - Múltiplas características suspeitas:
- 3+ critérios ABCDE positivos
- Aparência significativamente atípica
- Recomenda avaliação dermatológica urgente

**"extreme"** - Características altamente suspeitas:
- 4+ critérios ABCDE fortemente positivos
- Sinais de alarme críticos (sangramento, ulceração, crescimento rápido)
- Recomenda avaliação médica imediata
- Aparência compatível com melanoma ou carcinoma avançado

## LIMITAÇÕES DA ANÁLISE

- Qualidade da imagem afeta precisão (iluminação, foco, ângulo)
- Sem informação do paciente (histórico, evolução temporal)
- Não detecta lesões não-visíveis ou profundas
- Dermoscopia presencial é superior a análise fotográfica

## FORMATO DE RESPOSTA

Retorne APENAS um objeto JSON válido com esta estrutura exata:

{
  "severity": "low|medium|high|extreme",
  "accuracy": 0.85,
  "commentaries": "Análise detalhada aqui..."
}

### Orientações para cada campo:

**severity**: Use a classificação definida acima baseada nos critérios ABCDE

**accuracy**: Confiança da análise (0.0-1.0)
- 0.9-1.0: Imagem excelente, lesão clara, alta confiança
- 0.7-0.89: Boa qualidade, análise confiável
- 0.5-0.69: Qualidade moderada ou lesão ambígua
- 0.0-0.49: Imagem inadequada ou lesão impossível de avaliar

**commentaries**: Estruture assim:
1. **Critérios ABCDE encontrados**: Liste quais estão presentes
2. **Análise específica**: Descreva características observadas
3. **Diagnóstico diferencial**: Mencione possibilidades (ex: "compatível com nevo benigno" ou "características suspeitas de melanoma")
4. **Recomendação**: Ação sugerida baseada na severidade
5. **Ressalva**: Sempre termine com "Esta análise não substitui avaliação médica presencial. Consulte um dermatologista para diagnóstico definitivo."

## EXEMPLO DE ANÁLISE BOA

{
  "severity": "high",
  "accuracy": 0.82,
  "commentaries": "Critérios ABCDE: A+ (assimetria evidente em dois eixos), B+ (bordas irregulares especialmente no quadrante superior), C+ (variação de coloração marrom claro a escuro com área enegrecida central), D+ (diâmetro estimado cerca de 8mm). Análise: Lesão pigmentada com múltiplas características atípicas. A assimetria é pronunciada, as bordas apresentam irregularidades e há heterogeneidade cromática significativa. Diagnóstico diferencial: Características compatíveis com nevo displásico ou melanoma inicial. Menos provável: queratose seborreica pigmentada. Recomendação: Avaliação dermatológica urgente recomendada. Considerar dermoscopia e eventual biópsia. Ressalva: Esta análise não substitui avaliação médica presencial. Consulte um dermatologista para diagnóstico definitivo."
}

Seja preciso, use terminologia apropriada, mas mantenha linguagem acessível. Em caso de dúvida sobre severidade, prefira classificar no nível mais alto e recomendar avaliação médica.`;

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

    console.log('🩺\n=== Iniciando análise da imagem recebida ===\n');
    if (req.file) {
      console.log(`📄 Nome do arquivo: ${req.file.originalname || 'Desconhecido'}\n`);
      console.log(`🖼️ Tipo MIME: ${req.file.mimetype}\n`);
      console.log(`📏 Tamanho: ${(req.file.size / 1024).toFixed(2)} KB\n`);
    } else {
      console.log('🚫 Nenhum arquivo recebido!\n');
    }

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
    
    console.log('\n🎉 === Análise de Imagem Finalizada === 🎉\n');
    console.log(`🩺 Severidade: ${object.severity}\n`);
    console.log(`🎯 Acurácia: ${(object.accuracy * 100).toFixed(2)}%\n`);
    console.log('📝 Comentários:');
    console.log(`${object.commentaries}\n`);
    console.log('====================================\n');

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
