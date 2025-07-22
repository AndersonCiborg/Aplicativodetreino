const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Carregar a tabela nutricional
let tabelaNutricional = [];
try {
    const data = fs.readFileSync(path.join(__dirname, 'tabela-nutricional.json'), 'utf8');
    tabelaNutricional = JSON.parse(data);
    console.log('Tabela Nutricional carregada com sucesso.');
} catch (err) {
    console.error('Erro ao carregar a Tabela Nutricional:', err);
}

// Função para calcular o Gasto Energético Total (GET) usando a fórmula de Harris-Benedict
function calculateHarrisBenedictGET(sexo, pesoKg, alturaCm, idadeAnos, fatorAtividade) {
    let tmb;

    if (sexo === 'Masculino') {
        tmb = 66 + (13.7 * pesoKg) + (5 * alturaCm) - (6.8 * idadeAnos);
    } else if (sexo === 'Feminino') {
        tmb = 655 + (9.6 * pesoKg) + (1.8 * alturaCm) - (4.7 * idadeAnos);
    } else {
        // Caso o sexo não seja Masculino ou Feminino, ou dados inválidos
        return null;
    }

    // Fatores de atividade física (exemplo, podem ser ajustados)
    let get;
    switch (fatorAtividade) {
        case 'sedentario':
            get = tmb * 1.2;
            break;
        case 'levemente_ativo':
            get = tmb * 1.375;
            break;
        case 'moderadamente_ativo':
            get = tmb * 1.55;
            break;
        case 'muito_ativo':
            get = tmb * 1.725;
            break;
        case 'extremamente_ativo':
            get = tmb * 1.9;
            break;
        default:
            get = tmb; // Se nenhum fator for especificado, retorna apenas a TMB
    }

    return parseFloat(get.toFixed(2));
}

