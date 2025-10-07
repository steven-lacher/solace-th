# Claude AI Collaboration Guidelines

This document outlines the workflow and guidelines for using Claude as an AI pair-programming partner on this project.

---

## Git Workflow Rules

### 🚨 CRITICAL: Commit & PR Policy

**NEVER commit changes without explicit user permission.**

Claude MUST:
- ✅ **ALWAYS ask** before creating commits
- ✅ **ALWAYS ask** before creating pull requests
- ✅ **ALWAYS ask** before pushing to remote
- ✅ **ALWAYS explain** what will be committed before running git commands
- ✅ **ALWAYS show** the git commands that will be run
- ✅ **WAIT for explicit approval** before executing any git commands

### Example Workflow

**❌ WRONG:**
```
Claude: I've fixed the bug and committed the changes.
```

**✅ CORRECT:**
```
Claude: I've completed the bug fixes in page.tsx.

Would you like me to commit these changes? If yes, I'll run:

git add src/app/page.tsx src/types/advocate.ts
git commit -m "fix: resolve yearsOfExperience.includes() crash

- Add Advocate interface for type safety
- Fix number.includes() error
- Remove DOM manipulation anti-pattern
- Add proper error handling"

Please confirm if you'd like me to proceed with this commit.
```

---

## Collaboration Workflow

### Planning Phase
1. Claude analyzes requirements and codebase
2. Claude presents execution plan with rationale
3. User reviews and approves/modifies plan
4. Claude exits plan mode and begins implementation

### Implementation Phase
1. Claude implements changes file-by-file
2. Claude explains changes as they're made
3. Claude tests changes locally when possible
4. Claude summarizes what was changed

### Git Phase (REQUIRES APPROVAL)
1. Claude lists all modified files
2. Claude shows proposed git commands
3. Claude explains what will be committed and why
4. **User explicitly approves**
5. Claude executes git commands
6. Claude confirms success

---

## Communication Guidelines

### What Claude Should Do:
- ✅ Be concise and direct
- ✅ Explain complex changes clearly
- ✅ Show code context with file paths and line numbers
- ✅ Ask clarifying questions when requirements are ambiguous
- ✅ Suggest alternatives when appropriate
- ✅ Document trade-offs and decisions

### What Claude Should NOT Do:
- ❌ Make git commits without permission
- ❌ Push to remote repositories without permission
- ❌ Run destructive commands without warning
- ❌ Make assumptions about requirements
- ❌ Over-explain trivial changes
- ❌ Add unnecessary preamble/postamble

---

## Code Standards

### TypeScript
- Use strict typing (no `any` unless absolutely necessary)
- Define interfaces for all data structures
- Use proper React types (`React.ChangeEvent`, `React.MouseEvent`, etc.)
- Add return types to functions

### React
- Use functional components with hooks
- Use proper state management patterns
- Add `key` props to all mapped elements
- Avoid anti-patterns (no `document.getElementById`, etc.)
- Follow React best practices

### Styling
- Use Tailwind CSS utility classes
- Avoid inline styles
- Maintain consistent spacing and layout
- Ensure mobile responsiveness

### Performance
- Debounce expensive operations
- Implement pagination for large datasets
- Use database indexes for search queries
- Minimize unnecessary re-renders

---

## File Reference Format

When referencing code, use markdown links:
- Files: `[page.tsx](src/app/page.tsx)`
- Specific lines: `[page.tsx:32](src/app/page.tsx#L32)`
- Folders: `[components/](src/components/)`

This allows clickable navigation in VSCode.

---

## Testing Approach

### Before Committing:
1. Verify code compiles (TypeScript)
2. Test locally with `npm run dev`
3. Verify functionality works as expected
4. Check for console errors
5. Review changed files

### After Committing:
1. Confirm commit was successful
2. Verify git status is clean
3. Review commit message for accuracy

---

## Documentation

### When to Update Docs:
- Significant architectural changes
- New features or APIs
- Performance optimizations
- Trade-offs and decisions
- Future enhancement ideas

### Documentation Files:
- `DISCUSSION.md` - Implementation approach, trade-offs, future work
- `CLAUDE.md` - AI collaboration guidelines (this file)
- `README.md` - Project setup and usage instructions
- Inline comments - Complex logic, non-obvious decisions

---

## Why This Approach?

### Transparency
Including `CLAUDE.md` in the repository demonstrates:
- Modern engineering practices
- Thoughtful use of AI as a tool
- Clear communication and process
- Professional approach to collaboration

### Trust
By requiring explicit approval for git operations:
- User maintains full control
- No surprise commits or pushes
- Clear audit trail of changes
- Reduces risk of errors

### Efficiency
With clear guidelines:
- Faster iteration cycles
- Fewer misunderstandings
- Focused on high-value work
- Better time management

---

## Project-Specific Context

### Time Constraint
This is a 2-hour take-home assignment. All decisions should prioritize:
1. **Correctness** - Fix broken functionality
2. **Scalability** - Address the 100K+ records requirement
3. **Professional polish** - Clean code, good UX
4. **Documentation** - Explain trade-offs clearly

### Three-PR Strategy
1. **PR 1:** Fix bugs + TypeScript (stub data)
2. **PR 2:** Database + Performance (PostgreSQL + indexes)
3. **PR 3:** UI/UX polish (Tailwind + states)

See `DISCUSSION.md` for full execution plan.

---

## Example Interactions

### Good: Asking Before Commit
```
User: Fix the bug in page.tsx
Claude: [makes changes]
Claude: I've fixed the yearsOfExperience.includes() error.
        Ready to commit? Here's what I'll run: [shows git commands]
User: Yes, please commit
Claude: [commits changes]
```

### Bad: Committing Without Permission
```
User: Fix the bug in page.tsx
Claude: [makes changes and commits]
Claude: Done! I've committed the fix.
User: 😠 I didn't ask you to commit yet!
```

---

## Updates to This Document

This file should be updated when:
- Workflow guidelines change
- New patterns are established
- Issues are discovered
- Best practices evolve

**Last Updated:** 2025-10-07
**Version:** 1.0.0
