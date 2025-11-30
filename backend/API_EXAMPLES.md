# API Testing Examples

Complete cURL commands and Postman collection for testing the Samadhaan API.

## Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "User"
  }'
```

### 2. Register Admin
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "Admin"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token from response for subsequent requests:**
```bash
export TOKEN="your_jwt_token_here"
```

### 4. Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 Complaints

### 5. Submit Complaint
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Technical",
    "description": "Login page not working properly. Cannot access my account.",
    "priority": "High"
  }'
```

### 6. Get My Complaints
```bash
curl -X GET http://localhost:5000/api/complaints/my \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Get All Complaints (Admin)
```bash
curl -X GET http://localhost:5000/api/complaints \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 8. Get Complaints with Filters
```bash
# Filter by category
curl -X GET "http://localhost:5000/api/complaints?category=Technical" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/complaints?status=Pending" \
  -H "Authorization: Bearer $TOKEN"

# Filter by priority
curl -X GET "http://localhost:5000/api/complaints?priority=High" \
  -H "Authorization: Bearer $TOKEN"

# Filter by date
curl -X GET "http://localhost:5000/api/complaints?date=2024-01-15" \
  -H "Authorization: Bearer $TOKEN"

# Search by keyword
curl -X GET "http://localhost:5000/api/complaints?search=login" \
  -H "Authorization: Bearer $TOKEN"

# Multiple filters
curl -X GET "http://localhost:5000/api/complaints?category=Technical&status=Pending&priority=High" \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Get Complaint by ID
```bash
curl -X GET http://localhost:5000/api/complaints/COMPLAINT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Update Complaint Status (Admin only)
```bash
curl -X PATCH http://localhost:5000/api/complaints/COMPLAINT_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress"
  }'
```

## 👤 Profile

### 11. Get Profile
```bash
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer $TOKEN"
```

### 12. Update Profile
```bash
curl -X PUT http://localhost:5000/api/profile/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "1234567890",
    "address": "123 Main St",
    "bio": "Updated bio"
  }'
```

### 13. Change Password
```bash
curl -X PUT http://localhost:5000/api/profile/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

## 📊 Statistics (Admin only)

### 14. Get Total Complaints
```bash
curl -X GET http://localhost:5000/api/stats/total \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 15. Get Pending Complaints
```bash
curl -X GET http://localhost:5000/api/stats/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 16. Get Resolved Complaints
```bash
curl -X GET http://localhost:5000/api/stats/resolved \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 17. Get Category Distribution
```bash
curl -X GET http://localhost:5000/api/stats/category-distribution \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 18. Get Status Distribution
```bash
curl -X GET http://localhost:5000/api/stats/status-distribution \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 19. Get All Statistics
```bash
curl -X GET http://localhost:5000/api/stats/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 📥 Export (Admin only)

### 20. Export to CSV
```bash
curl -X GET http://localhost:5000/api/export/csv \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o complaints.csv
```

## 🧪 Complete Test Script

Save as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "=== Testing Samadhaan API ==="

# Register User
echo -e "\n1. Registering User..."
USER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "User"
  }')
echo $USER_RESPONSE | jq '.'

TOKEN=$(echo $USER_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# Submit Complaint
echo -e "\n2. Submitting Complaint..."
curl -s -X POST $BASE_URL/complaints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Technical",
    "description": "Test complaint description with more than 10 characters",
    "priority": "High"
  }' | jq '.'

# Get My Complaints
echo -e "\n3. Getting My Complaints..."
curl -s -X GET $BASE_URL/complaints/my \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Get Profile
echo -e "\n4. Getting Profile..."
curl -s -X GET $BASE_URL/profile/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== Tests Complete ==="
```

Make executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## 📮 Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Samadhaan API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"User\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/register",
              "host": ["{{base_url}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set('token', jsonData.data.token);",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Complaints",
      "item": [
        {
          "name": "Submit Complaint",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"category\": \"Technical\",\n  \"description\": \"Login page not working properly\",\n  \"priority\": \"High\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/complaints",
              "host": ["{{base_url}}"],
              "path": ["complaints"]
            }
          }
        },
        {
          "name": "Get My Complaints",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {
              "raw": "{{base_url}}/complaints/my",
              "host": ["{{base_url}}"],
              "path": ["complaints", "my"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ]
}
```

Save this as `Samadhaan_API.postman_collection.json` and import into Postman.

