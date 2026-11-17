# UFL-Backend

## Bulk user accounts

Set `BULK_USER_PASSWORD` in the local, git-ignored `.env` file to a password of at least 6 characters, then run:

```powershell
npm run seed:users
```

New users share that initial password. The script skips existing email addresses, derives usernames from the email local parts, and creates a wallet with the standard 500-coin welcome bonus for each new account.
