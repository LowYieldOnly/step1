/* SessionStart hook (.claude/settings.json): puts Dylan's deploy rule in front of every
 * session, including the one that resumes after a compaction. */
// Dylan, 2026-10-22: "don't deploy a new plan/plan update without my approval".
console.log('THE DEPLOY RULE (Dylan): never deploy a new plan or a plan update — no PR merge to main, no Pages deploy — without Dylan\'s explicit approval of that specific deploy. Committing and pushing to the working branch is fine; going live is his call, every time.');
