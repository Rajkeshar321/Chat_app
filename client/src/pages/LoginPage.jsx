
import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const { login } = useContext(AuthContext)

  const onSubmitHandler = (event) => {
    event.preventDefault()

    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true)
      return
    }

    login(
      currState === "Sign up" ? "signup" : "login",
      { fullName, email, password, bio }
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center gap-16 px-6 py-10 sm:justify-evenly max-sm:flex-col">

      {/* Left Section */}
      <div className="flex flex-col items-center gap-5">
        <img
          src={assets.logo_big}
          alt="Chat Logo"
          className="w-[min(30vw,250px)] max-sm:w-32"
        />

        <p className="text-white text-xl font-medium tracking-wide">
          Connect. Chat. Share.
        </p>
      </div>

      {/* Right Section */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-[420px] border border-white/30
        bg-slate-950/70 backdrop-blur-xl
        text-white p-8 flex flex-col gap-6
        rounded-2xl shadow-2xl shadow-purple-900/30"
      >

        <h2 className="font-semibold text-3xl flex justify-between items-center">
          {currState}

          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Back"
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {/* Full Name */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            placeholder="Full Name"
            autoComplete="name"
            required
            className="w-full p-3 bg-white/10 border border-white/30
            rounded-lg text-white placeholder-gray-300
            focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        )}

        {/* Email and Password */}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              autoComplete="username"
              required
              className="w-full p-3 bg-white/10 border border-white/30
              rounded-lg text-white placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              autoComplete={
                currState === "Sign up"
                  ? "new-password"
                  : "current-password"
              }
              required
              className="w-full p-3 bg-white/10 border border-white/30
              rounded-lg text-white placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </>
        )}

        {/* Bio */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            placeholder="Provide a short bio..."
            required
            className="w-full p-3 bg-white/10 border border-white/30
            rounded-lg text-white placeholder-gray-300
            focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r
          from-purple-500 to-violet-700
          hover:from-purple-600 hover:to-violet-800
          text-white font-semibold rounded-lg
          transition-all duration-300 cursor-pointer"
        >
          {currState === "Sign up"
            ? isDataSubmitted
              ? "Create Account"
              : "Continue"
            : "Login Now"}
        </button>

        {/* Terms */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" required className="accent-purple-500" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        {/* Switch Login / Signup */}
        <div className="text-sm text-gray-300">
          {currState === "Sign up" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login")
                  setIsDataSubmitted(false)
                }}
                className="font-semibold text-purple-400 cursor-pointer hover:text-purple-300"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Sign up")
                  setIsDataSubmitted(false)
                }}
                className="font-semibold text-purple-400 cursor-pointer hover:text-purple-300"
              >
                Sign up here
              </span>
            </p>
          )}
        </div>

      </form>
    </div>
  )
}

export default LoginPage
