// Módulo de Cálculos e Regras de Negócio

const CalculosService = {
    // Calcula totais acumulados por categoria e o total geral
    calcularTotais(manutencoes) {
        const result = {
            preventiva: 0,
            preditiva: 0,
            corretiva: 0,
            total: 0,
            qtdPreventiva: 0,
            qtdPreditiva: 0,
            qtdCorretiva: 0,
            qtdTotal: manutencoes.length
        };

        manutencoes.forEach(m => {
            const valor = parseFloat(m.valor) || 0;
            result.total += valor;

            if (m.categoria === 'Preventiva') {
                result.preventiva += valor;
                result.qtdPreventiva++;
            } else if (m.categoria === 'Preditiva') {
                result.preditiva += valor;
                result.qtdPreditiva++;
            } else if (m.categoria === 'Corretiva') {
                result.corretiva += valor;
                result.qtdCorretiva++;
            }
        });

        return result;
    },

    // Identifica qual tipo de manutenção representa o maior gasto
    identificarMaiorGasto(totais) {
        if (totais.total === 0) {
            return { categoria: 'Nenhum', valor: 0, porcentagem: 0, badgeClass: 'bg-secondary' };
        }

        const categorias = [
            { categoria: 'Preventiva', valor: totais.preventiva, badgeClass: 'badge-preventiva' },
            { categoria: 'Preditiva', valor: totais.preditiva, badgeClass: 'badge-preditiva' },
            { categoria: 'Corretiva', valor: totais.corretiva, badgeClass: 'badge-corretiva' }
        ];

        // Ordenar por valor decrescente
        categorias.sort((a, b) => b.valor - a.valor);
        const maior = categorias[0];

        const porcentagem = totais.total > 0 ? ((maior.valor / totais.total) * 100).toFixed(1) : 0;

        return {
            categoria: maior.categoria,
            valor: maior.valor,
            porcentagem: parseFloat(porcentagem),
            badgeClass: maior.badgeClass
        };
    },

    // Calcula os alertas de próxima revisão para um determinado veículo ou lista de veículos
    calcularAlertaRevisao(veiculo, manutencoesDoVeiculo) {
        if (!veiculo) return null;

        // Filtrar manutenções preventivas do veículo
        const preventivas = manutencoesDoVeiculo
            .filter(m => m.categoria === 'Preventiva')
            .sort((a, b) => new Date(b.data) - new Date(a.data) || b.km - a.km);

        if (preventivas.length === 0) {
            return {
                status: 'SEM_PREVENTIVA',
                tituloStatus: 'Atenção Necessária',
                badgeClass: 'status-warning',
                mensagem: 'Nenhuma manutenção preventiva foi registrada para este veículo ainda.',
                proximaKm: veiculo.kmAtual + 10000,
                kmFaltantes: 10000,
                progressoPorcentagem: 0,
                ultimaPreventiva: null
            };
        }

        const ultimaPreventiva = preventivas[0];
        const intervaloRecomendado = parseFloat(ultimaPreventiva.intervaloKmRecomendado) || 10000;
        const proximaKm = ultimaPreventiva.km + intervaloRecomendado;
        const kmFaltantes = proximaKm - veiculo.kmAtual;
        const kmPercorridosDesdeUltima = veiculo.kmAtual - ultimaPreventiva.km;

        // Cálculo de porcentagem de desgaste para barra de progresso visual (0% a 100% ou mais)
        let progressoPorcentagem = Math.min(Math.max((kmPercorridosDesdeUltima / intervaloRecomendado) * 100, 0), 120);

        let status = 'EM_DIA';
        let tituloStatus = 'Revisão em Dia';
        let badgeClass = 'status-success';
        let mensagem = `Próxima revisão recomendada aos ${proximaKm.toLocaleString('pt-BR')} KM (faltam ${kmFaltantes.toLocaleString('pt-BR')} KM).`;

        if (kmFaltantes <= 0) {
            status = 'VENCIDO';
            tituloStatus = 'Revisão Vencida / Ultrapassada!';
            badgeClass = 'status-danger';
            const ultrapassado = Math.abs(kmFaltantes);
            mensagem = `Quilometragem limite atingida! Revisão ultrapassada em ${ultrapassado.toLocaleString('pt-BR')} KM. Agende a manutenção urgente.`;
        } else if (kmFaltantes <= 1000) {
            status = 'PROXIMO';
            tituloStatus = 'Próxima Revisão Próxima';
            badgeClass = 'status-warning';
            mensagem = `Atenção: Faltam apenas ${kmFaltantes.toLocaleString('pt-BR')} KM para a próxima revisão preventiva (${proximaKm.toLocaleString('pt-BR')} KM).`;
        }

        return {
            status,
            tituloStatus,
            badgeClass,
            mensagem,
            proximaKm,
            kmFaltantes,
            progressoPorcentagem,
            ultimaPreventiva,
            intervaloRecomendado
        };
    },

    // Formatação de Moeda BRL
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    },

    // Formatação de Data DD/MM/AAAA
    formatarData(dataISO) {
        if (!dataISO) return '-';
        const [ano, mes, dia] = dataISO.split('-');
        if (!ano || !mes || !dia) return dataISO;
        return `${dia}/${mes}/${ano}`;
    },

    // Formatação de Número de KM
    formatarKm(km) {
        return (parseFloat(km) || 0).toLocaleString('pt-BR') + ' KM';
    }
};
