export const mockGameReviewAnalysis = {
  reviewSummary: {
    white: {
      username: "White",
      avatar: "",
      accuracy: 91.4,
      classifications: {
        brilliant: 1,
        excellent: 4,
        best: 12,
        mistake: 1,
        missedChance: 1,
        blunder: 0,
      },
    },
    black: {
      username: "Black",
      avatar: "",
      accuracy: 84.1,
      classifications: {
        brilliant: 0,
        excellent: 3,
        best: 10,
        mistake: 2,
        missedChance: 1,
        blunder: 1,
      },
    },
  },
  moveAnalysis: [
    { moveNumber: 1, white: { classification: "book" }, black: { classification: "book" } },
    { moveNumber: 2, white: { classification: "best" }, black: { classification: "best" } },
    { moveNumber: 3, white: { classification: "excellent" }, black: { classification: "best" } },
    { moveNumber: 4, white: { classification: "best" }, black: { classification: "inaccuracy" } },
    { moveNumber: 5, white: { classification: "excellent" }, black: { classification: "forced" } },
    { moveNumber: 6, white: { classification: "best" }, black: { classification: "mistake" } },
    { moveNumber: 7, white: { classification: "missedChance" }, black: { classification: "best" } },
    { moveNumber: 8, white: { classification: "blunder" }, black: { classification: "excellent" } },
  ],
  coachAnalysis: {
    gameSummary: {
      title: "Resumo da partida",
      text: "As brancas conseguiram uma posicao mais facil de jogar porque desenvolveram com ritmo e chegaram primeiro aos temas centrais do meio-jogo. As pretas resistiram bem por um tempo, mas foram sendo empurradas para lances reativos.",
    },
    decisiveMove: {
      title: "O lance que decidiu a partida",
      move: "20. Bg4??",
      text: "Esse foi o momento em que a posicao deixou de ser apenas desconfortavel e passou a permitir uma sequencia forçante para o adversario. O lance parece ativo, mas enfraquece a coordenacao defensiva e libera a invasao.",
      bestAlternative: "20. Ng4",
      errorCategory: "Erro de plano misturado com erro de calculo",
    },
    missedDecisiveChances: [
      {
        move: "6...Bb7?!",
        theme: "Ganho de tempo no desenvolvimento",
        text: "Havia uma maneira mais energica de ativar as pecas com ganho de tempo sobre o centro branco.",
      },
      {
        move: "14...Qc7?!",
        theme: "Contra-ataque central contra ataque lateral",
        text: "Em vez de acompanhar o ataque adversario pela ala, o momento pedia um golpe central imediato.",
      },
      {
        move: "32...Rxd4?!",
        theme: "Invasao pela segunda fileira",
        text: "A posicao oferecia uma continuacao ainda mais forte com entrada direta nas casas de invasao.",
      },
      {
        move: "41. Rff6??",
        theme: "Mate forcado / rei preso na primeira fileira",
        text: "O lance ignora a seguranca do rei e permite um padrao tatico tipico de mate na retaguarda.",
      },
    ],
    loserPatterns: {
      title: "Padrao de erros do jogador que perdeu",
      patterns: [
        "Atacar antes de consolidar",
        "Dificuldade em perceber quando o jogo mudou de natureza",
      ],
      text: "Os erros aparecem quando o plano original deixa de funcionar, mas o jogador continua investindo recursos na mesma ideia em vez de reavaliar a posicao.",
    },
    centralLesson: {
      title: "A licao central da partida",
      text: "Nem toda vantagem vem de um golpe tatico imediato. Muitas vezes o ponto decisivo e reconhecer quando a posicao pede consolidacao, profilaxia e so depois atividade.",
    },
  },
};

