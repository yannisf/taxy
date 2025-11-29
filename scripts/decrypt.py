#!/usr/bin/env python3
import os
import sys
import base64
import gzip
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.hashes import SHA256
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def main():
    if "PASSWD" not in os.environ:
        print("PASSWD environment variable not set", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <base64_cipher_file>", file=sys.stderr)
        sys.exit(1)

    passwd = os.environ["PASSWD"].encode()
    infile = sys.argv[1]
    outfile = "decrypted.out"

    # read and decode base64
    with open(infile, "rb") as f:
        raw = base64.b64decode(f.read())

    if len(raw) < 16 + 12 + 16:
        print("Ciphertext too short", file=sys.stderr)
        sys.exit(1)

    # layout: salt(16) | iv(12) | ciphertext | tag(16)
    salt = raw[:16]
    iv = raw[16:28]
    tag = raw[-16:]
    ciphertext = raw[28:-16]

    # derive AES-256 key with PBKDF2-SHA256
    kdf = PBKDF2HMAC(
        algorithm=SHA256(),
        length=32,
        salt=salt,
        iterations=100_000,
    )
    key = kdf.derive(passwd)

    # decrypt AES-GCM
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(iv, ciphertext + tag, associated_data=None)

    # gunzip in memory and write output
    decompressed = gzip.decompress(plaintext)
    with open(outfile, "wb") as f:
        f.write(decompressed)

    print(f"Decrypted output written to: {outfile}")

if __name__ == "__main__":
    main()

