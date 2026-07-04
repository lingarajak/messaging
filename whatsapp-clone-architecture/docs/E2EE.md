# End-to-End Encryption
Uses libsignal-protocol. Flow:
1. Client generates identityKey + preKeys on signup, POST /v1/keys
2. Before sending, fetch recipient keys from Redis
3. Encrypt locally with SessionCipher, send ciphertext only
4. Server never sees plaintext
