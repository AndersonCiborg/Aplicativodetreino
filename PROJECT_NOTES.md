# Notas do Projeto - Aplicativo de Dieta

Este documento resume as discussões e o planejamento do projeto do aplicativo de dieta, servindo como referência para o desenvolvimento contínuo.

## 1. Contexto do Projeto

Estamos desenvolvendo um aplicativo de dieta com as seguintes funcionalidades principais:
- **Ficha de Anamnese:** Para coletar dados iniciais dos clientes.
- **Acompanhamento Quinzenal:** Para registrar peso, medidas e fotos de progresso.
- **Cálculo de Composição Corporal:** Automático, usando a fórmula da Marinha dos EUA.
- **Painel de Clientes (Dashboard):** Para visualizar o histórico de acompanhamentos e cálculos.

**Status Atual (21 de Julho de 2025):**
- Projeto organizado no diretório `/App de dieta`.
- Repositório Git inicializado e sincronizado com o GitHub (`Aplicativodetreino`).
- Servidor Node.js (`server.js`) em funcionamento, lidando com o formulário de anamnese e acompanhamento.
- Links para teste:
    - Ficha de Anamnese: `http://192.168.1.36:3000/index.html`
    - Dashboard: `http://192.168.1.36:3000/dashboard.html`

## 2. Descrição da Planilha Excel (Referência para Automação)

A planilha "planilha teste.xlsx" possui 11 abas, com as seguintes descrições:

1.  **Respostas ao formulário** (36 linhas × 43 colunas):
    - Dados importados do Google Forms com anamnese: nome, email, peso, altura, idade, sexo, hábitos alimentares, doenças, histórico familiar, uso de esteroides, objetivos, feedback semanal. Não possui fórmulas.

2.  **Avaliação Homem** (23 × 10):
    - Avaliação antropométrica: IMC, circunferências corporais. Pode conter fórmula de IMC. Uso clínico.

3.  **Anamnese** (274 × 31):
    - Dados completos do cliente: rotina, alimentação, sono, intestino, objetivos, alergias, restrições, tipo de dieta preferida. Pode ter validação por lista.

4.  **Impressão 1 / 2 / 3**:
    - Layouts de impressão prontos para gerar PDFs com plano alimentar, refeição por refeição. Algumas células referenciam outras abas como "Plano Alimentar 1".

5.  **Plano Alimentar 1 / 2 / 3** (~210 × 24 cada):
    - Estrutura dividida por refeições. Contém alimento, quantidade, substituições, hora e total de macros. Tem fórmulas de soma de calorias e macros. Tabelas com bordas e cores suaves.

6.  **Tabela Nutricional** (789 × 12):
    - Banco de dados nutricional com valores de cada alimento: kcal, proteína, carbo, gordura. Usado para montar planos. Dados estáticos.

7.  **Manipulados** (57 × 6):
    - Lista de fórmulas manipuladas por objetivo, com ingredientes e posologia. Sem fórmulas.

**Objetivo Geral:** Permitir que, ao inserir um novo cliente no formulário, os dados se espalhem pelas outras abas automaticamente, gerando plano alimentar personalizado, sugestão de manipulado e impressão pronta.

## 3. Ideias e Sugestões para Automação (Próximos Passos)

Para automatizar o fluxo de dados e integrar a lógica da planilha ao aplicativo, as seguintes ideias foram propostas:

1.  **Centralizar e Enriquecer os Dados do Cliente:**
    - Fazer do `anamnese-data.json` (ou um banco de dados futuro) a única fonte de verdade para todos os dados do cliente, garantindo que todas as informações relevantes sejam salvas de forma estruturada.

2.  **Digitalizar Tabelas de Referência:**
    - Converter as abas "Tabela Nutricional" e "Manipulados" em arquivos JSON (`tabela-nutricional.json`, `manipulados.json`) ou armazená-los em um banco de dados para consulta pelo `server.js`.

3.  **Migrar Lógica de Cálculos para o Servidor (`server.js`):**
    - Implementar as fórmulas de cálculo de avaliação antropométrica (IMC, etc.) e de macros (soma de calorias, proteínas, carboidratos, gorduras) diretamente no `server.js`.

4.  **Gerar Planos Alimentares Dinamicamente:**
    - Criar um sistema no `server.js` que monte planos alimentares personalizados para cada cliente, utilizando as tabelas digitalizadas e regras/templates programáticos.

5.  **Automatizar Sugestão de Manipulados:**
    - Implementar lógica no `server.js` para sugerir manipulados relevantes com base nos dados da anamnese e na tabela "Manipulados" digitalizada.

6.  **Gerar Relatórios de Impressão (PDF) Dinamicamente:**
    - Substituir as abas "Impressão" do Excel por um gerador de PDF no `server.js` (usando bibliotecas como `puppeteer` ou `pdfkit`) para criar PDFs formatados com os dados do cliente, plano e manipulados.

7.  **Aprimorar o Dashboard:**
    - Atualizar o `dashboard.html` e `dashboard.js` para exibir todas as novas informações geradas (cálculos, plano, manipulados, links para PDFs).

## 4. Sincronização entre Dispositivos (Celular e Tablet)

Para garantir que o trabalho seja contínuo e as informações estejam sempre atualizadas em ambos os dispositivos:

-   **GitHub é o centro:** Todas as suas alterações devem ser enviadas para o GitHub.
-   **`git pull origin main` antes de começar:** Sempre puxe as últimas alterações do GitHub para o dispositivo em que você vai trabalhar.
-   **`git add .`, `git commit -m "Sua mensagem"`, `git push origin main` depois de terminar:** Sempre envie suas alterações para o GitHub quando terminar uma sessão de trabalho ou quiser trocar de dispositivo.
-   **Personal Access Token (PAT):** Lembre-se de usar seu PAT (`SEU_PERSONAL_ACCESS_TOKEN_AQUI`) para autenticação via HTTPS ao clonar ou enviar/puxar do GitHub.
