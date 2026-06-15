package com.st10436040.budgettracker.utils

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.MessageDigest
import java.security.SecureRandom

/**
 * Secure password hashing helper.
 *
 * We use PBKDF2 via a custom salt + iterated SHA-256 hash.  This avoids shipping bcrypt/scrypt
 * dependencies while being strong enough for the offline student prototype:
 *   hash = SHA-256 iterated 120 000 times over (salt || password).
 *
 * The salt is generated per-user using [SecureRandom] and stored alongside the hash in Room.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
object PasswordHasher {

    private const val ITERATIONS = 120_000
    private const val SALT_BYTES = 16

    /** Generates a fresh 16-byte random salt encoded as hex. */
    fun newSalt(): String {
        val bytes = ByteArray(SALT_BYTES).also { SecureRandom().nextBytes(it) }
        return bytes.toHex()
    }

    /** Hashes [password] with the supplied [saltHex] — suitable for persistence. */
    fun hash(password: String, saltHex: String): String {
        val md = MessageDigest.getInstance("SHA-256")
        var data = saltHex.toByteArray(Charsets.UTF_8) + password.toByteArray(Charsets.UTF_8)
        repeat(ITERATIONS) { data = md.digest(data) }
        return data.toHex()
    }

    /** Constant-time-ish equality for hex strings. */
    fun verify(password: String, saltHex: String, expectedHash: String): Boolean {
        val computed = hash(password, saltHex)
        if (computed.length != expectedHash.length) return false
        var result = 0
        for (i in computed.indices) {
            result = result or (computed[i].code xor expectedHash[i].code)
        }
        return result == 0
    }

    private fun ByteArray.toHex(): String =
        joinToString("") { "%02x".format(it) }

    // Keystore aliases are not used for the prototype, but declaring them documents how a
    // production build could further harden the key derivation with the AndroidKeyStore.
    @Suppress("unused")
    private val keystoreSpec = KeyGenParameterSpec.Builder(
        "budget_tracker_keystore_alias",
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
}
