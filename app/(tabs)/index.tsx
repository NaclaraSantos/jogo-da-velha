import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Quadrado from "../../components/Quadrado";
import { createRoom, ensureAnonAuth, joinRoom, leaveRoom, listenRoom, makeMove } from "../../scripts/multiplayer";
import { applyMove, calcularVencedor, createInitialGameState, type GameState, verificarEmpate } from "../../scripts/utils";


// ----------------------------------------------
//                TELA INICIAL
// ----------------------------------------------   

export default function Index() {

  // --------------------------------
  //      EFEITOS COLATERAIS
  // --------------------------------
  
  // autentica anonimamente ao montar o componente
  useEffect(() => {
  ensureAnonAuth()
    .then((user) => console.log("✅ UID:", user.uid))
    .catch((err) => console.log("❌ Auth error:", err));
}, []);


  // --------------------------------
  //        ESTADOS DO COMPONENTE
  // -------------------------------- 
//  const [tabuleiro, setTabuleiro] = useState<(string | null)[]>(    Array(9).fill(null)  );
//  const [xEhAVez, setXEhAVez] = useState(true);
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const resultado = calcularVencedor(game.board);
  const vencedor = resultado?.jogador;
  const linhaVencedora = resultado?.linha;
  const empate = !vencedor && verificarEmpate(game.board);

  const [roomId, setRoomId] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [mySymbol, setMySymbol] = useState<"X" | "O">("X");
  const [banner, setBanner] = useState<string | null>(null);
  const prevRoomStatus = useRef<GameState["status"] | null>(null);


  // escuta atualizações da sala atual
  useEffect(() => {
    if (!currentRoomId) return;

    const unsub = listenRoom(currentRoomId, (room) => {
    if (!room) return;
   
  const nextGame: GameState = {
    board: room.board,
    turn: room.turn,
    status: room.status,
    winner: room.winner,
    winningLine: room.winningLine,
  };

      // ✅ detecta waiting -> playing
    const prev = prevRoomStatus.current;
    if (prev === "waiting" && nextGame.status === "playing") {
      setBanner("✅ Sala pronta, começar o jogo!");
      setTimeout(() => setBanner(null), 2500);
    }
    prevRoomStatus.current = nextGame.status;

    setGame(nextGame);
  });

      return () => unsub();
    }, [currentRoomId]);


  // --------------------------------
  //        FUNÇÕES DO COMPONENTE
  // -------------------------------- 
  async function handlePress(indice: number) {

    //setGame((prev) => applyMove(prev, indice, prev.turn)); // o bloco abaixo foi substituído por esta linha que aplica a jogada no estado do jogo
   
  console.log("clicou", indice);
  setGame((prev) => {
    const next = applyMove(prev, indice, prev.turn);
    console.log("antes:", prev.board, "depois:", next.board);
    return next;
  });

 if (currentRoomId) {
    if (game.status !== "playing") return;
    if (game.turn !== mySymbol) return;

    try {
      await makeMove(currentRoomId, indice, mySymbol);
    } catch (e) {
      console.log("❌ makeMove:", e);
    }
    return;
  }

  // (opcional) modo offline/local se não tiver sala
  setGame((prev) => applyMove(prev, indice, prev.turn));
  }

  // reinicia o jogo
  function resetarJogo() {
    setGame(createInitialGameState()); // os comandos abaixo foram substituídos por esta linha que zera todo o estado do jogo
 // setTabuleiro(Array(9).fill(null));
 // setXEhAVez(true);
}

// --------------------------------
//        RENDERIZAÇÃO
// -------------------------------- 

  return (
    <ScrollView 
    contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
    >
      <Text style={styles.text}>Jogo da Velha</Text>
      {/* Texto que mostra quem está jogando */}
      <Text style={styles.status}>
        {vencedor
          ? `Vencedor: ${vencedor}`
          : empate
          ? "Empate!"
          : `Vez de: ${game.turn}`}
      </Text>
        
        {banner && (
      <Text style={{ marginTop: 8, color: "#22c55e", fontSize: 16, fontWeight: "bold" }}>
        {banner}
        </Text>
  )}


      {/* Tabuleiro */}
            <View style={styles.board}>
          {game.board.map((valor, indice) => {
        const lockedByStatus = game.status !== "playing";
        const lockedByTurn = currentRoomId ? game.turn !== mySymbol : false;
        const disabled = lockedByStatus || lockedByTurn;

        return (
          <Quadrado
            key={indice}
            valor={valor}
            onPress={() => handlePress(indice)}
            destaque={linhaVencedora?.includes(indice)}
            disabled={disabled}
          />
        );
      })}

      </View>

      <View style={styles.botoesRow}>
        <Pressable style={[styles.botaoBase, styles.botaoReset]} onPress={resetarJogo}>
          <Text style={styles.textoBotao}>Resetar</Text>
        </Pressable>

        {/* Botões de criar/entrar sala */}
        <Pressable
          style={[styles.botaoBase, styles.botaoSala]}
          onPress={async () => {
            try {
              const { roomId } = await createRoom();
              setCurrentRoomId(roomId);     // ✅ importantíssimo
              setMySymbol("X");             // (vamos criar esse state já já)
              console.log("🏠 Sala criada:", roomId);
            } catch (e) {
              console.log("❌ createRoom error:", e);
            }
          }}
        >
          <Text style={styles.textoBotao}>Criar sala</Text>
        </Pressable>

        {currentRoomId && (
  <Pressable
    style={[styles.botaoBase, { marginTop: 12, width: 300, backgroundColor: "#64748b" }]}
    onPress={async () => {
      try {
        await leaveRoom(currentRoomId);
      } catch (e) {
        console.log("❌ leaveRoom:", e);
      }

      // ✅ volta pro modo local
      prevRoomStatus.current = null;
      setCurrentRoomId(null);
      setRoomId("");
      setMySymbol("X");
      setGame(createInitialGameState());
      setBanner("👋 Você saiu da sala");
      setTimeout(() => setBanner(null), 1500);
    }}
  >
    <Text style={styles.textoBotao}>Sair da sala</Text>
  </Pressable>
)}

      </View>

      <TextInput
        value={roomId}
        onChangeText={setRoomId}
        placeholder="Cole o roomId aqui"
        placeholderTextColor="#94a3b8"
        style={{
          width: 300,
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#334155",
          color: "#fff",
        }}
      />

      {/* Botão de entrar na sala */}
      <Pressable
        style={[styles.botaoBase, styles.botaoSala, { marginTop: 12, width: 300 }]}
        onPress={async () => {
          try {
            const id = roomId.trim();
            if (!id) return;
            await joinRoom(id);
            setCurrentRoomId(id);
            setMySymbol("O");
            console.log("✅ Entrou na sala:", id);
          } catch (e) {
            console.log("❌ joinRoom:", e);
          }
        }}
      >
        <Text style={styles.textoBotao}>Entrar na sala</Text>
      </Pressable>


    </ScrollView>
  );
}

