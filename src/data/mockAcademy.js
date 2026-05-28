export const learningPaths = [
  {
    id: "calculation-fundamentals",
    title: "Calculation Fundamentals",
    description:
      "Build a reliable calculation routine for forcing lines, candidate moves, tactical checks, and final blunder checks.",
    level: "Beginner to Intermediate",
    theme: "Calculation",
    estimatedDuration: "4 weeks",
    progress: 62,
    modules: [
      {
        id: "candidate-moves",
        title: "Candidate Moves and Forcing Lines",
        description:
          "Learn how to find checks, captures, threats, and quiet resources before committing to a line.",
        order: 1,
        lessons: [
          {
            id: "forcing-move-scan",
            title: "The forcing move scan",
            theme: "Checks, captures, threats",
            order: 1,
            textContent: {
              intro:
                "Good calculation starts before you calculate. First build a shortlist of forcing moves, then compare the consequences instead of trusting the first attractive tactic.",
              keyConcepts: ["Candidate moves", "Forcing sequence", "Blunder check"],
              sections: [
                {
                  title: "Scan before going deep",
                  body:
                    "Look for checks first because they limit the opponent most. Captures come next, then direct threats. Only after this scan should you spend energy on long branches.",
                },
                {
                  title: "Stop at the critical reply",
                  body:
                    "The opponent's best defensive resource is usually the move that refutes your idea. Train yourself to search for that reply before celebrating the tactic.",
                },
              ],
            },
            conceptBoard: {
              title: "Scan forcing moves before choosing a plan",
              description:
                "This position shows why the scan starts with moves that force the opponent to answer. White first asks a concrete question, then improves the attack without rushing.",
              initialFen:
                "r2q1rk1/pp2bppp/2npbn2/4p3/4P3/2NPBN2/PPPQ1PPP/2KR1B1R w - - 0 10",
              orientation: "white",
              sourceGame: {
                white: "Mikhail Tal",
                black: "Bent Larsen",
                event: "Candidates Tournament",
                year: 1965,
                moveNumber: 10,
              },
              mainLine: [
                {
                  ply: 1,
                  san: "Bh6",
                  uci: "e3h6",
                  fenAfter:
                    "r2q1rk1/pp2bppp/2npbn1B/4p3/4P3/2NP1N2/PPPQ1PPP/2KR1B1R b - - 1 10",
                  comment:
                    "White starts with a forcing move: challenge the main kingside defender before calculating sacrifices.",
                  highlightSquares: ["h6", "g7", "g8"],
                  arrows: [{ from: "e3", to: "h6", color: "purple" }],
                },
                {
                  ply: 2,
                  san: "Re8",
                  uci: "f8e8",
                  fenAfter:
                    "r2qr1k1/pp2bppp/2npbn1B/4p3/4P3/2NP1N2/PPPQ1PPP/2KR1B1R w - - 2 11",
                  comment:
                    "Black defends, which gives White information. The attack should now be built on coordination, not hope.",
                  highlightSquares: ["e8", "g8"],
                  arrows: [{ from: "f8", to: "e8", color: "yellow" }],
                },
                {
                  ply: 3,
                  san: "h4",
                  uci: "h2h4",
                  fenAfter:
                    "r2qr1k1/pp2bppp/2npbn1B/4p3/4P2P/2NP1N2/PPPQ1PP1/2KR1B1R b - - 0 11",
                  comment:
                    "Only after identifying the defender does White add a direct attacking lever.",
                  highlightSquares: ["h4", "h6", "g7"],
                  arrows: [{ from: "h2", to: "h4", color: "purple" }],
                },
                {
                  ply: 4,
                  san: "Rc8",
                  uci: "a8c8",
                  fenAfter:
                    "2rqr1k1/pp2bppp/2npbn1B/4p3/4P2P/2NP1N2/PPPQ1PP1/2KR1B1R w - - 1 12",
                  comment:
                    "Black tries to create counterplay on the c-file, so White should still run a safety check.",
                  highlightSquares: ["c8", "c2", "c1"],
                  arrows: [{ from: "a8", to: "c8", color: "yellow" }],
                },
                {
                  ply: 5,
                  san: "Kb1",
                  uci: "c1b1",
                  fenAfter:
                    "2rqr1k1/pp2bppp/2npbn1B/4p3/4P2P/2NP1N2/PPPQ1PP1/1K1R1B1R b - - 2 12",
                  comment:
                    "The final blunder check matters: White steps away from tactics before continuing the attack.",
                  highlightSquares: ["b1", "c1", "c2"],
                  arrows: [{ from: "c1", to: "b1", color: "purple" }],
                },
              ],
              variations: [
                {
                  id: "grab-first",
                  label: "Grabbing before scanning",
                  description:
                    "This line shows the common mistake: taking material before asking what the opponent can force in reply.",
                  startFen:
                    "r2q1rk1/pp2bppp/2npbn2/4p3/4P3/2NPBN2/PPPQ1PPP/2KR1B1R w - - 0 10",
                  moves: [
                    {
                      ply: 1,
                      san: "Nxe5",
                      uci: "f3e5",
                      fenAfter:
                        "r2q1rk1/pp2bppp/2npbn2/4N3/4P3/2NPB3/PPPQ1PPP/2KR1B1R b - - 0 10",
                      comment:
                        "The capture looks tempting, but it starts with material instead of a forcing scan.",
                      highlightSquares: ["e5", "c6", "e7"],
                      arrows: [{ from: "f3", to: "e5", color: "yellow" }],
                    },
                    {
                      ply: 2,
                      san: "Nxe5",
                      uci: "c6e5",
                      fenAfter:
                        "r2q1rk1/pp2bppp/3pbn2/4n3/4P3/2NPB3/PPPQ1PPP/2KR1B1R w - - 0 11",
                      comment:
                        "Black removes the knight, and White's attack has not improved. The candidate scan would have found the stronger question first.",
                      highlightSquares: ["e5", "h6", "g7"],
                      arrows: [{ from: "c6", to: "e5", color: "yellow" }],
                    },
                  ],
                },
              ],
              explanationBlocks: [
                {
                  movePly: 0,
                  title: "Before calculating",
                  text:
                    "Pause and name the forcing candidates. The bishop on e3 can challenge g7, the knight on f3 can jump, and the king still needs a safety check.",
                },
                {
                  movePly: 1,
                  title: "The first forcing question",
                  text:
                    "Bh6 does not win by itself. Its value is that it forces Black to reveal how the kingside will be defended.",
                },
                {
                  movePly: 3,
                  title: "Attack with a foundation",
                  text:
                    "The h-pawn only becomes meaningful after White has identified the defender and improved the attacking direction.",
                },
                {
                  movePly: 5,
                  title: "The final safety check",
                  text:
                    "A good attack still respects counterplay. Kb1 keeps the calculation clean before White commits more material.",
                },
              ],
            },
            additionalResources: [
              {
                type: "book",
                title: "Improve Your Chess Calculation",
                author: "Ramesh RB",
                url: "https://example.com/calculation-book",
                description:
                  "A practical framework for candidate moves, visualization, and disciplined calculation habits.",
              },
              {
                type: "article",
                title: "Checks, Captures, Threats",
                author: "Aura Academy",
                url: "https://example.com/checks-captures-threats",
                description:
                  "Short reference note for building a repeatable forcing-move scan.",
              },
            ],
            modelGame: {
              white: "Mikhail Tal",
              black: "Bent Larsen",
              event: "Candidates Tournament",
              year: 1965,
              result: "1-0",
              pgn:
                "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. O-O-O",
              theme: "Forcing initiative",
              commentary:
                "Tal keeps asking forcing questions until the defensive coordination cracks. The point is not memorizing the attack, but noticing how each candidate move increases pressure.",
              guessTheMoveMoments: [
                {
                  moveNumber: 12,
                  sideToMove: "White",
                  prompt: "White can improve the attack before sacrificing. What forcing move should be considered first?",
                  bestMove: "Bh6",
                  idea: "Remove the defender and make the king's dark squares easier to attack.",
                },
                {
                  moveNumber: 17,
                  sideToMove: "White",
                  prompt: "The attack is ready. Which candidate move opens lines with tempo?",
                  bestMove: "Nf5",
                  idea: "A forcing jump that threatens key defenders and creates tactical overload.",
                },
              ],
            },
            puzzles: [
              {
                id: "calc-001",
                fen: "r2q1rk1/pp2bppp/2npbn2/4p3/4P3/2NPBN2/PPPQ1PPP/2KR1B1R w - - 0 10",
                theme: "Candidate moves",
                difficulty: "Easy",
                solution: ["Bh6"],
                explanation:
                  "Start with the forcing move that challenges the main kingside defender before calculating sacrifices.",
              },
              {
                id: "calc-002",
                fen: "r4rk1/pp2bppp/2npbn2/q3p3/4P3/2NPBN2/PPPQ1PPP/2KR1B1R w - - 0 12",
                theme: "Blunder check",
                difficulty: "Medium",
                solution: ["Kb1"],
                explanation:
                  "Before attacking, remove tactical shots on the king and improve the safety of the position.",
              },
            ],
          },
          {
            id: "visualizing-branches",
            title: "Visualizing branches without losing the board",
            theme: "Visualization",
            order: 2,
            textContent: {
              intro:
                "Visualization is not about seeing ten moves at once. It is about keeping one clear branch, naming the final position, then returning to compare alternatives.",
              keyConcepts: ["Branch discipline", "Final position", "Comparison"],
              sections: [
                {
                  title: "Use branch labels",
                  body:
                    "Give each line a label like capture-line, queen-trade, or mate-threat. Labels reduce mental clutter and make comparison easier.",
                },
                {
                  title: "Compare final positions",
                  body:
                    "After a line ends, describe material, king safety, and activity. If you cannot describe the final position, the line is not finished.",
                },
              ],
            },
            additionalResources: [
              {
                type: "video",
                title: "Visualization Drills for Club Players",
                author: "Aura Academy",
                url: "https://example.com/visualization-drills",
                description:
                  "A short training session for holding two candidate lines in memory.",
              },
            ],
            modelGame: {
              white: "Garry Kasparov",
              black: "Veselin Topalov",
              event: "Wijk aan Zee",
              year: 1999,
              result: "1-0",
              pgn:
                "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7",
              theme: "Long forcing branch",
              commentary:
                "Kasparov's famous attacking game rewards disciplined branch calculation. Each spectacular move still rests on concrete final-position evaluation.",
              guessTheMoveMoments: [
                {
                  moveNumber: 24,
                  sideToMove: "White",
                  prompt: "Which move keeps the forcing branch alive while improving piece activity?",
                  bestMove: "Rxd4",
                  idea: "Material is secondary because every reply leaves Black's king under pressure.",
                },
              ],
            },
            puzzles: [
              {
                id: "calc-003",
                fen: "2kr3r/ppp2ppp/2n1bn2/4p3/3PP3/2N1BN2/PPP2PPP/2KR3R w - - 0 11",
                theme: "Visualization",
                difficulty: "Medium",
                solution: ["d5"],
                explanation:
                  "Calculate the forcing pawn break and compare the resulting piece activity.",
              },
            ],
          },
        ],
      },
      {
        id: "tactical-cleanup",
        title: "Tactical Cleanup",
        description:
          "Convert calculation into practical accuracy with a final safety scan before each committal move.",
        order: 2,
        lessons: [
          {
            id: "final-blunder-check",
            title: "The final blunder check",
            theme: "Tactical safety",
            order: 1,
            textContent: {
              intro:
                "Many games are lost after the hard work is already done. The final blunder check is a fast scan for undefended pieces, back rank issues, and tactical replies.",
              keyConcepts: ["Loose pieces", "Back rank", "Opponent threats"],
              sections: [
                {
                  title: "Ask what changed",
                  body:
                    "Every move changes lines, defenders, and escape squares. Before releasing the move, ask which piece became loose and which line opened.",
                },
              ],
            },
            additionalResources: [
              {
                type: "course",
                title: "Tactical Safety Checklist",
                author: "Aura Academy",
                url: "https://example.com/tactical-safety",
                description:
                  "A compact checklist for avoiding one-move oversights in sharp positions.",
              },
            ],
            modelGame: {
              white: "Anatoly Karpov",
              black: "Viktor Korchnoi",
              event: "World Championship",
              year: 1978,
              result: "1-0",
              pgn: "1. c4 Nf6 2. Nc3 e6 3. Nf3 d5 4. d4 Be7 5. Bg5 h6 6. Bh4 O-O",
              theme: "Clean conversion",
              commentary:
                "Karpov's play shows how tactical safety supports strategic pressure. Nothing flashy is needed when the opponent receives no counterplay.",
              guessTheMoveMoments: [
                {
                  moveNumber: 20,
                  sideToMove: "White",
                  prompt: "Which quiet move keeps all tactics controlled before improving the position?",
                  bestMove: "h3",
                  idea: "Remove back-rank and piece-pin tricks before converting the advantage.",
                },
              ],
            },
            puzzles: [
              {
                id: "calc-004",
                fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
                theme: "Back rank safety",
                difficulty: "Easy",
                solution: ["Re8#"],
                explanation:
                  "The final scan confirms the king has no escape and the rook move is decisive.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "endgame-conversion",
    title: "Endgame Conversion",
    description:
      "Turn small advantages into points with king activity, pawn breaks, rook technique, and practical simplification choices.",
    level: "Intermediate",
    theme: "Endgames",
    estimatedDuration: "5 weeks",
    progress: 35,
    modules: [
      {
        id: "king-and-pawn-core",
        title: "King and Pawn Core",
        description:
          "Master opposition, key squares, reserve tempi, and converting outside passers.",
        order: 1,
        lessons: [
          {
            id: "opposition-key-squares",
            title: "Opposition and key squares",
            theme: "King activity",
            order: 1,
            textContent: {
              intro:
                "Most pawn endings are decided by access. The active king does not just attack pawns; it claims key squares that make promotion unavoidable.",
              keyConcepts: ["Opposition", "Key squares", "Reserve tempo"],
              sections: [
                {
                  title: "Win access, then win material",
                  body:
                    "Do not rush pawn moves if your king can first improve. The pawn is often strongest when it keeps reserve tempi.",
                },
              ],
            },
            additionalResources: [
              {
                type: "book",
                title: "Silman's Complete Endgame Course",
                author: "Jeremy Silman",
                url: "https://example.com/silman-endgames",
                description:
                  "A level-based endgame reference for practical conversion technique.",
              },
            ],
            modelGame: {
              white: "Jose Raul Capablanca",
              black: "Savielly Tartakower",
              event: "New York",
              year: 1924,
              result: "1-0",
              pgn: "1. d4 d5 2. Nf3 e6 3. c4 Nf6 4. Bg5 Be7 5. e3 O-O",
              theme: "King activity conversion",
              commentary:
                "Capablanca's technique shows how king activity and pawn structure turn a small pull into a clean win.",
              guessTheMoveMoments: [
                {
                  moveNumber: 34,
                  sideToMove: "White",
                  prompt: "Which king move improves access before committing the pawns?",
                  bestMove: "Kf3",
                  idea: "Centralize first, then use the pawn majority when Black is passive.",
                },
              ],
            },
            puzzles: [
              {
                id: "end-001",
                fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
                theme: "Key squares",
                difficulty: "Easy",
                solution: ["Kf3"],
                explanation:
                  "The king heads toward key squares while preserving pawn tempi.",
              },
            ],
          },
        ],
      },
      {
        id: "rook-endgames",
        title: "Rook Endgames",
        description:
          "Learn the practical rules that decide the most common tournament endgames.",
        order: 2,
        lessons: [
          {
            id: "active-rook",
            title: "Active rook before pawn grabbing",
            theme: "Rook activity",
            order: 1,
            textContent: {
              intro:
                "In rook endings, activity often beats material. Before taking a pawn, ask whether your rook can attack from behind or cut the king.",
              keyConcepts: ["Rook activity", "Behind passed pawns", "Cutoff"],
              sections: [
                {
                  title: "Activity is the currency",
                  body:
                    "An active rook creates checks, attacks pawns, and limits the king. A passive rook defends one pawn and watches the game slip away.",
                },
              ],
            },
            additionalResources: [
              {
                type: "video",
                title: "Rook Endgames: Active Defense",
                author: "Aura Academy",
                url: "https://example.com/rook-endgames",
                description:
                  "Model positions for choosing activity over pawn collection.",
              },
            ],
            modelGame: {
              white: "Akiba Rubinstein",
              black: "Georg Salwe",
              event: "Lodz",
              year: 1908,
              result: "1-0",
              pgn: "1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Bd3 c5 5. b3 Nc6",
              theme: "Rook activity",
              commentary:
                "Rubinstein's endgame play is a model of active rook placement and patient conversion.",
              guessTheMoveMoments: [
                {
                  moveNumber: 31,
                  sideToMove: "White",
                  prompt: "Should White take a pawn or activate the rook first?",
                  bestMove: "Rd7",
                  idea: "The active rook attacks weaknesses and keeps the opposing king boxed in.",
                },
              ],
            },
            puzzles: [
              {
                id: "end-002",
                fen: "8/5k2/8/3R4/5P2/6K1/r7/8 w - - 0 1",
                theme: "Rook activity",
                difficulty: "Medium",
                solution: ["Rd7+"],
                explanation:
                  "Check first and keep the rook active instead of passively defending.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "opening-understanding",
    title: "Opening Understanding",
    description:
      "Move beyond memorization with plans, structures, typical piece placement, and punishable opening mistakes.",
    level: "Beginner to Advanced",
    theme: "Openings",
    estimatedDuration: "6 weeks",
    progress: 18,
    modules: [
      {
        id: "structure-first",
        title: "Structures Before Moves",
        description:
          "Understand why opening moves are played by studying pawn structures and middlegame plans.",
        order: 1,
        lessons: [
          {
            id: "isolated-queen-pawn",
            title: "Playing with the isolated queen pawn",
            theme: "IQP structures",
            order: 1,
            textContent: {
              intro:
                "The isolated queen pawn offers activity and space in exchange for a long-term weakness. The player with the IQP should seek piece activity before the pawn becomes a target.",
              keyConcepts: ["IQP", "Piece activity", "Timing the break"],
              sections: [
                {
                  title: "Activity before simplification",
                  body:
                    "If pieces leave the board, the isolated pawn becomes weaker. Keep pieces active and look for central breaks or kingside pressure.",
                },
              ],
            },
            additionalResources: [
              {
                type: "article",
                title: "IQP Plans for Both Sides",
                author: "Aura Academy",
                url: "https://example.com/iqp-plans",
                description:
                  "Plan checklist for playing with and against the isolated queen pawn.",
              },
            ],
            modelGame: {
              white: "Garry Kasparov",
              black: "Ulf Andersson",
              event: "Tilburg",
              year: 1981,
              result: "1-0",
              pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Be7 5. Bg5 h6 6. Bh4 O-O",
              theme: "IQP initiative",
              commentary:
                "White uses the isolated pawn as a source of activity, not as something to defend passively.",
              guessTheMoveMoments: [
                {
                  moveNumber: 14,
                  sideToMove: "White",
                  prompt: "Which move activates the pieces and prepares central pressure?",
                  bestMove: "Re1",
                  idea: "Connect the rook to the central file and support future e-file tactics.",
                },
              ],
            },
            puzzles: [
              {
                id: "open-001",
                fen: "r2q1rk1/pp2bppp/2n1bn2/3p4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 9",
                theme: "IQP planning",
                difficulty: "Medium",
                solution: ["cxd5"],
                explanation:
                  "Choose the structure intentionally and prepare active piece play around the isolated pawn.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "practical-decision-making",
    title: "Practical Decision Making",
    description:
      "Choose better moves under real-game constraints: time pressure, risk, simplification, and opponent psychology.",
    level: "Intermediate",
    theme: "Practical play",
    estimatedDuration: "3 weeks",
    progress: 0,
    modules: [
      {
        id: "risk-management",
        title: "Risk Management",
        description:
          "Learn when to simplify, when to keep tension, and when practical pressure matters more than engine purity.",
        order: 1,
        lessons: [
          {
            id: "simplify-or-press",
            title: "Simplify or keep pressure?",
            theme: "Decision quality",
            order: 1,
            textContent: {
              intro:
                "A good practical decision considers the clock, opponent discomfort, and how easy the resulting position is to play.",
              keyConcepts: ["Risk profile", "Clock pressure", "Conversion path"],
              sections: [
                {
                  title: "Choose the easier win",
                  body:
                    "The best move is not always the most ambitious move. In winning positions, favor lines that reduce counterplay and preserve clear progress.",
                },
              ],
            },
            additionalResources: [
              {
                type: "course",
                title: "Practical Choices Under Pressure",
                author: "Aura Academy",
                url: "https://example.com/practical-choices",
                description:
                  "Decision drills for selecting playable moves in messy positions.",
              },
            ],
            modelGame: {
              white: "Magnus Carlsen",
              black: "Levon Aronian",
              event: "Wijk aan Zee",
              year: 2012,
              result: "1-0",
              pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. g3 Bb4+ 5. Bd2 Be7",
              theme: "Low-risk pressure",
              commentary:
                "Carlsen often chooses positions that are easy for him and unpleasant for the opponent, even without immediate tactics.",
              guessTheMoveMoments: [
                {
                  moveNumber: 28,
                  sideToMove: "White",
                  prompt: "Which move keeps pressure while limiting counterplay?",
                  bestMove: "Rc1",
                  idea: "Improve the worst piece and keep Black tied to passive defense.",
                },
              ],
            },
            puzzles: [
              {
                id: "prac-001",
                fen: "2r3k1/5ppp/8/3P4/8/2R3P1/5P1P/6K1 w - - 0 1",
                theme: "Simplification",
                difficulty: "Medium",
                solution: ["Rxc8+"],
                explanation:
                  "Trade into a clearly winning ending instead of allowing active counterplay.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "positional-strategy",
    title: "Positional Strategy",
    description:
      "Improve long-term thinking with weak squares, piece quality, pawn breaks, prophylaxis, and strategic conversion.",
    level: "Intermediate to Advanced",
    theme: "Strategy",
    estimatedDuration: "6 weeks",
    progress: 8,
    modules: [
      {
        id: "weak-squares",
        title: "Weak Squares and Piece Quality",
        description:
          "Learn to identify permanent weaknesses and build plans around improving your worst piece.",
        order: 1,
        lessons: [
          {
            id: "outposts",
            title: "Creating and using outposts",
            theme: "Weak squares",
            order: 1,
            textContent: {
              intro:
                "An outpost is valuable when it cannot be chased by pawns and when the piece placed there attacks something meaningful.",
              keyConcepts: ["Outpost", "Weak square", "Piece improvement"],
              sections: [
                {
                  title: "A square needs a purpose",
                  body:
                    "Do not occupy an outpost just because it exists. The piece should pressure pawns, restrict pieces, or support a concrete break.",
                },
              ],
            },
            additionalResources: [
              {
                type: "book",
                title: "My System",
                author: "Aron Nimzowitsch",
                url: "https://example.com/my-system",
                description:
                  "Classic strategic ideas on blockade, outposts, and prophylaxis.",
              },
            ],
            modelGame: {
              white: "Anatoly Karpov",
              black: "Garry Kasparov",
              event: "World Championship",
              year: 1984,
              result: "1-0",
              pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. a3 Bb7 5. Nc3 d5",
              theme: "Strategic restriction",
              commentary:
                "Karpov's strategic wins often show how one improved piece can restrict an entire position.",
              guessTheMoveMoments: [
                {
                  moveNumber: 18,
                  sideToMove: "White",
                  prompt: "Which maneuver improves the knight toward a permanent square?",
                  bestMove: "Nd2",
                  idea: "The knight reroutes toward a stronger post instead of staying visually active but ineffective.",
                },
              ],
            },
            puzzles: [
              {
                id: "strat-001",
                fen: "2rq1rk1/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/2R2RK1 w - - 0 14",
                theme: "Outpost",
                difficulty: "Medium",
                solution: ["Na4"],
                explanation:
                  "Head toward c5 and pressure the weak dark squares in Black's structure.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getPathLessonList(path) {
  return (path?.modules || [])
    .flatMap((module) =>
      (module.lessons || []).map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      }))
    )
    .sort((a, b) => a.order - b.order);
}

export default learningPaths;
