// Game rules and interface text.
// Scenario content (teams, members, tasks, outcomes) lives in /scenarios/*.json.

export const LANGS = ['en', 'ja'];

// The four ways a task can be organized, from "all human" to "all AI".
// The `id` values are the keys used in each task's `outcomes` in the scenario files.
export const MODES = [
  {
    id: 'human',
    icon: '🧑',
    label: { en: 'People alone', ja: '人だけで' },
    desc: { en: 'The team does the work without AI.', ja: 'チームがAIを使わずに作業する。' },
  },
  {
    id: 'human_ai',
    icon: '🧑‍✍️ → 🤖',
    label: { en: 'People draft, AI reviews', ja: '人が作成し、AIがレビュー' },
    desc: { en: 'People do the work; AI checks and suggests improvements.', ja: '人が作業し、AIがチェックと改善提案をする。' },
  },
  {
    id: 'ai_human',
    icon: '🤖 → 🧑‍⚖️',
    label: { en: 'AI drafts, a person approves', ja: 'AIが作成し、人が承認' },
    desc: { en: 'AI does the work; a person reviews and approves it.', ja: 'AIが作業し、人が確認して承認する。' },
  },
  {
    id: 'ai',
    icon: '🤖',
    label: { en: 'AI alone', ja: 'AIだけで' },
    desc: { en: 'AI does the work end to end, with no human check.', ja: 'AIが最初から最後まで担当し、人はチェックしない。' },
  },
];

// Possible results for a task, best first. `points` drive the sprint score.
export const OUTCOMES = {
  perfect: { icon: '🌟', points: 3, label: { en: 'Perfect!', ja: 'パーフェクト！' } },
  done: { icon: '✅', points: 2, label: { en: 'Done', ja: '無事完了' } },
  minor: { icon: '⚠️', points: 1, label: { en: 'Minor issue', ja: '軽微な問題' } },
  incident: { icon: '🚨', points: 0, label: { en: 'Incident', ja: 'インシデント' } },
};

export const UI = {
  en: {
    appTitle: 'Human × AI Sprint',
    tagline: 'Decide what your team delegates to AI — and how much you stay in the loop.',
    howTitle: 'How to play',
    how: [
      'Pick a team.',
      'Drag each backlog task into one of the four ways of working.',
      'Click “Run the Sprint” and see how the week went.',
      'Change your plan and run it again. What is AI good at? When should people stay in the loop?',
    ],
    modesTitle: 'Four ways of working',
    chooseTeam: 'Choose your team',
    tasksCount: '{n} tasks',
    changeTeam: '← Change team',
    members: 'Team members',
    backlog: 'Backlog',
    backlogDesc: 'Tasks waiting to be organized.',
    emptyDrop: 'Drop tasks here',
    tapHere: 'Tap to move here',
    hint: 'Drag a card into a column, or tap a card and then tap a column. Keyboard: select a card, then press 0–4.',
    remaining: '{n} task(s) left to place',
    ready: 'All tasks placed. Ready!',
    run: 'Run the Sprint ▶',
    rerun: 'Run the Sprint again ▶',
    reset: 'Back to backlog',
    running: 'Sprint in progress…',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    resultsTitle: 'Sprint {n} — results of the week',
    score: 'Score',
    stale: 'You changed the plan since the last sprint. Run the sprint again to see the new results.',
    history: 'Your sprints',
    sprintN: 'Sprint {n}',
    tryAgain: 'Try another way of organizing the work and run the sprint again!',
    owner: 'Owner',
    loadError: 'Could not load the scenarios.',
    loadErrorHint: 'If you opened index.html directly from disk, start a local web server instead (see README).',
    footer: 'All teams, people and companies are fictional.',
  },
  ja: {
    appTitle: '人 × AI スプリント',
    tagline: 'チームは何をAIに任せ、どこまで人が関わるべきか — 決めてみよう。',
    howTitle: '遊び方',
    how: [
      'チームを選ぶ。',
      'バックログのタスクを、4つの働き方のいずれかにドラッグする。',
      '「スプリント実行」をクリックして、1週間の結果を見る。',
      '計画を変えてもう一度実行。AIは何が得意？人はどこで関わるべき？',
    ],
    modesTitle: '4つの働き方',
    chooseTeam: 'チームを選ぶ',
    tasksCount: 'タスク {n} 件',
    changeTeam: '← チームを変更',
    members: 'チームメンバー',
    backlog: 'バックログ',
    backlogDesc: '振り分け待ちのタスク',
    emptyDrop: 'ここにドロップ',
    tapHere: 'タップしてここへ移動',
    hint: 'カードを列にドラッグするか、カードをタップしてから列をタップ。キーボード：カードを選んで 0〜4 を押す。',
    remaining: '残り {n} 件のタスクを配置してください',
    ready: 'すべてのタスクを配置しました！',
    run: 'スプリント実行 ▶',
    rerun: 'もう一度スプリント実行 ▶',
    reset: 'バックログに戻す',
    running: 'スプリント進行中…',
    days: ['月', '火', '水', '木', '金'],
    resultsTitle: 'スプリント {n} — 今週の結果',
    score: 'スコア',
    stale: '前回のスプリントから計画が変わりました。もう一度実行して新しい結果を確認しましょう。',
    history: 'これまでのスプリント',
    sprintN: 'スプリント {n}',
    tryAgain: '別の振り分け方を試して、もう一度スプリントを実行してみよう！',
    owner: '担当',
    loadError: 'シナリオを読み込めませんでした。',
    loadErrorHint: 'index.html を直接開いた場合は、ローカルWebサーバーを起動してください（README参照）。',
    footer: '登場するチーム・人物・企業はすべて架空のものです。',
  },
};
