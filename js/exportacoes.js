/* =====================================================
   EXPORTAÇÕES DE OS FINALIZADAS
   Exporta somente dados textuais/estruturados da abertura da OS.
   Imagens, anexos e evidências visuais permanecem apenas na tela da OS.
===================================================== */

function obterOSFinalizadasParaExportacao() {
  let lista = chamados.filter(chamado => STATUS_EXPORTACAO_OS_FINALIZADAS.includes(chamado.status));

  if (termoBuscaChamados) {
    lista = lista.filter(chamado => montarTextoBuscaChamado(chamado).includes(termoBuscaChamados));
  }

  return lista.sort((a, b) => {
    const dataA = obterDataValida(a.criadoEm, a.data).getTime();
    const dataB = obterDataValida(b.criadoEm, b.data).getTime();

    return dataB - dataA;
  });
}

function exportarOSFinalizadasExcel() {
  const lista = obterOSFinalizadasParaExportacao();

  if (!validarExportacaoOSFinalizadas(lista)) {
    return;
  }

  const html = montarDocumentoTabelaExportacao({
    titulo: "Relatório de OS finalizadas",
    lista,
    formato: "excel"
  });

  baixarArquivoExportacao(
    html,
    montarNomeArquivoExportacao("os-finalizadas", "xls"),
    "application/vnd.ms-excel;charset=utf-8"
  );
}

function exportarOSFinalizadasWord() {
  const lista = obterOSFinalizadasParaExportacao();

  if (!validarExportacaoOSFinalizadas(lista)) {
    return;
  }

  const html = montarDocumentoTabelaExportacao({
    titulo: "Relatório de OS finalizadas",
    lista,
    formato: "word"
  });

  baixarArquivoExportacao(
    html,
    montarNomeArquivoExportacao("os-finalizadas", "doc"),
    "application/msword;charset=utf-8"
  );
}

function exportarOSFinalizadasPDF() {
  const lista = obterOSFinalizadasParaExportacao();

  if (!validarExportacaoOSFinalizadas(lista)) {
    return;
  }

  const html = montarDocumentoTabelaExportacao({
    titulo: "Relatório de OS finalizadas",
    lista,
    formato: "pdf"
  });

  const janela = window.open("", "_blank");

  if (!janela) {
    alert("O navegador bloqueou a janela de impressão. Libere pop-ups para gerar o PDF.");
    return;
  }

  janela.document.open();
  janela.document.write(html);
  janela.document.close();
  janela.focus();

  setTimeout(() => {
    janela.print();
  }, 300);
}

function validarExportacaoOSFinalizadas(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    alert("Nenhuma OS finalizada encontrada para exportação.");
    return false;
  }

  return true;
}

function montarDocumentoTabelaExportacao({ titulo, lista, formato }) {
  const dataGeracao = new Date().toLocaleString("pt-BR");
  const linhas = lista.map(montarLinhaTabelaExportacao).join("");
  const cabecalho = COLUNAS_EXPORTACAO_OS_FINALIZADAS
    .map(coluna => `<th>${escaparHTML(coluna.titulo)}</th>`)
    .join("");

  const estiloImpressao = formato === "pdf"
    ? "@media print { body { margin: 12mm; } .no-print { display: none; } table { page-break-inside: auto; } tr { page-break-inside: avoid; page-break-after: auto; } }"
    : "";

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>${escaparHTML(titulo)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          p { margin: 0 0 14px; color: #5f6b7a; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #1f6fe5; color: #fff; text-align: left; }
          th, td { border: 1px solid #d8dee9; padding: 7px; vertical-align: top; }
          tr:nth-child(even) td { background: #f7f9fc; }
          .resumo { margin-bottom: 12px; }
          .no-print { margin-bottom: 12px; }
          .no-print button { padding: 8px 12px; border: 1px solid #d8dee9; border-radius: 8px; background: #fff; cursor: pointer; }
          ${estiloImpressao}
        </style>
      </head>
      <body>
        ${formato === "pdf" ? `<div class="no-print"><button type="button" id="botao-imprimir-relatorio">Imprimir / salvar em PDF</button></div>` : ""}
        <h1>${escaparHTML(titulo)}</h1>
        <p class="resumo">Senac Campo Mourão • Gerado em ${escaparHTML(dataGeracao)} • Total: ${lista.length} OS • Exportação sem imagens/anexos</p>

        ${formato === "pdf" ? `<script>
          document.getElementById("botao-imprimir-relatorio")?.addEventListener("click", function () {
            window.print();
          });
        <\/script>` : ""}
        <table>
          <thead>
            <tr>${cabecalho}</tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </body>
    </html>
  `;
}

function montarLinhaTabelaExportacao(chamado) {
  return `
    <tr>
      ${COLUNAS_EXPORTACAO_OS_FINALIZADAS
        .map(coluna => `<td>${escaparHTML(obterValorExportacaoChamado(chamado, coluna.chave))}</td>`)
        .join("")}
    </tr>
  `;
}

function obterValorExportacaoChamado(chamado, chave) {
  const valoresCalculados = {
    equipamento: [chamado.equipamentoCodigo, chamado.equipamentoNome].filter(Boolean).join(" - ") || chamado.equipamento || chamado.ativoCodigo,
    dataCriacao: formatarCampoDataExportacao(chamado.criadoEm || chamado.data, chamado.data)
  };

  if (Object.prototype.hasOwnProperty.call(valoresCalculados, chave)) {
    return valoresCalculados[chave] || "-";
  }

  return chamado[chave] || "-";
}

function formatarCampoDataExportacao(valor, dataReservaBR) {
  if (!valor && !dataReservaBR) {
    return "-";
  }

  if (typeof valor === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    return valor;
  }

  const data = obterDataValida(valor, dataReservaBR);

  if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
    return dataReservaBR || "-";
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function baixarArquivoExportacao(conteudo, nomeArquivo, tipoMime) {
  const blob = new Blob(["\ufeff", conteudo], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function montarNomeArquivoExportacao(prefixo, extensao) {
  const agora = new Date();
  const data = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0")
  ].join("-");

  return `${prefixo}-${data}.${extensao}`;
}
