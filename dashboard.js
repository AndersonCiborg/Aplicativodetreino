document.addEventListener('DOMContentLoaded', () => {
    const loadingDiv = document.getElementById('loading');
    const clientListContainer = document.getElementById('client-list-container');
    const clientDetailContainer = document.getElementById('client-detail-container');
    const detailContent = document.getElementById('detail-content');
    const backButton = document.getElementById('back-to-list');

    let allClientData = []; // Para armazenar os dados dos clientes

    function showListView() {
        clientDetailContainer.classList.add('hidden');
        clientListContainer.classList.remove('hidden');
    }

    function showDetailView() {
        clientListContainer.classList.add('hidden');
        clientDetailContainer.classList.remove('hidden');
    }

    // Função auxiliar para renderizar uma seção de dados
    function renderSection(parentEl, title, data, iconClass) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'bg-white rounded-xl shadow-md p-6 mb-6 md:p-8';

        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'text-2xl font-bold text-gray-900 mb-6 flex items-center';
        sectionTitle.innerHTML = `<i class="${iconClass} mr-3"></i> ${title}`;
        sectionDiv.appendChild(sectionTitle);

        const dataContainer = document.createElement('div');
        dataContainer.className = 'space-y-2';

        if (data) {
            for (const key in data) {
                if (Object.hasOwnProperty.call(data, key)) {
                    let value = data[key];
                    let displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // CamelCase para Espaços

                    if (Array.isArray(value)) {
                        if (value.length > 0) {
                            const list = document.createElement('ul');
                            list.className = 'list-disc list-inside ml-4';
                            const listItemTitle = document.createElement('p');
                            listItemTitle.className = 'text-gray-700';
                            listItemTitle.innerHTML = `<strong>${displayKey}:</strong>`;
                            dataContainer.appendChild(listItemTitle);
                            value.forEach(item => {
                                const li = document.createElement('li');
                                li.className = 'text-gray-600 break-words';
                                li.textContent = item;
                                list.appendChild(li);
                            });
                            dataContainer.appendChild(list);
                        } else {
                            const p = document.createElement('p');
                            p.className = 'text-gray-600';
                            p.innerHTML = `<strong>${displayKey}:</strong> Não informado`;
                            dataContainer.appendChild(p);
                        }
                    } else if (value) {
                        const p = document.createElement('p');
                        p.className = 'text-gray-700 break-words';
                        // Formata datas
                        if (key.includes('data') && !isNaN(new Date(value))) {
                            value = new Date(value).toLocaleDateString('pt-BR');
                        }
                        p.innerHTML = `<strong>${displayKey}:</strong> ${value}`;
                        dataContainer.appendChild(p);
                    } else {
                        const p = document.createElement('p');
                        p.className = 'text-gray-600';
                        p.innerHTML = `<strong>${displayKey}:</strong> Não informado`;
                        dataContainer.appendChild(p);
                    }
                }
            }
        } else {
            const p = document.createElement('p');
            p.className = 'text-gray-600 italic';
            p.textContent = 'Nenhum dado disponível para esta seção.';
            dataContainer.appendChild(p);
        }

        sectionDiv.appendChild(dataContainer);
        parentEl.appendChild(sectionDiv);
    }

    function displayClientDetails(clientId) {
        const clientData = allClientData.find(client => client.id === clientId);
        if (clientData) {
            detailContent.innerHTML = ''; // Limpa o conteúdo anterior

            // Renderiza a data de envio da anamnese inicial
            if (clientData.recebidoEm) {
                const receivedDateDiv = document.createElement('div');
                receivedDateDiv.className = 'bg-white rounded-xl shadow-md p-6 mb-6 md:p-8 text-center text-gray-700';
                receivedDateDiv.innerHTML = `<p>Anamnese inicial enviada em: <strong>${new Date(clientData.recebidoEm).toLocaleString('pt-BR')}</strong></p>`;
                detailContent.appendChild(receivedDateDiv);
            }

            // Renderiza cada seção da anamnese
            renderSection(detailContent, 'Dados Gerais', clientData.dadosGerais, 'fas fa-user-circle');
            
            // Exibe as fotos iniciais
            if (clientData.fotosIniciais && (clientData.fotosIniciais.fotoFrenteInicial || clientData.fotosIniciais.fotoLadoInicial || clientData.fotosIniciais.fotoCostasInicial)) {
                const fotosIniciaisDiv = document.createElement('div');
                fotosIniciaisDiv.className = 'bg-white rounded-xl shadow-md p-6 mb-6 md:p-8';
                fotosIniciaisDiv.innerHTML = `
                    <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <i class="fas fa-camera mr-3"></i> Fotos Iniciais
                    </h2>
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${clientData.fotosIniciais.fotoFrenteInicial ? `<img src="${clientData.fotosIniciais.fotoFrenteInicial}" alt="Foto Frente Inicial" class="w-24 h-24 object-cover rounded-md shadow-sm">` : ''}
                        ${clientData.fotosIniciais.fotoLadoInicial ? `<img src="${clientData.fotosIniciais.fotoLadoInicial}" alt="Foto Lado Inicial" class="w-24 h-24 object-cover rounded-md shadow-sm">` : ''}
                        ${clientData.fotosIniciais.fotoCostasInicial ? `<img src="${clientData.fotosIniciais.fotoCostasInicial}" alt="Foto Costas Inicial" class="w-24 h-24 object-cover rounded-md shadow-sm">` : ''}
                    </div>
                `;
                detailContent.appendChild(fotosIniciaisDiv);
            }

            renderSection(detailContent, 'Objetivos e Rotina', clientData.objetivoRotina, 'fas fa-bullseye');
            renderSection(detailContent, 'Hábitos e Consumos', clientData.habitosConsumos, 'fas fa-coffee');
            renderSection(detailContent, 'Sintomas Gerais', clientData.sintomasGerais, 'fas fa-head-side-cough');
            renderSection(detailContent, 'Treino / Atividade Física', clientData.treinoAtividadeFisica, 'fas fa-dumbbell');
            renderSection(detailContent, 'Suplementos / Hormônios / Histórico', clientData.suplementosHormoniosHistorico, 'fas fa-pills');
            renderSection(detailContent, 'Emocional e Comportamental', clientData.emocionalComportamental, 'fas fa-brain');
            renderSection(detailContent, 'Hábitos Alimentares', clientData.habitosAlimentares, 'fas fa-apple-alt');
            renderSection(detailContent, 'Observações Finais', clientData.observacoesFinais, 'fas fa-comment-dots');

            // Renderiza o plano alimentar gerado
            if (clientData.planoAlimentarGerado) {
                renderPlanoAlimentar(detailContent, clientData.planoAlimentarGerado, clientId);
            }

            // Exibe o histórico de acompanhamentos
            if (clientData.acompanhamentos && clientData.acompanhamentos.length > 0) {
                const acompanhamentosTitle = document.createElement('h3');
                acompanhamentosTitle.className = 'text-2xl font-bold text-gray-900 mb-4';
                acompanhamentosTitle.textContent = 'Histórico de Acompanhamentos:';
                detailContent.appendChild(acompanhamentosTitle);

                clientData.acompanhamentos.sort((a, b) => new Date(b.data) - new Date(a.data)); // Mais recente primeiro

                clientData.acompanhamentos.forEach((acompanhamento, index) => {
                    const acompanhamentoDiv = document.createElement('div');
                    acompanhamentoDiv.className = 'bg-white rounded-xl shadow-md p-6 mb-6 md:p-8';
                    acompanhamentoDiv.innerHTML = `
                        <h4 class="text-xl font-bold text-blue-700 mb-4">Acompanhamento em: ${new Date(acompanhamento.data).toLocaleString('pt-BR')}</h4>
                        <p class="text-gray-700 mb-1 break-words"><strong>Peso:</strong> ${acompanhamento.peso} kg</p>
                        <p class="text-gray-700 mb-1 break-words"><strong>Medidas:</strong> Pescoço: ${acompanhamento.medidas?.pescoco || 'N/A'}cm, Cintura: ${acompanhamento.medidas?.cintura || 'N/A'}cm${acompanhamento.medidas?.quadril ? `, Quadril: ${acompanhamento.medidas.quadril}cm` : ''}</p>
                        ${acompanhamento.calculos ? `
                            <p class="text-gray-700 mb-1 break-words"><strong>Cálculos:</strong> % Gordura: ${acompanhamento.calculos.percentualGordura}%, Massa Gorda: ${acompanhamento.calculos.massaGordaKg}kg, Massa Magra: ${acompanhamento.calculos.massaMagraKg}kg</p>
                        ` : ''}
                        <p class="text-gray-700 mt-2"><strong>Fotos:</strong></p>
                        <div class="flex flex-wrap gap-2 mt-2">
                            ${acompanhamento.fotos?.frente ? `<img src="${acompanhamento.fotos.frente}" alt="Foto Frente" class="w-24 h-24 object-cover rounded-md shadow-sm">` : ''}
                            ${acompanhamento.fotos?.lado ? `<img src="${acompanhamento.fotos.lado}" alt="Foto Lado" class="w-24 h-24 object-cover rounded-md shadow-sm">` : ''}
                            ${acompanhamento.fotos?.costas ? `<img src="${acompanhamento.fotos.costas}" alt="Foto Costas" class="w-24 h-24 object-cover rounded-md shadow-sm">` : ''}
                        </div>
                    `;
                    detailContent.appendChild(acompanhamentoDiv);
                });
            } else {
                const noAcompanhamento = document.createElement('p');
                noAcompanhamento.className = 'text-gray-600 italic';
                noAcompanhamento.textContent = 'Nenhum acompanhamento registrado para este cliente.';
                detailContent.appendChild(noAcompanhamento);
            }

            showDetailView();
        }
    }

    function renderPlanoAlimentar(parentEl, planoGerado, clientId) {
        const planoDiv = document.createElement('div');
        planoDiv.className = 'bg-blue-50 rounded-xl shadow-md p-6 mb-6 md:p-8';
        planoDiv.innerHTML = `<h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center"><i class="fas fa-utensils mr-3"></i> Plano Alimentar Sugerido</h2>`;

        planoGerado.planoAlimentar.forEach(refeicao => {
            const refeicaoDiv = document.createElement('div');
            refeicaoDiv.className = 'mb-4';
            refeicaoDiv.innerHTML = `<h3 class="text-xl font-semibold text-blue-800">${refeicao.refeicao} (${refeicao.horario})</h3>`;
            
            const ul = document.createElement('ul');
            ul.className = 'list-none pl-0';

            refeicao.itens.forEach(item => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center text-gray-700 py-1';
                li.innerHTML = `<span>${item.alimento} (${item.quantidade})</span>`;

                const swapButton = document.createElement('button');
                swapButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
                swapButton.className = 'substitute-btn text-blue-500 hover:text-blue-700 transition-colors duration-200';
                swapButton.dataset.clientId = clientId;
                swapButton.dataset.refeicaoNome = refeicao.refeicao;
                swapButton.dataset.alimentoNome = item.alimento;
                
                li.appendChild(swapButton);
                ul.appendChild(li);
            });

            refeicaoDiv.appendChild(ul);
            planoDiv.appendChild(refeicaoDiv);
        });

        parentEl.appendChild(planoDiv);
    }

    // Event listener para os botões de substituição
    detailContent.addEventListener('click', function(event) {
        const target = event.target.closest('.substitute-btn');
        if (!target) return;

        const { clientId, refeicaoNome, alimentoNome } = target.dataset;

        if (confirm(`Deseja substituir ${alimentoNome} na refeição ${refeicaoNome}?`)) {
            fetch('/api/substituir-alimento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    clientId: clientId, 
                    nomeRefeicao: refeicaoNome, 
                    nomeAlimentoASubstituir: alimentoNome 
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message.includes('sucesso')) {
                    // Atualiza os dados do cliente localmente
                    const clientIndex = allClientData.findIndex(c => c.id === clientId);
                    if (clientIndex !== -1) {
                        allClientData[clientIndex].planoAlimentarGerado = data.planoAlimentarGerado;
                    }
                    // Re-renderiza a view de detalhes
                    displayClientDetails(clientId);
                    alert('Alimento substituído com sucesso!');
                } else {
                    alert(`Erro: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Erro ao substituir alimento:', error);
                alert('Ocorreu um erro na comunicação com o servidor.');
            });
        }
    });

    function renderClientList(clients) {
        clientListContainer.innerHTML = ''; // Limpa a lista antiga
        if (clients.length === 0) {
            clientListContainer.innerHTML = '<p class="text-gray-600">Nenhum dado de cliente encontrado.</p>';
            return;
        }

        // Ordena os clientes pelo mais recente primeiro
        clients.sort((a, b) => new Date(b.recebidoEm) - new Date(a.recebidoEm));

        clients.forEach(client => {
            const item = document.createElement('div');
            item.className = 'flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-3 hover:shadow-md transition-all duration-200';

            const info = document.createElement('div');
            info.className = 'client-info';
            const clientName = client.dadosGerais?.nomeCompleto || 'Nome não informado';
            const submissionDate = new Date(client.recebidoEm).toLocaleString('pt-BR');
            info.innerHTML = `<strong class="text-lg text-blue-700">${clientName}</strong><br><span class="text-sm text-gray-600">Enviado em: ${submissionDate}</span>`;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flex space-x-2';

            const viewButton = document.createElement('button');
            viewButton.className = 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200';
            viewButton.textContent = 'Ver Detalhes';
            viewButton.onclick = () => displayClientDetails(client.id);

            const checkinButton = document.createElement('button');
            checkinButton.className = 'bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200';
            checkinButton.textContent = 'Novo Acompanhamento';
            checkinButton.onclick = () => {
                const link = `${window.location.origin}/acompanhamento?id=${client.id}`;
                window.open(link, '_blank'); // Abre em uma nova aba
            };
            buttonContainer.appendChild(viewButton);
            buttonContainer.appendChild(checkinButton);
            item.appendChild(info);
            item.appendChild(buttonContainer);
            clientListContainer.appendChild(item);
        });
    }

    function fetchData() {
        loadingDiv.classList.remove('hidden');
        fetch('/api/dados')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro na rede: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                allClientData = data;
                renderClientList(allClientData);
                loadingDiv.classList.add('hidden');
            })
            .catch(error => {
                console.error('Erro ao buscar dados:', error);
                loadingDiv.textContent = 'Falha ao carregar os dados. Verifique o console para mais detalhes.';
                loadingDiv.classList.remove('hidden'); // Mantém visível para mostrar a mensagem de erro
                loadingDiv.classList.add('text-red-600'); // Adiciona cor de erro
            });
    }

    backButton.addEventListener('click', showListView);

    // Carrega os dados quando a página é aberta
    fetchData();
});