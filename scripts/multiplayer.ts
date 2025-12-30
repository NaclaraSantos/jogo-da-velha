import { signInAnonymously } from "firebase/auth";
import { collection, doc, onSnapshot, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { applyMove, type PlayerSymbol } from "./utils";
export async function ensureAnonAuth() {
  // já tem usuário logado?
  if (auth.currentUser) return auth.currentUser;

  // faz login anônimo
  const cred = await signInAnonymously(auth);
  return cred.user;
}



type RoomDoc = {
  board: ( "X" | "O" | null )[];
  turn: "X" | "O";
  status: "waiting" | "playing" | "finished";
  winner: "X" | "O" | null;
  winningLine: number[] | null;
  players: {
    X: { uid: string };
    O: { uid: string } | null;
  };
  createdAt: any;
  updatedAt: any;
};

export async function createRoom(): Promise<{ roomId: string }> {
  const user = await ensureAnonAuth();

  const roomsRef = collection(db, "rooms");
  const roomRef = doc(roomsRef); // gera id automaticamente
  const roomId = roomRef.id;

  const room: RoomDoc = {
    board: Array(9).fill(null),
    turn: "X",
    status: "waiting",
    winner: null,
    winningLine: null,
    players: { X: { uid: user.uid }, O: null },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(roomRef, room);
  return { roomId };
}

// entra como O (se estiver vazio)
export async function joinRoom(roomId: string): Promise<{ mySymbol: "O" | "X" }> {
  const user = await ensureAnonAuth();
  const ref = doc(db, "rooms", roomId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Sala não existe.");

    const room = snap.data() as any;

    const uidX = room.players?.X?.uid ?? room.players?.X ?? null;
    const uidO = room.players?.O?.uid ?? room.players?.O ?? null;

    // já sou X?
    if (uidX === user.uid) return;

    // já sou O?
    if (uidO === user.uid) return;

    // sala cheia
    if (uidO) throw new Error("Sala cheia.");

    // setar O + começar jogo
    tx.update(ref, {
      players: room.players?.X?.uid
        ? { ...room.players, O: { uid: user.uid } } // players como objeto {uid}
        : { X: uidX, O: user.uid },                 // players como string
      status: "playing",
      updatedAt: serverTimestamp(),
    });
  });

  // no MVP, se você entrou é O (a não ser que já fosse X)
  return { mySymbol: "O" };
}

// listener realtime
export function listenRoom(roomId: string, cb: (room: any | null) => void) {
  const ref = doc(db, "rooms", roomId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return cb(null);
    cb(snap.data());
  });
}
export async function makeMove(roomId: string, index: number, mySymbol: PlayerSymbol) {
  const user = await ensureAnonAuth();
  const ref = doc(db, "rooms", roomId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Sala não existe.");

    const room = snap.data() as any;

    // garante que o uid bate com o símbolo
    const uidX = room.players?.X?.uid ?? room.players?.X ?? null;
    const uidO = room.players?.O?.uid ?? room.players?.O ?? null;

    if (mySymbol === "X" && user.uid !== uidX) throw new Error("Você não é o X desta sala.");
    if (mySymbol === "O" && user.uid !== uidO) throw new Error("Você não é o O desta sala.");

    const next = applyMove(
      {
        board: room.board,
        turn: room.turn,
        status: room.status,
        winner: room.winner,
        winningLine: room.winningLine,
      },
      index,
      mySymbol
    );

    // se não mudou nada, jogada inválida (fora do turno / casa ocupada / finished)
    const changed =
      next.board.some((v: any, i: number) => v !== room.board[i]) ||
      next.turn !== room.turn ||
      next.status !== room.status;

    if (!changed) return;

    tx.update(ref, {
      board: next.board,
      turn: next.turn,
      status: next.status,
      winner: next.winner,
      winningLine: next.winningLine,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function leaveRoom(roomId: string) {
  const user = await ensureAnonAuth();
  const ref = doc(db, "rooms", roomId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;

    // MVP: ao sair, finaliza a sala (pronto e simples)
    tx.update(ref, {
      status: "finished",
      winner: null,
      winningLine: null,
      endedAt: serverTimestamp(),
      endedBy: user.uid,
      updatedAt: serverTimestamp(),
    });
  });
}
