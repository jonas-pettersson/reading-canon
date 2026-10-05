# Continue Work - Resume Implementation

Resume work on reading-canon from previous session. Verifies project state and presents next task.

## Steps

### 1. Read Project State

```bash
Read: STATUS.md
Read: artifacts/plan-mvp0.md (find current task section)
Bash: git log --oneline -10
Bash: git status
```

### 2. Run Tests

```bash
Bash: npm test -- --run
```

Note: passing/skipped/failing counts and coverage %.

### 3. Verify STATUS.md Accuracy

**Cross-check claims against reality:**

- Check git log contains commits for tasks STATUS.md claims complete
- Compare test counts: actual vs. STATUS.md
- Verify no commits exist after "last completed task" that aren't reflected in STATUS.md

**If discrepancies found:**
- Report: "STATUS.md says X, but git log shows Y"
- Ask user which is correct
- Offer to update STATUS.md
- **Block until resolved**

### 4. Present Summary

```
Current Status:
- Phase: [phase from STATUS.md, verified]
- Last completed: [task, verified in git log]
- Next task: [task ID and name from plan-mvp0.md]
- Tests: [X passing / Y skipped / Z failing]
- Git: [clean / uncommitted changes]
- Coverage: [X%]

Next Task: [Task ID - Name]
- Effort: [S/M/L]
- Dependencies: [list, verify complete]
- TDD: [approach]
- Done criteria: [list from plan]

What would you like to do?
1. Proceed with [next task]
2. Review full task details
3. Work on different task
4. Status update only
```

### 5. After User Response

- **Option 1**: Begin implementation per CLAUDE.md workflows
- **Option 2**: Read full task from plan-mvp0.md, then ask again
- **Option 3**: Ask which task, verify dependencies, proceed
- **Option 4**: Stop, don't implement

## Blocking Conditions

**Block if:**
- Tests failing (unless user confirms expected)
- Uncommitted changes (ask user how to handle)
- STATUS.md doesn't match git log (update first)
- Task dependencies incomplete (list them, suggest completing first)

## Key Principles

- **Verify, don't trust**: Cross-check STATUS.md against git log and test results
- **Don't auto-start**: Always get user confirmation
- **Read, don't guess**: Use actual file contents
- **Follow CLAUDE.md**: Use documented workflows after user confirms

## Related Files

- `STATUS.md` - Progress tracking (verify against git)
- `artifacts/plan-mvp0.md` - Task details and dependencies
- `CLAUDE.md` - Workflows and completion steps
