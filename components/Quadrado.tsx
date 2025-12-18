import { Pressable, StyleSheet, Text } from "react-native";

// ----------------------------------------------------
//              COMPONENTE QUADRADO (GAVETA)
// ----------------------------------------------------

// ----------------------------------------------
//    TIPAGENS (tipagem significa TypeScript)
// --------------------------------------------     
type Props = {
  valor: string | null;
  onPress: () => void;
  destaque?: boolean;
};

// Responsável por exibir X, O ou vazio
// Dispara evento de toque para o componente pai
export default function Quadrado({ valor, onPress, destaque }: Props) {
  return (
    <Pressable
      style={[
        styles.square,
        destaque && styles.squareVencedor,
      ]}
      onPress={onPress}
    >
      <Text style={styles.texto}>{valor}</Text>
    </Pressable>
  );
}

// ----------------------------------------------------
//                    ESTILOS
// ----------------------------------------------------
const styles = StyleSheet.create({
  square: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },

  squareVencedor: {
    backgroundColor: "#2ecc71",
  },

  texto: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
});