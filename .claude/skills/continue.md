# Continue Work - Resume Implementation

Resume work on reading-canon from where it was left off. This skill helps you pick up implementation after a break or session restart by reading project state and presenting next steps.

## Instructions

When this skill is invoked, follow these steps in order:

### 1. Read Project State

Read these files to understand current status:

```bash
# Current progress and next task
Read: STATUS.md

# Detailed task requirements
Read: artifacts/plan-mvp0.md (search for current task)

# Development guidelines and workflows
Read: CLAUDE.md

# Recent changes
Bash: git log --oneline -5
```

### 2. Verify Repository State

Check for uncommitted changes or issues:

```bash
# Git status
Bash: git status

# If there are uncommitted changes, report them and ask user if they want to:
# - Commit them
# - Discard them
# - Keep them and continue
```

### 3. Verify Test State

Run tests to ensure we're starting from a clean state:

```bash
# Run full test suite
Bash: npm test -- --run

# Note the results (passing/failing/skipped)
```

### 4. Summarize Current State

Present a clear summary to the user:

**Project:** Reading Canon  
**Phase:** [Current phase from STATUS.md]  
**Last Completed:** [Last completed task]  
**Next Task:** [Next task ID and name from plan-mvp0.md]  

**Current Status:**
- Tests: [X passing / Y skipped / Z failing]
- Git: [clean / uncommitted changes]
- Coverage: [X%]

**Next Task Details:**
[Brief summary of what needs to be done]
- Effort: [S/M/L]
- Dependencies: [List any]
- TDD Approach: [test-first / test-alongside / etc.]

**Done Criteria:**
[List done criteria from plan]

### 5. Ask for Confirmation

Present options to the user:

**Ready to continue. What would you like to do?**

1. **Proceed with [next task]** - Start implementation immediately
2. **Review task details** - Show full task description from plan-mvp0.md
3. **Different task** - Specify which task to work on instead
4. **Status update only** - Don't start implementation yet

### 6. After User Responds

- If **1 (Proceed)**: Begin implementation following CLAUDE.md workflows
- If **2 (Review)**: Show complete task details, then ask again
- If **3 (Different)**: Ask which task, verify dependencies, then proceed
- If **4 (Status only)**: Stop here, don't implement

## Important Notes

- **Don't automatically start implementing** - Always get user confirmation first
- **Report any issues** - Failing tests, uncommitted changes, etc.
- **Follow CLAUDE.md** - Use the documented task completion workflow
- **Verify dependencies** - Don't start a task if its dependencies aren't complete
- **Read, don't guess** - All information should come from the actual files

## Example Session

```
User: /continue

Claude:
Reading project state...
✓ STATUS.md - Phase 3, Task 3.2.2 completed
✓ Git status - Clean working directory
✓ Tests - 305 passing, 28 skipped

Current Status:
- Phase 3: Book Curation (CRUD) - 65% complete
- Last: Task 3.2.2 (Edit Book Page)
- Next: Task 3.3.1 (Delete Confirmation Dialog)

Task 3.3.1 Details:
- Create generic ConfirmDialog component
- Focus management and keyboard navigation
- Accessibility (focus trap, ESC key)
- Effort: S (3 hours)
- TDD: Test alongside

Done Criteria:
✓ Tests passing
✓ Dialog displays and functions
✓ Accessible (focus trap, keyboard nav)

Ready to continue. What would you like to do?
1. Proceed with Task 3.3.1
2. Review full task details
3. Work on different task
4. Status update only
```

## Error Handling

**If tests are failing:**
- Report which tests are failing
- Ask user if they want to fix tests first or if failures are expected
- Don't proceed until resolved

**If git has uncommitted changes:**
- Show what files are modified
- Ask user how to handle them
- Don't proceed until resolved

**If dependencies not complete:**
- Report which dependencies are missing
- Don't allow starting the task
- Suggest completing dependencies first

## Related

- **STATUS.md** - Detailed progress tracking
- **plan-mvp0.md** - Complete implementation plan
- **CLAUDE.md** - Development workflows and guidelines
