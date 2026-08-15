// Módulo de Exportação de Dados (CSV e Relatório PDF)

const ExportService = {
    // Exportar Manutenções para CSV
    exportarCSV(manutencoes, veiculos, veiculoAtivoId) {
        if (!manutencoes || manutencoes.length === 0) {
            alert('Não há dados de manutenções cadastrados para exportar.');
            return;
        }

        // Mapear id do veículo para detalhes
        const veiculosMap = new Map();
        veiculos.forEach(v => veiculosMap.set(v.id, v));

        // Cabeçalhos do CSV
        const headers = ['Veículo', 'Placa', 'Tipo de Serviço', 'Categoria', 'Data', 'Quilometragem (KM)', 'Valor (R$)', 'Observações'];

        // Linhas de dados
        const rows = manutencoes.map(m => {
            const veiculo = veiculosMap.get(m.veiculoId) || { modelo: 'Desconhecido', placa: '---' };
            const valorFormatado = (parseFloat(m.valor) || 0).toFixed(2).replace('.', ',');
            const dataFormatada = CalculosService.formatarData(m.data);

            return [
                `"${veiculo.modelo.replace(/"/g, '""')}"`,
                `"${veiculo.placa}"`,
                `"${m.tipoServico.replace(/"/g, '""')}"`,
                `"${m.categoria}"`,
                `"${dataFormatada}"`,
                m.km,
                `"${valorFormatado}"`,
                `"${(m.observacao || '').replace(/"/g, '""')}"`
            ];
        });

        // Adicionar BOM UTF-8 para garantir acentuação correta no Excel
        let csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.join(';') + '\n';
        });

        // Download do arquivo CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const dataAtual = new Date().toISOString().split('T')[0];
        const sulfix = veiculoAtivoId && veiculoAtivoId !== 'TODOS' ? `_veiculo_${veiculoAtivoId}` : '_consolidado';
        
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_manutencoes${sulfix}_${dataAtual}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Exportar / Gerar Impressão Formatada de Relatório PDF
    gerarRelatorioPDF(manutencoes, veiculos, veiculoAtivo, totais, maiorGasto, alertaRevisao) {
        // Criar uma janela temporária estilizada para impressão PDF
        const printWindow = window.open('', '_blank', 'width=900,height=800');
        if (!printWindow) {
            alert('Por favor, permita pop-ups no seu navegador para gerar o relatório PDF.');
            return;
        }

        const dataEmissao = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR');
        const veiculosMap = new Map();
        veiculos.forEach(v => veiculosMap.set(v.id, v));

        const tituloVeiculo = veiculoAtivo && veiculoAtivo !== 'TODOS' 
            ? `${veiculoAtivo.modelo} (${veiculoAtivo.placa}) - KM Atual: ${veiculoAtivo.kmAtual.toLocaleString('pt-BR')} KM`
            : 'Relatório Consolidado (Todos os Veículos)';

        let manutencoesHTML = '';
        if (manutencoes.length === 0) {
            manutencoesHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhuma manutenção registrada no período.</td></tr>';
        } else {
            manutencoes.forEach(m => {
                const veiculo = veiculosMap.get(m.veiculoId) || { modelo: 'Desconhecido', placa: '---' };
                manutencoesHTML += `
                    <tr>
                        <td>${veiculo.modelo} (${veiculo.placa})</td>
                        <td><strong>${m.tipoServico}</strong></td>
                        <td><span class="badge ${m.categoria.toLowerCase()}">${m.categoria}</span></td>
                        <td>${CalculosService.formatarData(m.data)}</td>
                        <td>${m.km.toLocaleString('pt-BR')} KM</td>
                        <td style="text-align: right; font-weight: bold;">${CalculosService.formatarMoeda(m.valor)}</td>
                    </tr>
                `;
            });
        }

        let alertaHTML = '';
        if (alertaRevisao) {
            alertaHTML = `
                <div class="alert-box ${alertaRevisao.status.toLowerCase()}">
                    <h3>${alertaRevisao.tituloStatus}</h3>
                    <p>${alertaRevisao.mensagem}</p>
                </div>
            `;
        }

        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Relatório de Manutenção Veicular - ${new Date().toISOString().split('T')[0]}</title>
                <style>
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        color: #1e293b;
                        padding: 24px;
                        line-height: 1.5;
                    }
                    .header {
                        border-bottom: 2px solid #2563eb;
                        padding-bottom: 16px;
                        margin-bottom: 24px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .header h1 {
                        margin: 0;
                        color: #1e293b;
                        font-size: 24px;
                    }
                    .header p {
                        margin: 4px 0 0 0;
                        color: #64748b;
                        font-size: 13px;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin-top: 24px;
                        margin-bottom: 12px;
                        color: #0f172a;
                    }
                    .cards-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                        margin-bottom: 24px;
                    }
                    .card {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 12px;
                    }
                    .card-label {
                        font-size: 11px;
                        text-transform: uppercase;
                        color: #64748b;
                        font-weight: bold;
                    }
                    .card-val {
                        font-size: 18px;
                        font-weight: bold;
                        margin-top: 4px;
                        color: #0f172a;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 12px;
                    }
                    th, td {
                        padding: 10px 12px;
                        text-align: left;
                        border-bottom: 1px solid #e2e8f0;
                        font-size: 13px;
                    }
                    th {
                        background-color: #f1f5f9;
                        color: #475569;
                        font-weight: bold;
                    }
                    .badge {
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 11px;
                        font-weight: bold;
                    }
                    .badge.preventiva { background: #dbeafe; color: #1e40af; }
                    .badge.preditiva { background: #dcfce7; color: #166534; }
                    .badge.corretiva { background: #fee2e2; color: #991b1b; }
                    .alert-box {
                        padding: 12px 16px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    .alert-box.vencido { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
                    .alert-box.proximo { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
                    .alert-box.em_dia { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 11px;
                        color: #94a3b8;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 12px;
                    }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>🚗 Relatório de Gestão de Manutenções</h1>
                        <p><strong>Filtro / Veículo:</strong> ${tituloVeiculo}</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Emissão:</strong> ${dataEmissao}</p>
                    </div>
                </div>

                ${alertaHTML}

                <div class="section-title">Resumo Financeiro</div>
                <div class="cards-grid">
                    <div class="card">
                        <div class="card-label">Preventiva</div>
                        <div class="card-val" style="color: #2563eb;">${CalculosService.formatarMoeda(totais.preventiva)}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Preditiva</div>
                        <div class="card-val" style="color: #059669;">${CalculosService.formatarMoeda(totais.preditiva)}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Corretiva</div>
                        <div class="card-val" style="color: #dc2626;">${CalculosService.formatarMoeda(totais.corretiva)}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Custo Total</div>
                        <div class="card-val">${CalculosService.formatarMoeda(totais.total)}</div>
                    </div>
                </div>

                <p style="margin-bottom: 20px; font-size: 13px;">
                    <strong>Maior Gasto do Período:</strong> 
                    <span style="font-weight: bold; color: #2563eb;">${maiorGasto.categoria}</span> 
                    (${CalculosService.formatarMoeda(maiorGasto.valor)} - ${maiorGasto.porcentagem}% do total)
                </p>

                <div class="section-title">Histórico Detalhado de Serviços (${manutencoes.length} registros)</div>
                <table>
                    <thead>
                        <tr>
                            <th>Veículo</th>
                            <th>Serviço / Manutenção</th>
                            <th>Categoria</th>
                            <th>Data</th>
                            <th>KM</th>
                            <th style="text-align: right;">Valor (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${manutencoesHTML}
                    </tbody>
                </table>

                <div class="footer">
                    Sistema de Gestão e Registro de Manutenção Veicular • Documento gerado automaticamente.
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    }
};
