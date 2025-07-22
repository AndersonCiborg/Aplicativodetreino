document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('anamneseForm');
    const statusMessage = document.getElementById('status-message');
    const quadrilInicialDiv = document.getElementById('quadril-inicial-div');
    const sexoRadios = document.getElementsByName('sexo');

    // --- Funções para mostrar/esconder campos condicionais ---
    function setupConditionalDisplay(radioGroupName, conditionalDivId, showValue = 'Sim') {
        const radios = document.getElementsByName(radioGroupName);
        const conditionalDiv = document.getElementById(conditionalDivId);
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                const shouldShow = radio.value === showValue && radio.checked;
                conditionalDiv.style.display = shouldShow ? 'block' : 'none';
                // Torna os campos dentro da div obrigatórios apenas se ela estiver visível
                conditionalDiv.querySelectorAll('input, select, textarea').forEach(el => {
                    if (shouldShow) {
                        el.setAttribute('required', '');
                    } else {
                        el.removeAttribute('required');
                    }
                });
            });
        });
    }

    setupConditionalDisplay('usaMedicacao', 'medicacaoDescricaoDiv');
    setupConditionalDisplay('usaAnticoncepcional', 'anticoncepcionalTipoDiv');
    setupConditionalDisplay('intestinoPreso', 'frequenciaEvacuatoriaDiv');
    setupConditionalDisplay('praticaAtividade', 'detalhesTreinoDiv');
    setupConditionalDisplay('usaSuplementos', 'suplementosNomesDiv');
    setupConditionalDisplay('usouHormonios', 'hormoniosNomesDiv');
    setupConditionalDisplay('fazJejum', 'horasJejumDiv');

    // Lógica condicional para o campo Quadril na Anamnese
    sexoRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'Feminino' && radio.checked) {
                quadrilInicialDiv.style.display = 'block';
                document.getElementById('quadrilInicial').setAttribute('required', '');
            } else {
                quadrilInicialDiv.style.display = 'none';
                document.getElementById('quadrilInicial').removeAttribute('required');
                document.getElementById('quadrilInicial').value = ''; // Limpa o valor
            }
        });
    });

    // --- Atualizar valor do slider de esforço ---
    const nivelEsforco = document.getElementById('nivelEsforco');
    const esforcoValue = document.getElementById('esforcoValue');
    if (nivelEsforco && esforcoValue) {
        nivelEsforco.addEventListener('input', () => {
            esforcoValue.textContent = nivelEsforco.value;
        });
    }

    // --- Lógica do Formulário ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearAllValidationStyles();
        hideStatusMessage();

        if (!validateForm()) {
            showStatusMessage('Por favor, preencha todos os campos obrigatórios destacados em vermelho.', 'error');
            return;
        }

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
            if (jsonData[key]) {
                if (Array.isArray(jsonData[key])) {
                    jsonData[key].push(value);
                } else {
                    jsonData[key] = [jsonData[key], value];
                }
            } else {
                jsonData[key] = value;
            }
        });

        const structuredData = buildStructuredData(jsonData);

        // Envia os dados para o servidor
        fetch('/salvar-dados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(structuredData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            showStatusMessage('Enviado com sucesso!', 'success');
            form.reset();
            // Esconde a mensagem de sucesso após alguns segundos
            setTimeout(hideStatusMessage, 5000);
        })
        .catch((error) => {
            console.error('Error:', error);
            showStatusMessage('Houve um erro ao enviar os dados. Por favor, tente novamente.', 'error');
        });
    });

    function validateForm() {
        let isValid = true;
        let firstInvalidElement = null;
        const validatedRadioGroups = new Set(); // Para evitar re-validar o mesmo grupo de rádio

        // Validação de campos com atributo required
        form.querySelectorAll('input[required], select[required], textarea[required]').forEach(el => {
            // Verifica se o elemento está visível
            if (el.offsetParent !== null) { 
                if (!el.value.trim()) {
                    isValid = false; 
                    highlightInvalidField(el);
                    if (!firstInvalidElement) {
                        firstInvalidElement = el;
                    }
                }
            }
        });

        // Validação para grupos de rádio (agora sem o atributo required nos inputs individuais)
        const radioGroupNamesToValidate = [
            'sexo', 'objetivo', 'rotina', 'usaMedicacao', 'usaAnticoncepcional',
            'menstruacaoRegular', 'intestinoPreso', 'praticaAtividade',
            'usaSuplementos', 'usouHormonios', 'fezExames', 'usouTermogenicos',
            'dormeBem', 'senteEstresse', 'temDificuldadeFoco', 'acompanhamentoPsicologico',
            'costumaBeliscar', 'comeDoces', 'comeAntesDormir', 'fazJejum'
        ];

        radioGroupNamesToValidate.forEach(groupName => {
            const radioGroup = form.querySelectorAll(`input[name="${groupName}"]`);
            if (radioGroup.length > 0 && ![...radioGroup].some(radio => radio.checked)) {
                isValid = false;
                highlightInvalidField(radioGroup[0]); // Destaca o primeiro botão de rádio no grupo
                if (!firstInvalidElement) {
                    firstInvalidElement = radioGroup[0];
                }
            }
        });

        if (firstInvalidElement) {
            firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    function highlightInvalidField(element) {
        // Para inputs de texto, número, email, select, textarea, destaca o próprio input
        if (element.type !== 'radio' && element.type !== 'checkbox') {
            element.classList.add('border-red-500', 'ring-2', 'ring-red-500');
            const label = form.querySelector(`label[for='${element.id}']`);
            if (label) {
                label.classList.add('text-red-500');
            }
        } else { // Para inputs de rádio e checkbox
            // Encontra a label da pergunta principal do grupo
            const groupContainer = element.closest('.flex.flex-wrap.gap-4');
            if (groupContainer) {
                const questionLabel = groupContainer.previousElementSibling; // A label antes da div
                if (questionLabel && questionLabel.tagName === 'LABEL') {
                    questionLabel.classList.add('text-red-500');
                }
            }
        }

        // Sempre destaca o título da seção (h2) do card pai
        const parentDiv = element.closest('.bg-white.rounded-xl');
        if (parentDiv) {
            const h2 = parentDiv.querySelector('h2');
            if (h2) {
                h2.classList.add('text-red-500');
            }
        }
    }

    function clearAllValidationStyles() {
        form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500', 'ring-2', 'ring-red-500'));
        form.querySelectorAll('.text-red-500').forEach(el => el.classList.remove('text-red-500'));
    }

    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'border-green-400', 'bg-red-100', 'text-red-800', 'border-red-400');
        statusMessage.classList.add('block', 'p-3', 'rounded-md', 'border');

        if (type === 'success') {
            statusMessage.classList.add('bg-green-100', 'text-green-800', 'border-green-400');
        } else if (type === 'error') {
            statusMessage.classList.add('bg-red-100', 'text-red-800', 'border-red-400');
        }
    }

    function hideStatusMessage() {
        statusMessage.classList.add('hidden');
        statusMessage.classList.remove('block', 'p-3', 'rounded-md', 'border', 'bg-green-100', 'text-green-800', 'border-green-400', 'bg-red-100', 'text-red-800', 'border-red-400');
    }

    function buildStructuredData(jsonData) {
        // (Esta função permanece a mesma de antes)
        return {
            dadosGerais: {
                nomeCompleto: jsonData.nomeCompleto,
                idade: jsonData.idade,
                sexo: jsonData.sexo,
                peso: jsonData.peso,
                altura: jsonData.altura,
                dataNascimento: jsonData.dataNascimento,
                email: jsonData.email,
                telefone: jsonData.telefone,
                horaAcorda: jsonData.horaAcorda,
                horaDorme: jsonData.horaDorme
            },
            objetivoRotina: {
                objetivo: jsonData.objetivo,
                dietaTentada: jsonData.dietaTentada || [],
                resultadoDieta: jsonData.resultadoDieta,
                rotina: jsonData.rotina
            },
            habitosConsumos: {
                aguaPorDia: jsonData.aguaPorDia,
                usaMedicacao: jsonData.usaMedicacao,
                medicacaoDescricao: jsonData.medicacaoDescricao,
                medicacaoTipo: jsonData.medicacaoTipo || [],
                usaAnticoncepcional: jsonData.usaAnticoncepcional,
                anticoncepcionalTipo: jsonData.anticoncepcionalTipo,
                menstruacaoRegular: jsonData.menstruacaoRegular,
                intestinoPreso: jsonData.intestinoPreso,
                frequenciaEvacuatoria: jsonData.frequenciaEvacuatoria
            },
            sintomasGerais: {
                sintomas: jsonData.sintomas || []
            },
            treinoAtividadeFisica: {
                praticaAtividade: jsonData.praticaAtividade,
                qualAtividade: jsonData.qualAtividade,
                frequenciaSemanal: jsonData.frequenciaSemanal,
                tempoTreinoDiario: jsonData.tempoTreinoDiario,
                horarioTreino: jsonData.horarioTreino,
                fatorAtividade: jsonData.fatorAtividade,
                nivelEsforco: jsonData.nivelEsforco
            },
            suplementosHormoniosHistorico: {
                usaSuplementos: jsonData.usaSuplementos,
                suplementosNomes: jsonData.suplementosNomes,
                usouHormonios: jsonData.usouHormonios,
                hormoniosNomes: jsonData.hormoniosNomes,
                efeitoColateral: jsonData.efeitoColateral || [],
                fezExames: jsonData.fezExames,
                usouTermogenicos: jsonData.usouTermogenicos,
                doencasPreexistentes: jsonData.doencasPreexistentes,
                historicoFamiliarDoencas: jsonData.historicoFamiliarDoencas
            },
            emocionalComportamental: {
                dormeBem: jsonData.dormeBem,
                horasSono: jsonData.horasSono,
                senteEstresse: jsonData.senteEstresse,
                temDificuldadeFoco: jsonData.temDificuldadeFoco,
                acompanhamentoPsicologico: jsonData.acompanhamentoPsicologico
            },
            habitosAlimentares: {
                cafeDaManha: jsonData.cafeDaManha,
                almoco: jsonData.almoco,
                jantar: jsonData.jantar,
                costumaBeliscar: jsonData.costumaBeliscar,
                comeDoces: jsonData.comeDoces,
                comeAntesDormir: jsonData.comeAntesDormir,
                fazJejum: jsonData.fazJejum,
                horasJejum: jsonData.horasJejum,
                alergias: jsonData.alergias || [],
                preferenciaAlimentar: jsonData.preferenciaAlimentar || []
            },
            observacoesFinais: {
                observacoes: jsonData.observacoes
            }
        };
    }
});