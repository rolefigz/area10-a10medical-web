// Configurazione di html-validate (npm run valida).
export default {
  extends: ['html-validate:recommended'],
  rules: {
    // role="list" è voluto: Safari/VoiceOver toglie la semantica alle liste senza punti elenco
    'no-redundant-role': 'off',
    'prefer-native-element': ['error', { exclude: ['list'] }],
    // gli stili inline servono solo per valori dinamici (rapporto delle foto, ritardi delle animazioni)
    'no-inline-style': 'off',
    // i numeri nei link tel: non vanno a capo grazie a white-space: nowrap (base.css)
    'tel-non-breaking': 'off',
    // il modulo dei filtri corsi si applica a ogni modifica, senza pulsante di invio
    'wcag/h32': 'off',
  },
};
