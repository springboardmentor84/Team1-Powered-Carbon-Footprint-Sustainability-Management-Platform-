#!/bin/bash
echo "Registering user ZZZ..."
curl -s -X POST http://localhost:9042/register \
  -H "Content-Type: application/json" \
  -d '{"name":"ZZZ","email":"zzz@example.com","password":"password123","role":"USER"}'

echo -e "\nLogging in ZZZ..."
LOGIN_RESP=$(curl -s -X POST http://localhost:9042/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zzz@example.com","password":"password123"}')
echo $LOGIN_RESP
TOKEN=$(echo $LOGIN_RESP | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "Token: $TOKEN"

echo -e "\nFetching /carbon..."
curl -s -X GET http://localhost:9042/carbon \
  -H "Authorization: Bearer $TOKEN"

echo -e "\nFetching /goals..."
curl -s -X GET http://localhost:9042/goals \
  -H "Authorization: Bearer $TOKEN"
