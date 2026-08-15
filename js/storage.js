// Módulo de Gerenciamento do LocalStorage

const STORAGE_KEYS = {
    VEICULOS: 'gestao_veiculos_dados',
    MANUTENCOES: 'gestao_manutencoes_dados',
    VEICULO_ATIVO: 'gestao_veiculo_ativo_id'
};

// Dados Iniciais de Demonstração (Mock)
const INITIAL_MOCK_DATA = {
    veiculos: [
        {
            id: 'v-1700000000001',
            modelo: 'Toyota Corolla 2.0 Flex',
            placa: 'ABC-1D23',
            kmAtual: 58500,
            ano: 2021,
            cor: '#2563eb'
        },
        {
            id: 'v-1700000000002',
            modelo: 'Volkswagen Nivus Highline 200 TSI',
            placa: 'XYZ-9876',
            kmAtual: 34200,
            ano: 2022,
            cor: '#059669'
        }
    ],
    manutencoes: [
        {
            id: 'm-1700000000001',
            veiculoId: 'v-1700000000001',
            tipoServico: 'Troca de Óleo 5W30 e Filtros',
            data: '2026-02-15',
            km: 50000,
            valor: 480.00,
            categoria: 'Preventiva',
            intervaloKmRecomendado: 10000,
            observacao: 'Substituição completa do óleo do motor, filtro de óleo e filtro de ar da cabine.'
        },
        {
            id: 'm-1700000000002',
            veiculoId: 'v-1700000000001',
            tipoServico: 'Troca de Pastilhas de Freio Dianteiras',
            data: '2026-04-20',
            km: 53500,
            valor: 750.00,
            categoria: 'Preditiva',
            intervaloKmRecomendado: 20000,
            observacao: 'Identificada espessura residual de 3mm na inspeção preventiva de rotina.'
        },
        {
            id: 'm-1700000000003',
            veiculoId: 'v-1700000000001',
            tipoServico: 'Substituição de Bateria 60Ah',
            data: '2026-06-12',
            km: 56800,
            valor: 620.00,
            categoria: 'Corretiva',
            intervaloKmRecomendado: 0,
            observacao: 'Falha total de carga ao ligar o veículo pela manhã.'
        },
        {
            id: 'm-1700000000004',
            veiculoId: 'v-1700000000002',
            tipoServico: 'Revisão Concessionária 30.000 KM',
            data: '2026-03-10',
            km: 30000,
            valor: 1150.00,
            categoria: 'Preventiva',
            intervaloKmRecomendado: 10000,
            observacao: 'Revisão periódica recomendada pelo manual do fabricante.'
        },
        {
            id: 'm-1700000000005',
            veiculoId: 'v-1700000000002',
            tipoServico: 'Alinhamento e Balanceamento 3D',
            data: '2026-05-18',
            km: 32500,
            valor: 220.00,
            categoria: 'Preventiva',
            intervaloKmRecomendado: 10000,
            observacao: 'Rodízio de pneus e alinhamento do eixo dianteiro/traseiro.'
        }
    ]
};

