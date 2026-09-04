import React from 'react';
import { EPIDeclaration } from '../types';
import { PneuBrasLogo } from './PneuBrasLogo';

interface EPIDocumentProps {
  declaration: EPIDeclaration;
  customLogo?: string | null;
}

// Utility to format ISO date (YYYY-MM-DD) to Brazilian format (DD/MM/YYYY)
const formatDateBR = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const EPIDocument: React.FC<EPIDocumentProps> = ({ declaration, customLogo = null }) => {
  const tableRowsCount = Math.max(4, declaration.items.length);
  const rows = Array.from({ length: tableRowsCount }).map((_, index) => {
    return declaration.items[index] || null;
  });

  return (
    <div 
      id="epi-document-sheet"
      className="bg-white text-black font-sans print-container p-8 md:p-12 shadow-md border border-gray-200 mx-auto w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Section */}
      <div>
        {/* Header with Logo and Title */}
        <div className="flex flex-row items-center justify-between gap-6 pb-4">
          {customLogo ? (
            <img 
              src={customLogo} 
              alt="Logo PneuBras" 
              className="flex-shrink-0 max-w-[200px]"
              style={{ height: '65px', objectFit: 'contain' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <PneuBrasLogo height={65} className="flex-shrink-0" />
          )}

          <div className="text-left flex-1">
            <h1 className="text-[13px] font-bold leading-tight uppercase tracking-tight text-black">
              DECLARAÇÃO DE RECEBIMENTO DE EQUIPAMENTO DE
              PROTEÇÃO INDIVIDUAL E RESPONSABILIDADE DE USO E
              GUARDA
            </h1>
            <p className="text-[12px] font-extrabold tracking-wider text-black mt-1">
              PNEUBRAS COMERCIO DE PNEUS LTDA
            </p>
          </div>
        </div>

        {/* NÚMERO UNICO Row */}
        <div className="border-t border-black py-1.5 flex justify-between items-center text-[11px]">
          <span className="font-bold uppercase">NÚMERO UNICO: <span className="font-mono text-[12px] ml-1">{declaration.numeroUnico || '___________'}</span></span>
        </div>

        {/* Employee details form section */}
        <div className="border-t border-black text-[10.5px] leading-[1.3] py-2 grid grid-cols-12 gap-y-1">
          {/* Row 1 */}
          <div className="col-span-7 flex">
            <span className="font-bold min-w-[90px]">Funcionário:</span>
            <span className="border-b border-gray-200 flex-1 truncate uppercase font-medium">{declaration.funcionario || '__________________________________________________'}</span>
          </div>
          <div className="col-span-5 flex pl-4">
            <span className="font-bold min-w-[110px]">Centro de Custo:</span>
            <span className="border-b border-gray-200 flex-1 truncate uppercase font-medium">{declaration.centroDeCusto || '________________________'}</span>
          </div>

          {/* Row 2 */}
          <div className="col-span-7 flex">
            <span className="font-bold min-w-[90px]">Empresa:</span>
            <span className="border-b border-gray-200 flex-1 truncate uppercase font-medium">{declaration.empresa || 'PNEUBRAS COMERCIO DE PNEUS LTDA'}</span>
          </div>
          <div className="col-span-5 flex pl-4">
            <span className="font-bold min-w-[110px]">Matrícula:</span>
            <span className="border-b border-gray-200 flex-1 truncate uppercase font-mono font-medium">{declaration.matricula || '________________________'}</span>
          </div>

          {/* Row 3 */}
          <div className="col-span-7 flex">
            <span className="font-bold min-w-[90px]">Reg. Trabalho:</span>
            <span className="border-b border-gray-200 flex-1 truncate uppercase font-medium">{declaration.regTrabalho || 'Normal'}</span>
          </div>
          <div className="col-span-5 flex pl-4">
            <span className="font-bold min-w-[110px]">Nascimento:</span>
            <span className="border-b border-gray-200 flex-1 truncate font-medium">{formatDateBR(declaration.nascimento) || '__/__/____'}</span>
          </div>

          {/* Row 4 */}
          <div className="col-span-7 flex">
            <span className="font-bold min-w-[90px]">Função:</span>
            <span className="border-b border-gray-200 flex-1 truncate uppercase font-bold text-slate-900">{declaration.funcao || '__________________________________'}</span>
          </div>
          <div className="col-span-5 flex pl-4">
            <span className="font-bold min-w-[110px]">Admissão:</span>
            <span className="border-b border-gray-200 flex-1 truncate font-medium">{formatDateBR(declaration.admissao) || '__/__/____'}</span>
          </div>

          {/* Row 5 */}
          <div className="col-span-7 flex">
            <span className="font-bold min-w-[90px]">Setor:</span>
            <span className="border-b border-gray-200 flex-1 truncate uppercase font-medium">{declaration.setor || '__________________________________'}</span>
          </div>
          <div className="col-span-5 flex pl-4">
            <span className="font-bold min-w-[110px]">RG:</span>
            <span className="border-b border-gray-200 flex-1 truncate uppercase font-mono font-medium">{declaration.rg || '________________________'}</span>
          </div>
        </div>

        {/* Declaration Legal Text Block */}
        <div className="border-t border-black pt-2 text-[9px] leading-[1.3] text-justify space-y-2 text-slate-800">
          <p>
            Eu, <strong className="uppercase text-black">{declaration.funcionario || '___________________________________________'}</strong>,
          </p>
          <p>
            Declaro para todos os efeitos previstos na legislação, haver recebido gratuitamente, conforme descrito na C.L.T, nos artigos 166, 167 e demais artigos adstritos à matéria, na NR - 6 e nos itens 1.4.2 e 1.5.5,1.2 da NR - 1 DISPOSIÇÕES GERAIS e GERENCIAMENTO DE RISCOS OCUPACIONAIS, após treinamento e orientação do uso adequado, aplicação, guarda, conservação, substituição e requisitos de higiene, em palestra realizada pelo Serviço Especializado em Segurança e Medicina do Trabalho da empresa, <strong className="uppercase text-black">PNEUBRAS COMERCIO DE PNEUS LTDA</strong>, o(s) equipamento(s) de proteção individual abaixo descrito(s) e designado(s) como EPIs, os quais obrigo-me a usá-los(s) sistematicamente em meu trabalho, mediante ainda, os termos seguintes:
          </p>
          <p>
            a) O EPI será usado unicamente para finalidade a que se destina a qualquer alteração que o torne parcial ou totalmente danificado será por mim comunicado à empresa;
          </p>
          <p>
            b) Declaro que me responsabilizo pela guarda e conservação dos EPI&apos;s que me foram confiados e que, na impossibilidade de seu uso, deverei comunicar a chefia imediatamente, para as providências que se fizerem necessárias, e os devolverei após o vencimento de duração estipulada;
          </p>
          <p>
            c) Estou ciente e de Pleno acordo que a falta de uso por mim, dos EPI&apos;s fornecidos pela Empresa, constitui Ato Faltoso, sujeito às sanções disciplinares previstas na legislação pertinente aos assuntos, Regulamento Interno e Normas de Segurança da Empresa;
          </p>
          <p>
            d) Reconhecendo expressamente que à sua não utilização configura em falta grave capitulada na letra &quot;h&quot;, do Artigo 482 da C.L.T., como ato de indisciplina ou de insubordinação, ensejadora da rescisão do meu contrato de trabalho por justa causa;
          </p>
          <p>
            e) Autorizo expressamente a Empresa a proceder descontos no meus salários , vencimentos, graticações, indenizações, os valores dos EPI&apos;s que por ventura por mim forem:
          </p>
          <ul className="list-none pl-4 space-y-0.5">
            <li>- Danificados propositadamente;</li>
            <li>- Extraviados;</li>
            <li>- Não devolvidos à empresa para substituição;</li>
          </ul>
          <p>
            f) Tomei ciência e estou de acordo com os termos da declaração acima, assinando-a de livre e espontânea vontade, após sua leitura nessa data.
          </p>
        </div>

        {/* EPI Table Header Banner */}
        <div className="mt-4 bg-[#bfbfbf] border border-black border-b-0 py-0.5 text-center text-[11px] font-bold tracking-widest text-black select-none">
          EPI
        </div>

        {/* EPI Table */}
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-gray-50 text-[10px] select-none">
              <th className="border border-black px-2 py-1 font-bold text-center w-[15%]">Data Entrega</th>
              <th className="border border-black px-2 py-1 font-bold text-center w-[12%]">Código</th>
              <th className="border border-black px-2 py-1 font-bold text-left w-[47%]">Descrição</th>
              <th className="border border-black px-2 py-1 font-bold text-center w-[8%]">Un</th>
              <th className="border border-black px-2 py-1 font-bold text-center w-[8%]">Qtd</th>
              <th className="border border-black px-2 py-1 font-bold text-center w-[10%]">Cod . Ca</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, idx) => {
              if (item) {
                return (
                  <tr key={item.id} className="h-7 text-black hover:bg-slate-50 transition-colors">
                    <td className="border border-black px-2 py-1 text-center font-mono font-medium">
                      {formatDateBR(item.dataEntrega)}
                    </td>
                    <td className="border border-black px-2 py-1 text-center font-mono font-bold text-blue-900">
                      {item.codigo || ''}
                    </td>
                    <td className="border border-black px-2 py-1 text-left uppercase font-semibold text-slate-800">
                      {item.descricao || ''}
                    </td>
                    <td className="border border-black px-2 py-1 text-center font-mono uppercase">
                      {item.un || ''}
                    </td>
                    <td className="border border-black px-2 py-1 text-center font-mono font-bold">
                      {item.qtd || ''}
                    </td>
                    <td className="border border-black px-2 py-1 text-center font-mono">
                      {item.codCa || ''}
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={`empty-${idx}`} className="h-7">
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1 text-center font-mono text-[9px] text-gray-400">
                      {idx === 1 ? 'UN' : ''}
                    </td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Signature Section */}
      <div className="mt-8 pt-4 flex flex-row items-end justify-end text-[11px]">
        <div className="w-[60%] flex flex-col items-center">
          <div className="w-full border-b border-black h-1"></div>
          <span className="text-[9px] uppercase font-bold text-slate-600 mt-1.5 text-center tracking-wider">
            Assinatura do Funcionário (Recebedor)
          </span>
        </div>
      </div>
    </div>
  );
};