/* Aspen Core, dados das peças do modelo 3D da bancada. Um lugar só para texto, ordem e vista explodida.
   id = nome do grupo em bancada3d.js. pino: mostra o marcador sobre o modelo. exp: deslocamento (mm) na vista explodida.
   funcao: resumo de uma linha. detalhes: pares [rótulo, valor] do cartão. fluxo: como a peça entra no uso da chave.
   pendente: texto de pendência, aparece só enquanto o modelo estiver em rascunho (PENDENTE P22 e P09 em PENDENCIAS.md).
   Regra de verdade: o que o firmware esp32-fido2-lab, a demonstração de 29/10/2026 e o Henrique confirmaram.
   ATECC e NFC entram como parte da chave por decisão do Henrique (implementação na semana de 29/10/2026); ver P22. */
export var PARTES = [
  { id: 'esp32-usb', nome: 'Ligação USB-C', pino: true, exp: [0, 34, 10],
    funcao: 'Primeira forma de uso: conectada ao computador.',
    texto: 'A placa possui duas entradas USB-C. É por uma delas, com um cabo, que o protótipo se liga ao computador, recebe energia e se comunica com ele.',
    detalhes: [['Protocolo', 'CTAP2 (FIDO2) sobre USB HID'], ['Entradas na placa', '2, no padrão USB-C']],
    fluxo: 'Com a chave conectada, o desafio do site chega por aqui e a assinatura retorna pelo mesmo caminho.' },
  { id: 'esp32', nome: 'Placa de controle ESP32-S3', pino: true, exp: [0, 34, 10],
    funcao: 'Executa o programa da chave.',
    texto: 'É o núcleo da montagem. Comunica-se com o computador, verifica o PIN, aguarda a confirmação por toque e encaminha o pedido de assinatura ao chip de segurança.',
    detalhes: [['Processador', 'ESP32-S3, dois núcleos'], ['Programa', 'Firmware FIDO2 de laboratório'], ['Algoritmo', 'ES256: ECDSA P-256 com SHA-256'], ['PIN', '12 a 63 caracteres, enviado cifrado pelo navegador']],
    fluxo: 'Recebe o desafio pelo USB, consulta o chip pelo barramento I2C e devolve a resposta montada.' },
  { id: 'esp32-botoes', nome: 'Botões BOOT e RST', pino: true, exp: [0, 34, 10],
    funcao: 'O BOOT confirma a presença física.',
    texto: 'O botão BOOT confirma que há uma pessoa presente: a chave só assina após o acionamento. O RST reinicia a placa.',
    detalhes: [['BOOT', 'Pino 0 da ESP32-S3'], ['Na verificação', 'Aparece como UP, presença confirmada'], ['RST', 'Reinicia a placa']],
    fluxo: 'Com a chave no USB, o site solicita o toque depois do PIN e o botão BOOT libera a assinatura. No celular, por NFC, a própria aproximação cumpre esse papel.' },
  { id: 'nfc', nome: 'Leitor NFC', pino: true, exp: [10, 44, -8],
    funcao: 'Segunda forma de uso planejada: aproximar do celular.',
    texto: 'Ainda não é usado no protótipo, embora o código já funcione. A ideia é que o módulo vermelho cumpra a mesma função do USB, sem cabo. A chave é aproximada da parte traseira do celular, e a moldura branca (a antena) se comunica com ele por proximidade. A aproximação já vale como confirmação por toque.',
    detalhes: [['Situação', 'Código funcionando, ainda sem uso no protótipo'], ['Módulo', 'PN532'], ['Frequência', '13,56 MHz'], ['Ligação', 'Fios até a placa de controle'], ['Funciona com', 'Celulares com NFC, a poucos centímetros']],
    fluxo: 'USB no computador e NFC no celular são duas formas de chegar ao mesmo resultado. Internamente o caminho é o mesmo, e o chip de segurança assina da mesma maneira.' },
  { id: 'chip-seguranca', nome: 'Chip de segurança ATECC', pino: true, exp: [-4, 44, -12],
    funcao: 'Armazena a chave privada e realiza a assinatura.',
    texto: 'O módulo azul abriga o chip de segurança. A chave privada é gerada dentro dele e nunca sai: o chip recebe o desafio e devolve apenas a assinatura.',
    detalhes: [['Ligação', 'I2C (SDA e SCL), mais alimentação'], ['Assinatura', 'ECDSA P-256, realizada dentro do chip'], ['Chave privada', 'Gerada no chip e nunca copiada para fora']],
    fluxo: 'A ESP32-S3 envia o desafio pelo I2C, o chip assina e devolve a assinatura.',
    pendente: 'PENDENTE P09: a documentação do firmware cita o ATECC608B; confirmar na peça.' },
  { id: 'botao-pressao', nome: 'Botão de pressão', pino: true, exp: [-16, 24, 0],
    funcao: 'Botão adicional da montagem.',
    texto: 'Botão de pressão preto, ao lado do módulo azul do chip.',
    detalhes: [['Tipo', 'Botão tátil de 6 x 6 mm']],
    pendente: 'PENDENTE P22: confirmar a função deste botão.' },
  { id: 'protoboard', nome: 'Protoboard', pino: true,
    funcao: 'Base de testes sem solda.',
    texto: 'A base branca com furos é uma protoboard. Ela permite conectar e trocar componentes sem solda, prática comum em testes. Por isso o protótipo de hoje é uma montagem de bancada, e o design final pode mudar.',
    detalhes: [['Tamanho', '830 pontos, 165 x 55 mm'], ['Passo dos furos', '2,54 mm']] },
  { id: 'fios', nome: 'Fios de ligação', pino: false,
    funcao: 'Alimentação e dados entre as peças.',
    texto: 'Os fios ligam a placa de controle, o chip de segurança e o leitor NFC. A ligação foi feita manualmente, fio a fio. As cores servem apenas para organização.',
    detalhes: [['Montagem', 'Sem solda entre as peças e a protoboard']] }
];
