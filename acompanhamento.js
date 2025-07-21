document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('acompanhamentoForm');
    const clientIdInput = document.getElementById('clientId');
    const statusMessage = document.getElementById('status-message');
    
    const medidasSection = document.getElementById('medidas-section');
    const pescocoInput = document.getElementById('pescoco');
    const cinturaInput = document.getElementById('cintura');
    const quadrilInput = document.getElementById('quadril');
    const quadrilDiv = document.getElementById('quadril-div');

    // 1. Pegar o ID do cliente da URL
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('id');
    
    if (!clientId) {
        document.body.innerHTML = '<h1>Erro: ID do cliente não fornecido.</h1><p>Este link de acompanhamento é inválido. Por favor, solicite um novo link.</p>';
        return;
    }
    clientIdInput.value = clientId;

    // 2. Buscar os dados do cliente para saber o sexo
    fetch(`/api/dados`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.statusText}`);
            }
            return response.json();
        })
        .then(allData => {
            console.log('Dados de todos os clientes recebidos:', allData);
            const clientData = allData.find(c => c.id === clientId);
            console.log('Dados do cliente atual:', clientData);

            if (clientData && clientData.dadosGerais) {
                const sexo = clientData.dadosGerais.sexo;
                console.log('Sexo do cliente:', sexo);

                // Sempre mostra a seção de medidas, pois ela é condicional apenas ao sexo
                medidasSection.style.display = 'block';

                // Define os campos obrigatórios com base no sexo
                pescocoInput.setAttribute('required', '');
                cinturaInput.setAttribute('required', '');

                if (sexo === 'Feminino') {
                    quadrilDiv.style.display = 'block';
                    quadrilInput.setAttribute('required', '');
                } else {
                    quadrilDiv.style.display = 'none';
                    quadrilInput.removeAttribute('required');
                    quadrilInput.value = ''; // Limpa o valor se o campo for escondido
                }
            } else {
                 console.warn("Não foi possível encontrar o sexo do cliente ou dados gerais. Mostrando todos os campos de medida por padrão e tornando-os opcionais.");
                 medidasSection.style.display = 'block'; // Mostra todos por padrão se não achar
                 // Torna os campos opcionais se não conseguir determinar o sexo
                 pescocoInput.removeAttribute('required');
                 cinturaInput.removeAttribute('required');
                 quadrilInput.removeAttribute('required');
            }
        })
        .catch(err => {
            console.error("Erro ao buscar dados do cliente:", err);
            showStatusMessage('Erro ao carregar dados do cliente. Verifique o console.', 'error');
            medidasSection.style.display = 'block'; // Garante que o form seja usável mesmo com erro
            // Torna os campos opcionais em caso de erro
            pescocoInput.removeAttribute('required');
            cinturaInput.removeAttribute('required');
            quadrilInput.removeAttribute('required');
        });


    // 4. Lidar com o envio do formulário
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Validação simples (pode ser melhorada como no outro form)
        if(!form.checkValidity()){
            showStatusMessage('Por favor, preencha todos os campos e envie todas as fotos.', 'error');
            return;
        }

        const formData = new FormData(form);

        showStatusMessage('Enviando dados, por favor aguarde...', 'success');

        fetch('/salvar-acompanhamento', {
            method: 'POST',
            body: formData // FormData lida com arquivos automaticamente
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Acompanhamento salvo com sucesso!') {
                showStatusMessage('Acompanhamento enviado com sucesso! Obrigado.', 'success');
                form.reset();
            } else {
                throw new Error(data.message || 'Erro desconhecido no servidor.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar acompanhamento:', error);
            showStatusMessage(`Erro: ${error.message}`, 'error');
        });
    });

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
});