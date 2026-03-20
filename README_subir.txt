Arquivos prontos para subir

1. index.html  -> use o arquivo index_final_pc_sync.html renomeando para index.html
2. mobile.html -> use o arquivo mobile_final_consulta.html renomeando para mobile.html
3. sheets-sync.js -> use o arquivo sheets-sync_final_pc.js renomeando para sheets-sync.js

Modelo novo:
- PC é a única ponta que escreve
- mobile é somente consulta
- mobile atualiza ao abrir, ao focar, no botão e a cada 15 minutos
- PC sincroniza com planilha automaticamente e mantém tombstones em _deleted

Planilha:
As abas esperadas no Apps Script são:
clientes, produtos, vendas, recebimentos, cobrancas, _deleted
