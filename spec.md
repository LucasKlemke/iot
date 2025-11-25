Visão Geral do Projeto
Aplicação mobile para análise de imagens de pele usando IA para detectar possível câncer de pele. O sistema consiste em um app Expo (frontend) e API Express (backend) integrados com Vercel AI SDK e Google Gemini.
Stack Tecnológica

Frontend: Expo (React Native) com Expo Router
Backend: Express.js com Node.js
IA: Vercel AI SDK + Google Gemini (gemini-1.5-flash-latest)
Banco de Dados: SQLite com Prisma ORM
Upload: Multer para processamento de imagens
Sem autenticação

Estrutura de Diretórios
iot-cancer-detector/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   └── routes/
│   │       └── analysis.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
└── mobile/
    ├── app/
    │   ├── _layout.js
    │   ├── index.js
    │   ├── new-analysis.js
    │   └── history.js
    ├── components/
    │   ├── AnalysisCard.js
    │   └── SeverityBadge.js
    ├── constants/
    │   ├── config.js
    │   └── colors.js
    ├── package.json
    └── app.json
Backend - Especificações
Dependências
json{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "@ai-sdk/google": "latest",
    "ai": "latest",
    "@prisma/client": "latest",
    "dotenv": "^16.3.1",
    "zod": "latest"
  },
  "devDependencies": {
    "prisma": "latest",
    "nodemon": "^3.0.1"
  }
}
Schema do Banco de Dados (Prisma)
prismadatasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Analysis {
  id           String   @id @default(uuid())
  imageBase64  String   // Imagem armazenada em base64
  severity     String   // "low", "medium", "high", "extreme"
  accuracy     Float    // 0.0 a 1.0
  commentaries String   // Comentários da análise
  createdAt    DateTime @default(now())
}
API Endpoints
GET /analysis
Descrição: Retorna todas as análises do histórico
Response: Array de análises ordenadas por data (mais recente primeiro)
json[
  {
    "id": "uuid",
    "imageBase64": "data:image/jpeg;base64,...",
    "severity": "medium",
    "accuracy": 0.85,
    "commentaries": "...",
    "createdAt": "2025-11-25T10:30:00.000Z"
  }
]
POST /analysis
Descrição: Cria nova análise de imagem
Content-Type: multipart/form-data
Body:

image: arquivo de imagem (campo do form-data)

Processo:

Recebe imagem via multer
Converte para base64
Envia para Google Gemini via Vercel AI SDK usando generateObject
Salva resultado no banco
Retorna análise criada

Schema de validação (Zod):
javascript{
  severity: z.enum(['low', 'medium', 'high', 'extreme']),
  accuracy: z.number().min(0).max(1),
  commentaries: z.string()
}
```

**Response**: Objeto da análise criada

#### DELETE /analysis/:id
**Descrição**: Deleta uma análise específica
**Params**: `id` (UUID da análise)
**Response**: Mensagem de sucesso

### Prompt para a IA
```
Você é um assistente médico especializado em dermatologia. Analise a imagem de pele fornecida e avalie o risco de câncer de pele.

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

Forneça:
1. severity: Classificação do risco
2. accuracy: Sua confiança na análise (0.0 a 1.0)
3. commentaries: Comentários detalhados sobre características observadas, motivo da classificação e sempre incluir: "⚠️ IMPORTANTE: Esta é uma análise preliminar realizada por IA e NÃO substitui avaliação médica profissional. Consulte um dermatologista para diagnóstico definitivo."

Seja preciso mas cauteloso em suas análises.
Configuração da IA (Vercel AI SDK)
javascriptimport { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

const model = google('gemini-1.5-flash-latest');

// Enviar imagem como base64 no formato:
{
  type: 'image',
  image: `data:${mimeType};base64,${base64Data}`
}
```

### Variáveis de Ambiente (.env)
```
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
PORT=3000
Scripts npm
json{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate"
  }
}
Frontend - Especificações
Dependências
json{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react-native": "0.74.0",
    "expo-image-picker": "~15.0.0",
    "axios": "^1.6.0",
    "react-native-safe-area-context": "4.10.0",
    "expo-status-bar": "~1.12.0",
    "@expo/vector-icons": "latest"
  }
}
Configuração do app.json
json{
  "expo": {
    "name": "IoT Cancer Detector",
    "slug": "iot-cancer-detector",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "iotcancerdetector",
    "plugins": ["expo-router"],
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
Estrutura de Navegação (Expo Router)

/ - Tela inicial (index.js)
/new-analysis - Nova análise (new-analysis.js)
/history - Histórico (history.js)

Telas
Tela Inicial (app/index.js)
Elementos:

Logo/ícone médico
Título: "IoT Cancer Detector"
Subtítulo: "Análise preliminar de lesões de pele com IA"
Botão 1: "Nova Análise" (ícone: camera-alt) → navega para /new-analysis
Botão 2: "Histórico" (ícone: history) → navega para /history
Disclaimer: "Este aplicativo não substitui avaliação médica profissional"

Design:

Botão primário (Nova Análise): fundo azul, texto branco
Botão secundário (Histórico): fundo branco, borda azul, texto azul
Layout centralizado verticalmente

Tela Nova Análise (app/new-analysis.js)
Funcionalidades:

Estado inicial:

Botão "Tirar Foto" (abre câmera)
Botão "Galeria" (abre galeria)


Após selecionar imagem:

Preview da imagem (400px altura)
Botão "Nova Foto" (secundário)
Botão "Analisar" (primário)


Durante análise:

Loading spinner no botão "Analisar"


Após análise:

Card de resultado com:

Badge de severidade (colorido)
Barra de confiança visual (accuracy)
Comentários completos


Botões: "Nova Análise" e "Ver Histórico"



Estados:

image: URI da imagem selecionada
loading: boolean para loading state
result: objeto com resultado da análise

Integração com API:
javascriptconst formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'photo.jpg',
});

