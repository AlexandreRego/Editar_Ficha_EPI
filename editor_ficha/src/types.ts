export interface EPIItem {
  id: string;
  dataEntrega: string;
  codigo: string;
  descricao: string;
  un: string;
  qtd: number;
  codCa: string;
}

export interface EPIDeclaration {
  id: string;
  numeroUnico: string;
  funcionario: string;
  centroDeCusto: string;
  empresa: string;
  matricula: string;
  regTrabalho: string;
  nascimento: string;
  funcao: string;
  admissao: string;
  setor: string;
  rg: string;
  dataDeclaracao: string;
  items: EPIItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EPITemplate {
  codigo: string;
  descricao: string;
  un: string;
  codCa: string;
}

export interface FunctionTemplate {
  funcao: string;
  setor: string;
  centroDeCusto: string;
  items: Omit<EPIItem, 'id' | 'dataEntrega'>[];
}
