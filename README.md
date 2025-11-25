# IoT Cancer Detector

Aplicação mobile para análise de imagens de pele usando IA para detectar possível câncer de pele.

## Stack Tecnológica

- **Frontend**: Expo (React Native) com Expo Router
- **Backend**: Express.js com Node.js
- **IA**: Vercel AI SDK + Google Gemini (gemini-1.5-flash-latest)
- **Banco de Dados**: SQLite com Prisma ORM

## Estrutura do Projeto

```
iot-cancer-detector/
├── backend/          # API Express
│   ├── src/
│   │   ├── index.js
│   │   └── routes/
│   │       └── analysis.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
└── mobile/           # App Expo
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
```

## Setup e Execução

### Backend

1. Entre no diretório do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a API Key do Google Gemini:
   - Obtenha sua chave em: https://aistudio.google.com/app/apikey
   - Edite o arquivo `.env` e adicione sua chave:
```
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
PORT=3000
```

4. Configure o banco de dados:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Frontend (Mobile)

1. Entre no diretório do mobile:
```bash
cd mobile
```

2. Instale as dependências:
```bash
npm install
```

3. **IMPORTANTE**: Se você for testar em um dispositivo físico, edite o arquivo `mobile/constants/config.js` e altere o `API_URL` para o IP da sua máquina:
```javascript
export const API_URL = 'http://SEU_IP:3000';
// Exemplo: 'http://192.168.1.100:3000'
```

4. Inicie o Expo:
```bash
npx expo start
```

5. Escaneie o QR Code com o app Expo Go (disponível na App Store/Play Store) ou pressione:
   - `a` para abrir no Android
   - `i` para abrir no iOS

## Funcionalidades

- ✅ Captura de foto via câmera
- ✅ Seleção de imagem da galeria
- ✅ Análise de imagem com IA (Google Gemini)
- ✅ Classificação de severidade (Baixo, Médio, Alto, Extremo)
- ✅ Histórico de análises
- ✅ Exclusão de análises
- ✅ Pull-to-refresh no histórico

## API Endpoints

- `GET /analysis` - Lista todas as análises
- `POST /analysis` - Cria nova análise (requer imagem)
- `DELETE /analysis/:id` - Deleta uma análise

## Notas Importantes

⚠️ **Este aplicativo é apenas para fins educacionais e NÃO substitui avaliação médica profissional.**

- Sempre consulte um dermatologista para diagnóstico definitivo
- A análise é preliminar e realizada por IA
- Sem autenticação (dados locais apenas)

## Troubleshooting

### Erro de conexão no app mobile

Se o app não conseguir se conectar ao backend:

1. Verifique se o backend está rodando
2. Se estiver usando dispositivo físico, certifique-se de que ambos estão na mesma rede
3. Atualize o `API_URL` em `mobile/constants/config.js` com o IP correto

### Erro ao instalar dependências

Se houver erro ao instalar as dependências do Expo:
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Permissões negadas

O app solicitará permissões de câmera e galeria na primeira vez. Se você negou, vá em:
- **iOS**: Ajustes > Privacy > Camera/Photos
- **Android**: Configurações > Apps > IoT Cancer Detector > Permissões
