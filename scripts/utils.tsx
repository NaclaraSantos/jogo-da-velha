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

export type PlayerSymbol = "X" | "O";
export type CellValue = PlayerSymbol | null;
export type GameStatus = "waiting" | "playing" | "finished";

export type GameState = {
  board: CellValue[];
  turn: PlayerSymbol;
  status: GameStatus;
  winner: PlayerSymbol | null;
  winningLine: number[] | null;
};

export function createInitialGameState(): GameState {
  return {
    board: Array(9).fill(null),
    turn: "X",
    status: "playing",
    winner: null,
    winningLine: null,
  };
}

export function applyMove(state: GameState, indice: number, symbol: PlayerSymbol): GameState {
  if (state.status !== "playing") return state;
  if (state.turn !== symbol) return state;
  if (indice < 0 || indice > 8) return state;
  if (state.board[indice]) return state;

  const newBoard = [...state.board];
  newBoard[indice] = symbol;

  const resultado = calcularVencedor(newBoard);
  const winner = (resultado?.jogador ?? null) as PlayerSymbol | null;
  const winningLine = resultado?.linha ?? null;
  const empate = !winner && verificarEmpate(newBoard);

  if (winner || empate) {
    return { ...state, board: newBoard, status: "finished", winner, winningLine };
  }

  const nextTurn: PlayerSymbol = symbol === "X" ? "O" : "X";
  return { ...state, board: newBoard, turn: nextTurn, winner: null, winningLine: null };
}