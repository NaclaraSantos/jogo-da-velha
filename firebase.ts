// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Adicione esta linha abaixo para silenciar o erro visual no VS Code:
//@ts-ignore 
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUFoUbBG_CXsL_MRtyfA6226UxvTXmv3Y",
  authDomain: "jogodavelha-dev.firebaseapp.com",
  projectId: "jogodavelha-dev",
  storageBucket: "jogodavelha-dev.firebasestorage.app",
  messagingSenderId: "675524580826",
  appId: "1:675524580826:web:975290a03ac156121bdce3"
};

// 1. Inicializa o App
const app = initializeApp(firebaseConfig);

// 2. Inicializa o Auth do jeito que o Mobile exige (O PULO DO GATO)
// Usamos a função nativa getReactNativePersistence aqui
const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });

// 3. Inicializa o Banco de Dados (se o tutorial pedir)
const db = getFirestore(app);

export { auth, db };