axios.post(`${API_URL}/analysis`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
Tela Histórico (app/history.js)
Funcionalidades:

FlatList com todas as análises
Pull-to-refresh para atualizar
Estado vazio: ícone + mensagem "Nenhuma análise realizada"
Cada item (AnalysisCard) mostra:

Data e hora formatada
Imagem (thumbnail)
Badge de severidade
Confiança em %
Comentários
Botão deletar



Integração com API:
javascript// Carregar análises
axios.get(`${API_URL}/analysis`);

// Deletar análise
axios.delete(`${API_URL}/analysis/${id}`);
Hook: useFocusEffect para recarregar ao retornar para a tela
Componentes
SeverityBadge.js
Props: severity (string)
Renderiza: Badge colorido com label
Mapeamento de cores:

low → verde (#10b981) - "Baixo"
medium → amarelo (#f59e0b) - "Médio"
high → laranja (#f97316) - "Alto"
extreme → vermelho (#ef4444) - "Extremo"

AnalysisCard.js
Props:

analysis (objeto com dados da análise)
onDelete (função callback)

Elementos:

Header: data/hora + badge + botão deletar
Imagem (200px altura)
Ícone + texto de confiança
Comentários

Constantes
constants/config.js
javascriptexport const API_URL = 'http://localhost:3000';
// Para dispositivo físico: 'http://SEU_IP:3000'
constants/colors.js
javascriptexport const COLORS = {
  primary: '#2563eb',
  secondary: '#1e40af',
  background: '#f8fafc',
  white: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  severityLow: '#10b981',
  severityMedium: '#f59e0b',
  severityHigh: '#f97316',
  severityExtreme: '#ef4444',
  error: '#ef4444',
  warning: '#f59e0b'
};
Design System
Paleta: Azul médico profissional
Ícones: @expo/vector-icons (MaterialIcons)
Tipografia:

Títulos: 20-28px, bold
Body: 14-16px, regular
Labels: 12-14px, semibold

Componentes:

Botões: 12px border-radius, padding 16-20px
Cards: 12px border-radius, sombra sutil
Badges: 20px border-radius (pill shape)

Fluxo da Aplicação
Fluxo Principal

Usuário abre app → Tela inicial
Clica "Nova Análise" → Tela de análise
Tira foto ou seleciona da galeria → Preview
Clica "Analisar" → Loading → Resultado
Visualiza resultado → Opção de ver histórico ou nova análise

Fluxo de Histórico

Usuário clica "Histórico" → Lista de análises
Pull-to-refresh para atualizar
Clica em análise → Expande detalhes
Opção de deletar → Confirmação → Remove da lista

Requisitos Técnicos
Backend

Node.js 18+
Express com CORS habilitado
Multer configurado para memoryStorage
Limite de upload: 10MB
Prisma com SQLite (arquivo local)
Type: "module" no package.json (ES6 imports)

Frontend

Expo SDK 51
React Native 0.74
Expo Router para navegação
Permissões: câmera + galeria
Suporte iOS e Android

IA

Google Gemini API Key necessária
Modelo: gemini-1.5-flash-latest
Método: generateObject do Vercel AI SDK
Imagens enviadas em base64

Tratamento de Erros
Backend

Validação de imagem presente
Try-catch em todas as rotas
Logs de erro no console
Response com status code apropriado

Frontend

Alerts para erros de permissão
Alerts para erros de rede
Loading states em operações assíncronas
Confirmação antes de deletar

Considerações de Segurança e Ética
Disclaimers Obrigatórios

Tela inicial: aviso que não substitui médico
Resultado da análise: aviso nos comentários da IA
Sempre recomendar consulta com dermatologista

Limitações

Sem autenticação (conforme especificado)
Dados armazenados localmente
Sem criptografia de imagens
Sem limite de armazenamento (conforme especificado)

Setup e Execução
Backend
bashcd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
Frontend
bashcd mobile
npm install
npx expo start
Configuração da API Key

Obter chave em https://aistudio.google.com/app/apikey
Adicionar em backend/.env
Ajustar API_URL no frontend se usar dispositivo físico

Testes Recomendados

 Captura de foto funciona
 Seleção da galeria funciona
 Análise retorna resultado válido
 Histórico carrega corretamente
 Delete remove análise
 Pull-to-refresh atualiza lista
 Tratamento de erro quando backend está offline
 Permissões são solicitadas corretamente