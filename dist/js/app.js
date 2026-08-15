// Controlador Principal da Aplicação UI

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    currentChart: null,

    init() {
        this.bindEvents();
        this.renderAll();
    },

    // Vinculação de Eventos DOM
    bindEvents() {
        // Seletor de Veículo Ativo
        const selectVeiculo = document.getElementById('selectVeiculoAtivo');
        if (selectVeiculo) {
            selectVeiculo.addEventListener('change', (e) => {
                StorageService.setActiveVeiculoId(e.target.value);
                this.renderAll();
            });
        }

        // Filtros da Tabela
        const searchInput = document.getElementById('searchManutencao');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderTabelaManutencoes());
        }

        const filterCategoria = document.getElementById('filterCategoria');
        if (filterCategoria) {
            filterCategoria.addEventListener('change', () => this.renderTabelaManutencoes());
        }

        // Formulário de Veículo
        const formVeiculo = document.getElementById('formVeiculo');
        if (formVeiculo) {
            formVeiculo.addEventListener('submit', (e) => this.handleSaveVeiculo(e));
        }

        // Formulário de Manutenção
        const formManutencao = document.getElementById('formManutencao');
        if (formManutencao) {
            formManutencao.addEventListener('submit', (e) => this.handleSaveManutencao(e));
        }

        // Botões de Exportação
        const btnExportCSV = document.getElementById('btnExportCSV');
        if (btnExportCSV) {
            btnExportCSV.addEventListener('click', () => this.handleExportCSV());
        }

        const btnExportPDF = document.getElementById('btnExportPDF');
        if (btnExportPDF) {
            btnExportPDF.addEventListener('click', () => this.handleExportPDF());
        }

        // Botão de Reset Mock Data (Resetar Dados)
        const btnResetMock = document.getElementById('btnResetMock');
        if (btnResetMock) {
            btnResetMock.addEventListener('click', () => {
                if (confirm('Deseja restaurar os dados iniciais de demonstração? Seus registros atuais serão substituídos.')) {
                    StorageService.resetAllData();
                    this.renderAll();
                }
            });
        }
    },

    // Renderização completa da UI
    renderAll() {
        this.renderVeiculoSelector();
        this.renderVehicleBanner();
        this.renderAlerts();
        this.renderMetricsCards();
        this.renderChart();
        this.renderTabelaManutencoes();
        this.renderListaVeiculosModal();
    },

    // 1. Renderiza a lista do Dropdown de Veículo Ativo
    renderVeiculoSelector() {
        const select = document.getElementById('selectVeiculoAtivo');
        if (!select) return;

        const veiculos = StorageService.getVeiculos();
        const activeId = StorageService.getActiveVeiculoId();

        let optionsHTML = '<option value="TODOS">🌐 Visão Consolidada (Todos os Veículos)</option>';
        veiculos.forEach(v => {
            optionsHTML += `<option value="${v.id}" ${v.id === activeId ? 'selected' : ''}>🚗 ${v.modelo} (${v.placa})</option>`;
        });

        select.innerHTML = optionsHTML;
    },

    // 2. Banner de informação do veículo ativo
    renderVehicleBanner() {
        const bannerContainer = document.getElementById('vehicleBanner');
        if (!bannerContainer) return;

        const activeId = StorageService.getActiveVeiculoId();
        const veiculos = StorageService.getVeiculos();
        const manutencoes = StorageService.getManutencoes();

        if (activeId === 'TODOS' || veiculos.length === 0) {
            bannerContainer.innerHTML = `
                <div class="vehicle-info">
                    <h2>🌐 Painel Consolidado</h2>
                    <p style="color: #94a3b8;">Exibindo soma estatística e histórico global de todos os ${veiculos.length} veículos cadastrados.</p>
                </div>
                <div class="vehicle-stats">
                    <div class="stat-item">
                        <div class="label">Total de Veículos</div>
                        <div class="value">${veiculos.length}</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Total de Manutenções</div>
                        <div class="value">${manutencoes.length}</div>
                    </div>
                </div>
            `;
            return;
        }

        const veiculo = StorageService.getVeiculoById(activeId);
        if (!veiculo) return;

        const manutencoesVeiculo = StorageService.getManutencoesByVeiculoId(veiculo.id);

        bannerContainer.innerHTML = `
            <div class="vehicle-info">
                <h2>
                    <span>${veiculo.modelo}</span>
                    <span class="placa-badge">${veiculo.placa}</span>
                </h2>
                <p style="color: #94a3b8; margin-top: 4px;">
                    Ano Fabricação: <strong>${veiculo.ano}</strong> | Quilometragem Registrada: <strong>${CalculosService.formatarKm(veiculo.kmAtual)}</strong>
                </p>
            </div>
            <div class="vehicle-stats">
                <div class="stat-item">
                    <div class="label">Quilometragem Atual</div>
                    <div class="value">${CalculosService.formatarKm(veiculo.kmAtual)}</div>
                </div>
                <div class="stat-item">
                    <div class="label">Manutenções Registradas</div>
                    <div class="value">${manutencoesVeiculo.length}</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline" style="color: #fff; border-color: rgba(255,255,255,0.4);" onclick="App.openEditVeiculoModal('${veiculo.id}')">
                        <i class="fas fa-edit"></i> Editar Veículo
                    </button>
                    <button class="btn btn-sm btn-danger" style="margin-left: 6px;" onclick="App.handleDeleteVeiculo('${veiculo.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    },

    // 3. Renderiza o Card de Alerta de Próxima Revisão
    renderAlerts() {
        const container = document.getElementById('revisionAlertContainer');
        if (!container) return;

        const activeId = StorageService.getActiveVeiculoId();

        if (activeId === 'TODOS') {
            // Em modo consolidado, checar alertas de todos os veículos
            const veiculos = StorageService.getVeiculos();
            let pendentesCount = 0;
            let proximosCount = 0;
            let vencidosCount = 0;

            veiculos.forEach(v => {
                const mans = StorageService.getManutencoesByVeiculoId(v.id);
                const alerta = CalculosService.calcularAlertaRevisao(v, mans);
                if (alerta) {
                    if (alerta.status === 'VENCIDO') vencidosCount++;
                    else if (alerta.status === 'PROXIMO') proximosCount++;
                    else if (alerta.status === 'SEM_PREVENTIVA') pendentesCount++;
                }
            });

            let statusClass = 'status-success';
            let titulo = 'Status Consolidado de Revisões';
            let msg = `Todos os ${veiculos.length} veículos estão com as revisões preventivas em dia.`;

            if (vencidosCount > 0) {
                statusClass = 'status-danger';
                titulo = '⚠️ Alerta Consolidado: Revisões Vencidas!';
                msg = `Existem ${vencidosCount} veículo(s) com revisão preventiva ultrapassada. Alterne para o veículo específico para detalhes.`;
            } else if (proximosCount > 0) {
                statusClass = 'status-warning';
                titulo = '⚡ Alerta Consolidado: Revisões Próximas';
                msg = `Existem ${proximosCount} veículo(s) com revisão preventiva próxima nos próximos 1.000 KM.`;
            }

            container.className = `revision-alert-card ${statusClass}`;
            container.innerHTML = `
                <div class="revision-alert-header">
                    <div class="revision-alert-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>${titulo}</span>
                    </div>
                </div>
                <p style="font-size: 14px; margin-top: 4px;">${msg}</p>
            `;
            return;
        }

        const veiculo = StorageService.getVeiculoById(activeId);
        if (!veiculo) {
            container.innerHTML = '';
            return;
        }

        const manutencoes = StorageService.getManutencoesByVeiculoId(veiculo.id);
        const alerta = CalculosService.calcularAlertaRevisao(veiculo, manutencoes);

        if (!alerta) return;

        let icon = 'fa-check-circle';
        if (alerta.status === 'VENCIDO') icon = 'fa-times-circle';
        else if (alerta.status === 'PROXIMO') icon = 'fa-exclamation-circle';
        else if (alerta.status === 'SEM_PREVENTIVA') icon = 'fa-info-circle';

        container.className = `revision-alert-card ${alerta.badgeClass}`;
        container.innerHTML = `
            <div class="revision-alert-header">
                <div class="revision-alert-title">
                    <i class="fas ${icon}"></i>
                    <span>${alerta.tituloStatus} - ${veiculo.modelo} (${veiculo.placa})</span>
                </div>
                <div style="font-size: 12px; font-weight: 700;">
                    ${alerta.proximaKm ? 'Alvo: ' + alerta.proximaKm.toLocaleString('pt-BR') + ' KM' : ''}
                </div>
            </div>
            <p style="font-size: 14px;">${alerta.mensagem}</p>
            ${alerta.progressoPorcentagem ? `
                <div class="revision-progress-bar">
                    <div class="revision-progress-fill" style="width: ${Math.min(alerta.progressoPorcentagem, 100)}%;"></div>
                </div>
            ` : ''}
        `;
    },

    // 4. Cards de Métricas Financeiras e Maior Gasto
    renderMetricsCards() {
        const activeId = StorageService.getActiveVeiculoId();
        const manutencoes = StorageService.getManutencoesByVeiculoId(activeId);
        const totais = CalculosService.calcularTotais(manutencoes);
        const maiorGasto = CalculosService.identificarMaiorGasto(totais);

        document.getElementById('valPreventiva').innerText = CalculosService.formatarMoeda(totais.preventiva);
        document.getElementById('subPreventiva').innerText = `${totais.qtdPreventiva} registro(s)`;

        document.getElementById('valPreditiva').innerText = CalculosService.formatarMoeda(totais.preditiva);
        document.getElementById('subPreditiva').innerText = `${totais.qtdPreditiva} registro(s)`;

        document.getElementById('valCorretiva').innerText = CalculosService.formatarMoeda(totais.corretiva);
        document.getElementById('subCorretiva').innerText = `${totais.qtdCorretiva} registro(s)`;

        document.getElementById('valTotal').innerText = CalculosService.formatarMoeda(totais.total);
        document.getElementById('subTotal').innerText = `${totais.qtdTotal} manutenção(ões) no total`;

        // Card Destaque de Maior Gasto
        const cardMaiorGasto = document.getElementById('cardMaiorGasto');
        if (cardMaiorGasto) {
            if (totais.total === 0) {
                cardMaiorGasto.innerHTML = `
                    <div class="highlight-left">
                        <div class="highlight-icon"><i class="fas fa-chart-pie"></i></div>
                        <div class="highlight-info">
                            <h3>Maior Gasto de Manutenção</h3>
                            <p>Sem registros financeiros no momento</p>
                        </div>
                    </div>
                `;
            } else {
                cardMaiorGasto.innerHTML = `
                    <div class="highlight-left">
                        <div class="highlight-icon"><i class="fas fa-trophy"></i></div>
                        <div class="highlight-info">
                            <h3>Tipo de Manutenção de Maior Gasto</h3>
                            <p>Manutenção <span style="color: var(--primary); font-weight: 700;">${maiorGasto.categoria}</span></p>
                        </div>
                    </div>
                    <div class="highlight-badge">
                        ${CalculosService.formatarMoeda(maiorGasto.valor)} (${maiorGasto.porcentagem}% do Total)
                    </div>
                `;
            }
        }
    },

    // 5. Gráfico de Rosca com Chart.js (Cores Stitch & Fonte Inter)
    renderChart() {
        const canvas = document.getElementById('chartCategorias');
        if (!canvas) return;

        const activeId = StorageService.getActiveVeiculoId();
        const manutencoes = StorageService.getManutencoesByVeiculoId(activeId);
        const totais = CalculosService.calcularTotais(manutencoes);

        if (this.currentChart) {
            this.currentChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Preventiva', 'Preditiva', 'Corretiva'],
                datasets: [{
                    data: [totais.preventiva, totais.preditiva, totais.corretiva],
                    backgroundColor: ['#003d9b', '#006e2f', '#ba1a1a'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Inter', weight: '600', size: 12 },
                            padding: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.raw || 0;
                                return ' ' + context.label + ': ' + CalculosService.formatarMoeda(val);
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    },

    // 6. Tabela de Registros de Manutenções
    renderTabelaManutencoes() {
        const tbody = document.getElementById('tbodyManutencoes');
        if (!tbody) return;

        const activeId = StorageService.getActiveVeiculoId();
        let manutencoes = StorageService.getManutencoesByVeiculoId(activeId);
        const veiculos = StorageService.getVeiculos();
        const veiculosMap = new Map(veiculos.map(v => [v.id, v]));

        // Filtros da UI
        const searchInput = document.getElementById('searchManutencao');
        const filterCategoria = document.getElementById('filterCategoria');

        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const catFilter = filterCategoria ? filterCategoria.value : '';

        if (query) {
            manutencoes = manutencoes.filter(m => 
                m.tipoServico.toLowerCase().includes(query) ||
                (m.observacao && m.observacao.toLowerCase().includes(query)) ||
                m.km.toString().includes(query)
            );
        }

        if (catFilter) {
            manutencoes = manutencoes.filter(m => m.categoria === catFilter);
        }

        // Ordenar da mais recente para a mais antiga
        manutencoes.sort((a, b) => new Date(b.data) - new Date(a.data) || b.km - a.km);

        if (manutencoes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fas fa-tools"></i>
                            <h4>Nenhuma manutenção encontrada</h4>
                            <p>Não há registros cadastrados ou que coincidam com os filtros aplicados.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let rowsHTML = '';
        manutencoes.forEach(m => {
            const veiculo = veiculosMap.get(m.veiculoId) || { modelo: 'Desconhecido', placa: '---' };
            const catClass = `cat-${m.categoria.toLowerCase()}`;

            rowsHTML += `
                <tr>
                    <td>
                        <strong style="color: var(--text-primary);">${veiculo.modelo}</strong>
                        <div style="font-size: 11px; color: var(--text-secondary); font-family: monospace;">${veiculo.placa}</div>
                    </td>
                    <td>
                        <strong>${m.tipoServico}</strong>
                        ${m.observacao ? `<div style="font-size: 12px; color: var(--text-secondary);">${m.observacao}</div>` : ''}
                    </td>
                    <td>
                        <span class="cat-badge ${catClass}">
                            <i class="fas fa-tag"></i> ${m.categoria}
                        </span>
                    </td>
                    <td>${CalculosService.formatarData(m.data)}</td>
                    <td><strong>${m.km.toLocaleString('pt-BR')}</strong> KM</td>
                    <td style="font-weight: 800; color: var(--text-primary);">${CalculosService.formatarMoeda(m.valor)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="App.openEditManutencaoModal('${m.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="App.handleDeleteManutencao('${m.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHTML;
    },

    // 7. Modal de Cadastro/Edição de Veículos
    openNovoVeiculoModal() {
        document.getElementById('modalVeiculoTitle').innerText = 'Cadastrar Novo Veículo';
        document.getElementById('veiculoId').value = '';
        document.getElementById('formVeiculo').reset();
        this.toggleModal('modalVeiculo', true);
    },

    openEditVeiculoModal(id) {
        const veiculo = StorageService.getVeiculoById(id);
        if (!veiculo) return;

        document.getElementById('modalVeiculoTitle').innerText = 'Editar Veículo';
        document.getElementById('veiculoId').value = veiculo.id;
        document.getElementById('veiculoModelo').value = veiculo.modelo;
        document.getElementById('veiculoPlaca').value = veiculo.placa;
        document.getElementById('veiculoKm').value = veiculo.kmAtual;
        document.getElementById('veiculoAno').value = veiculo.ano;

        this.toggleModal('modalVeiculo', true);
    },

    handleSaveVeiculo(e) {
        e.preventDefault();
        const id = document.getElementById('veiculoId').value;
        const modelo = document.getElementById('veiculoModelo').value.trim();
        const placa = document.getElementById('veiculoPlaca').value.trim();
        const kmAtual = parseFloat(document.getElementById('veiculoKm').value) || 0;
        const ano = parseInt(document.getElementById('veiculoAno').value) || new Date().getFullYear();

        if (!modelo || !placa) {
            alert('Por favor, preencha o modelo e a placa do veículo.');
            return;
        }

        const saved = StorageService.saveVeiculo({ id, modelo, placa, kmAtual, ano });
        
        // Ativar veículo recém-salvo se for novo
        if (!id) {
            StorageService.setActiveVeiculoId(saved.id);
        }

        this.toggleModal('modalVeiculo', false);
        this.renderAll();
    },

    handleDeleteVeiculo(id) {
        const veiculo = StorageService.getVeiculoById(id);
        if (!veiculo) return;

        if (confirm(`Tem certeza que deseja excluir o veículo "${veiculo.modelo}" (${veiculo.placa})? Todas as manutenções associadas também serão apagadas.`)) {
            StorageService.deleteVeiculo(id);
            this.renderAll();
        }
    },

    // Lista de Veículos Dentro do Modal de Gerenciamento
    renderListaVeiculosModal() {
        const container = document.getElementById('listaVeiculosModalContainer');
        if (!container) return;

        const veiculos = StorageService.getVeiculos();
        let html = '';
        veiculos.forEach(v => {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #e2e8f0;">
                    <div>
                        <strong>${v.modelo}</strong> (${v.placa}) - ${v.kmAtual.toLocaleString('pt-BR')} KM
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline" onclick="App.openEditVeiculoModal('${v.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="App.handleDeleteVeiculo('${v.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    // 8. Modal de Cadastro/Edição de Manutenção
    openNovaManutencaoModal() {
        const veiculos = StorageService.getVeiculos();
        if (veiculos.length === 0) {
            alert('Cadastre ao menos um veículo antes de registrar manutenções.');
            this.openNovoVeiculoModal();
            return;
        }

        document.getElementById('modalManutencaoTitle').innerText = 'Registrar Nova Manutenção';
        document.getElementById('manutencaoId').value = '';
        document.getElementById('formManutencao').reset();

        // Data de hoje padrão
        document.getElementById('manutencaoData').value = new Date().toISOString().split('T')[0];

        // Popular select de veículos
        const selectVeiculo = document.getElementById('manutencaoVeiculoId');
        let optionsHTML = '';
        const activeId = StorageService.getActiveVeiculoId();

        veiculos.forEach(v => {
            const isSelected = (activeId !== 'TODOS' && activeId === v.id) ? 'selected' : '';
            optionsHTML += `<option value="${v.id}" ${isSelected}>${v.modelo} (${v.placa})</option>`;
        });
        selectVeiculo.innerHTML = optionsHTML;

        // Atualizar campo KM sugerida quando o veículo selecionado mudar
        selectVeiculo.onchange = () => {
            const v = StorageService.getVeiculoById(selectVeiculo.value);
            if (v) document.getElementById('manutencaoKm').value = v.kmAtual;
        };

        // Disparar evento para carregar km inicial
        if (selectVeiculo.value) {
            const v = StorageService.getVeiculoById(selectVeiculo.value);
            if (v) document.getElementById('manutencaoKm').value = v.kmAtual;
        }

        this.toggleModal('modalManutencao', true);
    },

    openEditManutencaoModal(id) {
        const m = StorageService.getManutencaoById(id);
        if (!m) return;

        document.getElementById('modalManutencaoTitle').innerText = 'Editar Registro de Manutenção';
        document.getElementById('manutencaoId').value = m.id;

        // Popular select de veículos
        const selectVeiculo = document.getElementById('manutencaoVeiculoId');
        const veiculos = StorageService.getVeiculos();
        let optionsHTML = '';
        veiculos.forEach(v => {
            optionsHTML += `<option value="${v.id}" ${v.id === m.veiculoId ? 'selected' : ''}>${v.modelo} (${v.placa})</option>`;
        });
        selectVeiculo.innerHTML = optionsHTML;

        document.getElementById('manutencaoTipo').value = m.tipoServico;
        document.getElementById('manutencaoCategoria').value = m.categoria;
        document.getElementById('manutencaoData').value = m.data;
        document.getElementById('manutencaoKm').value = m.km;
        document.getElementById('manutencaoValor').value = m.valor;
        document.getElementById('manutencaoIntervaloKm').value = m.intervaloKmRecomendado || 10000;
        document.getElementById('manutencaoObs').value = m.observacao || '';

        this.toggleModal('modalManutencao', true);
    },

    handleSaveManutencao(e) {
        e.preventDefault();
        const id = document.getElementById('manutencaoId').value;
        const veiculoId = document.getElementById('manutencaoVeiculoId').value;
        const tipoServico = document.getElementById('manutencaoTipo').value.trim();
        const categoria = document.getElementById('manutencaoCategoria').value;
        const data = document.getElementById('manutencaoData').value;
        const km = parseFloat(document.getElementById('manutencaoKm').value) || 0;
        const valor = parseFloat(document.getElementById('manutencaoValor').value) || 0;
        const intervaloKmRecomendado = parseFloat(document.getElementById('manutencaoIntervaloKm').value) || 10000;
        const observacao = document.getElementById('manutencaoObs').value.trim();

        if (!veiculoId || !tipoServico || !data || valor < 0) {
            alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }

        StorageService.saveManutencao({
            id,
            veiculoId,
            tipoServico,
            categoria,
            data,
            km,
            valor,
            intervaloKmRecomendado,
            observacao
        });

        this.toggleModal('modalManutencao', false);
        this.renderAll();
    },

    handleDeleteManutencao(id) {
        const m = StorageService.getManutencaoById(id);
        if (!m) return;

        if (confirm(`Deseja excluir a manutenção "${m.tipoServico}"?`)) {
            StorageService.deleteManutencao(id);
            this.renderAll();
        }
    },

    // 9. Exportação
    handleExportCSV() {
        const activeId = StorageService.getActiveVeiculoId();
        const manutencoes = StorageService.getManutencoesByVeiculoId(activeId);
        const veiculos = StorageService.getVeiculos();
        ExportService.exportarCSV(manutencoes, veiculos, activeId);
    },

    handleExportPDF() {
        const activeId = StorageService.getActiveVeiculoId();
        const manutencoes = StorageService.getManutencoesByVeiculoId(activeId);
        const veiculos = StorageService.getVeiculos();
        const totais = CalculosService.calcularTotais(manutencoes);
        const maiorGasto = CalculosService.identificarMaiorGasto(totais);

        let veiculoAtivo = null;
        let alertaRevisao = null;

        if (activeId !== 'TODOS') {
            veiculoAtivo = StorageService.getVeiculoById(activeId);
            alertaRevisao = CalculosService.calcularAlertaRevisao(veiculoAtivo, manutencoes);
        }

        ExportService.gerarRelatorioPDF(manutencoes, veiculos, veiculoAtivo, totais, maiorGasto, alertaRevisao);
    },

    // Utility Modal Toggle
    toggleModal(modalId, show) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (show) modal.classList.add('active');
            else modal.classList.remove('active');
        }
    }
};
