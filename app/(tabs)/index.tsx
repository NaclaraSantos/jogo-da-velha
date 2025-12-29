import Quadrado from "@/components/Quadrado";
import { calcularVencedor, verificarEmpate } from "@/scripts/utils";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
// ----------------------------------------------
//                TELA INICIAL
// ----------------------------------------------   

export default function Index() {

  // --------------------------------
  //        ESTADOS DO COMPONENTE
  // -------------------------------- 
  const [tabuleiro, setTabuleiro] = useState<(string | null)[]>(
    Array(9).fill(null)
  );
  const [xEhAVez, setXEhAVez] = useState(true);

  const resultado = calcularVencedor(tabuleiro);
  const vencedor = resultado?.jogador;
  const linhaVencedora = resultado?.linha;
  const empate = !vencedor && verificarEmpate(tabuleiro);

  // --------------------------------
  //        FUNÇÕES DO COMPONENTE
  // -------------------------------- 
  function handlePress(indice: number) {
    // não permite sobrescrever
    if (tabuleiro[indice] || vencedor) return;

    // cria cópia do tabuleiro
    const novoTabuleiro = [...tabuleiro];

    // define X ou O
    novoTabuleiro[indice] = xEhAVez ? "X" : "O";

    // atualiza estado
    setTabuleiro(novoTabuleiro);
    setXEhAVez(!xEhAVez);
  }

  // reinicia o jogo
  function resetarJogo() {
  setTabuleiro(Array(9).fill(null));
  setXEhAVez(true);
}

// --------------------------------
//        RENDERIZAÇÃO
// -------------------------------- 

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Jogo da Velha</Text>

      <Text style={styles.status}>
  {vencedor
    ? `Vencedor: ${vencedor}`
    : empate
    ? "Empate!"
    : `Vez de: ${xEhAVez ? "X" : "O"}`}
</Text>
      {/* Tabuleiro */}
      <View style={styles.board}>
        {tabuleiro.map((valor, indice) => (
          <Quadrado
            key={indice}
            valor={valor}
            onPress={() => handlePress(indice)}
             destaque={linhaVencedora?.includes(indice)}
          />
        ))}
      </View>
      {/* Botão para resetar o jogo */}
      <Pressable style={styles.botaoReset} onPress={resetarJogo}>
        <Text style={styles.textoBotao}>Resetar jogo</Text>
      </Pressable>

    </View>
  );
}

// ----------------------------------------------
//              ESTILIZAÇÕES (CSS caseiro)
// ----------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // FORÇA FUNDO BRANCO
    color: "#fff",
    alignItems: "center",
    justifyContent: "center",
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

});