// Função auxiliar para pegar um item aleatório de um array
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Função para gerar um plano alimentar
function generateMealPlan(clientData, tabelaNutricional) {
    const planoAlimentar = [];
    let totalPtnAnimal = 0;
    let totalPtnVegetal = 0;
    let totalCho = 0;
    let totalFat = 0;
    let totalKcal = 0;

    // Refeições fixas para o plano
    const refeicoes = [
        { nome: "Desjejum", horario: "07:00" },
        { nome: "Lanche da Manhã", horario: "10:00" },
        { nome: "Almoço", horario: "13:00" },
        { nome: "Lanche da Tarde", horario: "16:00" },
        { nome: "Jantar", horario: "20:00" }
    ];

    refeicoes.forEach(refeicaoInfo => {
        const itensRefeicao = [];
        let alimentosParaRefeicao = [];

        // Lógica de seleção de alimentos por refeição (exemplo básico)
        if (refeicaoInfo.nome === "Desjejum") {
            // Exemplo: 1 proteína (PTN) e 1 carboidrato (CHO)
            const proteinas = tabelaNutricional.filter(item => item.categoria === 'PTN');
            const carboidratos = tabelaNutricional.filter(item => item.categoria === 'CHO');

            if (proteinas.length > 0) {
                alimentosParaRefeicao.push(getRandomItem(proteinas));
            }
            if (carboidratos.length > 0) {
                alimentosParaRefeicao.push(getRandomItem(carboidratos));
            }
        } else if (refeicaoInfo.nome === "Almoço" || refeicaoInfo.nome === "Jantar") {
            // Exemplo: 1 proteína (PTN), 1 carboidrato (CHO), 1 vegetal (VEGETAL/FOLHA)
            const proteinas = tabelaNutricional.filter(item => item.categoria === 'PTN');
            const carboidratos = tabelaNutricional.filter(item => item.categoria === 'CHO');
            const vegetais = tabelaNutricional.filter(item => item.categoria === 'VEGETAL' || item.categoria === 'FOLHA');

            if (proteinas.length > 0) {
                alimentosParaRefeicao.push(getRandomItem(proteinas));
            }
            if (carboidratos.length > 0) {
                alimentosParaRefeicao.push(getRandomItem(carboidratos));
            }
            if (vegetais.length > 0) {
                alimentosParaRefeicao.push(getRandomItem(vegetais));
            }
        } else { // Lanches
            // Exemplo: 1 carboidrato (CHO) ou 1 gordura (FAT)
            const carboidratos = tabelaNutricional.filter(item => item.categoria === 'CHO');
            const gorduras = tabelaNutricional.filter(item => item.categoria === 'FAT');

            if (carboidratos.length > 0) {
                alimentosParaRefeicao.push(getRandomItem(carboidratos));
            } else if (gorduras.length > 0) {
                alimentosParaRefeicao.push(getRandomItem(gorduras));
            }
        }

        alimentosParaRefeicao.forEach(alimentoData => {
            // Para simplificar, vamos assumir uma porção padrão ou a medida da tabela
            // Em um cenário real, a quantidade seria calculada com base nas necessidades do cliente
            const quantidade = alimentoData.medida === 'g' ? '100g' : '1 unidade'; // Exemplo de quantidade
            const ptn_animal = alimentoData.ptn_animal || 0;
            const ptn_vegetal = alimentoData.ptn_vegetal || 0;
            const cho = alimentoData.cho || 0;
            const fat = alimentoData.fat || 0;
            // Para kcal, você precisaria de um cálculo mais preciso (ex: 4kcal/g CHO, 4kcal/g PTN, 9kcal/g FAT)
            // Por enquanto, vamos usar um valor placeholder ou calcular com base nos macros se tivermos os valores por grama
            const kcal = (ptn_animal + ptn_vegetal) * 4 + cho * 4 + fat * 9; // Exemplo de cálculo de kcal

            itensRefeicao.push({
                alimento: alimentoData.nome,
                quantidade: quantidade,
                medida: alimentoData.medida,
                macros: {
                    ptn_animal: parseFloat(ptn_animal.toFixed(2)),
                    ptn_vegetal: parseFloat(ptn_vegetal.toFixed(2)),
                    cho: parseFloat(cho.toFixed(2)),
                    fat: parseFloat(fat.toFixed(2)),
                    kcal: parseFloat(kcal.toFixed(2))
                }
            });

            totalPtnAnimal += ptn_animal;
            totalPtnVegetal += ptn_vegetal;
            totalCho += cho;
            totalFat += fat;
            totalKcal += kcal;
        });

        planoAlimentar.push({
            refeicao: refeicaoInfo.nome,
            horario: refeicaoInfo.horario,
            itens: itensRefeicao
        });
    });

    return {
        planoAlimentar: planoAlimentar,
        macrosTotais: {
            ptn_animal: parseFloat(totalPtnAnimal.toFixed(2)),
            ptn_vegetal: parseFloat(totalPtnVegetal.toFixed(2)),
            cho: parseFloat(totalCho.toFixed(2)),
            fat: parseFloat(totalFat.toFixed(2)),
            calorias: parseFloat(totalKcal.toFixed(2))
        }
    };
}

