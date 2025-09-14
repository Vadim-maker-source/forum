"use client";

import { signUpAction } from "@/app/lib/api/actions";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import ru from 'react-phone-input-2/lang/ru.json'
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () =>
    start(async () => {
      setError(null);
      try {
        await signUpAction(name, email, number || undefined, password);
        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        });
      } catch (e: any) {
        setError(e?.message || "Ошибка регистрации");
      }
    });

  return (
    <div className="w-[340px] md:w-sm mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-center mb-4">Регистрация</h1>
      <div className="flex flex-col gap-3">
        <input
          className="px-4 py-2 w-full h-10 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <PhoneInput
        localization={ru}
        country={"ru"}
  value={number}
  onChange={setNumber}
  containerClass="focus:border-orange-500 outline-0 hover:border-gray-300 duration-200"
  inputClass="focus:border-orange-500 outline-0 hover:border-gray-300 duration-200"
  inputStyle={{ borderColor: "#e5e7eb", width: "100%", borderRadius: "0.25rem", height: 40, paddingRight: 8, textAlign: "center", paddingInline: 16, }}
/>
        {/* <input
          className="px-4 py-2 w-full h-10 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200"
          placeholder="Телефон"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        /> */}
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
          disabled={pending}
          className={`flex items-center justify-center w-full ${pending ? "border-orange-100 bg-orange-100" : "border-orange-400 bg-orange-400"} p-2 border hover:bg-orange-100 text-white rounded-lg duration-300 cursor-pointer hover:text-orange-500`}
        >
          {pending ? <Loader2 className="animate-spin" /> : "Зарегистрироваться"}
        </button>

        <div className="w-full flex justify-center mt-3 mb-3">
          <div className="h-[1px] w-[80%] bg-gray-300 flex items-center justify-center"><div className="mb-1 bg-white w-10 h-3 text-center flex items-center justify-center content-center"><span className="text-gray-500">или</span></div></div>
        </div>
        
        {/* <button
  onClick={() => signIn("google", { callbackUrl: "/" })}
  className={`flex items-center gap-3 justify-center w-full border-orange-400 bg-orange-400 p-2 border hover:bg-orange-100 text-white rounded-lg duration-300 cursor-pointer hover:text-orange-500`}
>
<Image src="/icons/google.svg" alt="Google" width={21} height={21} /> Войти через Yandex
</button> */}

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <hr className="my-2" />

        <a
          href="/sign-in"
          className="text-orange-500 hover:underline text-sm text-center flex items-center justify-center"
        >
          Уже есть аккаунт? <span className="font-bold ml-1">Войдите</span>
        </a>
      </div>
    </div>
  );
}
