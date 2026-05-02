node server.js &
SERVER_PID=$!
sleep 2

# Test the KYC route
echo "Testing POST /api/auth/kyc without token:"
curl -X POST http://localhost:8000/api/auth/kyc -s -o /dev/null -w "%{http_code}\n"

kill $SERVER_PID
