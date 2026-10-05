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

### 4. Cross-Check STATUS.md Against Reality

**IMPORTANT:** Don't blindly trust STATUS.md. Verify its claims:

```bash
# Check recent commits match claimed completed tasks
Bash: git log --oneline -10

# Look for commit messages matching the last few "completed" tasks from STATUS.md
# If STATUS.md says Task 3.2.2 is complete, git log should show that commit
```

**Verification checklist:**
- ✅ Git log contains commits for tasks STATUS.md claims are complete
- ✅ Test counts in STATUS.md match actual test run results (step 3)
- ✅ Coverage percentages reasonably close (within ~5%)
- ✅ No commits after the "last completed" task that aren't reflected in STATUS.md

**If discrepancies found:**
- Report what STATUS.md says vs. what repository shows
- Ask user which is correct
- Suggest updating STATUS.md if it's out of date
- **Do NOT proceed** until STATUS.md accurately reflects reality

**Example discrepancy:**
```
⚠️ STATUS.md says Task 3.2.2 is complete (last updated 2026-10-05)
   But git log shows Task 3.3.1 was committed after that.
   
   Actual state appears to be: Task 3.3.1 complete
   STATUS.md state claims: Task 3.2.2 complete
   
   STATUS.md needs updating. Update now? (y/n)
```

### 5. Summarize Current State

Present a clear summary to the user (using **verified** information):

**Project:** Reading Canon  
**Phase:** [Current phase from STATUS.md, verified against git log]  
**Last Completed:** [Last completed task, verified in git log]  
**Next Task:** [Next task ID and name from plan-mvp0.md]  

**Current Status:**
- Tests: [X passing / Y skipped / Z failing] (from actual test run)
- Git: [clean / uncommitted changes]
- Coverage: [X%] (from actual test run)

**Next Task Details:**
[Brief summary of what needs to be done]
- Effort: [S/M/L]
- Dependencies: [List any, verify they're actually complete]
- TDD Approach: [test-first / test-alongside / etc.]

**Done Criteria:**
[List done criteria from plan]

### 6. Ask for Confirmation

Present options to the user:

**Ready to continue. What would you like to do?**

1. **Proceed with [next task]** - Start implementation immediately
2. **Review task details** - Show full task description from plan-mvp0.md
3. **Different task** - Specify which task to work on instead
4. **Status update only** - Don't start implementation yet

### 7. After User Responds

- If **1 (Proceed)**: Begin implementation following CLAUDE.md workflows
- If **2 (Review)**: Show complete task details, then ask again
- If **3 (Different)**: Ask which task, verify dependencies, then proceed
- If **4 (Status only)**: Stop here, don't implement

## Important Notes

- **Don't automatically start implementing** - Always get user confirmation first
- **Verify, don't trust blindly** - Cross-check STATUS.md against git log and test results
- **Report any discrepancies** - If STATUS.md doesn't match reality, stop and report
- **Report any issues** - Failing tests, uncommitted changes, etc.
- **Follow CLAUDE.md** - Use the documented task completion workflow
- **Verify dependencies** - Don't start a task if its dependencies aren't complete
- **Read, don't guess** - All information should come from the actual files

## Example Session

```
User: /continue

Claude:
Reading project state...
✓ STATUS.md read - Claims Task 3.2.2 completed
✓ Git log verified - Task 3.2.2 commit found (4abca3a)
✓ Git status - Clean working directory
✓ Tests run - 305 passing, 28 skipped (matches STATUS.md)
✓ Verification complete - STATUS.md is accurate

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

**If STATUS.md doesn't match repository state:**
- Report specific discrepancies (what STATUS.md claims vs. what git log shows)
- Show last few commits from git log
- Ask user which is correct
- Offer to update STATUS.md if it's out of date
- Don't proceed until STATUS.md accurately reflects reality

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

**If test counts don't match STATUS.md:**
- Report actual test results vs. what STATUS.md claims
- Suggest updating STATUS.md with current counts
- This is usually not a blocker, but note it for accuracy

## Related

- **STATUS.md** - Detailed progress tracking
- **plan-mvp0.md** - Complete implementation plan
- **CLAUDE.md** - Development workflows and guidelines
