---
name: "speckit-git-commit"
description: "Commit all pending changes before the next Spec Kit phase runs."
compatibility: "Requires spec-kit project structure with .specify/ directory"
user-invocable: true
disable-model-invocation: false
---

Commit pending work so each Spec Kit phase starts from a clean tree.

1. Run `git status --porcelain`. If empty, report "Nothing to commit" and stop.
2. Run `git add -A`.
3. Commit with a concise message summarizing the changes (e.g. `Update spec artifacts before <phase>`). If the user supplied arguments, use them as the message.
4. Do not push. Do not amend existing commits.
