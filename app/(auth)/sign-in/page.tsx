"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });

    if (res?.error) {
      setError("Неверный email или пароль");
    }
    setLoading(false);
  };

  return (
    <div className="w-[340px] md:w-sm mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h1 className="text-2xl text-center font-bold mb-4">Вход</h1>
      <div className="flex flex-col gap-3">
        <input
          type="email"
          className="px-4 py-2 w-full h-10 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200"
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="px-4 py-2 w-full h-10 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          className={`flex items-center justify-center w-full ${loading ? "border-orange-100 bg-orange-100" : "border-orange-400 bg-orange-400"} p-2 border hover:bg-orange-100 text-white rounded-lg duration-300 cursor-pointer hover:text-orange-500`}
        >
          {loading ? "Входим..." : "Войти"}
        </button>

        <div className="w-full flex justify-center mt-3 mb-3">
          <div className="h-[1px] w-[80%] bg-gray-300 flex items-center justify-center"><div className="mb-1 bg-white w-10 h-3 text-center flex items-center justify-center content-center"><span className="text-gray-500">или</span></div></div>
        </div>

        {/* <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className={`flex items-center gap-3 justify-center w-full border-orange-400 bg-orange-400 p-2 border hover:bg-orange-100 text-white rounded-lg duration-300 cursor-pointer hover:text-orange-500`}
        >
        <Image src="/icons/google.svg" alt="Google" width={21} height={21} /> Войти через Google
        </button> */}

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <hr className="my-2" />

        <a
          href="/sign-up"
          className="text-orange-500 hover:underline text-sm text-center flex items-center justify-center"
        >
          Ещё нет аккаунта? <span className="font-bold ml-1">Зарегистрируйтесь</span>
        </a>
      </div>
    </div>
  );
}
