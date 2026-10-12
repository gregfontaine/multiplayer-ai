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
    desc: { en: 'People do the work; AI checks and suggests improvements.', ja: '人が作業し、AIがチェックして改善案を出す。' },
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
    desc: { en: 'AI does the work end to end, with no human check.', ja: 'AIが最初から最後まで担当し、人のチェックは入らない。' },
  },
];

// Possible results for a task, best first. `points` drive the sprint score.
export const OUTCOMES = {
  perfect: { icon: '🌟', points: 3, label: { en: 'Perfect!', ja: '大成功！' } },
  done: { icon: '✅', points: 2, label: { en: 'Done', ja: '無事完了' } },
  minor: { icon: '⚠️', points: 1, label: { en: 'Minor issue', ja: '小さな問題あり' } },
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
    tagline: '何をAIに任せ、どこまで人が関わるか。チームで決めてみよう。',
    howTitle: '遊び方',
    how: [
      'チームを選ぶ。',
      'バックログの各タスクを、4つの働き方のどれかにドラッグする。',
      '「スプリント開始」をクリックして、1週間の結果を見る。',
      '計画を変えて、もう一度やってみる。AIが得意なことは？ 人が関わるべきなのはどこ？',
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
    hint: 'カードを列にドラッグするか、カードをタップしてから移動先の列をタップ。キーボードの場合は、カードを選んで 0〜4 キーを押す。',
    remaining: 'あと {n} 件のタスクを配置してください',
    ready: '全タスクの配置が完了。準備OK！',
    run: 'スプリント開始 ▶',
    rerun: 'もう一度スプリント開始 ▶',
    reset: 'バックログに戻す',
    running: 'スプリント進行中…',
    days: ['月', '火', '水', '木', '金'],
    resultsTitle: 'スプリント {n}：今週の結果',
    score: 'スコア',
    stale: '前回のスプリントから計画が変わっています。もう一度スプリントを開始して、新しい結果を確認しましょう。',
    history: 'これまでのスプリント',
    sprintN: 'スプリント {n}',
    tryAgain: '別の振り分け方を試して、もう一度スプリントを回してみよう！',
    owner: '担当',
    loadError: 'シナリオを読み込めませんでした。',
    loadErrorHint: 'index.html を直接開いた場合は、ローカルWebサーバーを起動してください（README参照）。',
    footer: '登場するチーム・人物・企業はすべて架空のものです。',
  },
};
