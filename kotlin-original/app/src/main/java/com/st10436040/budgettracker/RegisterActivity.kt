package com.st10436040.budgettracker

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.st10436040.budgettracker.data.User
import com.st10436040.budgettracker.databinding.ActivityRegisterBinding
import com.st10436040.budgettracker.utils.PasswordHasher
import kotlinx.coroutines.launch

/**
 * Simple registration screen — creates a new [User] row.
 * Uniqueness is enforced by the unique index on [User.username]; duplicate names are caught and
 * surfaced as a user-friendly toast rather than a crash.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_register)

        binding.btnRegister.setOnClickListener { attemptRegister() }
    }

    private fun attemptRegister() {
        val username = binding.inputUsername.text?.toString()?.trim().orEmpty()
        val password = binding.inputPassword.text?.toString().orEmpty()
        val confirm = binding.inputConfirmPassword.text?.toString().orEmpty()

        when {
            username.length < 3 -> {
                toast(R.string.error_short_username); return
            }
            password.length < 6 -> {
                toast(R.string.error_short_password); return
            }
            password != confirm -> {
                toast(R.string.error_password_mismatch); return
            }
        }

        binding.btnRegister.isEnabled = false
        val dao = (applicationContext as BudgetApp).database.userDao()

        lifecycleScope.launch {
            try {
                val salt = PasswordHasher.newSalt()
                val hash = PasswordHasher.hash(password, salt)
                val id = dao.insert(User(username = username, passwordHash = hash, salt = salt))
                Log.i(TAG, "Registered user $username with id=$id")
                Toast.makeText(this@RegisterActivity, R.string.register_success, Toast.LENGTH_SHORT).show()
                finish()
            } catch (e: Exception) {
                Log.e(TAG, "Registration failed", e)
                Toast.makeText(this@RegisterActivity, R.string.error_username_taken, Toast.LENGTH_LONG).show()
            } finally {
                binding.btnRegister.isEnabled = true
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }

    private fun toast(resId: Int) = Toast.makeText(this, resId, Toast.LENGTH_SHORT).show()

    companion object { private const val TAG = "RegisterActivity" }
}
