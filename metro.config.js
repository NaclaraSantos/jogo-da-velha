const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicione estas duas linhas críticas para o Firebase/Expo
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false; // Esta linha é a chave

module.exports = config;