const StorageService = {
    // Inicialização
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.VEICULOS)) {
            this.setVeiculos(INITIAL_MOCK_DATA.veiculos);
        }
        if (!localStorage.getItem(STORAGE_KEYS.MANUTENCOES)) {
            this.setManutencoes(INITIAL_MOCK_DATA.manutencoes);
        }
        if (!localStorage.getItem(STORAGE_KEYS.VEICULO_ATIVO)) {
            const veiculos = this.getVeiculos();
            if (veiculos.length > 0) {
                this.setActiveVeiculoId(veiculos[0].id);
            } else {
                this.setActiveVeiculoId('TODOS');
            }
        }
    },

    // --- VEÍCULOS ---
    getVeiculos() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.VEICULOS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Erro ao ler veículos do LocalStorage', e);
            return [];
        }
    },

    setVeiculos(veiculos) {
        localStorage.setItem(STORAGE_KEYS.VEICULOS, JSON.stringify(veiculos));
    },

    getVeiculoById(id) {
        return this.getVeiculos().find(v => v.id === id) || null;
    },

    saveVeiculo(veiculoData) {
        const veiculos = this.getVeiculos();
        let savedVeiculo;
        
        if (veiculoData.id) {
            // Edição
            const index = veiculos.findIndex(v => v.id === veiculoData.id);
            if (index !== -1) {
                veiculos[index] = { ...veiculos[index], ...veiculoData };
                savedVeiculo = veiculos[index];
            }
        } else {
            // Novo cadastro
            savedVeiculo = {
                id: 'v-' + Date.now(),
                modelo: veiculoData.modelo,
                placa: veiculoData.placa.toUpperCase(),
                kmAtual: parseFloat(veiculoData.kmAtual) || 0,
                ano: parseInt(veiculoData.ano) || new Date().getFullYear(),
                cor: veiculoData.cor || '#2563eb'
            };
            veiculos.push(savedVeiculo);
        }

        this.setVeiculos(veiculos);
        return savedVeiculo;
    },

    deleteVeiculo(id) {
        let veiculos = this.getVeiculos();
        veiculos = veiculos.filter(v => v.id !== id);
        this.setVeiculos(veiculos);

        // Deletar também manutenções associadas
        let manutencoes = this.getManutencoes();
        manutencoes = manutencoes.filter(m => m.veiculoId !== id);
        this.setManutencoes(manutencoes);

        // Ajustar veículo ativo se o excluído era o selecionado
        if (this.getActiveVeiculoId() === id) {
            this.setActiveVeiculoId(veiculos.length > 0 ? veiculos[0].id : 'TODOS');
        }
    },

    // --- MANUTENÇÕES ---
    getManutencoes() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.MANUTENCOES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Erro ao ler manutenções do LocalStorage', e);
            return [];
        }
    },

    setManutencoes(manutencoes) {
        localStorage.setItem(STORAGE_KEYS.MANUTENCOES, JSON.stringify(manutencoes));
    },

    getManutencoesByVeiculoId(veiculoId) {
        const manutencoes = this.getManutencoes();
        if (!veiculoId || veiculoId === 'TODOS') {
            return manutencoes;
        }
        return manutencoes.filter(m => m.veiculoId === veiculoId);
    },

    getManutencaoById(id) {
        return this.getManutencoes().find(m => m.id === id) || null;
    },

    saveManutencao(manutencaoData) {
        const manutencoes = this.getManutencoes();
        let savedManutencao;

        if (manutencaoData.id) {
            // Edição
            const index = manutencoes.findIndex(m => m.id === manutencaoData.id);
            if (index !== -1) {
                manutencoes[index] = { ...manutencoes[index], ...manutencaoData };
                savedManutencao = manutencoes[index];
            }
        } else {
            // Novo registro
            savedManutencao = {
                id: 'm-' + Date.now(),
                veiculoId: manutencaoData.veiculoId,
                tipoServico: manutencaoData.tipoServico,
                data: manutencaoData.data,
                km: parseFloat(manutencaoData.km) || 0,
                valor: parseFloat(manutencaoData.valor) || 0,
                categoria: manutencaoData.categoria, // 'Preventiva', 'Preditiva', 'Corretiva'
                intervaloKmRecomendado: parseFloat(manutencaoData.intervaloKmRecomendado) || 10000,
                observacao: manutencaoData.observacao || ''
            };
            manutencoes.push(savedManutencao);
        }

        // Se a quilometragem registrada na manutenção for superior à km atual do veículo, atualiza o veículo
        const veiculo = this.getVeiculoById(savedManutencao.veiculoId);
        if (veiculo && savedManutencao.km > veiculo.kmAtual) {
            this.saveVeiculo({ id: veiculo.id, kmAtual: savedManutencao.km });
        }

        this.setManutencoes(manutencoes);
        return savedManutencao;
    },

    deleteManutencao(id) {
        let manutencoes = this.getManutencoes();
        manutencoes = manutencoes.filter(m => m.id !== id);
        this.setManutencoes(manutencoes);
    },

    // --- VEÍCULO ATIVO ---
    getActiveVeiculoId() {
        return localStorage.getItem(STORAGE_KEYS.VEICULO_ATIVO) || 'TODOS';
    },

    setActiveVeiculoId(id) {
        localStorage.setItem(STORAGE_KEYS.VEICULO_ATIVO, id);
    },

    // --- RESET ---
    resetAllData() {
        localStorage.removeItem(STORAGE_KEYS.VEICULOS);
        localStorage.removeItem(STORAGE_KEYS.MANUTENCOES);
        localStorage.removeItem(STORAGE_KEYS.VEICULO_ATIVO);
        this.init();
    }
};

// Executar inicialização ao carregar script
StorageService.init();
