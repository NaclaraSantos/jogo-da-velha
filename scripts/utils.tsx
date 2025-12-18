// ----------------------------------------------------
//          FUNÇÃO PARA CALCULAR O VENCEDOR
// ----------------------------------------------------
export function calcularVencedor(tabuleiro: (string | null)[]) {
  const linhasVencedoras = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let linha of linhasVencedoras) {
    const [a, b, c] = linha;

    if (
      tabuleiro[a] &&
      tabuleiro[a] === tabuleiro[b] &&
      tabuleiro[a] === tabuleiro[c]
    ) {
      return {
        jogador: tabuleiro[a],
        linha: linha,
      };
    }
  }

  return null;
}
// ----------------------------------------------------
//          FUNÇÃO PARA DETECTAR EMPATE
// ----------------------------------------------------
export function verificarEmpate(tabuleiro: (string | null)[]) {
  return tabuleiro.every((casa) => casa !== null);
}