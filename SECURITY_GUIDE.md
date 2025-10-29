# Security & Configuration Guide

## 🔐 Credential Management

### Files Structure:

```
TO-DO-App/
├── .env.example          ← Template (safe to commit)
├── .env                  ← Real credentials (NOT in git - local only)
├── .gitignore            ← Tells git to ignore .env
├── db/
│   ├── 01-create-database.sql
│   ├── 02-create-user.sql
│   ├── 03-create-todos-table.sql
│   └── SETUP_GUIDE.md
└── backend/
    └── application.properties  ← Will use env variables
```

### Setup Process:

1. **Copy `.env.example` to `.env`** (local only)
```powershell
Copy-Item .env.example .env
```

2. **Edit `.env` with real credentials** (NOT committed to git)
```
DB_NAME=todo_db
DB_USER=todo_user
DB_PASSWORD=your_secure_password_here
```

**Password Requirements:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, special characters
- Example: `T0d0@App2025Secure`
- ❌ DO NOT use: b4code, password123, admin, 12345678

3. **Use environment variables in application**
   - Spring Boot reads from `.env` or system variables
   - Never hardcode in source code

### Git Safety Check:

```powershell
# Verify .env is ignored
git status

# Should NOT show .env file
# Should show .env.example and .gitignore
```

---

## 📋 Three SQL Files (Recommended)

Keep all 3 files separate because:

| File | Purpose | When to Use |
|------|---------|-----------|
| `01-create-database.sql` | Create database | First time setup |
| `02-create-user.sql` | Create roles/permissions | First time setup |
| `03-create-todos-table.sql` | Create tables/schema | First time + migrations |

**Why separate?**
- Different run frequency (db once, schema multiple times)
- Different permissions (admin vs app user)
- Version control clarity
- Standard industry practice

---

## 🚀 For Your Team

### To Other Team Members:
1. They copy `.env.example` → `.env`
2. They fill in their own credentials
3. They never commit `.env`
4. Git history stays clean of secrets

### For CI/CD Later:
- GitHub Actions will use GitHub Secrets
- Not environment files

---

## ✅ What's Secured:

- ✅ Passwords NOT in git history
- ✅ Each developer has their own `.env`
- ✅ `.gitignore` prevents accidental commits
- ✅ `.env.example` shows structure

---

## ⚠️ Git History Warning

If you already pushed `02-create-user.sql` with the password to git:

```powershell
# View git history
git log --oneline

# If it's in the last commit, you can amend:
git reset HEAD~1
git add db/02-create-user.sql
git commit --amend -m "feat: Update user creation script to use password variables"
git push origin feature/db-setup-dulanga --force-with-lease
```

But if it's in older commits, the password is still visible in history!
Consider rotating the password to 'b4code2' or similar.

