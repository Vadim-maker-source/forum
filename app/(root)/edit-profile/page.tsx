"use client";

import { useEffect, useState, useTransition } from "react";
import { getCurrentUser, updateUserProfile, uploadFile } from "@/app/lib/api/actions";
import { toast } from "sonner";

export default function EditProfile() {
  const [user, setUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");

  // Загружаем текущего пользователя
  useEffect(() => {
    (async () => {
      const me = await getCurrentUser();
      if (me) {
        setUser(me);
        setName(me.name || "");
        setBio(me.bio || "");
        setAvatar(me.avatar || "");
      }
    })();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadFile(file);
      setAvatar(uploaded.url);
    } catch (err) {
      console.error(err);
      setMessage("Ошибка загрузки файла");
    }
  };

  const handleSubmit = () =>
    start(async () => {
      if (!user) return;
      try {
        await updateUserProfile({
          id: user.id,
          name,
          bio: bio,
          avatar,
          currentPassword: passwordCurrent || undefined,
          newPassword: passwordNew || undefined,
        });
        setPasswordCurrent("");
        setPasswordNew("");
        toast.success("Ваш профиль был успешно обновлён!");
      } catch (err: any) {
        toast.error("❌ Ошибка: " + (err.message || "не удалось обновить профиль"));
      }
    });

  if (!user) return <p>Загрузка профиля...</p>;

  return (
    <div className="max-w-3xl w-md md:w-lg mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Редактирование профиля</h1>

      {/* Аватар */}
      <div className="w-full">
        <label>Аватар</label>
        <img
          src={"https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-512.png"}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {avatar && <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full mt-2" />}
      </div>

      {/* Имя */}
      <div className="flex flex-col justify-start gap-2">
        <label>Имя</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200" />
      </div>

      {/* О себе */}
      <div className="flex flex-col justify-start gap-2">
        <label>О себе</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200" />
      </div>

      {/* Пароль */}
      <div className="flex flex-col justify-start gap-2">
        <label>Текущий пароль</label>
        <input type="password" value={passwordCurrent} onChange={(e) => setPasswordCurrent(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200" />
      </div>
      <div className="flex flex-col justify-start gap-2">
        <label>Новый пароль</label>
        <input type="password" value={passwordNew} onChange={(e) => setPasswordNew(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200" />
      </div>

      <button disabled={pending} onClick={handleSubmit} className="flex items-center justify-center w-full p-3 border border-orange-500 bg-orange-500 hover:bg-orange-100 text-white rounded-lg duration-300 cursor-pointer hover:text-orange-500">
        {pending ? "Сохраняем..." : "Сохранить"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
