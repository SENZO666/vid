package com.st10436040.budgettracker

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.st10436040.budgettracker.databinding.ActivityLoginBinding
import com.st10436040.budgettracker.utils.PasswordHasher
import com.st10436040.budgettracker.utils.SessionManager
import kotlinx.coroutines.launch

/**
 * Entry point — username + password login.
 *
 * Satisfies the POE requirement:
 *   "The user must be able to log in to the app using a username and password."
 *
 * If a session is already active we skip straight to the dashboard.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        session = SessionManager(this)

        if (session.isLoggedIn()) {
            Log.d(TAG, "Active session for userId=${session.getUserId()} — jumping to dashboard")
            goToDashboard()
            return
        }

        binding.btnLogin.setOnClickListener { attemptLogin() }
        binding.btnGotoRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun attemptLogin() {
        val username = binding.inputUsername.text?.toString()?.trim().orEmpty()
        val password = binding.inputPassword.text?.toString().orEmpty()

        // Boundary validation — guards against blank inputs that would crash the auth logic.
        if (username.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, R.string.error_empty_credentials, Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnLogin.isEnabled = false
        val app = applicationContext as BudgetApp

        lifecycleScope.launch {
            val user = app.database.userDao().findByUsername(username)
            val ok = user != null && PasswordHasher.verify(password, user.salt, user.passwordHash)
            binding.btnLogin.isEnabled = true
            if (ok && user != null) {
                Log.i(TAG, "Login succeeded for $username (userId=${user.id})")
                session.setLoggedInUser(user.id, user.username)
                goToDashboard()
            } else {
                Log.w(TAG, "Login failed for username=$username")
                Toast.makeText(this@LoginActivity, R.string.error_invalid_login, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun goToDashboard() {
        startActivity(Intent(this, DashboardActivity::class.java))
        finish()
    }

    companion object { private const val TAG = "LoginActivity" }
}
