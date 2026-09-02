import { EPITemplate, FunctionTemplate } from './types';

export const COMMON_EPIS: EPITemplate[] = [
  { codigo: '4115', descricao: 'ABAFADOR DE RUIDOS (TIPO CONCHA)', un: 'UN', codCa: '15623' },
  { codigo: '1022', descricao: 'BOTA DE SEGURANÇA COM BIQUEIRA DE AÇO', un: 'PR', codCa: '32415' },
  { codigo: '2201', descricao: 'LUVA DE PROTEÇÃO NITRILICA', un: 'PR', codCa: '41253' },
  { codigo: '2202', descricao: 'LUVA DE RASPA DE COURO', un: 'PR', codCa: '28145' },
  { codigo: '3054', descricao: 'ÓCULOS DE SEGURANÇA INCOLOR', un: 'UN', codCa: '25346' },
  { codigo: '3055', descricao: 'ÓCULOS DE SEGURANÇA ESCURO', un: 'UN', codCa: '25347' },
  { codigo: '5502', descricao: 'AVENTAL DE RASPA DE COURO', un: 'UN', codCa: '18765' },
  { codigo: '6112', descricao: 'MASCARA SEMIFACIAL FILTRANTE PFF2', un: 'UN', codCa: '38945' },
  { codigo: '7088', descricao: 'CREME PROTETOR DE PELE (DERMATOLÓGICO)', un: 'TB', codCa: '12044' },
  { codigo: '8021', descricao: 'CAPACETE DE SEGURANÇA COM JUGULAR', un: 'UN', codCa: '29833' },
  { codigo: '9045', descricao: 'PROTETOR AURICULAR (TIPO PLUG)', un: 'UN', codCa: '11542' }
];

export const FUNCTION_TEMPLATES: FunctionTemplate[] = [
  {
    funcao: 'BORRACHEIRO',
    setor: 'OFICINA / BORRACHARIA',
    centroDeCusto: 'CC-BORRACHARIA',
    items: [
      { codigo: '4115', descricao: 'ABAFADOR', un: 'UN', codCa: '15623', qtd: 1 },
      { codigo: '1022', descricao: 'BOTA DE SEGURANÇA COM BIQUEIRA DE AÇO', un: 'PR', codCa: '32415', qtd: 1 },
      { codigo: '2201', descricao: 'LUVA DE PROTEÇÃO NITRILICA', un: 'PR', codCa: '41253', qtd: 2 },
      { codigo: '3054', descricao: 'ÓCULOS DE SEGURANÇA INCOLOR', un: 'UN', codCa: '25346', qtd: 1 }
    ]
  },
  {
    funcao: 'MECÂNICO DE SUSPENSÃO',
    setor: 'OFICINA MECÂNICA',
    centroDeCusto: 'CC-MECANICA',
    items: [
      { codigo: '1022', descricao: 'BOTA DE SEGURANÇA COM BIQUEIRA DE AÇO', un: 'PR', codCa: '32415', qtd: 1 },
      { codigo: '2201', descricao: 'LUVA DE PROTEÇÃO NITRILICA', un: 'PR', codCa: '41253', qtd: 3 },
      { codigo: '3054', descricao: 'ÓCULOS DE SEGURANÇA INCOLOR', un: 'UN', codCa: '25346', qtd: 1 },
      { codigo: '9045', descricao: 'PROTETOR AURICULAR (TIPO PLUG)', un: 'UN', codCa: '11542', qtd: 1 }
    ]
  },
  {
    funcao: 'ALINHADOR',
    setor: 'OFICINA / ALINHAMENTO',
    centroDeCusto: 'CC-ALINHAMENTO',
    items: [
      { codigo: '1022', descricao: 'BOTA DE SEGURANÇA COM BIQUEIRA DE AÇO', un: 'PR', codCa: '32415', qtd: 1 },
      { codigo: '2201', descricao: 'LUVA DE PROTEÇÃO NITRILICA', un: 'PR', codCa: '41253', qtd: 2 },
      { codigo: '3054', descricao: 'ÓCULOS DE SEGURANÇA INCOLOR', un: 'UN', codCa: '25346', qtd: 1 }
    ]
  },
  {
    funcao: 'VENDEDOR DE PNEUS',
    setor: 'COMERCIAL',
    centroDeCusto: 'CC-VENDAS',
    items: [
      { codigo: '1022', descricao: 'BOTA DE SEGURANÇA COM BIQUEIRA DE AÇO', un: 'PR', codCa: '32415', qtd: 1 },
      { codigo: '3054', descricao: 'ÓCULOS DE SEGURANÇA INCOLOR', un: 'UN', codCa: '25346', qtd: 1 }
    ]
  },
  {
    funcao: 'GERENTE DE LOJA',
    setor: 'ADMINISTRATIVO / COMERCIAL',
    centroDeCusto: 'CC-ADMIN',
    items: [
      { codigo: '1022', descricao: 'BOTA DE SEGURANÇA COM BIQUEIRA DE AÇO', un: 'PR', codCa: '32415', qtd: 1 }
    ]
  }
];

export const INITIAL_DECLARATION_MOCK = {
  id: 'mock-1',
  numeroUnico: '008942',
  funcionario: 'CARLOS HENRIQUE DA SILVA',
  centroDeCusto: 'CC-OFICINA-01',
  empresa: 'PNEUBRAS COMERCIO DE PNEUS LTDA',
  matricula: 'MT-45092',
  regTrabalho: 'Normal',
  nascimento: '1988-11-24',
  funcao: 'BORRACHEIRO',
  admissao: '2024-03-10',
  setor: 'BORRACHARIA SÊNIOR',
  rg: '42.984.102-X',
  dataDeclaracao: new Date().toISOString().split('T')[0],
  items: [
    {
      id: 'item-1',
      dataEntrega: new Date().toISOString().split('T')[0],
      codigo: '4115',
      descricao: 'ABAFADOR DE RUIDOS (TIPO CONCHA)',
      un: 'UN',
      qtd: 1,
      codCa: '15623'
    },
    {
      id: 'item-2',
      dataEntrega: new Date().toISOString().split('T')[0],
      codigo: '2201',
      descricao: 'LUVA DE PROTEÇÃO NITRILICA',
      un: 'PR',
      qtd: 1,
      codCa: '41253'
    },
    {
      id: 'item-3',
      dataEntrega: '',
      codigo: '',
      descricao: '',
      un: 'UN',
      qtd: 1,
      codCa: ''
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
