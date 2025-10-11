# 👥 Manual User Creation Guide

## Creating Users via Console

Users are created manually by administrators using curl commands. There is NO user registration interface.

---

## 📝 Create User Command

### Basic Format
```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@igad.com",
    "name": "User Name",
    "password": "secure_password_here"
  }'
```

---

## 🎯 Create the 3 Default Users

### 1. Create Hector
```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hector@igad.com",
    "name": "Hector",
    "password": "hector123"
  }'
```

### 2. Create Enrique
```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "enrique@igad.com",
    "name": "Enrique",
    "password": "enrique123"
  }'
```

### 3. Create Yecksin
```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yecksin@igad.com",
    "name": "Yecksin",
    "password": "yecksin123"
  }'
```

---

## ✅ Expected Response

**Success:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "hector@igad.com",
    "name": "Hector"
  }
}
```

**Error (duplicate email):**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

---

## 🔐 Password Security

- Passwords are hashed using **SHA-256**
- Never stored in plain text
- Cannot be retrieved (only reset)

---

## 🧪 Test Login After Creating User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hector@igad.com",
    "password": "hector123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "hector@igad.com",
    "name": "Hector"
  }
}
```

---

## 📋 View All Users (via D1)

```bash
npx wrangler d1 execute igad-db --remote \
  --command="SELECT id, email, name, created_at FROM users"
```

---

## 🗑️ Delete a User (if needed)

```bash
npx wrangler d1 execute igad-db --remote \
  --command="DELETE FROM users WHERE email = 'user@igad.com'"
```

---

## 🔄 Reset User Password

To change a password, you need to:

1. Calculate the new password hash
2. Update directly in D1

Or simply delete and recreate the user.

---

## 🚀 Quick Setup Script

Run all 3 user creation commands at once:

```bash
# Create all users
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{"email":"hector@igad.com","name":"Hector","password":"hector123"}' && \
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{"email":"enrique@igad.com","name":"Enrique","password":"enrique123"}' && \
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{"email":"yecksin@igad.com","name":"Yecksin","password":"yecksin123"}'
```

---

## 📌 Important Notes

1. **No UI for user creation** - Must use curl/API
2. **Emails must be unique** - Duplicate emails will fail
3. **Password requirements** - Use strong passwords in production
4. **Admin access only** - This endpoint should be restricted in production
5. **Test locally first** - Verify before creating production users

---

## 🔒 Production Security Recommendations

For production deployment:

1. **Restrict `/api/admin/*` endpoints** - Add IP whitelist or authentication
2. **Use stronger passwords** - Minimum 12 characters, mixed case, numbers, symbols
3. **Enable HTTPS only** - Never send passwords over HTTP
4. **Add rate limiting** - Prevent brute force attacks
5. **Add audit logging** - Track user creation/deletion

---

## 📞 Troubleshooting

### "Database not available"
- Check that the server is running: `npm run dev`
- Verify D1 binding in `wrangler.toml`

### "User with this email already exists"
- Delete existing user first
- Or use a different email

### "Invalid email or password" on login
- Verify email is correct (case-sensitive)
- Verify password matches exactly
- Check user exists: `wrangler d1 execute igad-db --remote --command="SELECT * FROM users"`

---

**✅ Users ready to login!**

After creating users, they can login at: `http://localhost:3000` → Click "Login"