// --- Configuração do Multer para Upload de Arquivos ---
// Configuração de armazenamento para anamnese inicial (temporário, pois clientId ainda não existe)
const initialAnamneseStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempUploadPath = path.join(__dirname, 'uploads', 'temp');
        fs.mkdirSync(tempUploadPath, { recursive: true });
        cb(null, tempUploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const uploadInitialAnamnese = multer({ storage: initialAnamneseStorage });

// Configuração de armazenamento para acompanhamentos (clientId já existe)
const acompanhamentoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const clientId = req.body.clientId;
        if (!clientId) {
            return cb(new Error('ID do cliente não encontrado no corpo da requisição'), null);
        }
        const uploadPath = path.join(__dirname, 'uploads', clientId);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const uploadAcompanhamento = multer({ storage: acompanhamentoStorage });

// --- Servir arquivos estáticos (HTML, CSS, JS) ---
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota principal para servir o formulário de anamnese
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware para permitir que o servidor entenda JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para receber os dados do formulário de anamnese (via POST)
app.post('/salvar-dados', uploadInitialAnamnese.fields([
    { name: 'fotoFrenteInicial', maxCount: 1 },
    { name: 'fotoLadoInicial', maxCount: 1 },
    { name: 'fotoCostasInicial', maxCount: 1 }
]), (req, res) => {
    const novosDados = req.body;
    const files = req.files; // Arquivos enviados pelo Multer
    const filePath = path.join(__dirname, 'anamnese-data.json');

    // Adiciona um ID único e a data de recebimento
    const clientId = `cliente_${Date.now()}`;
    novosDados.id = clientId;
    novosDados.recebidoEm = new Date().toISOString();

    // Calcula o GET usando Harris-Benedict
    const pesoKg = parseFloat(novosDados.dadosGerais.peso);
    const alturaCm = parseFloat(novosDados.dadosGerais.altura);
    const idadeAnos = parseInt(novosDados.dadosGerais.idade);
    const sexo = novosDados.dadosGerais.sexo;
    const fatorAtividade = novosDados.treinoAtividadeFisica.fatorAtividade;

    if (!isNaN(pesoKg) && !isNaN(alturaCm) && !isNaN(idadeAnos) && sexo && fatorAtividade) {
        const getHarrisBenedict = calculateHarrisBenedictGET(sexo, pesoKg, alturaCm, idadeAnos, fatorAtividade);
        if (getHarrisBenedict !== null) {
            if (!novosDados.calculos) {
                novosDados.calculos = {};
            }
            novosDados.calculos.getHarrisBenedict = getHarrisBenedict;
        }
    }

    // Processa as fotos iniciais
    if (files) {
        novosDados.fotosIniciais = {};
        const clientUploadPath = path.join(__dirname, 'uploads', clientId);
        fs.mkdirSync(clientUploadPath, { recursive: true }); // Cria a pasta final do cliente

        for (const fieldName in files) {
            const file = files[fieldName][0];
            const oldPath = file.path;
            const newPath = path.join(clientUploadPath, file.filename);
            fs.renameSync(oldPath, newPath); // Move o arquivo da pasta temp para a pasta do cliente
            novosDados.fotosIniciais[fieldName] = `/uploads/${clientId}/${file.filename}`;
        }
    }

    // Gera o plano alimentar (usando a função placeholder por enquanto)
    novosDados.planoAlimentarGerado = generateMealPlan(novosDados, tabelaNutricional);

    fs.readFile(filePath, 'utf8', (err, data) => {
        let todosOsDados = [];
        if (!err && data) {
            try {
                todosOsDados = JSON.parse(data);
                if (!Array.isArray(todosOsDados)) {
                    todosOsDados = [];
                }
            } catch (e) {
                console.error("Erro ao parsear JSON existente, iniciando um novo array.");
                todosOsDados = [];
            }
        }

        todosOsDados.push(novosDados);

        fs.writeFile(filePath, JSON.stringify(todosOsDados, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo:', err);
                return res.status(500).json({ message: 'Erro ao salvar os dados.' });
            }
            console.log('Dados recebidos e salvos com sucesso!');
            res.status(200).json({ message: 'Dados recebidos com sucesso!', id: novosDados.id });
        });
    });
});

// Rota para o painel de controle obter os dados
app.get('/api/dados', (req, res) => {
    const filePath = path.join(__dirname, 'anamnese-data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            console.error('Erro ao ler o arquivo:', err);
            return res.status(500).json({ message: 'Erro ao ler os dados.' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            console.error('Erro ao parsear o JSON dos dados:', e);
            res.status(500).json({ message: 'Erro ao processar os dados.' });
        }
    });
});