// ----------------------------------------------
//              ESTILIZAÇÕES (CSS caseiro)
// ----------------------------------------------

const styles = StyleSheet.create({
  container: {
  flexGrow: 1,
  backgroundColor: "#0f172a",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: 60,
  paddingBottom: 140, // IMPORTANTÍSSIMO por causa da TabBar no celular
},
  text: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff", // FORÇA TEXTO BRANCO
  },
  board: {
    width: 300,              // 3 colunas * 100 pixels cada
    height: 300,             // 3 linhas * 100 pixels cada
    flexDirection: "row",
    flexWrap: "wrap",
  },
  status: {
  marginBottom: 20,
  color: "#fff",
  fontFamily: "Arial",
  fontSize : 24,
  fontWeight: "bold",
},
botaoReset: {
  marginTop: 24,
  paddingVertical: 12,
  paddingHorizontal: 24,
  backgroundColor: "#e74c3c",
  borderRadius: 8,
},

textoBotao: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
},
botoesRow: {
  flexDirection: "row",
  gap: 12,              // se der erro no seu RN, eu te mostro alternativa abaixo
  marginTop: 24,
  paddingHorizontal: 16,
},

botaoBase: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
},


botaoSala: {
  backgroundColor: "#3498db",
   marginTop: 24,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
},

});