// Rota para servir a página do painel
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rota para servir a página de acompanhamento
app.get('/acompanhamento', (req, res) => {
    res.sendFile(path.join(__dirname, 'acompanhamento.html'));
});

// Rota para salvar os dados do formulário de acompanhamento
app.post('/salvar-acompanhamento', uploadAcompanhamento.fields([
    { name: 'fotoFrente', maxCount: 1 },
    { name: 'fotoLado', maxCount: 1 },
    { name: 'fotoCostas', maxCount: 1 }
]), (req, res) => {
    const { clientId, peso, pescoco, cintura, quadril } = req.body;
    const files = req.files;

    if (!clientId || !peso || !files) {
        return res.status(400).json({ message: 'Dados essenciais (ID, peso, fotos) estão faltando.' });
    }

    const filePath = path.join(__dirname, 'anamnese-data.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao ler o banco de dados.' });
        }

        let todosOsDados = JSON.parse(data);
        const clientIndex = todosOsDados.findIndex(c => c.id === clientId);

        if (clientIndex === -1) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        // Cria o novo registro de acompanhamento
        const novoAcompanhamento = {
            data: new Date().toISOString(),
            peso: peso,
            medidas: {
                pescoco: pescoco,
                cintura: cintura,
                quadril: quadril || null // Salva null se não for fornecido
            },
            fotos: {
                frente: `/uploads/${clientId}/${files.fotoFrente[0].filename}`,
                lado: `/uploads/${clientId}/${files.fotoLado[0].filename}`,
                costas: `/uploads/${clientId}/${files.fotoCostas[0].filename}`
            }
        };

        // --- Início dos Cálculos de Composição Corporal ---
        const clientData = todosOsDados[clientIndex];
        const sexo = clientData.dadosGerais.sexo;
        const alturaCm = parseFloat(clientData.dadosGerais.altura);

        if (alturaCm && peso && pescoco && cintura) {
            const alturaIn = alturaCm / 2.54;
            const pescocoIn = parseFloat(pescoco) / 2.54;
            const cinturaIn = parseFloat(cintura) / 2.54;
            let bodyFatPercentage = 0;

            if (sexo === 'Masculino') {
                bodyFatPercentage = 86.010 * Math.log10(cinturaIn - pescocoIn) - 70.041 * Math.log10(alturaIn) + 36.76;
            } else if (sexo === 'Feminino') {
                const quadrilIn = parseFloat(quadril) / 2.54;
                if (quadrilIn) {
                    bodyFatPercentage = 163.205 * Math.log10(cinturaIn + quadrilIn - pescocoIn) - 97.684 * Math.log10(alturaIn) - 78.387;
                }
            }

            bodyFatPercentage = Math.max(0, bodyFatPercentage);

            const massaGordaKg = (parseFloat(peso) * bodyFatPercentage) / 100;
            const massaMagraKg = parseFloat(peso) - massaGordaKg;

            novoAcompanhamento.calculos = {
                percentualGordura: parseFloat(bodyFatPercentage.toFixed(2)),
                massaGordaKg: parseFloat(massaGordaKg.toFixed(2)),
                massaMagraKg: parseFloat(massaMagraKg.toFixed(2))
            };
        }
        // --- Fim dos Cálculos de Composição Corporal ---

        // Adiciona o acompanhamento ao histórico do cliente
        if (!todosOsDados[clientIndex].acompanhamentos) {
            todosOsDados[clientIndex].acompanhamentos = [];
        }
        todosOsDados[clientIndex].acompanhamentos.push(novoAcompanhamento);

        // Salva os dados atualizados
        fs.writeFile(filePath, JSON.stringify(todosOsDados, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar acompanhamento:', err);
                return res.status(500).json({ message: 'Erro ao salvar os dados de acompanhamento.' });
            }
            res.status(200).json({ message: 'Acompanhamento salvo com sucesso!' });
        });
    });
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});